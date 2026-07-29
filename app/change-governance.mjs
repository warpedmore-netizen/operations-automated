import { synthesiseMethodologySignals } from "./methodology-learning.mjs";

export const FOUNDER_NAME = "Jamie Peppard";

export const FEEDBACK_CLASSIFICATIONS = Object.freeze([
  "answer-only-correction",
  "conversation-context",
  "reusable-project-memory",
  "evidence-submission",
  "methodology-change-candidate",
  "product-change-candidate",
  "no-action-required"
]);

export const CHANGE_STATUSES = Object.freeze([
  "awaiting-review",
  "revision-requested",
  "approved-for-preparation",
  "implementation-in-progress",
  "awaiting-release-approval",
  "implemented",
  "rejected",
  "deferred"
]);

export const PREPARATION_ACTIONS = Object.freeze(["prepare-change", "request-revision", "reject", "defer"]);
export const RELEASE_ACTIONS = Object.freeze(["approve-and-merge", "request-changes", "reject", "defer"]);

const dispositionClassifications = {
  useful: "no-action-required",
  "correct-interpretation": "no-action-required",
  "needs-clarification": "answer-only-correction",
  "challenge-conclusion": "conversation-context",
  "add-evidence": "evidence-submission",
  "record-methodology-feedback": "methodology-change-candidate",
  "product-change-feedback": "product-change-candidate",
  "proposal-requested": "methodology-change-candidate"
};

export function suggestedClassification(disposition, wording = "") {
  const lower = String(wording).toLowerCase();
  if (/\b(interface|screen|button|navigation|workbench|product|feature|user experience|ux)\b/.test(lower)) return "product-change-candidate";
  if (/\b(method|methodology|principle|operate|output contract|charter)\b/.test(lower)) return "methodology-change-candidate";
  if (/\bremember|reusable|future conversation|project memory\b/.test(lower)) return "reusable-project-memory";
  return dispositionClassifications[disposition] || "conversation-context";
}

export function validateClassification(value) {
  if (!FEEDBACK_CLASSIFICATIONS.includes(value)) throw Object.assign(new Error("Choose a recognised feedback classification."), { status: 400 });
  return value;
}

export function isChangeCandidate(classification) {
  return classification === "methodology-change-candidate" || classification === "product-change-candidate";
}

export function proposalKind(classification) {
  if (classification === "methodology-change-candidate") return "methodology";
  if (classification === "product-change-candidate") return "product";
  throw Object.assign(new Error("Only methodology or product change candidates can become proposals."), { status: 409 });
}

export function buildStructuredProposal({
  feedback, conversation, sources, route, expectedCost = 0, relatedFeedback = []
}) {
  const kind = proposalKind(feedback.classification);
  const approvedSources = sources.filter((source) => source.status === "approved");
  const connectedSources = sources.filter((source) => source.status === "external-evidence");
  const synthesisSignals = [feedback, ...relatedFeedback];
  const synthesis = synthesisSignals.length >= 2 ? synthesiseMethodologySignals(synthesisSignals) : null;
  const affectedFiles = [...new Set([
    ...sources.filter((source) => !source.path.includes("://")).map((source) => source.path),
    ...(kind === "product" ? ["app/index.html", "app/app.js", "app/server.mjs", "app/styles.css"] : [])
  ])];
  return {
    kind,
    title: `${kind === "methodology" ? "Methodology" : "Product"} change: ${String(feedback.original_wording || feedback.wording).slice(0, 90)}`,
    problemLearning: feedback.original_wording || feedback.wording,
    approvedSources: approvedSources.map(({ path, status, version, hash, excerpt }) => ({ path, status, version, hash, excerpt })),
    affectedFiles,
    currentWording: approvedSources.length
      ? approvedSources.slice(0, 4).map((source) => `[${source.path}@${source.version}] ${source.excerpt}`).join("\n\n")
      : "Current approved meaning must be retrieved and confirmed before preparation.",
    proposedWording: `Candidate proposed meaning, not approved: ${feedback.original_wording || feedback.wording}`,
    rationale: `This proposal is traceable to feedback ${feedback.id}. Classification identifies a candidate for human review; it does not approve the change.`,
    evidence: [
      { type: "feedback", reference: feedback.id, wording: feedback.original_wording || feedback.wording },
      { type: "conversation", reference: conversation.id, title: conversation.title },
      ...connectedSources.map((source) => ({
        type: "connected-external-evidence",
        reference: source.path,
        status: source.status,
        version: source.version,
        hash: source.hash
      }))
    ],
    alternatives: [
      "Retain the current approved position and record the feedback as learning only.",
      "Run a bounded test before changing the methodology or product.",
      "Address the issue only in the originating answer or conversation."
    ],
    risks: [
      "The feedback may be context-specific rather than reusable.",
      "A change could introduce inconsistency with approved material or existing product behaviour.",
      "Implementation may solve the visible symptom without addressing the underlying cause."
    ],
    validationRequirements: [
      "Confirm every affected file and current status.",
      "Test the strongest credible alternative.",
      "Run relevant automated tests and retain results.",
      "Confirm the draft remains reversible and does not edit main directly.",
      "Obtain a separate release decision after implementation."
    ],
    relatedFeedback: relatedFeedback.map((item) => ({
      id: item.id,
      classification: item.classification,
      disposition: item.learning_disposition || item.disposition || "untriaged",
      originalWording: item.original_wording || item.wording || ""
    })),
    synthesis,
    evidenceStrength: relatedFeedback.length
      ? `${relatedFeedback.length + 1} related retained signals; no independent validation is implied.`
      : "One direct retained signal; no independent validation is implied.",
    counterTests: [
      "Test whether the approved method already covers the point and the failure is delivery or explanation.",
      "Test a materially different user, scale, consequence and failure case before generalising the change.",
      "Test the no-change alternative and whether a product correction would solve the problem without changing methodology meaning."
    ],
    disagreements: feedback.disagreement
      ? [feedback.disagreement]
      : ["No explicit disagreement is recorded; absence of disagreement is not convergence."],
    affectedComponents: feedback.affectedComponents || feedback.affected_components || [],
    affectedProductsAndPrompts: kind === "methodology"
      ? ["Operations Automated Methodology", "AI Workbench delivery behaviour", "registered methodology-application prompts"]
      : ["AI Workbench", "registered Workbench implementation prompts"],
    migration: "No approved meaning or live delivery behaviour changes until an explicit release decision records the effective version, affected products, prompts and distribution destinations.",
    recommendation: "Prepare or revise only the smallest bounded proposal supported by the retained evidence; keep release and approval separate.",
    exactDecisionRequired: "Prepare this candidate for controlled implementation, request revision, defer it for more evidence, or reject it. This decision cannot approve release.",
    expectedCost: Number(expectedCost || 0),
    modelRoute: {
      tier: route?.tier ?? 0,
      reason: route?.reason || "Deterministic proposal preparation",
      estimatedInputTokens: route?.inputEstimate || 0,
      outputLimit: route?.outputLimit || 0
    }
  };
}

