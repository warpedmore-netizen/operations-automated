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
const brandReview = JSON.parse(readFileSync(resolve(repoRoot, "brand/review-items.json"), "utf8"));
const brandAdoption = JSON.parse(readFileSync(resolve(repoRoot, "brand/adoption.json"), "utf8"));

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
  for (const asset of ["styles.css", "engine.js", "storage.js", "voice-capture.js", "app.js", "build-version.txt", "manifest.webmanifest"]) {
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
  for (const id of ["new-conversation", "composer", "record", "recording-status", "recording-level", "voice-recovery", "retry-transcription", "discard-recording", "processing-state", "attach", "workspace", "output-type", "preview-dialog", "feedback-list", "decision-status-board", "decision-list", "decision-detail", "challenges-view", "connections-view", "phone-access-heading", "confluence-form", "confluence-connection-status", "remove-confluence", "confluence-publication", "preview-confluence-publication", "preview-methodology-lab", "confluence-publication-approval", "publish-confluence", "brand-view", "brand-review-progress", "brand-feedback-heading", "brand-feedback-count", "brand-feedback-list", "brand-adoption-list", "brand-review-grid", "server-version-warning", "server-version-message", "guide-view"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const label of ["Challenge studio", "Saved feedback", "Decision inbox", "Brand review", "Cost and usage", "Settings", "Connections", "How it works"]) assert.match(html, new RegExp(label));
  assert.match(html, /<main[^>]+id="main"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /lang="en-GB"/);
  assert.match(html, /Translate to English/);
  assert.match(html, /Review captured text before reasoning/);
  assert.match(html, /Retry transcription/);
  assert.match(html, /recording remains temporarily in that browser tab/i);
  assert.match(appSource, /recorder\.start\(1000\)/);
  assert.match(appSource, /Your recording has not been lost/);
  assert.match(html, /hard budget blocks further paid requests/i);
  assert.match(html, /id="context-panel"[^>]+hidden/);
  assert.match(appSource, /Why Oppa Mate recommended this/);
  assert.match(appSource, /userFacingAnswer/);
  assert.match(html + appSource, /Approve and merge/);
  assert.match(html, /Preparation and release are separate decisions/);
});

