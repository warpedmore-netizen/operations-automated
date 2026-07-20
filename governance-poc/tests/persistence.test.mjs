import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GovernanceStore } from "../store.mjs";
import { createGovernanceServer } from "../server.mjs";

async function temporaryState(run) {
  const directory = await mkdtemp(join(tmpdir(), "oa-governance-"));
  try { return await run(join(directory, "state.json")); }
  finally { await rm(directory, { recursive: true, force: true }); }
}

test("governed actions survive store reconstruction", () => temporaryState(async path => {
  const first = new GovernanceStore(path);
  await first.act("accept-finding", { actor: "Test reviewer" });
  const second = new GovernanceStore(path);
  const restored = await second.read();
  assert.equal(restored.findings[0].status, "accepted");
  assert.equal(restored.auditEvents.at(-1).actor, "Test reviewer");
  assert.equal(JSON.parse(await readFile(path, "utf8")).findings[0].status, "accepted");
}));

test("HTTP API persists the complete human-governed release workflow", () => temporaryState(async statePath => {
  const server = createGovernanceServer({ statePath });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const post = async (action, input) => {
    const response = await fetch(`http://127.0.0.1:${port}/api/actions/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const text = await response.text();
    assert.equal(response.status, 200, text);
    return JSON.parse(text);
  };
  try {
    await post("accept-finding", { actor: "Exercise evaluator" });
    await post("create-proposal", { actor: "Incident owner" });
    await post("decide-proposal", { actor: "Governance reviewer", role: "Risk owner", comments: "Approved in test", decision: "approved" });
    const released = await post("create-release", { actor: "Release manager" });
    assert.equal(released.releases.at(-1).id, "REL-IM-002");
    assert.equal(released.approvals.at(-1).role, "Risk owner");
    assert.equal(released.policyStatements.filter(item => item.id === "POL-IM-003").length, 2);
  } finally { await new Promise(resolve => server.close(resolve)); }
}));

test("HTTP API rejects an unnamed approval", () => temporaryState(async statePath => {
  const server = createGovernanceServer({ statePath });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/actions/decide-proposal`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actor: "", decision: "approved" }) });
    assert.equal(response.status, 400);
  } finally { await new Promise(resolve => server.close(resolve)); }
}));
