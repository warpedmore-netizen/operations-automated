const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const engine = require("../engine.js");

const appRoot = resolve(__dirname, "..");
const html = readFileSync(resolve(appRoot, "index.html"), "utf8");
const appSource = readFileSync(resolve(appRoot, "app.js"), "utf8");

function matches(pattern, source) {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

function getPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

test("all interface IDs are unique", () => {
  const ids = matches(/\sid="([^"]+)"/g, html);
  assert.equal(new Set(ids).size, ids.length);
});

test("every DOM ID referenced by the application exists", () => {
  const htmlIds = new Set(matches(/\sid="([^"]+)"/g, html));
  const dynamicIds = new Set(matches(/\sid="([^"]+)"/g, appSource));
  const referencedIds = new Set(matches(/byId\("([^"]+)"\)/g, appSource));
  const missing = [...referencedIds].filter((id) => !htmlIds.has(id) && !dynamicIds.has(id));
  assert.deepEqual(missing, []);
});

test("every form binding maps to the workspace schema", () => {
  const workspace = engine.createWorkspace();
  const bindings = matches(/data-bind="([^"]+)"/g, html);
  const invalid = bindings.filter((binding) => typeof getPath(workspace, binding) !== "string");
  assert.deepEqual(invalid, []);
});

test("local interface assets exist and no external resources are loaded", () => {
  for (const asset of ["styles.css", "engine.js", "storage.js", "app.js"]) {
    assert.equal(existsSync(resolve(appRoot, asset)), true, `${asset} should exist`);
  }
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//i);
});

test("essential controls and accessibility landmarks are present", () => {
  for (const id of ["new-conversation", "composer", "record", "recording-status", "processing-state", "attach", "workspace", "output-type", "preview-dialog", "feedback-list", "decision-status-board", "decision-list", "decision-detail", "challenges-view", "connections-view", "confluence-form", "confluence-connection-status", "remove-confluence", "confluence-publication", "preview-confluence-publication", "preview-methodology-lab", "confluence-publication-approval", "publish-confluence", "guide-view"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const label of ["Challenge studio", "Saved feedback", "Decision inbox", "Cost and usage", "Settings", "Connections", "How this works"]) assert.match(html, new RegExp(label));
  assert.match(html, /<main[^>]+id="main"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /lang="en-GB"/);
  assert.match(html, /Translate to English/);
  assert.match(html, /Review captured text before reasoning/);
  assert.match(html, /hard budget blocks further paid requests/i);
  assert.match(html, /id="context-panel"[^>]+hidden/);
  assert.match(appSource, /Behind this answer/);
  assert.match(appSource, /userFacingAnswer/);
  assert.match(html + appSource, /Approve and merge/);
  assert.match(html, /Preparation and release are separate decisions/);
});

test("change review and methodology challenge are designed for the founder", () => {
  assert.match(html, /Send me a challenge/);
  assert.match(html, /Principles/);
  assert.match(html, /AI suitability/);
  assert.match(html, /Manual work/);
  assert.match(html, /Delivery capability/);
  assert.match(appSource, /What am I deciding\?/);
  assert.match(appSource, /Open the draft change on GitHub/);
  assert.match(appSource, /one primary plain-language question/);
  assert.match(appSource, /Treat my answer as evidence, not approval/);
});

test("the interface states the governance and data boundaries", () => {
  assert.match(html, /Feedback is not approval/i);
  assert.match(html, /No automatic repository writes/i);
  assert.match(html, /Non-confidential project material only/i);
  assert.match(html, /Not approved/i);
  assert.match(html, /Private · governed publication/i);
  assert.match(html, /Windows user-level encryption/i);
  assert.match(html, /never publishes automatically or deletes a Confluence page/i);
  assert.match(html, /Git status remains authoritative/i);
  assert.match(html, /Every publication requires Jamie’s separate confirmation/i);
  assert.match(html, /cannot approve a methodology change/i);
  assert.match(html, /organised first into Live, Draft and Archived/i);
  assert.match(html, /Methodology Lab – Pilot 1/i);
  assert.match(html, /leaves the current 108 pages unchanged/i);
  assert.match(html, /Type the confirmation shown above/i);
  assert.match(appSource, /Use reviewed Git copy/i);
  assert.match(appSource, /publication-conflicts\/reapply/i);
});

test("the interface source contains no mojibake or placeholder attachment wording", () => {
  assert.doesNotMatch(html + appSource, /ï¼|â€”|â€¦|metadata staged|reserved for the next increment/i);
});
