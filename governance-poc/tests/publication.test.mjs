import test from "node:test";
import assert from "node:assert/strict";
import { createSeed } from "../seed.mjs";
import { checkDrift, platformProfiles, publishDocument, registerMapping, simulateRemoteEdit } from "../publication.mjs";

test("platform adapters expose genuine capability differences", () => {
  assert.equal(platformProfiles.confluence.concurrencyToken, "version-number");
  assert.equal(platformProfiles.confluence.supportsAtomicBodyUpdate, true);
  assert.equal(platformProfiles.notion.concurrencyToken, "last-edited-time");
  assert.equal(platformProfiles.notion.supportsAtomicBodyUpdate, false);
});

test("approved documents publish through Confluence and Notion translations", () => {
  let state = createSeed();
  state = registerMapping(state, { targetId: "PUB-CONF-001", documentKey: "policy", actor: "Document owner" });
  state = registerMapping(state, { targetId: "PUB-NOTION-001", documentKey: "policy", actor: "Document owner" });
  state = publishDocument(state, "MAP-001", "Publisher");
  state = publishDocument(state, "MAP-002", "Publisher");
  const confluence = state.remoteDocuments.find(item => item.targetId === "PUB-CONF-001");
  const notion = state.remoteDocuments.find(item => item.targetId === "PUB-NOTION-001");
  assert.equal(confluence.translated.representation, "storage");
  assert.equal(confluence.translated.version, 1);
  assert.equal(notion.translated.representation, "blocks");
  assert.ok(notion.translated.blocks.length > 1);
  assert.equal(state.auditEvents.filter(item => item.action === "approved-document-published").length, 2);
});

test("stable release generation reports in-sync until remote content drifts", () => {
  let state = registerMapping(createSeed(), { targetId: "PUB-CONF-001", documentKey: "policy", actor: "Owner" });
  state = publishDocument(state, "MAP-001", "Publisher");
  state = checkDrift(state, "MAP-001");
  assert.equal(state.publicationChecks.at(-1).status, "in-sync");
  state = simulateRemoteEdit(state, "MAP-001", "Confluence editor");
  state = checkDrift(state, "MAP-001");
  assert.equal(state.publicationChecks.at(-1).status, "drifted");
  assert.throws(() => publishDocument(state, "MAP-001", "Publisher"), /changed after/);
});

test("AI cannot publish an approved document", () => {
  const state = registerMapping(createSeed(), { targetId: "PUB-NOTION-001", documentKey: "procedure", actor: "Owner" });
  assert.throws(() => publishDocument(state, "MAP-001", "AI agent"), /AI cannot publish/);
});
