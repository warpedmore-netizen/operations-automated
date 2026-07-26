/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { loadWorkspace, saveWorkspace } from "../../../lib/workspace";
import {
  DRAFT_CONFIRMATION,
  LIVE_CONFIRMATION,
  applyPublicationReceipts,
  executeGovernancePublication,
  inspectGovernancePublication,
  listConfluenceSpaces,
  publicPlan,
} from "../../../lib/confluence-governance.mjs";

type RuntimeBindings = {
  CONFLUENCE_BASE_URL?: string;
  CONFLUENCE_SITE_URL?: string;
  CONFLUENCE_ACCESS_TOKEN?: string;
  CONFLUENCE_ACCOUNT_EMAIL?: string;
};

type Payload = { action?: string; spaceId?: string; target?: "draft" | "live"; documentIds?: string[]; planId?: string; confirmation?: string };

function connection() {
  const runtime = env as unknown as RuntimeBindings;
  if (!runtime.CONFLUENCE_BASE_URL || !runtime.CONFLUENCE_ACCESS_TOKEN) return null;
  const base = new URL(runtime.CONFLUENCE_BASE_URL);
  if (base.protocol !== "https:" || !(base.hostname.endsWith(".atlassian.net") || base.hostname === "api.atlassian.com")) throw new Error("Confluence must use an approved Atlassian Cloud HTTPS endpoint");
  const site = new URL(runtime.CONFLUENCE_SITE_URL || (base.hostname.endsWith(".atlassian.net") ? base.origin : "https://www.atlassian.com"));
  if (site.protocol !== "https:" || !site.hostname.endsWith(".atlassian.net")) throw new Error("CONFLUENCE_SITE_URL must be an Atlassian Cloud site");
  const authorization = runtime.CONFLUENCE_ACCOUNT_EMAIL
    ? `Basic ${btoa(`${runtime.CONFLUENCE_ACCOUNT_EMAIL}:${runtime.CONFLUENCE_ACCESS_TOKEN}`)}`
    : `Bearer ${runtime.CONFLUENCE_ACCESS_TOKEN}`;
  return { apiBaseUrl: `${base.origin}${base.pathname.replace(/\/$/, "")}`, siteUrl: site.origin, authorization };
}

function audit(state: Record<string, any>, action: string, detail: string, actor: string) {
  state.audit = [...(Array.isArray(state.audit) ? state.audit : []), { at: new Date().toISOString(), action, detail, actor }];
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in is required" }, { status: 401 });
  try {
    const current = connection();
    const state = await loadWorkspace(user.email) as Record<string, any> | null;
    if (!current) return Response.json({ configured: false, spaces: [], selection: state?.publication || null, draftConfirmation: DRAFT_CONFIRMATION, liveConfirmation: LIVE_CONFIRMATION });
    const spaces = await listConfluenceSpaces(current);
    return Response.json({ configured: true, siteUrl: current.siteUrl, spaces, selection: state?.publication || null, draftConfirmation: DRAFT_CONFIRMATION, liveConfirmation: LIVE_CONFIRMATION });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to read Confluence", configured: false }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in is required" }, { status: 401 });
  try {
    const current = connection();
    if (!current) throw Object.assign(new Error("The Confluence server connection has not been enabled"), { status: 409 });
    const payload = await request.json() as Payload;
    const state = (await loadWorkspace(user.email) || {}) as Record<string, any>;
    state.publication ||= { mappings: {} };
    if (payload.action === "select-space") {
      const spaces = await listConfluenceSpaces(current);
      const selected = spaces.find((space) => space.id === String(payload.spaceId || ""));
      if (!selected) throw Object.assign(new Error("Choose a visible Confluence space"), { status: 400 });
      state.publication = { ...state.publication, spaceId: selected.id, spaceName: selected.name, spaceKey: selected.key, pendingPlan: null };
      audit(state, "Confluence governance space selected", `${selected.name} (${selected.key || selected.id})`, user.displayName);
      await saveWorkspace(user.email, state);
      return Response.json({ state });
    }
    if (payload.action === "preview") {
      const target = payload.target === "live" ? "live" : "draft";
      const plan = await inspectGovernancePublication(current, state.governancePack, state.publication, target, payload.documentIds || []);
      state.publication.pendingPlan = plan;
      audit(state, `Confluence ${target} plan prepared`, `${plan.id} · ${plan.summary.create} create · ${plan.summary.update} update · ${plan.summary.conflict} conflict`, user.displayName);
      await saveWorkspace(user.email, state);
      return Response.json({ plan: publicPlan(plan), state });
    }
    if (payload.action === "publish") {
      const storedPlan = state.publication.pendingPlan;
      if (!storedPlan || storedPlan.id !== payload.planId) throw Object.assign(new Error("Prepare a fresh publication plan first"), { status: 409 });
      const freshPlan = await inspectGovernancePublication(current, state.governancePack, state.publication, storedPlan.target, storedPlan.documentIds || []);
      if (freshPlan.id !== storedPlan.id) throw Object.assign(new Error("Confluence or the governance documents changed after the preview. Prepare a fresh plan."), { status: 409 });
      const result = await executeGovernancePublication(current, freshPlan, payload.confirmation || "");
      applyPublicationReceipts(state, result, user.displayName);
      audit(state, result.target === "live" ? "Approved governance promoted to Confluence Live" : "Governance candidates published to Confluence Draft", `${result.created} created · ${result.updated} updated · ${result.unchanged} unchanged`, user.displayName);
      await saveWorkspace(user.email, state);
      return Response.json({ result, state });
    }
    return Response.json({ error: "Unknown Confluence action" }, { status: 400 });
  } catch (error) {
    const status = typeof (error as { status?: unknown })?.status === "number" ? (error as { status: number }).status : 500;
    return Response.json({ error: error instanceof Error ? error.message : "Confluence governance action failed" }, { status });
  }
}
