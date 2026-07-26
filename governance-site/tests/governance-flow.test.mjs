import test from "node:test";
import assert from "node:assert/strict";
import {
  APPROVAL_CONFIRMATION,
  approveGovernanceDocuments,
  generateGovernancePack,
  governanceCatalogue,
  operationsAutomatedProfile,
  updateGovernanceDocument,
} from "../lib/governance.mjs";
import {
  DRAFT_CONFIRMATION,
  LIVE_CONFIRMATION,
  applyPublicationReceipts,
  executeGovernancePublication,
  inspectGovernancePublication,
} from "../lib/confluence-governance.mjs";

const connection = { apiBaseUrl: "https://example.atlassian.net", siteUrl: "https://example.atlassian.net", authorization: "Bearer test" };

function response(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
}

test("the starter generates a connected twelve-document governance pack", () => {
  const pack = generateGovernancePack(operationsAutomatedProfile, "Jamie Peppard", "2026-07-26T10:00:00.000Z");
  assert.equal(governanceCatalogue().length, 12);
  assert.equal(pack.documents.length, 12);
  assert.equal(pack.documents.every((document) => document.status === "candidate"), true);
  assert.ok(pack.documents.find((document) => document.id === "OA-POL-AI-001"));
  assert.ok(pack.documents.find((document) => document.id === "OA-PROC-CHG-001").dependsOn.includes("OA-POL-DOC-001"));
  assert.match(pack.documents[0].content, /Operations Automated/);
});

test("editing creates a new candidate and invalidates previous approval", () => {
  const pack = generateGovernancePack(operationsAutomatedProfile, "Jamie");
  const document = pack.documents[0];
  document.status = "approved";
  document.approval = { actor: "Jamie", approvedAt: "now", scope: "internal", contentHash: document.contentHash };
  const originalVersion = document.version;
  updateGovernanceDocument(pack, document.id, document.content + "\n\n## Review note\n\nA material revision for review.", "Jamie");
  assert.equal(document.version, originalVersion + 1);
  assert.equal(document.status, "candidate");
  assert.equal(document.approval, null);
});

test("approval requires a matching Confluence Draft receipt and exact phrase", () => {
  const pack = generateGovernancePack(operationsAutomatedProfile, "Jamie");
  const document = pack.documents[0];
  assert.throws(() => approveGovernanceDocuments(pack, [document.id], "Jamie", APPROVAL_CONFIRMATION), /not been published/);
  document.draftReceipt = { contentHash: document.contentHash };
  assert.throws(() => approveGovernanceDocuments(pack, [document.id], "Jamie", "approve"), /Type/);
  approveGovernanceDocuments(pack, [document.id], "Jamie", APPROVAL_CONFIRMATION, "2026-07-26T11:00:00.000Z");
  assert.equal(document.status, "approved");
  assert.equal(document.approval.contentHash, document.contentHash);
});

test("governance documents move through Confluence Draft, approval and Live with optimistic versions", async () => {
  const state = {
    governancePack: generateGovernancePack(operationsAutomatedProfile, "Jamie"),
    publication: { spaceId: "10", spaceName: "Internal Governance", mappings: {} },
  };
  const selected = state.governancePack.documents.map((document) => document.id);
  let remotePages = [];
  let nextId = 100;
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url: String(url), method: options.method || "GET", body: options.body ? JSON.parse(options.body) : null });
    if (!options.method || options.method === "GET") return response({ results: remotePages, _links: {} });
    if (options.method === "POST") {
      const body = JSON.parse(options.body);
      const page = { id: String(nextId++), title: body.title, spaceId: body.spaceId, parentId: body.parentId || null, version: { number: 1 }, _links: { webui: `/wiki/spaces/INT/pages/${nextId}` } };
      remotePages.push(page);
      return response(page);
    }
    const body = JSON.parse(options.body);
    const page = remotePages.find((item) => item.id === String(body.id));
    page.title = body.title;
    page.parentId = body.parentId || null;
    page.version = { number: body.version.number };
    return response({ ...page, _links: { webui: `/wiki/spaces/INT/pages/${page.id}` } });
  };

  const draftPlan = await inspectGovernancePublication(connection, state.governancePack, state.publication, "draft", selected, fetchImpl);
  assert.equal(draftPlan.publishable, true);
  assert.equal(draftPlan.summary.create, 14);
  const draftResult = await executeGovernancePublication(connection, draftPlan, DRAFT_CONFIRMATION, fetchImpl);
  applyPublicationReceipts(state, draftResult, "Jamie");
  assert.equal(state.governancePack.documents.every((document) => document.status === "draft"), true);
  assert.equal(requests.some((request) => request.method === "DELETE"), false);

  approveGovernanceDocuments(state.governancePack, selected, "Jamie", APPROVAL_CONFIRMATION);
  const livePlan = await inspectGovernancePublication(connection, state.governancePack, state.publication, "live", selected, fetchImpl);
  assert.equal(livePlan.publishable, true);
  assert.equal(livePlan.items.filter((item) => item.kind === "document").every((item) => item.action === "update"), true);
  const liveResult = await executeGovernancePublication(connection, livePlan, LIVE_CONFIRMATION, fetchImpl);
  applyPublicationReceipts(state, liveResult, "Jamie");
  assert.equal(state.governancePack.documents.every((document) => document.status === "live"), true);
  assert.equal(state.governancePack.documents.every((document) => document.liveReceipt?.version === 2), true);
});

test("an independent Confluence edit blocks promotion", async () => {
  const state = {
    governancePack: generateGovernancePack(operationsAutomatedProfile, "Jamie"),
    publication: { spaceId: "10", spaceName: "Internal Governance", mappings: {} },
  };
  const document = state.governancePack.documents[0];
  document.status = "approved";
  document.approval = { actor: "Jamie", approvedAt: "now", scope: "private internal use", contentHash: document.contentHash };
  state.publication.mappings[`document:${document.id}`] = { pageId: "200", version: 1, title: document.title, contentHash: document.contentHash, lifecycle: "draft" };
  const fetchImpl = async () => response({ results: [{ id: "200", title: document.title, spaceId: "10", version: { number: 2 } }], _links: {} });
  const plan = await inspectGovernancePublication(connection, state.governancePack, state.publication, "live", [document.id], fetchImpl);
  assert.equal(plan.publishable, false);
  assert.ok(plan.items.find((item) => item.documentId === document.id && item.conflictType === "managed-page-version"));
});
