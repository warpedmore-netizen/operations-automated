import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  frameRequest,
  FRAMING_PROMPT,
  reviewCodexReturn
} from "../request-framing.mjs";
import { loadSteeringControls } from "../steering-control.mjs";

const repositoryRoot = process.cwd();
const controls = loadSteeringControls(repositoryRoot);
const fixedClock = () => "2026-07-29T19:00:00.000Z";
const baseContext = {
  sources: [
    { path: "docs/purpose/ai-workbench.md", title: "AI Workbench purpose", status: "proposed", authority: "controlled-proposal" },
    { path: "methodology/operations-automated-overview.md", title: "Approved methodology", status: "approved", authority: "approved-normative" }
  ],
  workProfile: { id: "product-application-build", label: "Product or application build", version: "OA-WORK-PROFILES-001@0.1" }
};

function approvedControls() {
  return {
    ...controls,
    steering: { ...controls.steering, status: "approved", approving_decision: "OA-DECISION-STEERING-FRAMING-TEST" },
    decisionIds: new Set([...controls.decisionIds, "OA-DECISION-STEERING-FRAMING-TEST"]),
    prompts: controls.prompts.map((prompt) => prompt.prompt_id === "OA-PROMPT-WORKBENCH-BUILD-001" && prompt.exact_version === "1.0"
      ? { ...prompt, status: "approved", approving_decision: "OA-DECISION-2026-07-26-010" }
      : prompt)
  };
}

function completeFeatureInput(overrides = {}) {
  return {
    sourceText: "Add a governed request-framing journey to the private Workbench so Jamie can turn ordinary language into the correct actionable route.",
    userStatedOutcome: "Jamie can understand the request route, created records and exact next action without developer tooling.",
    currentBehaviour: "The steering surface classifies a request but stops before readiness, work packaging and handoff.",
    requiredBehaviour: "Return a complete governed route and produce a Codex handoff only when every implementation gate passes.",
    acceptanceCriteria: [
      "Natural language produces a governed route with visible readiness.",
      "Codex receives a complete implementation package only at stage D."
    ],
    testScenarios: ["Complete the ordinary-language-to-handoff vertical journey."],
    constraints: ["Preserve human authority and existing records."],
    exclusions: ["Do not merge or release."],
    authorityToPrepare: true,
    authorityStatement: "Jamie authorises preparation and implementation on a proposal branch only.",
    ...overrides
  };
}

test("1. a normal Workbench enhancement stays in the Workbench", () => {
  const framing = frameRequest(completeFeatureInput(), approvedControls(), baseContext, fixedClock);
  assert.equal(framing.projectBoundary.recommendation, "remain-current-product");
  assert.equal(framing.workPackage.identity.targetProject, "ai-workbench");
  assert.ok(framing.classifications.some((item) => item.key === "workbench-feature"));
});

test("2. a Methodology challenge enters the learning route", () => {
  const framing = frameRequest({ sourceText: "Challenge the methodology assumption that every handoff needs a formal Change." }, controls, baseContext, fixedClock);
  assert.ok(framing.classifications.some((item) => item.key === "methodology-challenge"));
  assert.ok(framing.recordPlan.createWhenConfirmed.some((item) => item.type === "Feedback"));
  assert.equal(framing.codex.selected, false);
});

test("3. a Governance lifecycle request routes to the separate Governance product", () => {
  const framing = frameRequest({ sourceText: "Add a policy approval lifecycle to the Dynamic Governance Tool." }, controls, baseContext, fixedClock);
  assert.equal(framing.workPackage.identity.targetProject, "dynamic-governance-tool");
  assert.equal(framing.projectBoundary.recommendation, "create-separate-project");
  assert.ok(framing.projectBoundary.newProject.exactHumanDecisionRequired);
});

test("4. an RPG feature becomes a separate-project item", () => {
  const framing = frameRequest({ sourceText: "Build a multiplayer exercise for the Incident Management RPG." }, controls, baseContext, fixedClock);
  assert.equal(framing.projectBoundary.recommendation, "create-separate-project");
  assert.equal(framing.workPackage.identity.targetProject, "incident-management-rpg");
  assert.ok(framing.recordPlan.createWhenConfirmed.some((item) => item.type === "Decision"));
});

test("5. a Player Lab feature becomes a separate-project item", () => {
  const framing = frameRequest({ sourceText: "Add scouting comparisons to Football Manager Player Lab." }, controls, baseContext, fixedClock);
  assert.equal(framing.projectBoundary.recommendation, "create-separate-project");
  assert.equal(framing.workPackage.identity.targetProject, "football-manager-player-lab");
});

test("6. a simple answer does not create a Build Job", () => {
  const framing = frameRequest({ sourceText: "What does the current readiness path mean?" }, controls, baseContext, fixedClock);
  assert.equal(framing.modelToolRoute.route, "deterministic-local");
  assert.equal(framing.codex.required, false);
  assert.equal(framing.codexHandoff, null);
  assert.ok(framing.recordPlan.notCreated.some((item) => item.type === "Task"));
});

