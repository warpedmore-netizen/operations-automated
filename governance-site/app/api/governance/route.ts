/* eslint-disable @typescript-eslint/no-explicit-any */
import { getChatGPTUser } from "../../chatgpt-auth";
import { loadWorkspace, saveWorkspace } from "../../../lib/workspace";
import {
  APPROVAL_CONFIRMATION,
  approveGovernanceDocuments,
  generateGovernancePack,
  governanceCatalogue,
  operationsAutomatedProfile,
  updateGovernanceDocument,
} from "../../../lib/governance.mjs";

type ActionPayload = {
  action?: string;
  documentId?: string;
  content?: string;
  documentIds?: string[];
  confirmation?: string;
};

function audit(state: Record<string, any>, action: string, detail: string, actor: string) {
  state.audit = [...(Array.isArray(state.audit) ? state.audit : []), { at: new Date().toISOString(), action, detail, actor }];
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in is required" }, { status: 401 });
  const state = await loadWorkspace(user.email);
  return Response.json({ catalogue: governanceCatalogue(), pack: state?.governancePack || null, approvalConfirmation: APPROVAL_CONFIRMATION, starterOrganisation: operationsAutomatedProfile });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in is required" }, { status: 401 });
  try {
    const payload = await request.json() as ActionPayload;
    const state = (await loadWorkspace(user.email) || {}) as Record<string, any>;
    if (payload.action === "generate") {
      state.organisation = { ...operationsAutomatedProfile, ...(state.organisation || {}) };
      state.governancePack = generateGovernancePack(state.organisation, user.displayName);
      state.publication = { ...(state.publication || {}), pendingPlan: null };
      audit(state, "Core governance pack generated", `${state.governancePack.documents.length} candidate documents`, user.displayName);
    } else if (payload.action === "update-document") {
      if (!state.governancePack) throw Object.assign(new Error("Generate the governance pack first"), { status: 409 });
      const document = updateGovernanceDocument(state.governancePack, payload.documentId, payload.content, user.displayName);
      state.publication = { ...(state.publication || {}), pendingPlan: null };
      audit(state, "Governance candidate updated", `${document.id} · version ${document.version}`, user.displayName);
    } else if (payload.action === "approve") {
      if (!state.governancePack) throw Object.assign(new Error("Generate the governance pack first"), { status: 409 });
      const approved = approveGovernanceDocuments(state.governancePack, payload.documentIds || [], user.displayName, payload.confirmation);
      state.publication = { ...(state.publication || {}), pendingPlan: null };
      audit(state, "Governance documents approved", approved.map((document: any) => `${document.id}@${document.contentHash}`).join(", "), user.displayName);
    } else {
      return Response.json({ error: "Unknown governance action" }, { status: 400 });
    }
    const savedAt = await saveWorkspace(user.email, state);
    return Response.json({ savedAt, state });
  } catch (error) {
    const status = typeof (error as { status?: unknown })?.status === "number" ? (error as { status: number }).status : 500;
    return Response.json({ error: error instanceof Error ? error.message : "Governance action failed" }, { status });
  }
}
