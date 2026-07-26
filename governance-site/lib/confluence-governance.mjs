import { documentStorage, fingerprint } from "./governance.mjs";

export const DRAFT_CONFIRMATION = "Send reviewed governance drafts to Confluence";
export const LIVE_CONFIRMATION = "Promote approved governance documents to Live";

async function readJson(response, message) {
  const text = await response.text();
  let value = {};
  try { value = text ? JSON.parse(text) : {}; } catch { value = {}; }
  if (!response.ok) throw Object.assign(new Error(`${message} Confluence returned ${response.status}.`), { status: response.status === 401 || response.status === 403 ? 403 : 502 });
  return value;
}

export async function confluenceRequest(connection, path, init = {}, fetchImpl = fetch) {
  const response = await fetchImpl(`${connection.apiBaseUrl}/wiki/api/v2${path}`, {
    ...init,
    redirect: "follow",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: connection.authorization, ...(init.headers || {}) },
  });
  return readJson(response, "The Confluence request failed.");
}

async function paged(connection, path, fetchImpl) {
  const results = [];
  let next = path;
  for (let page = 0; next && page < 100; page += 1) {
    const payload = await confluenceRequest(connection, next, {}, fetchImpl);
    results.push(...(Array.isArray(payload.results) ? payload.results : []));
    const link = payload?._links?.next;
    next = link ? String(link).replace(/^.*\/wiki\/api\/v2/, "") : "";
  }
  return results;
}

export async function listConfluenceSpaces(connection, fetchImpl = fetch) {
  const spaces = await paged(connection, "/spaces?limit=100", fetchImpl);
  return spaces.map((space) => ({ id: String(space.id), key: String(space.key || ""), name: String(space.name || space.key || space.id) }));
}

export async function listConfluencePages(connection, spaceId, fetchImpl = fetch) {
  const pages = await paged(connection, `/spaces/${encodeURIComponent(spaceId)}/pages?limit=250`, fetchImpl);
  return pages.map((page) => ({
    id: String(page.id),
    title: String(page.title || "Untitled"),
    spaceId: String(page.spaceId || spaceId),
    parentId: page.parentId ? String(page.parentId) : null,
    version: Number(page.version?.number || 0),
    webPath: String(page?._links?.webui || ""),
  }));
}

function navigation(target) {
  const live = target === "live";
  return [
    {
      key: "navigation:root", kind: "navigation", title: "Operations Automated Governance", parentKey: null,
      contentHash: fingerprint("Operations Automated Governance library"),
      bodyStorage: "<h1>Operations Automated Governance</h1><p>The connected human reading library for business governance, policies, frameworks, procedures and registers.</p><p>Draft publication does not create approval. Live pages retain their internal approval record and source fingerprint.</p>",
    },
    {
      key: `navigation:${target}`, kind: "navigation", title: live ? "Live" : "Draft", parentKey: "navigation:root",
      contentHash: fingerprint(live ? "Live approved internal governance" : "Draft governance for review"),
      bodyStorage: live
        ? "<h1>Live</h1><p>Governance approved for the stated private internal scope. This does not authorise external publication.</p>"
        : "<h1>Draft</h1><p>Candidate governance published for review. Nothing here is approved merely because it is readable in Confluence.</p>",
    },
  ];
}

function pageUrl(connection, page) {
  if (!page?.webPath) return "";
  try { return new URL(page.webPath, connection.siteUrl).toString(); } catch { return ""; }
}

