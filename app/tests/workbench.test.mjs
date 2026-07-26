import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_SETTINGS, buildContextPreview, buildLocalSynthesis, buildProposalPacket, chooseRoute, extractFrontMatter, validateSettings } from "../workbench-core.mjs";

test("front matter status remains the source authority", () => {
  const metadata = extractFrontMatter("---\nstatus: proposed\nversion: 0.4\n---\n# Present on main");
  assert.equal(metadata.status, "proposed");
  assert.notEqual(metadata.status, "approved");
});
test("material and consequential requests escalate only when enabled", () => {
  assert.equal(chooseRoute({ text: "Propose a material methodology change with security consequences", outputType: "analysis" }, DEFAULT_SETTINGS).tier, 3);
  assert.equal(chooseRoute({ text: "Propose a material methodology change with security consequences", outputType: "analysis" }, { ...DEFAULT_SETTINGS, advancedReasoningEnabled: false }).tier, 2);
});

test("ordinary words containing format do not accidentally force local processing", () => {
  const route = chooseRoute({ text: "Take this information into account and answer me plainly.", outputType: "answer" }, DEFAULT_SETTINGS);
  assert.equal(route.tier, 2);
});

test("context preview never implies approval", () => {
  const route = chooseRoute({ text: "Review this", outputType: "answer" }, DEFAULT_SETTINGS);
  const preview = buildContextPreview({ workspace: "living-methodology" }, route, [], DEFAULT_SETTINGS);
  assert.equal(preview.approvalState, "not-approved");
  assert.match(preview.contextPolicy, /Current request/);
});

test("local synthesis returns plain-language guidance without exposing internal paths", () => {
  const text = buildLocalSynthesis({
    input: "How should I test an operational change?",
    outputType: "checklist",
    sources: [{
      path: "methodology/operate-overview.md",
      status: "approved",
      version: "0.1",
      hash: "abc123",
      excerpt: "## Test\n\nRun a bounded test with visible measures and recovery."
    }]
  });
  assert.match(text, /Practical checklist/);
  assert.match(text, /accountable for the decision/);
  assert.doesNotMatch(text, /methodology\/operate-overview\.md/);
  assert.doesNotMatch(text, /deterministic local synthesis|Sources used/);
});

test("local synthesis answers an operational test question before exposing source excerpts", () => {
  const text = buildLocalSynthesis({
    input: "Explain how I should test an operational change in plain language.",
    outputType: "answer",
    sources: [{
      path: "methodology/operate-overview.md",
      status: "approved",
      version: "0.1",
      hash: "abc123",
      excerpt: "## Test\n\nRun a bounded test with visible measures and recovery."
    }]
  });
  assert.match(text, /Test the change on a small, reversible scale/i);
  assert.match(text, /one condition that would stop the test/i);
  assert.doesNotMatch(text, /methodology\/operate-overview\.md|approved, version|source hash/i);
});

test("proposal creation is explicitly separate from approval and repository mutation", () => {
  const packet = buildProposalPacket(
    { disposition: "challenge-conclusion", wording: "Evidence conflicts", interpretation: "", affected_components: "[]" },
    { messages: [{ role: "user", working_text: "Change the method" }, { id: "a1", role: "assistant", working_text: "Draft interpretation", metadata: { sources: [] } }] }
  );
  assert.match(packet, /human decision required/i);
  assert.match(packet, /did not edit, approve, publish or merge/i);
});

test("hard ceilings cannot be lower than warnings", () => {
  assert.throws(() => validateSettings({ ...DEFAULT_SETTINGS, perRequestWarningThreshold: 1, perRequestHardCeiling: .5 }), /hard ceiling/i);
});

test("the browser never receives or stores the API key", () => {
  const source = readFileSync(resolve(import.meta.dirname, "..", "app.js"), "utf8");
  const html = readFileSync(resolve(import.meta.dirname, "..", "index.html"), "utf8");
  assert.doesNotMatch(source + html, /OPENAI_API_KEY|sk-[A-Za-z0-9]/);
});

test("git exclusions cover local secrets, databases, attachments and audio", () => {
  const ignore = readFileSync(resolve(import.meta.dirname, "..", "..", ".gitignore"), "utf8");
  for (const pattern of [".env", "app/local-data/", "*.sqlite", "*.webm", "*.wav", "*.mp3"]) assert.match(ignore, new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("the proposed collaboration method covers AI suitability, manual work and delivery capability without claiming approval", () => {
  const approved = readFileSync(resolve(import.meta.dirname, "..", "..", "methodology", "human-ai-collaboration.md"), "utf8");
  const proposed = readFileSync(resolve(import.meta.dirname, "..", "..", "methodology", "human-ai-collaboration-v0.4-proposed.md"), "utf8");
  assert.match(approved, /status: approved/);
  assert.match(approved, /version: 0\.2/);
  assert.match(proposed, /status: proposed/);
  assert.match(proposed, /human-readable and AI-usable methodology/i);
  assert.match(proposed, /automation as a design choice, not the default outcome/i);
  assert.match(proposed, /Early delivery collaboration and capability transfer/i);
  assert.match(proposed, /Build capability while delivering change/i);
  assert.match(proposed, /Separate responsibility from accountability/i);
  assert.match(proposed, /does not amend the approved v0\.7 methodology baseline/i);
});
