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
  const lab = read("app/GovernanceLab.tsx");

  assert.match(layout, /Operations Automated — Connected Governance/);
  assert.match(page, /GovernanceLab/);
  for (const label of [
    "Organisation",
    "Authority",
    "Inventory",
    "Recommendations",
    "Governance package",
    "Sources",
    "Audit",
    "Confluence",
    "Notion",
    "Google Drive & Docs",
    "Microsoft 365",
  ]) {
    assert.match(lab, new RegExp(label));
  }
});

test("the private dogfooding route generates substantive role-based governance drafts", () => {
  const lab = read("app/GovernanceLab.tsx");
  const governance = read("lib/business-governance.ts");

  assert.match(lab, /Operations Automated/);
  assert.match(lab, /Read proposed document/);
  assert.match(lab, /Download reviewed Draft hand-off/);
  for (const title of [
    "Business Governance Framework",
    "Roles and Delegated Authority Standard",
    "Human-led AI and Automation Policy",
    "Information Handling and Confidentiality Policy",
    "Risk, Control and Assurance Framework",
    "Connections and Credential Policy",
    "Documentation, Change and Publication Policy",
    "Continuity and Recovery Policy",
    "Finding and Improvement Procedure",
    "Governance Scenario Test Standard",
  ]) {
    assert.match(governance, new RegExp(title));
  }
  assert.match(governance, /status: proposed/);
  assert.match(governance, /Operations Automated Governance Authority/);
  assert.doesNotMatch(governance, /Jamie Peppard/);
});

test("the Draft hand-off excludes credentials and cannot grant approval or Live publication", () => {
  const route = read("app/api/governance-package/route.ts");
  assert.match(route, /connected-governance-draft-handoff/);
  assert.match(route, /Internal \/ Draft/);
  assert.match(route, /approvalGranted: false/);
  assert.match(route, /livePromotionGranted: false/);
  assert.match(route, /credentialIncluded: false/);
  assert.match(route, /status: "proposed"/);
});

test("workspace persistence remains server-side and size bounded", () => {
  const route = read("app/api/workspace/route.ts");
  assert.match(route, /getDb\(\)/);
  assert.match(route, /500_000/);
  assert.match(route, /onConflictDoUpdate/);
});