export async function inspectGovernancePublication(connection, pack, publication, target, documentIds, fetchImpl = fetch) {
  if (!publication?.spaceId) throw Object.assign(new Error("Choose a Confluence space first"), { status: 409 });
  if (!pack?.documents?.length) throw Object.assign(new Error("Generate the governance pack first"), { status: 409 });
  const eligible = pack.documents.filter((document) => documentIds.includes(document.id));
  if (!eligible.length) throw Object.assign(new Error("Select at least one governance document"), { status: 400 });
  if (target === "live") {
    for (const document of eligible) {
      if (document.status !== "approved" && document.status !== "live") throw Object.assign(new Error(`${document.title} is not approved`), { status: 409 });
      if (document.approval?.contentHash !== document.contentHash) throw Object.assign(new Error(`${document.title} changed after approval`), { status: 409 });
    }
  }
  const remotePages = await listConfluencePages(connection, publication.spaceId, fetchImpl);
  const mappings = publication.mappings || {};
  const items = [
    ...navigation(target),
    ...eligible.map((document) => ({
      key: `document:${document.id}`,
      kind: "document",
      documentId: document.id,
      title: document.title,
      parentKey: `navigation:${target}`,
      contentHash: document.contentHash,
      bodyStorage: documentStorage(document, target),
    })),
  ].map((item) => {
    const mapping = mappings[item.key];
    const remote = mapping ? remotePages.find((page) => page.id === String(mapping.pageId)) : null;
    const titleMatch = remotePages.find((page) => page.title.toLowerCase() === item.title.toLowerCase());
    let action = "create";
    let conflictType = "";
    let reason = "No managed page exists.";
    if (mapping && !remote) { action = "conflict"; conflictType = "managed-page-missing"; reason = "The previously managed Confluence page is missing or inaccessible."; }
    else if (mapping && remote && Number(mapping.version) !== remote.version) { action = "conflict"; conflictType = "managed-page-version"; reason = "The Confluence page changed after the last governed write."; }
    else if (mapping && remote) {
      const expectedParent = item.parentKey ? mappings[item.parentKey]?.pageId || null : null;
      const sameParent = !expectedParent || String(remote.parentId || "") === String(expectedParent);
      if (mapping.contentHash === item.contentHash && mapping.lifecycle === target && sameParent && mapping.title === item.title) { action = "unchanged"; reason = "Content, lifecycle and tracked Confluence version are unchanged."; }
      else { action = "update"; reason = target === "live" ? "The approved document will be promoted into Live." : "The candidate will update its managed Draft page."; }
    } else if (titleMatch) { action = "conflict"; conflictType = "unmanaged-title"; reason = "A same-title page exists but is not managed by this governance workspace."; }
    return { ...item, action, conflictType, reason, pageId: remote?.id || "", version: remote?.version || 0, parentId: remote?.parentId || null, webUrl: pageUrl(connection, remote) };
  });
  const byKey = new Map(items.map((item) => [item.key, item]));
  for (const item of items) {
    const parent = item.parentKey ? byKey.get(item.parentKey) : null;
    if (parent?.action === "conflict") { item.action = "conflict"; item.conflictType = "parent-conflict"; item.reason = `The parent page “${parent.title}” has a conflict.`; }
  }
  const summary = Object.fromEntries(["create", "update", "unchanged", "conflict"].map((action) => [action, items.filter((item) => item.action === action).length]));
  const plan = {
    id: "",
    target,
    spaceId: publication.spaceId,
    spaceName: publication.spaceName,
    generatedAt: new Date().toISOString(),
    documentIds: eligible.map((document) => document.id),
    summary,
    publishable: summary.conflict === 0,
    automaticPublication: false,
    deletionEnabled: false,
    confirmationPhrase: target === "live" ? LIVE_CONFIRMATION : DRAFT_CONFIRMATION,
    items,
  };
  plan.id = `plan-${fingerprint(JSON.stringify({ target, spaceId: plan.spaceId, items: items.map(({ key, action, contentHash, version }) => ({ key, action, contentHash, version })) }))}`;
  return plan;
}