test("the Workbench consumes the controlled brand source and exposes visual review", () => {
  assert.match(html, /\/brand-system\/tokens\/brand\.css/);
  assert.match(html + appSource, /\/brand-system\/assets\/logo\/generated\/mark-colour-transparent-1024\.png/);
  assert.match(html, /\/brand-system\/assets\/logo\/generated\/mark-dark-tile-192\.png/);
  assert.match(html, /<img[^>]+class="brand-logo"[^>]+mark-colour-transparent-1024\.png/);
  assert.match(html, /class="oppa-account-avatar"[^>]*>OM<\/span>/);
  assert.match(appSource, /\/api\/brand-review/);
  assert.match(appSource, /approve-internal/);
  assert.match(appSource, /Revision requested/);
  assert.match(appSource, /Direction rejected/);
  assert.match(appSource, /Awaiting Codex review/);
  assert.match(appSource, /Revision prepared · re-review needed/);
  assert.match(html, /Revision and rejection notes are automatically surfaced for Codex review/);
  assert.match(appSource, /This page is not a valid brand preview until the restart warning has cleared/);
  assert.doesNotMatch(cssSource, /Georgia,\s*serif/);
  assert.match(cssSource, /var\(--oa-midnight,\s*#03111e\)/);
  assert.match(cssSource, /var\(--oa-font-display,\s*Montserrat/);
  assert.match(cssSource, /var\(--oa-ink,\s*#102a43\)/);
  assert.match(cssSource, /\.conversation-link\.current[^}]+var\(--oa-electric,\s*#32b6fe\)/s);
  assert.match(cssSource, /-webkit-line-clamp:\s*2/);
  assert.match(cssSource, /\.brand-preview-type p \{[^}]+font-size:\s*0\.9rem[^}]+font-weight:\s*650/s);
  assert.match(cssSource, /\.brand-preview-type strong \{[^}]+font-size:\s*clamp\(1\.9rem,\s*2\.65vw,\s*2\.25rem\)/s);
  assert.match(cssSource, /\.brand-feedback-list article \{[^}]+border-left:\s*4px solid/s);
  assert.match(html, /id="oppa-mate-topbar"/);
  assert.match(html, /Oppa <b>Mate<\/b>/);
  assert.match(html, /Operations Automated service account/);
  assert.match(appSource, /message\.role === "user" \? "You" : "OM"/);
  assert.match(appSource, /const reviewedCount = value\.items\.filter/);
  assert.equal(brandReview.items.some((item) => item.id === "oppa-mate-service-account" && item.status === "draft"), true);
  assert.equal(brandAdoption.surfaces.some((surface) => surface.id === "oppa-mate-service-account" && surface.status === "pilot-applied"), true);
});

test("the primary knowledge journey remains readable and touch-usable on a phone", () => {
  assert.match(html, /This is the knowledge control room/);
  assert.match(html, /data-route-view="feedback"/);
  assert.match(html, /Secure phone access/);
  assert.match(html, /Governance status · approval not inferred/);
  assert.match(html, /tailscale serve --bg 4173/);
  assert.match(cssSource, /@media \(max-width: 700px\)/);
  assert.match(cssSource, /\.rail nav > \.nav-item > span:last-child \{ display: block; \}/);
  assert.match(cssSource, /min-height: 44px/);
  assert.match(cssSource, /100dvh/);
  assert.match(cssSource, /overflow-wrap: anywhere/);
  assert.match(cssSource, /\.thread-column \{[^}]*min-height:\s*0/s);
  assert.match(cssSource, /\.messages \{[^}]*min-height:\s*0[^}]*overflow:\s*auto/s);
  assert.match(cssSource, /\.composer-tools button, \.composer-tools select \{ min-height: 44px; \}/);
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

test("answers and feedback actions lead with plain-language outcomes", () => {
  assert.match(appSource, /Optional: sources, status and controls/);
  assert.match(appSource, /They are not part of the main answer/);
  assert.match(appSource, /the supporting guidance/);
  assert.match(appSource, /Saves that this answer helped\. No follow-up or change starts/);
  assert.match(appSource, /saves a change candidate\. It does not create or approve a change proposal/i);
  assert.match(appSource, /What happens when you choose/);
  assert.match(appSource, /Save this use/);
  assert.match(appSource, /Create change review/);
  assert.match(appSource, /Saving will mark this for methodology review/);
  assert.match(html, /Every action should tell you its result before you choose it/);
  assert.match(html, /Sending creates an answer in this conversation/);
  assert.match(html, /Helpful<\/strong> and <strong>You understood me/);
  assert.match(html, /Create change review<\/strong> makes a separate brief for review/);
  assert.match(cssSource, /\.feedback-choice/);
  assert.match(cssSource, /\.answer-control-details/);
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
  assert.match(html, /AI may publish committed proposals into Draft for review/i);
  assert.match(html, /Promotion to Live requires Jamie’s explicit approval/i);
  assert.match(html, /cannot approve a methodology change/i);
  assert.match(html, /Operational activation does not by itself record governance approval/i);
  assert.match(html, /Do not use a public tunnel or router port-forward/i);
  assert.match(html, /organised first into Live, Draft and Archived/i);
  assert.match(html, /End-to-end methodology Draft v0\.8/i);
  assert.match(html, /does not alter Live content/i);
  assert.match(html, /Type the confirmation shown above/i);
  assert.match(appSource, /Use reviewed Git copy/i);
  assert.match(appSource, /publication-conflicts\/reapply/i);
});

test("the interface source contains no mojibake or placeholder attachment wording", () => {
  assert.doesNotMatch(html + appSource, /ï¼|â€”|â€¦|metadata staged|reserved for the next increment/i);
});

test("Operate starts with a unified, explainable My Work journey", () => {
  assert.match(html, /id="my-work-view"/);
  assert.match(html, /id="do-next-list"/);
  assert.match(html, /Recommended order/);
  assert.match(html, /Closest deadline/);
  assert.match(html, /Cases &amp; work/);
  assert.match(html, /Operations Bible/);
  assert.match(html, /What the links tell us/);
  assert.match(html, /id="capture-parent"/);
  assert.match(html, /id="work-link-dialog"/);
  assert.match(html, /A relationship adds context; it does not create approval/);
  assert.match(html, /Classification organises work; it does not approve it/);
  assert.match(html, /id="capture-suggestion"/);
  assert.match(html, /Suggested automatically; edit only if useful/);
  assert.match(html, /Change suggestions or add optional detail/);
  assert.doesNotMatch(html, /name="title" required/);
  assert.match(appSource, /\/api\/my-work/);
  assert.match(appSource, /\/api\/operate\/records/);
  assert.match(appSource, /\/api\/operate\/network/);
  assert.match(appSource, /Governed next action/);
  assert.match(appSource, /data-operate-action/);
  assert.match(appSource, /data-operate-action-confirmation/);
  assert.match(appSource, /data-operate-action-choice/);
  assert.match(appSource, /\/api\/operate\/recommendation/);
  assert.match(appSource, /action\.suggestedNote/);
  assert.match(appSource, /confirmation = action\.confirmation/);
  assert.doesNotMatch(appSource, /window\.prompt\(`Type "\$\{action\.confirmation\}/);
  assert.match(appSource, /\/api\/operate\/records\/\$\{encodeURIComponent\(record\.id\)\}\/actions/);
  assert.match(appSource, /workflow\.action-completed/);
  assert.match(appSource, /Record the evidence, outcome or reason/);
  assert.match(appSource, /Suggested by Oppa Mate/);
  assert.match(appSource, /Relationship rejected and retained in activity history/);
  assert.match(appSource, /Linked source/);
  assert.match(appSource, /rel="noopener noreferrer"/);
  assert.match(appSource, /Ask Oppa Mate about this work/);
  assert.match(appSource, /You are asking from this work item/);
  assert.match(appSource, /data-inline-help-prompt/);
  assert.match(appSource, /Open full conversation with this context/);
  assert.match(html, /id="conversation-work-context"/);
  assert.match(appSource, /Conversation opened from this work item/);
  assert.match(appSource, /data-back-to-work-item/);
  assert.match(cssSource, /\.work-action-panel/);
  assert.match(cssSource, /\.source-work-package/);
  assert.match(cssSource, /\.inline-work-help/);
  assert.match(cssSource, /min-height:\s*42px/);
});
