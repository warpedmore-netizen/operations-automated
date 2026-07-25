import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("the connected governance service compiles to a deployable worker", () => {
  assert.equal(existsSync(new URL("dist/server/index.js", root)), true);
  assert.equal(existsSync(new URL("dist/client", root)), true);
});

test("the main shell exposes a guided route from context to actual drafts", () => {
  const layout = read("app/layout.tsx");
  const page = read("app/page.tsx");
  const lab = read("app/GovernanceLab.tsx");

  assert.match(layout, /Operations Automated — Connected Governance/);
  assert.match(page, /GovernanceLab/);
  for (const label of [
    "Organisation",
    "Authority",
    "Sources & destination",
    "Inventory",
    "Recommendations",
    "Draft documents",
    "Audit",
    "Saved",
    "Continue to sources and destination",
  ]) {
    assert.match(lab, new RegExp(label.replace(/[&]/g, "\\&")));
  }
  assert.match(lab, /Step \{index \+ 1\} of/);
});

test("fields explain their purpose and the interface offers safe assisted context", () => {
  const lab = read("app/GovernanceLab.tsx");

  assert.match(lab, /HelpTip/);
  assert.match(lab, /role="tooltip"/);
  assert.match(lab, /Use Operations Automated context/);
  assert.match(lab, /does not send data to another AI service/);
  assert.match(lab, /Authority means the role allowed to make each decision/);
});

test("sources, inventory and Draft destination remain visibly separate", () => {
  const lab = read("app/GovernanceLab.tsx");

  assert.match(lab, /INPUT IS NOT OUTPUT/);
  assert.match(lab, /Knowledge source/);
  assert.match(lab, /Draft destination/);
  assert.match(lab, /Confluence through private Workbench/);
  assert.match(lab, /Add known project inventory/);
  assert.match(lab, /No API key is entered or copied here/);
  assert.match(lab, /direct hosted-to-Workbench import is not active/i);
});

test("recommendations explain evidence, outputs, authority and consequences", () => {
  const lab = read("app/GovernanceLab.tsx");

  assert.match(lab, /Evidence used/);
  assert.match(lab, /Proposed owner/);
  assert.match(lab, /What selecting this means/);
  assert.match(lab, /Select for draft generation/);
  assert.match(lab, /Generate proposed documents/);
  assert.match(lab, /Review the generated drafts/);
});

test("the private dogfooding route generates substantive role-based governance drafts", () => {
  const lab = read("app/GovernanceLab.tsx");
  const governance = read("lib/business-governance.ts");

  assert.match(lab, /Operations Automated/);
  assert.match(lab, /Read the proposed document/);
  assert.match(lab, /Prepare credential-free Workbench package/);
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

test("the proposed brand pilot uses the retained OA identity without implying approval", () => {
  const lab = read("app/GovernanceLab.tsx");
  const css = read("app/globals.css");

  assert.equal(existsSync(new URL("public/brand-mark.png", root)), true);
  assert.equal(existsSync(new URL("public/brand-favicon.png", root)), true);
  assert.match(lab, /Brand pilot/);
  assert.match(lab, /Not approved/);
  assert.match(css, /--oa-obsidian: #01070f/);
  assert.match(css, /--oa-electric: #32b6fe/);
  assert.match(css, /prefers-reduced-motion/);
});

test("the Draft hand-off excludes credentials and cannot grant approval or Live publication", () => {
  const route = read("app/api/governance-package/route.ts");

  assert.match(route, /connected-governance-draft-handoff/);
  assert.match(route, /sourceScope/);
  assert.match(route, /destinationPlatform/);
  assert.match(route, /Draft lifecycle only/);
  assert.match(route, /lifecycle: "Draft"/);
  assert.match(route, /approvalGranted: false/);
  assert.match(route, /livePromotionGranted: false/);
  assert.match(route, /automaticPublication: false/);
  assert.match(route, /credentialIncluded: false/);
  assert.match(route, /status: "proposed"/);
});

test("workspace persistence remains server-side and size bounded", () => {
  const route = read("app/api/workspace/route.ts");
  assert.match(route, /getDb\(\)/);
  assert.match(route, /500_000/);
  assert.match(route, /onConflictDoUpdate/);
});
