import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_SETTINGS, buildContextPreview, buildProposalPacket, chooseRoute, extractFrontMatter, validateSettings } from "../workbench-core.mjs";

test("front matter status remains the source authority", () => {
  const metadata = extractFrontMatter("---\nstatus: proposed\nversion: 0.4\n---\n# Present on main");
  assert.equal(metadata.status, "proposed");
  assert.notEqual(metadata.status, "approved");
});
test("material and consequential requests escalate only when enabled", () => {
  assert.equal(chooseRoute({ text: "Propose a material methodology change with security consequences", outputType: "analysis" }, DEFAULT_SETTINGS).tier, 3);
  assert.equal(chooseRoute({ text: "Propose a material methodology change with security consequences", outputType: "analysis" }, { ...DEFAULT_SETTINGS, advancedReasoningEnabled: false }).tier, 2);
});

test("context preview never implies approval", () => {
  const route = chooseRoute({ text: "Review this", outputType: "answer" }, DEFAULT_SETTINGS);
  const preview = buildContextPreview({ workspace: "living-methodology" }, route, [], DEFAULT_SETTINGS);
  assert.equal(preview.approvalState, "not-approved");
  assert.match(preview.contextPolicy, /Current request/);
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
