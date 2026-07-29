import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { DatabaseSync, backup } from "node:sqlite";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  acceptanceCriteriaAlign, buildProvenanceFor, classifyRequest, collateCurrentPrompts, loadSteeringControls,
  selectCurrentPrompt, steeringOverview, validateBuildProvenance
} from "../steering-control.mjs";

const repositoryRoot = process.cwd();
const controls = loadSteeringControls(repositoryRoot);

test("normal in-scope Workbench requests remain in the Workbench", () => {
  const value = classifyRequest("Add a recovery-status panel to the private Workbench.", controls);
  assert.equal(value.primaryTarget, "ai-workbench");
  assert.ok(value.candidates.some((item) => item.classification === "workbench-product-change"));
  assert.ok(value.candidates.every((item) => item.purposeVersion && item.steeringVersion && item.aiInference));
  assert.ok(value.candidates.every((item) => Array.isArray(item.linkedCandidateIds) && Array.isArray(item.assumptions)));
  assert.equal(value.boundary.recommendation, "remain-current-product");
});

test("Governance Tool requests route to the separate Governance product", () => {
  const value = classifyRequest("Add a control-testing view to the Dynamic Governance Tool.", controls);
  assert.equal(value.primaryTarget, "dynamic-governance-tool");
  assert.ok(value.candidates.some((item) => item.classification === "governance-tool-product-change"));
  assert.equal(value.boundary.recommendation, "create-separate-project");
  assert.match(value.boundary.newProject.migrationOrIntegration, /non-destructive/i);
});

test("Incident Management RPG and Player Lab requests remain separate projects", () => {
  const incident = classifyRequest("Build a multiplayer scenario for the Incident Management RPG.", controls);
  const player = classifyRequest("Add scouting comparisons to Football Manager Player Lab.", controls);
  assert.equal(incident.primaryTarget, "incident-management-rpg");
  assert.equal(player.primaryTarget, "football-manager-player-lab");
  assert.equal(incident.boundary.recommendation, "create-separate-project");
  assert.equal(player.boundary.recommendation, "create-separate-project");
  assert.ok(incident.candidates.some((item) => item.classification === "new-project-candidate"));
  assert.ok(player.candidates.some((item) => item.classification === "new-project-candidate"));
});

test("a feature request cannot silently start or approve a Product Purpose change", () => {
  const feature = classifyRequest("Add a prompt history feature to the Workbench.", controls);
  const explicitReview = classifyRequest("Start a Product Purpose review for the Workbench.", controls);
  assert.equal(feature.purposeChangeAllowed, false);
  assert.equal(feature.approvalState, "not-approved-by-classification");
  assert.equal(explicitReview.purposeChangeAllowed, true);
  assert.ok(explicitReview.candidates.some((item) => item.classification === "purpose-boundary-change"));
});

test("superseded prompts are excluded from current selection and collation", () => {
  const current = selectCurrentPrompt(controls, { targetProject: "operations-automated-core", targetCapability: "steering-control-installation" });
  const collation = collateCurrentPrompts(controls, "ai-workbench", { includeDrafts: true });
  assert.equal(current.exact_version, "1.0");
  assert.equal(current.status, "approved");
  assert.ok(collation.supersededExcluded.includes("OA-PROMPT-WORKBENCH-BUILD-001@0.9"));
  assert.ok(collation.current.every((prompt) => prompt.status !== "superseded"));
  assert.ok(collation.drafts.some((prompt) => prompt.prompt_id === "OA-PROMPT-WORKBENCH-BUILD-001" && prompt.exact_version === "1.0"));
  assert.match(current.exact_text, /NON-NEGOTIABLE ARCHITECTURE/);
});

test("a material build is blocked without exact purpose and prompt provenance", () => {
  const incomplete = validateBuildProvenance(controls, { targetProject: "ai-workbench" });
  assert.throws(() => buildProvenanceFor(controls, { targetProject: "ai-workbench", targetCapability: "product-application-build" }), /Steering.*not approved/i);
  const approvedControls = {
    ...controls,
    steering: { ...controls.steering, status: "approved", approving_decision: "OA-DECISION-STEERING-TEST" },
    decisionIds: new Set([...controls.decisionIds, "OA-DECISION-STEERING-TEST"]),
    prompts: controls.prompts.map((prompt) => prompt.prompt_id === "OA-PROMPT-WORKBENCH-BUILD-001" && prompt.exact_version === "1.0"
      ? { ...prompt, status: "approved", approving_decision: "OA-DECISION-2026-07-26-010" }
      : prompt)
  };
  const provenance = buildProvenanceFor(approvedControls, { targetProject: "ai-workbench", targetCapability: "product-application-build" });
  const complete = validateBuildProvenance(approvedControls, provenance);
  const wrongHash = validateBuildProvenance(approvedControls, { ...provenance, promptSha256: "not-the-registered-hash" });
  assert.equal(incomplete.valid, false);
  assert.match(incomplete.missing.join(" "), /Purpose|prompt|Steering/i);
  assert.equal(complete.valid, true, complete.missing.join(", "));
  assert.equal(wrongHash.valid, false);
  assert.match(wrongHash.missing.join(" "), /hash/i);
});

test("an instruction that collapses product and database boundaries is surfaced as a conflict", () => {
  const value = classifyRequest("Merge Dynamic Governance into the Workbench and use a shared database.", controls);
  assert.equal(value.boundary.recommendation, "reject-purpose-inconsistent");
  assert.ok(value.conflicts.some((conflict) => conflict.severity === "blocking"));
  assert.ok(value.conflicts.every((conflict) => conflict.owner === "Jamie Peppard" && conflict.precedenceLevel && conflict.effect && conflict.disposition));
});

