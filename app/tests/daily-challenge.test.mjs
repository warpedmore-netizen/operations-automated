import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDailyChallengePrompt,
  dailyChallengePlan,
  summariseDailyChallengeHistory
} from "../daily-challenge.mjs";

test("controlled variety changes territory, mode and artefact across the challenge cycle", () => {
  const plans = Array.from({ length: 12 }, (_, offset) => {
    const date = new Date(Date.UTC(2026, 6, 20 + offset)).toISOString().slice(0, 10);
    return dailyChallengePlan(date);
  });
  assert.equal(new Set(plans.map((plan) => plan.territory.id)).size, 12);
  assert.ok(new Set(plans.map((plan) => plan.mode.id)).size >= 8);
  assert.equal(new Set(plans.map((plan) => plan.format.id)).size, 12);
});

test("the daily prompt makes novelty, relevance, artefact variation and evidence limits explicit", () => {
  const prompt = buildDailyChallengePrompt("2026-07-31");
  assert.match(prompt, /RETAINED DAILY CHALLENGE MEMORY/);
  assert.match(prompt, /merely changes the organisation, names or numbers/i);
  assert.match(prompt, /Methodology territory:/);
  assert.match(prompt, /Challenge mode:/);
  assert.match(prompt, /Response artefact:/);
  assert.match(prompt, /decision value/i);
  assert.match(prompt, /one primary plain-language question/i);
  assert.match(prompt, /10 minutes/i);
  assert.match(prompt, /do not invent a public signal/i);
  assert.match(prompt, /do not claim to attach an image or downloadable document/i);
});

test("history preserves earlier challenges, founder judgement and structured disposition", () => {
  const memory = summariseDailyChallengeHistory([{
    title: "Daily methodology challenge — 2026-07-29",
    messages: [
      { role: "user", working_text: "Prepare a challenge." },
      { role: "assistant", working_text: "Should every refund receive prior human review?" },
      { role: "user", working_text: "We have covered this. Use risk, monitoring and outcome evidence." },
      { role: "assistant", working_text: "The earlier premise failed to carry forward the prior judgement." }
    ],
    feedback: [{ learning_disposition: "more-evidence" }]
  }]);
  assert.match(memory, /Should every refund receive prior human review/);
  assert.match(memory, /We have covered this/);
  assert.match(memory, /failed to carry forward/);
  assert.match(memory, /more-evidence/);
});
