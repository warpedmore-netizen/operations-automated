import test from "node:test";
import assert from "node:assert/strict";
import {
  FOUNDER_NAME, buildImplementationInstruction, buildStructuredProposal, preparationTransition, releaseTransition,
  suggestedClassification, validateRepositoryReference
} from "../change-governance.mjs";
import { retrieveIndexedSections } from "../repository-index.mjs";
import { validateMergeReadiness } from "../repository-release.mjs";

test("feedback classification is descriptive and cannot become approval", () => {
  assert.equal(suggestedClassification("record-methodology-feedback", "Change the method"), "methodology-change-candidate");
  assert.equal(suggestedClassification("useful", "This helped"), "no-action-required");
  assert.equal(preparationTransition({
    classification: "methodology-change-candidate",
    status: "awaiting-review",
    action: "prepare-change"
  }), "approved-for-preparation");
  assert.notEqual("approved-for-preparation", "implemented");
});

test("only a change candidate can be prepared", () => {
  assert.throws(() => preparationTransition({
    classification: "answer-only-correction",
    status: "awaiting-review",
    action: "prepare-change"
  }), /classified as a methodology or product change candidate/i);
});

test("release approval is separate and founder-controlled", () => {
  assert.throws(() => releaseTransition({
    status: "awaiting-release-approval",
    action: "approve-and-merge",
    actor: "AI",
    confirmation: "Approve and merge",
    hasPreparationApproval: true
  }), /Only Jamie Peppard/i);
  assert.throws(() => releaseTransition({
    status: "awaiting-release-approval",
    action: "approve-and-merge",
    actor: FOUNDER_NAME,
    confirmation: "Approve and merge",
    hasPreparationApproval: false
  }), /separate preparation approval/i);
  assert.equal(releaseTransition({
    status: "awaiting-release-approval",
    action: "approve-and-merge",
    actor: FOUNDER_NAME,
    confirmation: "Approve and merge",
    hasPreparationApproval: true,
    mergeSucceeded: true
  }), "implemented");
});

test("repository preparation rejects main and requires a draft validated pull request", () => {
  assert.throws(() => validateRepositoryReference({
    branchName: "main",
    pullRequestUrl: "https://github.com/example/repo/pull/1",
    isDraft: true,
    commitSha: "abcdef1",
    validationStatus: "passed"
  }), /non-main branch/i);
  assert.throws(() => validateRepositoryReference({
    branchName: "codex/change",
    pullRequestUrl: "https://github.com/example/repo/pull/1",
    isDraft: false,
    commitSha: "abcdef1",
    validationStatus: "passed"
  }), /must remain a draft/i);
});

test("implementation instruction stops after draft preparation", () => {
  const instruction = buildImplementationInstruction({
    proposal: {
      change_kind: "methodology",
      problem_learning: "Clarify accountability",
      proposed_wording: "A human remains accountable.",
      affected_files_json: '["methodology/example.md"]',
      validation_json: '["Run governance tests"]'
    },
    feedback: { id: "feedback-1" },
    decisionId: "decision-1"
  });
  assert.match(instruction, /new branch/i);
  assert.match(instruction, /draft pull request/i);
  assert.match(instruction, /Do not merge automatically/i);
  assert.match(instruction, /authorises preparation only/i);
});

test("connected evidence is retained as evidence but never becomes a repository file target", () => {
  const feedback = {
    id: "feedback-connected",
    classification: "methodology-change-candidate",
    original_wording: "Consider the connected control evidence."
  };
  const conversation = {
    id: "conversation-connected",
    title: "Connected evidence",
    messages: []
  };
  const proposal = buildStructuredProposal({
    feedback,
    conversation,
    sources: [{
      path: "confluence://methodology/METHOD/202/Method principle",
      status: "external-evidence",
      version: "3",
      hash: "abc123",
      excerpt: "A connected control observation."
    }],
    route: { tier: 2, reason: "test", inputEstimate: 10, outputLimit: 20 }
  });
  assert.equal(proposal.affectedFiles.some((path) => path.startsWith("confluence://")), false);
  assert.ok(proposal.evidence.some((item) => item.type === "connected-external-evidence"));
  assert.equal(proposal.approvedSources.length, 0);
});

test("only approved indexed documents are returned as approved context", () => {
  const documents = [
    { path: "methodology/approved.md", status: "approved", version: "1", hash: "a", content: "## Release\nMerged omega evidence" },
    { path: "feedback/rejected.md", status: "rejected", version: "1", hash: "r", content: "## Rejected\nRejected zebra evidence" },
    { path: "proposals/proposed.md", status: "proposed", version: "1", hash: "p", content: "## Proposed\nProposed theta evidence" }
  ];
  assert.equal(retrieveIndexedSections(documents, "rejected zebra", 10_000, { approvedOnly: true }).length, 0);
  assert.equal(retrieveIndexedSections(documents, "proposed theta", 10_000, { approvedOnly: true }).length, 0);
  assert.ok(retrieveIndexedSections(documents, "merged omega", 10_000, { approvedOnly: true }).some((item) => item.status === "approved"));
});

test("GitHub merge readiness is bounded to the reviewed branch and main target", () => {
  assert.equal(validateMergeReadiness({
    state: "OPEN",
    headRefName: "codex/change",
    baseRefName: "main",
    recordedBranch: "codex/change"
  }), true);
  assert.throws(() => validateMergeReadiness({
    state: "OPEN",
    headRefName: "other-branch",
    baseRefName: "main",
    recordedBranch: "codex/change"
  }), /head does not match/i);
});
