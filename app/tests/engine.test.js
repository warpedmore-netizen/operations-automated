const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../engine.js");

function completeSetup(workspace) {
  Object.assign(workspace.project, {
    title: "Improve handoffs",
    problem: "Customers repeat information between teams",
    peopleAffected: "Customers and service colleagues",
    owner: "Service owner"
  });
  Object.assign(workspace.value, {
    proposition: "Reduce customer effort while preserving safe decisions",
    desiredOutcome: "Customers provide information once",
    beneficiary: "Customers",
    formsOfValue: "Confidence, time and quality",
    priorities: "Safety, customer confidence, then time",
    minimumOutcome: "No reduction in decision quality",
    constraints: "Privacy, accessibility and human review",
    decisionAuthority: "Service owner"
  });
  return workspace;
}

function completeStage(workspace, stageId) {
  Object.assign(workspace.stages[stageId], {
    evidence: `Evidence for ${stageId}`,
    decision: `Decision for ${stageId}`,
    owner: "Service owner"
  });
  return workspace;
}

test("a new workspace begins at Observe with local governance metadata", () => {
  const workspace = engine.createWorkspace("2026-07-20T10:00:00.000Z");
  assert.equal(workspace.currentStage, "observe");
  assert.equal(workspace.methodologyVersion, "0.3");
  assert.equal(workspace.status, "active");
  assert.equal(workspace.activity[0].type, "workspace-created");
});

test("the engine asks for project context before value or stage work", () => {
  const assessment = engine.assessWorkspace(engine.createWorkspace());
  assert.equal(assessment.nextAction, "Define the problem and ownership");
  assert.deepEqual(assessment.setupMissing, ["title", "problem", "peopleAffected", "owner"]);
  assert.equal(assessment.canAdvance, false);
});

test("user-defined value is required before progressing the current stage", () => {
  const workspace = engine.createWorkspace();
  Object.assign(workspace.project, { title: "A", problem: "B", peopleAffected: "C", owner: "D" });
  const assessment = engine.assessWorkspace(workspace);
  assert.equal(assessment.nextAction, "Complete the user-defined value matrix");
  assert.equal(assessment.valueMissing.length, 8);
});

test("Observe can advance when setup, value and stage evidence are complete", () => {
  const workspace = completeStage(completeSetup(engine.createWorkspace()), "observe");
  const assessment = engine.assessWorkspace(workspace);
  assert.equal(assessment.canAdvance, true);
  const result = engine.advanceStage(workspace, "2026-07-20T11:00:00.000Z");
  assert.equal(result.advanced, true);
  assert.equal(result.workspace.currentStage, "prioritise");
});

test("a consequential gate cannot be passed without named human approval", () => {
  let workspace = completeStage(completeSetup(engine.createWorkspace()), "observe");
  workspace = engine.advanceStage(workspace).workspace;
  completeStage(workspace, "prioritise");

  let assessment = engine.assessWorkspace(workspace);
  assert.equal(assessment.control, "Human approval required");
  assert.equal(assessment.canAdvance, false);

  workspace = engine.setApproval(workspace, "prioritise", "Jamie Peppard", "2026-07-20T12:00:00.000Z");
  assessment = engine.assessWorkspace(workspace);
  assert.equal(assessment.canAdvance, true);
  assert.equal(workspace.approvals.prioritise.approvedBy, "Jamie Peppard");
});

test("approval cannot be inferred without an authorised human name", () => {
  const workspace = completeSetup(engine.createWorkspace());
  assert.throws(() => engine.setApproval(workspace, "prioritise", ""), /Record the authorised human's name/);
});

test("changing approved value removes affected approval and returns to Prioritise", () => {
  let workspace = completeStage(completeSetup(engine.createWorkspace()), "observe");
  workspace = engine.advanceStage(workspace).workspace;
  completeStage(workspace, "prioritise");
  workspace = engine.setApproval(workspace, "prioritise", "Jamie Peppard");
  workspace = engine.advanceStage(workspace).workspace;
  assert.equal(workspace.currentStage, "examine");

  workspace.value.priorities = "Customer confidence before speed";
  workspace = engine.invalidateFromStage(workspace, "prioritise", "Value matrix changed");
  assert.equal(workspace.currentStage, "prioritise");
  assert.equal(workspace.approvals.prioritise, undefined);
  assert.equal(workspace.activity.at(-1).type, "governance-reset");
});

test("changing stage evidence after approval removes that approval", () => {
  let workspace = completeStage(completeSetup(engine.createWorkspace()), "observe");
  workspace = engine.advanceStage(workspace).workspace;
  completeStage(workspace, "prioritise");
  workspace = engine.setApproval(workspace, "prioritise", "Jamie Peppard");
  workspace.stages.prioritise.evidence = "Revised evidence";
  workspace = engine.invalidateFromStage(workspace, "prioritise", "Evidence changed");
  assert.equal(workspace.approvals.prioritise, undefined);
  assert.equal(engine.assessWorkspace(workspace).control, "Human approval required");
});

test("the exported record includes value, stages and human approvals", () => {
  let workspace = completeStage(completeSetup(engine.createWorkspace()), "observe");
  workspace = engine.advanceStage(workspace).workspace;
  completeStage(workspace, "prioritise");
  workspace = engine.setApproval(workspace, "prioritise", "Jamie Peppard", "2026-07-20T12:00:00.000Z");
  const markdown = engine.exportMarkdown(workspace);
  assert.match(markdown, /# Improve handoffs/);
  assert.match(markdown, /## User-defined value/);
  assert.match(markdown, /Jamie Peppard/);
  assert.match(markdown, /## Evolve/);
});

test("an AI brief exposes the next action and preserves the human boundary", () => {
  const workspace = completeSetup(engine.createWorkspace());
  const brief = engine.buildAiBrief(workspace);
  assert.match(brief, /Next governed action:/);
  assert.match(brief, /Do not approve on behalf of the authorised human/);
  assert.match(brief, /Reduce customer effort/);
});

test("invalid imported stages return safely to Observe", () => {
  const workspace = engine.normaliseWorkspace({ currentStage: "publish", project: { title: "Imported" } });
  assert.equal(workspace.currentStage, "observe");
  assert.equal(workspace.project.title, "Imported");
  assert.ok(workspace.stages.evolve);
});