async function writePage(connection, item, spaceId, parentId, fetchImpl) {
  if (item.action === "create") {
    return confluenceRequest(connection, "/pages", {
      method: "POST",
      body: JSON.stringify({ spaceId: String(spaceId), status: "current", title: item.title, parentId: parentId ? String(parentId) : undefined, body: { representation: "storage", value: item.bodyStorage } }),
    }, fetchImpl);
  }
  return confluenceRequest(connection, `/pages/${encodeURIComponent(item.pageId)}`, {
    method: "PUT",
    body: JSON.stringify({ id: String(item.pageId), status: "current", title: item.title, parentId: parentId ? String(parentId) : undefined, body: { representation: "storage", value: item.bodyStorage }, version: { number: Number(item.version) + 1, message: `Operations Automated governance ${item.contentHash}` } }),
  }, fetchImpl);
}

export async function executeGovernancePublication(connection, plan, confirmation, fetchImpl = fetch) {
  if (!plan?.publishable || plan.items.some((item) => item.action === "conflict")) throw Object.assign(new Error("Resolve every conflict and prepare a fresh plan"), { status: 409 });
  if (confirmation !== plan.confirmationPhrase) throw Object.assign(new Error(`Type “${plan.confirmationPhrase}” exactly`), { status: 400 });
  const results = new Map();
  const receipts = [];
  for (const item of plan.items) {
    const parent = item.parentKey ? results.get(item.parentKey) : null;
    const parentId = parent?.pageId || null;
    if (item.parentKey && !parentId) throw Object.assign(new Error(`The parent page for ${item.title} is unavailable`), { status: 409 });
    if (item.action === "unchanged") {
      const receipt = { ...item, outcome: "unchanged", pageId: item.pageId, version: item.version, lifecycle: plan.target };
      results.set(item.key, receipt); receipts.push(receipt); continue;
    }
    const page = await writePage(connection, item, plan.spaceId, parentId, fetchImpl);
    const receipt = {
      ...item,
      outcome: item.action === "create" ? "created" : "updated",
      pageId: String(page.id || item.pageId || ""),
      version: Number(page.version?.number || (item.action === "create" ? 1 : Number(item.version) + 1)),
      parentId: page.parentId ? String(page.parentId) : parentId,
      lifecycle: plan.target,
      webUrl: pageUrl(connection, { webPath: page?._links?.webui || "" }),
    };
    if (!receipt.pageId) throw Object.assign(new Error("Confluence did not return a page identifier"), { status: 502 });
    results.set(item.key, receipt); receipts.push(receipt);
  }
  return { completedAt: new Date().toISOString(), target: plan.target, receipts, created: receipts.filter((item) => item.outcome === "created").length, updated: receipts.filter((item) => item.outcome === "updated").length, unchanged: receipts.filter((item) => item.outcome === "unchanged").length };
}

export function applyPublicationReceipts(state, result, actor) {
  state.publication ||= {};
  state.publication.mappings ||= {};
  for (const receipt of result.receipts) {
    state.publication.mappings[receipt.key] = { pageId: receipt.pageId, version: receipt.version, title: receipt.title, contentHash: receipt.contentHash, lifecycle: result.target, webUrl: receipt.webUrl || state.publication.mappings[receipt.key]?.webUrl || "", updatedAt: result.completedAt };
    if (receipt.documentId) {
      const document = state.governancePack.documents.find((item) => item.id === receipt.documentId);
      if (!document) continue;
      const documentReceipt = { pageId: receipt.pageId, version: receipt.version, webUrl: receipt.webUrl || state.publication.mappings[receipt.key].webUrl, contentHash: document.contentHash, publishedAt: result.completedAt, actor };
      if (result.target === "draft") { document.status = "draft"; document.draftReceipt = documentReceipt; document.approval = null; document.liveReceipt = null; }
      else { document.status = "live"; document.liveReceipt = documentReceipt; }
    }
  }
  state.publication.lastRun = { ...result, receipts: result.receipts.map((receipt) => { const retained = { ...receipt }; delete retained.bodyStorage; return retained; }), actor };
  state.publication.pendingPlan = null;
}

export function publicPlan(plan) {
  if (!plan) return null;
  return { ...plan, items: plan.items.map((item) => { const visible = { ...item }; delete visible.bodyStorage; return visible; }) };
}