test("learning-loop, technical-approval and acceptance-outcome conflicts remain visible", () => {
  const learning = classifyRequest("Disable Workbench feedback history to simplify the screen.", controls);
  const authority = classifyRequest("The tests passed, so approve and release the Workbench.", controls);
  const mismatch = acceptanceCriteriaAlign("Provide a recoverable prompt registry", ["The colour palette looks balanced."]);
  const overview = steeringOverview(controls, { buildVersion: "1.6.0-steering-control-draft" });
  assert.ok(learning.conflicts.some((item) => item.id === "request-weakens-methodology-learning-loop"));
  assert.ok(authority.conflicts.some((item) => item.id === "technical-completion-mistaken-for-approval"));
  assert.equal(mismatch.valid, false);
  assert.ok(overview.conflicts.some((item) => item.id === "implemented-steering-remains-proposed"));
});

test("the recorded recovery route is successful and a copied SQLite database retains governed records", async () => {
  assert.equal(controls.recovery.latest.restore_status, "succeeded");
  assert.equal(controls.recovery.latest.restored_counts.conversations, 12);
  const root = await mkdtemp(join(tmpdir(), "oa-steering-recovery-test-"));
  const sourcePath = join(root, "source.sqlite");
  const restoredPath = join(root, "restored.sqlite");
  const source = new DatabaseSync(sourcePath);
  source.exec("CREATE TABLE conversations(id TEXT); CREATE TABLE governed_decisions(id TEXT); CREATE TABLE governed_approvals(id TEXT); CREATE TABLE implementation_jobs(id TEXT); INSERT INTO conversations VALUES('c1'); INSERT INTO governed_decisions VALUES('d1'); INSERT INTO governed_approvals VALUES('a1'); INSERT INTO implementation_jobs VALUES('j1');");
  await backup(source, restoredPath);
  source.close();
  const restored = new DatabaseSync(restoredPath, { readOnly: true });
  for (const table of ["conversations", "governed_decisions", "governed_approvals", "implementation_jobs"]) {
    assert.equal(Number(restored.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count), 1);
  }
  restored.close();
  await rm(root, { recursive: true, force: true });
});

test("existing specialist workflows remain present beside the steering surface", async () => {
  const server = await readFile(new URL("../server.mjs", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(server, /\/api\/brand-review/);
  assert.match(server, /\/api\/connections\/confluence\/publications/);
  assert.match(html, /Brand review/);
  assert.match(html, /Connections/);
  assert.match(html, /Purpose &amp; steering/);
});

test("approved purpose and prompt statuses require an available recorded human Decision", () => {
  assert.equal(controls.registryStatus, "loaded");
  for (const prompt of controls.prompts.filter((item) => item.status === "approved")) {
    assert.ok(prompt.approving_decision);
    assert.equal(controls.decisionIds.has(prompt.approving_decision), true, prompt.approving_decision);
  }
  for (const purpose of controls.purposes.filter((item) => item.metadata.status === "approved")) {
    assert.ok(purpose.metadata.approving_decision, purpose.path);
  }
  assert.equal(controls.conflicts.some((item) => item.id.startsWith("unapproved-current-prompt") || item.id.startsWith("purpose-approved-without-decision")), false);
});

test("a rejected new-project recommendation remains traceable through the Workbench API", { timeout: 25_000 }, async () => {
  const dataRoot = await mkdtemp(join(tmpdir(), "oa-steering-api-"));
  const port = 46173;
  const child = spawn(process.execPath, ["app/server.mjs"], {
    cwd: repositoryRoot,
    env: { ...process.env, PORT: String(port), OPENAI_API_KEY: "", WORKBENCH_FORCE_LOCAL: "1", WORKBENCH_DATA_ROOT: dataRoot, WORKBENCH_REPOSITORY_ROOT: repositoryRoot },
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
    const conversation = await call("/api/conversations", { workspace: "living-methodology", title: "Prompt collation check" });
    assert.equal(conversation.response.status, 201, JSON.stringify(conversation.value));
    const collation = await call("/api/respond", {
      conversationId: conversation.value.conversation.id,
      text: "Collate my current prompts",
      outputType: "answer",
      confirmed: true
    });
    assert.equal(collation.response.status, 200, JSON.stringify(collation.value));
    assert.match(collation.value.message.working_text, /OA-PROMPT-STEERING-INSTALL-001@1\.0/);
    assert.match(collation.value.message.working_text, /NON-NEGOTIABLE ARCHITECTURE/);
    assert.doesNotMatch(collation.value.message.working_text, /OA-PROMPT-WORKBENCH-BUILD-001@0\.9/);
    assert.equal(collation.value.usage.status, "offline");

    const created = await call("/api/steering/intakes", { sourceText: "Build a new scenario in the Incident Management RPG." });
    assert.equal(created.response.status, 201, JSON.stringify(created.value));
    assert.equal(created.value.intake.boundary.recommendation, "create-separate-project");
    const decided = await call(`/api/steering/intakes/${created.value.intake.id}/decision`, { action: "reject-route", actor: "Jamie Peppard", reason: "Keep this outside the current delivery scope." });
    assert.equal(decided.response.status, 200, JSON.stringify(decided.value));
    assert.equal(decided.value.intake.status, "route-rejected");
    assert.equal(decided.value.intake.decision.reason, "Keep this outside the current delivery scope.");
    assert.equal(decided.value.approvalCreated, false);
    const overview = await call("/api/steering");
    const retained = overview.value.intakes.find((item) => item.id === created.value.intake.id);
    assert.equal(retained.status, "route-rejected");
    assert.equal(retained.decision.action, "reject-route");
  } finally {
    if (child.exitCode === null) {
      child.kill();
      await new Promise((resolveExit) => child.once("exit", resolveExit));
    }
    await rm(dataRoot, { recursive: true, force: true });
  }
});
