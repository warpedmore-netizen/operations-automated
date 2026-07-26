import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("the connected governance service compiles to a deployable worker", () => {
  assert.equal(existsSync(new URL("dist/server/index.js", root)), true);
  assert.equal(existsSync(new URL("dist/client", root)), true);
});

test("the main shell exposes the complete external testing journey", () => {
  const layout = read("app/layout.tsx");
  const page = read("app/page.tsx");
  const lab = read("app/GovernanceWorkbench.tsx");

  assert.match(layout, /Operations Automated — Connected Governance/);
  assert.match(page, /GovernanceWorkbench/);
  for (const label of [
    "Organisation",
    "Generate all 12 documents",
    "Governance pack",
    "Audit",
    "Confluence",
    "Send reviewed candidates to Draft",
    "Approve the exact Draft versions",
    "Promote approved governance",
  ]) {
    assert.match(lab, new RegExp(label));
  }
});

test("governed publication routes retain exact confirmations and conflict checks", () => {
  const governance = read("lib/governance.mjs");
  const confluence = read("lib/confluence-governance.mjs");
  assert.match(governance, /Approve selected governance documents for internal use/);
  assert.match(confluence, /Send reviewed governance drafts to Confluence/);
  assert.match(confluence, /Promote approved governance documents to Live/);
  assert.match(confluence, /managed-page-version/);
  assert.doesNotMatch(confluence, /method:\s*["']DELETE/);
});

test("workspace persistence remains server-side and size bounded", () => {
  const route = read("app/api/workspace/route.ts");
  const workspace = read("lib/workspace.ts");
  assert.match(route, /loadWorkspace/);
  assert.match(workspace, /getDb\(\)/);
  assert.match(workspace, /1_500_000/);
  assert.match(workspace, /onConflictDoUpdate/);
});