export function preparationTransition({ classification, status, action }) {
  if (!PREPARATION_ACTIONS.includes(action)) throw Object.assign(new Error("Choose a recognised preparation decision."), { status: 400 });
  if (["implemented", "rejected"].includes(status)) throw Object.assign(new Error("This proposal is closed and cannot receive a preparation decision."), { status: 409 });
  if (action === "prepare-change" && !isChangeCandidate(classification)) {
    throw Object.assign(new Error("Feedback must be classified as a methodology or product change candidate before preparation."), { status: 409 });
  }
  return {
    "prepare-change": "approved-for-preparation",
    "request-revision": "revision-requested",
    reject: "rejected",
    defer: "deferred"
  }[action];
}

export function releaseTransition({ status, action, actor, confirmation, hasPreparationApproval, mergeSucceeded = false }) {
  if (!RELEASE_ACTIONS.includes(action)) throw Object.assign(new Error("Choose a recognised release decision."), { status: 400 });
  if (status !== "awaiting-release-approval") throw Object.assign(new Error("Release decisions are available only after implementation and validation are ready for review."), { status: 409 });
  if (!hasPreparationApproval) throw Object.assign(new Error("An implementation cannot be released without a separate preparation approval."), { status: 409 });
  if (action === "approve-and-merge") {
    if (actor !== FOUNDER_NAME || confirmation !== "Approve and merge") {
      throw Object.assign(new Error(`Only ${FOUNDER_NAME}'s explicit “Approve and merge” confirmation can authorise this release.`), { status: 403 });
    }
    return mergeSucceeded ? "implemented" : "awaiting-release-approval";
  }
  return {
    "request-changes": "revision-requested",
    reject: "rejected",
    defer: "deferred"
  }[action];
}

export function validateRepositoryReference({ branchName, pullRequestUrl, isDraft, commitSha, validationStatus }) {
  const branch = String(branchName || "").trim();
  if (!branch || ["main", "master"].includes(branch.toLowerCase())) {
    throw Object.assign(new Error("Repository preparation must use a new non-main branch."), { status: 409 });
  }
  if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+\/?$/.test(String(pullRequestUrl || ""))) {
    throw Object.assign(new Error("Record a valid GitHub pull request URL."), { status: 400 });
  }
  if (!isDraft) throw Object.assign(new Error("The preparation pull request must remain a draft until release review."), { status: 409 });
  if (!/^[a-f0-9]{7,40}$/i.test(String(commitSha || ""))) throw Object.assign(new Error("Record the implementation commit SHA."), { status: 400 });
  if (validationStatus !== "passed") throw Object.assign(new Error("Validation must pass before release review."), { status: 409 });
  return { branchName: branch, pullRequestUrl, isDraft: true, commitSha, validationStatus };
}

export function buildImplementationInstruction({ proposal, feedback, decisionId }) {
  const affectedFiles = JSON.parse(proposal.affected_files_json || "[]");
  const validation = JSON.parse(proposal.validation_json || "[]");
  return `# Bounded change implementation instruction

Status: approved for preparation, not approved for release
Originating feedback: ${feedback.id}
Preparation decision: ${decisionId}
Change type: ${proposal.change_kind}

## Problem or learning

${proposal.problem_learning}

## Proposed wording

${proposal.proposed_wording}

## Bounded file scope

${affectedFiles.map((path) => `- ${path}`).join("\n") || "- Confirm affected files before editing"}

## Required repository method

- Create a new branch from the current approved baseline.
- Do not commit directly to main or alter the approved baseline.
- Include the proposed change, decision record, changelog update and version impact.
- Run and retain the validation results.
- Push the branch and open a draft pull request.
- Record the branch, pull request, commit and test results in the Workbench.
- Stop for a separate release decision. Do not merge automatically.

## Validation

${validation.map((item) => `- ${item}`).join("\n")}

This instruction authorises preparation only. It is not approval to merge, publish or release.`;
}
