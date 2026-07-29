import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  findRelatedMethodologySignals, synthesiseMethodologySignals,
  validateApplicationContract, validateChangeContract, validateMethodologyRegistry
} from "../methodology-learning.mjs";
import { KNOWLEDGE_MANIFEST, scanWorkingTree } from "../repository-index.mjs";

const registry = JSON.parse(readFileSync(resolve(process.cwd(), "knowledge/methodology-components.v0.7.json"), "utf8"));
const schema = JSON.parse(readFileSync(resolve(process.cwd(), "knowledge/methodology-contract.schema.json"), "utf8"));

test("machine-readable components link to human authority and remain proposed", () => {
  assert.equal(validateMethodologyRegistry(registry), registry);
  assert.equal(registry.status, "proposed");
  assert.ok(registry.components.some((component) => component.component_id === "founder-charter"));
  assert.ok(registry.components.some((component) => component.component_id === "evolution-system"));
  for (const component of registry.components) {
    assert.ok(component.human_authority.path);
    assert.ok(component.human_authority.artefact_id);
    assert.ok(Array.isArray(component.required_questions));
    assert.ok(Array.isArray(component.review_triggers));
  }
});

test("contract schema defines application, signal, synthesis, change, release and outcome records", () => {
  for (const definition of ["application", "learningSignal", "synthesis", "changeProposal", "release", "outcomeReview"]) {
    assert.ok(schema.$defs[definition], `${definition} definition should exist`);
  }
  assert.deepEqual(schema.$defs.approvalState, {
    const: "not-approved",
    description: "Application, feedback, synthesis and proposal records cannot create approval."
  });
});

test("machine forms are indexed as proposed evidence rather than normative methodology", () => {
  const documents = scanWorkingTree(process.cwd(), KNOWLEDGE_MANIFEST);
  for (const path of ["knowledge/methodology-components.v0.7.json", "knowledge/methodology-contract.schema.json"]) {
    const document = documents.find((item) => item.path === path);
    assert.ok(document, `${path} should be indexed`);
    assert.equal(document.status, "proposed");
    assert.equal(document.normative, false);
    assert.equal(document.authority, "evidence-only");
  }
});

test("a methodology application carries its version and exact knowledge snapshot", () => {
  const application = {
    methodology_version: "0.7",
    relevant_components: ["founder-charter", "output-contract"],
    knowledge_snapshot: {
      snapshot_id: "snapshot-1",
      source_ref: "origin/main",
      baseline_version: "0.7",
      sources: [{ path: "CHARTER.md", artefact_id: "OA-CHARTER-001", version: "0.3", status: "approved", hash: "abc" }]
    },
    user_context: { case: "non-confidential recurring activity" },
    evidence: [],
    assumptions: [],
    uncertainty: "Case evidence is illustrative.",
    result: "A useful provisional answer.",
    options: ["Retain the current work", "Run a bounded improvement"],
    recommendation: "Run the smallest reversible test.",
    authority_required: "The operational owner decides whether to proceed.",
    case_test: "proportionate Ask route",
    feedback_route: "feedback-1",
    approval_state: "not-approved"
  };
  assert.equal(validateApplicationContract(application), application);
  assert.throws(() => validateApplicationContract({ ...application, approval_state: "approved" }), /cannot create approval/i);
});

test("related corrections can be retrieved and synthesised without becoming approval", () => {
  const signals = [
    {
      id: "signal-1",
      original_wording: "The answer hid the human accountability decision.",
      classification: "answer-only-correction",
      learning_disposition: "answer-only-correction",
      affectedComponents: ["human-ai-collaboration"],
      source_reference: "conversation-1",
      evidence: ["Observed answer"],
      evidence_limitations: "One interaction"
    },
    {
      id: "signal-2",
      original_wording: "Make human accountability visible in a methodology recommendation.",
      classification: "methodology-change-candidate",
      learning_disposition: "methodology-change-candidate",
      affectedComponents: ["human-ai-collaboration"],
      source_reference: "conversation-2",
      evidence: ["Founder correction"],
      evidence_limitations: "Founder evidence only"
    }
  ];
  const related = findRelatedMethodologySignals(signals, signals[1]);
  assert.equal(related[0].id, "signal-1");
  const synthesis = synthesiseMethodologySignals(signals);
  assert.deepEqual(synthesis.signalIds, ["signal-1", "signal-2"]);
  assert.equal(synthesis.status, "proposed");
  assert.equal(synthesis.approvalState, "not-approved");
  assert.match(synthesis.summary, /repetition supports review, not truth or approval/i);
});

test("a change proposal must expose current and proposed meaning and cannot self-approve", () => {
  const proposal = {
    source_feedback: "signal-2",
    related_feedback: ["signal-1"],
    current_approved_meaning: "OA-METHOD-009@0.2",
    proposed_meaning: "Candidate wording only",
    rationale: "Test whether accountability needs clarification.",
    evidence_strength: "Two founder signals; no independent validation.",
    counter_tests: ["Test whether this is delivery failure only."],
    disagreements: [],
    alternatives: ["No change"],
    affected_components: ["human-ai-collaboration"],
    affected_products_and_prompts: ["AI Workbench"],
    migration: "No effect until release.",
    tests: ["Run the contract suite."],
    risks: ["Extra wording could add bureaucracy."],
    recommendation: "Prepare a bounded clarification.",
    exact_decision_required: "Prepare, revise, defer or reject.",
    approval_state: "not-approved"
  };
  assert.equal(validateChangeContract(proposal), proposal);
  assert.throws(() => validateChangeContract({ ...proposal, approval_state: "approved" }), /cannot approve itself/i);
});