test("7. a vague feature remains in Explore or Define", () => {
  const framing = frameRequest({ sourceText: "Add AI to the Workbench." }, approvedControls(), baseContext, fixedClock);
  assert.ok(["B", "C"].includes(framing.readiness.stage));
  assert.equal(framing.readiness.implementationReady, false);
  assert.equal(framing.materialQuestions.length, 1);
  assert.equal(framing.codexHandoff, null);
});

test("8. a sufficiently defined feature reaches Implementation Ready", () => {
  const framing = frameRequest(completeFeatureInput(), approvedControls(), baseContext, fixedClock);
  assert.equal(framing.readiness.stage, "D");
  assert.equal(framing.codex.selected, true);
  assert.match(framing.codexHandoff.prompt, /^TITLE\n/m);
  assert.match(framing.codexHandoff.prompt, /\nACCEPTANCE CRITERIA\n/);
  assert.match(framing.codexHandoff.prompt, /\nSTRUCTURED RETURN\n/);
  assert.match(framing.codexHandoff.prompt, /\nDO NOT\n/);
});

test("9. a purpose change cannot be disguised as a feature", () => {
  const framing = frameRequest({
    ...completeFeatureInput(),
    sourceText: "Change the Product Purpose so the Workbench becomes a general autonomous project management suite."
  }, approvedControls(), baseContext, fixedClock);
  assert.ok(framing.classifications.some((item) => item.key === "purpose-change"));
  assert.equal(framing.codex.selected, false);
  assert.ok(framing.recordPlan.createWhenConfirmed.some((item) => item.type === "Decision"));
});

test("10. related Ideas are surfaced without automatically entering scope", () => {
  const framing = frameRequest(completeFeatureInput(), approvedControls(), {
    ...baseContext,
    ideas: [{ id: "OA-IDEA-001", title: "Incident Management Simulation Game", status: "idea", path: "ideas/incident-management-simulation-game.md" }]
  }, fixedClock);
  assert.equal(framing.workPackage.currentState.relatedIdeas.length, 1);
  assert.ok(!framing.workPackage.purposeAndScope.inScope.some((item) => /simulation game/i.test(item)));
});

test("11. previously rejected work is not reopened without new evidence", () => {
  const framing = frameRequest(completeFeatureInput(), approvedControls(), {
    ...baseContext,
    rejectedWork: [{ id: "DEC-OLD", title: "Earlier rejected framing route", status: "rejected" }]
  }, fixedClock);
  assert.equal(framing.projectBoundary.recommendation, "defer-pending-evidence");
  assert.equal(framing.readiness.stage, "B");
  assert.equal(framing.codex.selected, false);
});

test("12. existing answers prevent repeated questions", () => {
  const framing = frameRequest({ sourceText: "Add AI to the Workbench." }, approvedControls(), {
    ...baseContext,
    existingAnswers: [{ questionId: "intended-outcome", answer: "Jamie can frame work." }]
  }, fixedClock);
  assert.equal(framing.materialQuestions.some((item) => item.id === "intended-outcome"), false);
});

test("13. the cheapest sufficient route is used for simple classification", () => {
  const framing = frameRequest({ sourceText: "For information only: keep this note; no action required." }, controls, baseContext, fixedClock);
  assert.equal(framing.modelToolRoute.route, "deterministic-local");
  assert.equal(framing.modelToolRoute.costClass, "no-provider-cost");
});

test("14. Codex is selected only for implementation", () => {
  const research = frameRequest({ sourceText: "Research evidence about operational handoff quality." }, controls, baseContext, fixedClock);
  const implementation = frameRequest(completeFeatureInput(), approvedControls(), baseContext, fixedClock);
  assert.equal(research.codex.selected, false);
  assert.equal(implementation.codex.selected, true);
});

test("15. an inadequate Codex return remains open", () => {
  const framing = frameRequest(completeFeatureInput(), approvedControls(), baseContext, fixedClock);
  const review = reviewCodexReturn(framing, {
    workReference: framing.reference,
    intendedOutcome: framing.interpretation.apparentOutcome,
    filesChanged: ["app/request-framing.mjs"],
    tests: ["node --test: passed"],
    migrationPerformed: "Additive migration passed.",
    rollbackPath: "Restore verified copy.",
    unresolvedRisks: [],
    remainingWork: [],
    authorityBoundary: "No release.",
    acceptanceCriterionEvidence: []
  });
  assert.equal(review.complete, false);
  assert.equal(review.status, "open-inadequate-return");
  assert.equal(review.failedCriteria.length, framing.workPackage.acceptanceAndValidation.acceptanceCriteria.length);
});

