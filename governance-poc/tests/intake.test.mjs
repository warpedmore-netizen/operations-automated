import test from "node:test";
import assert from "node:assert/strict";
import { createSeed } from "../seed.mjs";
import { answerIntakeQuestion, classifyChange, createIntake, intakeProfiles, recommendChangeClass, reviewCandidate } from "../intake.mjs";

test("intake adapters retain different source structures and references", () => {
  assert.equal(intakeProfiles.word.structure, "headings-paragraphs-tables");
  assert.equal(intakeProfiles.googleDocs.reference, "document-id");
  assert.equal(intakeProfiles.confluence.reference, "page-id");
  assert.equal(intakeProfiles.notion.structure, "workspace-parent-page-properties-blocks");
  assert.equal(intakeProfiles.guided.input, "answers");
});

test("document type, starting route and source platform remain separate", () => {
  const created = createIntake(createSeed(), { intakeRoute: "new", documentType: "policy", title: "Incident Policy", actor: "Jamie" });
  assert.equal(created.intakes[0].documentType, "policy");
  assert.equal(created.intakes[0].sourceType, "guided");
  assert.equal(created.intakeQuestions.some(item => item.key === "sourceContent"), false);
  const imported = createIntake(createSeed(), { intakeRoute: "existing", documentType: "procedure", sourceType: "notion", title: "Escalation", reference: "notion-page-id", actor: "Jamie" });
  assert.equal(imported.intakes[0].documentType, "procedure");
  assert.equal(imported.intakes[0].sourceType, "notion");
});

test("document intake combines required and gap-driven questions", () => {
  const state = createIntake(createSeed(), { sourceType: "word", title: "Incident Policy", reference: "incident-policy.docx", content: "The Incident Lead should notify Risk.\n2. Record the incident decision.", actor: "Jamie" });
  const questions = state.intakeQuestions;
  assert.ok(questions.some(item => item.key === "owner" && item.reason === "required-governance-baseline"));
  assert.ok(questions.some(item => item.key === "mandatoryMeaning"));
  assert.ok(state.intakeCandidates.some(item => item.objectType === "PolicyStatement"));
  assert.ok(state.intakeCandidates.some(item => item.objectType === "ProcedureStep"));
  assert.ok(state.intakeCandidates.every(item => item.status === "suggested"));
});

test("remote references require an identifier and do not pretend to retrieve content", () => {
  assert.throws(() => createIntake(createSeed(), { sourceType: "googleDocs", title: "Policy", actor: "Jamie" }), /requires a document reference/);
  const state = createIntake(createSeed(), { sourceType: "confluence", title: "Policy", reference: "12345", actor: "Jamie" });
  assert.equal(state.intakes[0].contentBoundary, "no content retrieved in mock mode");
  assert.ok(state.intakeQuestions.some(item => item.key === "sourceContent"));
});

test("answers and extracted candidates require human review", () => {
  let state = createIntake(createSeed(), { sourceType: "text", title: "Policy", content: "The owner must record evidence.", actor: "Jamie" });
  state = answerIntakeQuestion(state, "Q-001", "Incident Management Owner", "Jamie");
  state = reviewCandidate(state, "CAND-001", "amended", "Jamie", "The Incident Lead must record evidence.");
  assert.equal(state.intakeQuestions[0].status, "answered");
  assert.equal(state.intakeCandidates[0].status, "accepted");
  assert.equal(state.intakeCandidates[0].reviewDecision.decision, "amended");
});

test("any role may escalate a recommended change", () => {
  const state = classifyChange(createSeed(), { title: "Treat criterion as material", changedFields: ["criteria"], actor: "Contributor", role: "Contributor", requestedClass: "material", justification: "Potential customer impact" });
  assert.equal(state.changeAssessments[0].recommendedClass, "minor");
  assert.equal(state.changeAssessments[0].selectedClass, "material");
  assert.equal(state.changeAssessments[0].direction, "escalated");
});

test("downgrades require both delegated role authority and justification", () => {
  const base = { title: "Change control owner", changedFields: ["owner"], actor: "Reviewer", requestedClass: "minor" };
  assert.throws(() => classifyChange(createSeed(), { ...base, role: "Contributor", justification: "Small team" }), /not authorised/);
  assert.throws(() => classifyChange(createSeed(), { ...base, role: "Governance Chair", justification: "" }), /requires recorded justification/);
  const state = classifyChange(createSeed(), { ...base, role: "Governance Chair", justification: "Delegated operational ownership only" });
  assert.equal(state.changeAssessments[0].direction, "downgraded");
  assert.equal(state.changeAssessments[0].approvalRing, "Team");
});

test("classification produces proportionate approval and notification rules", () => {
  assert.equal(recommendChangeClass({ changedFields: ["risk appetite"] }), "fundamental");
  const state = classifyChange(createSeed(), { title: "Risk appetite", changedFields: ["risk appetite"], actor: "Jamie", role: "Contributor" });
  const assessment = state.changeAssessments[0];
  assert.equal(assessment.approvalRing, "Executive or Board");
  assert.ok(assessment.notificationRules.some(item => item.audience === "Executive forum" && item.action === "approve"));
});
