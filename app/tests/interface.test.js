const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const engine = require("../engine.js");

const appRoot = resolve(__dirname, "..");
const repoRoot = resolve(appRoot, "..");
const html = readFileSync(resolve(appRoot, "index.html"), "utf8");
const appSource = readFileSync(resolve(appRoot, "app.js"), "utf8");
const cssSource = readFileSync(resolve(appRoot, "styles.css"), "utf8");

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
  for (const asset of ["styles.css", "engine.js", "storage.js", "app.js", "build-version.txt", "manifest.webmanifest"]) {
    assert.equal(existsSync(resolve(appRoot, asset)), true, `${asset} should exist`);
  }
  for (const asset of [
    "brand/tokens/brand.css",
    "brand/assets/logo/generated/mark-colour-transparent-1024.png",
    "brand/adoption.json",
    "brand/review-items.json",
    "Launch-Brand-Review.cmd"
  ]) assert.equal(existsSync(resolve(repoRoot, asset)), true, `${asset} should exist`);
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//i);
});

test("essential controls and accessibility landmarks are present", () => {
  for (const id of ["new-conversation", "composer", "record", "recording-status", "processing-state", "attach", "workspace", "output-type", "preview-dialog", "feedback-list", "decision-status-board", "decision-list", "decision-detail", "challenges-view", "connections-view", "phone-access-heading", "confluence-form", "confluence-connection-status", "remove-confluence", "confluence-publication", "preview-confluence-publication", "confluence-publication-approval", "publish-confluence", "brand-view", "brand-review-progress", "brand-adoption-list", "brand-review-grid", "server-version-warning", "server-version-message", "guide-view"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const label of ["Challenge studio", "Saved feedback", "Decision inbox", "Brand review", "Cost and usage", "Settings", "Connections", "How it works"]) assert.match(html, new RegExp(label));
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

test("the Workbench consumes the controlled brand source and exposes visual review", () => {
  assert.match(html, /\/brand-system\/tokens\/brand\.css/);
  assert.match(html + appSource, /\/brand-system\/assets\/logo\/generated\/mark-colour-transparent-1024\.png/);
  assert.match(html, /\/brand-system\/assets\/logo\/generated\/mark-dark-tile-192\.png/);
  assert.match(html, /class="brand-logo"[^>]*>OA</);
  assert.doesNotMatch(html, /<img[^>]+class="(?:brand-logo|welcome-logo)"/);
  assert.match(appSource, /\/api\/brand-review/);
  assert.match(appSource, /approve-internal/);
  assert.match(appSource, /Revision requested/);
  assert.match(appSource, /Direction rejected/);
  assert.match(appSource, /This page is not a valid brand preview until the restart warning has cleared/);
  assert.doesNotMatch(cssSource, /Georgia,\s*serif/);
  assert.match(cssSource, /var\(--oa-midnight,\s*#03111e\)/);
  assert.match(cssSource, /var\(--oa-font-display,\s*Montserrat/);
  assert.match(cssSource, /var\(--oa-ink,\s*#102a43\)/);
});

test("the primary knowledge journey remains readable and touch-usable on a phone", () => {
  assert.match(html, /This is the knowledge control room/);
  assert.match(html, /data-route-view="feedback"/);
  assert.match(html, /Secure phone access/);
  assert.match(html, /Proposed connection · not enabled/);
  assert.match(html, /tailscale serve --bg 4173/);
  assert.match(cssSource, /@media \(max-width: 700px\)/);
  assert.match(cssSource, /\.rail nav > \.nav-item > span:last-child \{ display: block; \}/);
  assert.match(cssSource, /min-height: 44px/);
  assert.match(cssSource, /100dvh/);
  assert.match(cssSource, /overflow-wrap: anywhere/);
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
  assert.match(html, /review evidence/i);
  assert.match(html, /do not merge the pull request, change repository status or authorise external publication/i);
  assert.match(html, /Non-confidential project material only/i);
  assert.match(html, /Not approved/i);
  assert.match(html, /Private · governed publication/i);
  assert.match(html, /Windows user-level encryption/i);
  assert.match(html, /never publishes automatically or deletes a Confluence page/i);
  assert.match(html, /Git status remains authoritative/i);
  assert.match(html, /Every publication requires Jamie’s separate confirmation/i);
  assert.match(html, /cannot approve a methodology change/i);
  assert.match(html, /new access and security connection requires Jamie’s separate approval/i);
  assert.match(html, /Do not use a public tunnel or router port-forward/i);
  assert.match(html, /organised first into Live, Draft and Archived/i);
  assert.match(html, /Type the confirmation shown above/i);
  assert.match(appSource, /Use reviewed Git copy/i);
  assert.match(appSource, /publication-conflicts\/reapply/i);
});

test("the interface source contains no mojibake or placeholder attachment wording", () => {
  assert.doesNotMatch(html + appSource, /ï¼|â€”|â€¦|metadata staged|reserved for the next increment/i);
});