test("16. the complete route retains provenance", () => {
  const framing = frameRequest(completeFeatureInput(), approvedControls(), baseContext, fixedClock);
  assert.equal(framing.provenance.framingPromptId, FRAMING_PROMPT.id);
  assert.equal(framing.provenance.framingPromptVersion, FRAMING_PROMPT.version);
  assert.equal(framing.provenance.generationTime, fixedClock());
  assert.match(framing.codexHandoff.prompt, /Framing prompt: OA-PROMPT-REQUEST-FRAMING-001@1\.0/);
  assert.match(framing.codexHandoff.prompt, /Final approved handoff version: not yet approved/);
});

test("the Workbench API retains the full framing and creates only the minimum draft route", { timeout: 30_000 }, async () => {
  const dataRoot = await mkdtemp(join(tmpdir(), "oa-request-framing-api-"));
  const port = 47173;
  const child = spawn(process.execPath, ["app/server.mjs"], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      PORT: String(port),
      OPENAI_API_KEY: "",
      WORKBENCH_FORCE_LOCAL: "1",
      WORKBENCH_DATA_ROOT: dataRoot,
      WORKBENCH_REPOSITORY_ROOT: repositoryRoot
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  await new Promise((resolveReady, reject) => {
    child.stdout.on("data", (chunk) => chunk.toString().includes("running at") && resolveReady());
    child.once("exit", (code) => reject(new Error(`Server exited ${code}: ${stderr}`)));
  });
  const call = async (path, body) => {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    return { response, value: await response.json() };
  };
  try {
    const framed = await call("/api/steering/intakes", {
      sourceText: "Add a recovery-status panel to the private Workbench so Jamie can understand whether controlled restoration is ready."
    });
    assert.equal(framed.response.status, 201, JSON.stringify(framed.value));
    assert.equal(framed.value.intake.status, "framed");
    assert.equal(framed.value.intake.framing.preflight.retrievedBeforeFraming, true);
    assert.equal(framed.value.intake.framing.projectBoundary.recommendation, "remain-current-product");
    assert.equal(framed.value.intake.framing.codex.selected, false);
    assert.equal(framed.value.intake.framing.readiness.stage, "C");
    assert.ok(framed.value.intake.knowledgeSnapshotId);

    const created = await call(`/api/steering/intakes/${framed.value.intake.id}/create-route`, {});
    assert.equal(created.response.status, 201, JSON.stringify(created.value));
    assert.equal(created.value.created.length, 1);
    assert.equal(created.value.created[0].recordType, "improvement");
    assert.equal(created.value.created[0].approvalState, "not-approved");
    assert.equal(created.value.implementationJobCreated, false);
    assert.equal(created.value.intake.linkedRecords.length, 1);

    const vague = await call("/api/steering/intakes", { sourceText: "Add AI to the Workbench." });
    assert.equal(vague.response.status, 201, JSON.stringify(vague.value));
    assert.equal(vague.value.intake.framing.materialQuestions[0].id, "intended-outcome");
    const answered = await call(`/api/steering/intakes/${vague.value.intake.id}/answer`, {
      questionId: "intended-outcome",
      answer: "Jamie can describe a need and understand the governed product route and next action."
    });
    assert.equal(answered.response.status, 200, JSON.stringify(answered.value));
    assert.equal(answered.value.intake.id, vague.value.intake.id);
    assert.equal(answered.value.intake.sourceText, vague.value.intake.sourceText);
    assert.equal(answered.value.intake.framing.materialQuestions.length, 0);
    assert.equal(answered.value.intake.framing.provenance.humanChanges.length, 1);
    assert.match(answered.value.intake.framing.interpretation.apparentOutcome, /governed product route/i);

    const answer = await call("/api/steering/intakes", { sourceText: "What does the current approved readiness path mean?" });
    assert.equal(answer.response.status, 201, JSON.stringify(answer.value));
    assert.equal(answer.value.intake.framing.codex.required, false);
    assert.equal(answer.value.intake.framing.recordPlan.notCreated.some((item) => item.type === "Task"), true);
    const retained = await call(`/api/steering/intakes/${answer.value.intake.id}/create-route`, {});
    assert.equal(retained.response.status, 200, JSON.stringify(retained.value));
    assert.equal(retained.value.created.length, 0);
  } finally {
    if (child.exitCode === null) {
      child.kill();
      await new Promise((resolveExit) => child.once("exit", resolveExit));
    }
    await rm(dataRoot, { recursive: true, force: true });
  }
});

test("the founder interface exposes framing, one material answer and minimum route creation", async () => {
  const [html, script, styles] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../app.js", import.meta.url), "utf8"),
    readFile(new URL("../styles.css", import.meta.url), "utf8")
  ]);
  assert.match(html, /Describe what you need/);
  assert.match(html, /Frame my request/);
  assert.match(script, /data-answer-framing-question/);
  assert.match(script, /Continue with this answer/);
  assert.match(script, /data-create-framing-route/);
  assert.match(styles, /\.framing-route-grid/);
  assert.match(styles, /\.framing-question textarea/);
});
