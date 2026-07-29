export const LEARNING_DISPOSITIONS = Object.freeze([
  "already-covered",
  "answer-only-correction",
  "conversation-context",
  "reusable-correction",
  "clarification",
  "example-or-guidance-need",
  "more-evidence",
  "methodology-change-candidate",
  "product-change-candidate",
  "separate-project-candidate",
  "deferred",
  "rejected",
  "superseded",
  "urgent-review",
  "no-action"
]);

export const LEARNING_DISPOSITION_LABELS = Object.freeze({
  "answer-only-correction": "Used to correct this answer only",
  "conversation-context": "Retained as conversation context",
  "reusable-correction": "Retained as a reusable correction",
  "already-covered": "Current Methodology already covers it",
  clarification: "Clarification required",
  "example-or-guidance-need": "Example or guidance required",
  "more-evidence": "More evidence required",
  "methodology-change-candidate": "Methodology change proposed",
  "product-change-candidate": "Product change proposed",
  "separate-project-candidate": "Separate-project candidate",
  deferred: "Deferred until a named trigger",
  rejected: "Rejected with reasoning",
  superseded: "Superseded by later learning",
  "urgent-review": "Urgent review",
  "no-action": "No further action"
});

const REQUIRED_COMPONENT_FIELDS = Object.freeze([
  "component_id",
  "title",
  "version",
  "status",
  "scope",
  "applicability",
  "required_questions",
  "relevant_operational_lenses",
  "authority_boundaries",
  "expected_outputs",
  "evidence_expectations",
  "dependencies",
  "related_components",
  "review_triggers",
  "supersession",
  "human_authority"
]);

const REQUIRED_APPLICATION_FIELDS = Object.freeze([
  "methodology_version",
  "relevant_components",
  "knowledge_snapshot",
  "user_context",
  "evidence",
  "assumptions",
  "uncertainty",
  "result",
  "options",
  "recommendation",
  "authority_required",
  "case_test",
  "feedback_route"
]);

const REQUIRED_CHANGE_FIELDS = Object.freeze([
  "source_feedback",
  "related_feedback",
  "current_approved_meaning",
  "proposed_meaning",
  "rationale",
  "evidence_strength",
  "counter_tests",
  "disagreements",
  "alternatives",
  "affected_components",
  "affected_products_and_prompts",
  "migration",
  "tests",
  "risks",
  "recommendation",
  "exact_decision_required"
]);

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function requireFields(value, fields, label) {
  requireObject(value, label);
  const missing = fields.filter((field) => value[field] === undefined || value[field] === null);
  if (missing.length) throw new Error(`${label} is missing: ${missing.join(", ")}.`);
  return value;
}

export function validateMethodologyRegistry(registry) {
  requireFields(registry, [
    "id", "title", "status", "version", "approved_baseline", "authority_rule", "components"
  ], "Methodology component registry");
  if (registry.status !== "proposed") {
    throw new Error("The machine-readable registry must remain proposed until explicitly approved.");
  }
  if (!Array.isArray(registry.components) || !registry.components.length) {
    throw new Error("The methodology component registry needs at least one component.");
  }
  const ids = new Set();
  for (const component of registry.components) {
    requireFields(component, REQUIRED_COMPONENT_FIELDS, `Methodology component ${component?.component_id || "unknown"}`);
    requireFields(component.human_authority, ["path", "artefact_id", "version", "status"], `Human authority for ${component.component_id}`);
    if (ids.has(component.component_id)) throw new Error(`Duplicate methodology component: ${component.component_id}.`);
    ids.add(component.component_id);
  }
  for (const component of registry.components) {
    for (const dependency of [...component.dependencies, ...component.related_components]) {
      if (!ids.has(dependency)) throw new Error(`${component.component_id} refers to unknown component ${dependency}.`);
    }
  }
  return registry;
}

export function validateApplicationContract(record) {
  requireFields(record, REQUIRED_APPLICATION_FIELDS, "Methodology application record");
  requireFields(record.knowledge_snapshot, ["snapshot_id", "source_ref", "baseline_version", "sources"], "Knowledge snapshot");
  if (!Array.isArray(record.relevant_components) || !record.relevant_components.length) {
    throw new Error("A methodology application must identify at least one relevant component.");
  }
  if (record.approval_state !== "not-approved") {
    throw new Error("Applying the Methodology cannot create approval.");
  }
  return record;
}

export function validateChangeContract(record) {
  requireFields(record, REQUIRED_CHANGE_FIELDS, "Methodology change record");
  if (record.approval_state !== "not-approved") {
    throw new Error("A methodology change proposal cannot approve itself.");
  }
  return record;
}

function tokens(value) {
  return new Set(String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 5));
}

function signalComponents(signal) {
  return new Set(signal.affectedComponents || signal.affected_components || []);
}

function similarity(left, right) {
  const a = tokens(`${left.original_wording || left.wording || ""} ${left.interpretation || ""}`);
  const b = tokens(`${right.original_wording || right.wording || ""} ${right.interpretation || ""}`);
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter((token) => b.has(token)).length;
  return overlap / Math.max(1, Math.min(a.size, b.size));
}

export function findRelatedMethodologySignals(signals, target, { limit = 8 } = {}) {
  const targetComponents = signalComponents(target);
  return signals
    .filter((signal) => signal.id && signal.id !== target.id)
    .map((signal) => {
      const sharedComponents = [...signalComponents(signal)].filter((component) => targetComponents.has(component));
      const textSimilarity = similarity(signal, target);
      const explicit = (target.relatedSignals || target.related_signals || []).includes(signal.id);
      return {
        signal,
        sharedComponents,
        textSimilarity,
        score: (explicit ? 5 : 0) + sharedComponents.length * 3 + textSimilarity
      };
    })
    .filter((item) => item.score >= 0.34)
    .sort((left, right) => right.score - left.score || String(right.signal.created_at || "").localeCompare(String(left.signal.created_at || "")))
    .slice(0, limit)
    .map((item) => ({
      id: item.signal.id,
      classification: item.signal.classification,
      disposition: item.signal.learning_disposition || item.signal.disposition || "untriaged",
      sharedComponents: item.sharedComponents,
      relationship: item.sharedComponents.length
        ? `Shared methodology component: ${item.sharedComponents.join(", ")}`
        : "Related wording or explicit link",
      approvalState: "not-approved"
    }));
}

export function synthesiseMethodologySignals(signals) {
  if (!Array.isArray(signals) || signals.length < 2) {
    throw new Error("A synthesis requires at least two retained signals.");
  }
  const components = [...new Set(signals.flatMap((signal) => [...signalComponents(signal)]))];
  const dispositions = [...new Set(signals.map((signal) => signal.learning_disposition || signal.disposition || "untriaged"))];
  const sources = signals.map((signal) => ({
    signalId: signal.id,
    source: signal.source_reference || signal.source || "Workbench feedback",
    originalWording: signal.original_wording || signal.wording || "",
    evidence: signal.evidence || [],
    limitations: signal.evidence_limitations || signal.limitations || "Not independently validated."
  }));
  return {
    signalIds: signals.map((signal) => signal.id),
    theme: components.length ? `Signals affecting ${components.join(", ")}` : "Related methodology signals",
    components,
    dispositions,
    sources,
    summary: `${signals.length} retained signals have a material relationship. Their repetition supports review, not truth or approval.`,
    recommendation: dispositions.includes("methodology-change-candidate")
      ? "Review current approved meaning and counter-test the combined signal before preparing change."
      : "Retain the synthesis and gather more evidence before proposing change.",
    limitations: [
      "Signal volume is not evidence of correctness.",
      "Source context, permission and contrary evidence remain material.",
      "The synthesis cannot approve methodology meaning."
    ],
    status: "proposed",
    approvalState: "not-approved"
  };
}

export function groupRelatedMethodologySignals(signals) {
  const groups = new Map();
  for (const signal of signals || []) {
    const components = [...signalComponents(signal)].sort();
    const key = components.length ? components.join("|") : "unscoped";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(signal);
  }
  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => ({
      id: `cluster:${key}`,
      components: key === "unscoped" ? [] : key.split("|"),
      signalIds: items.map((item) => item.id),
      signals: items,
      relationship: key === "unscoped"
        ? "Related retained signals without a confirmed Methodology component"
        : `Shared Methodology component: ${key.split("|").join(", ")}`,
      approvalState: "not-approved"
    }))
    .sort((left, right) => right.signalIds.length - left.signalIds.length || left.id.localeCompare(right.id));
}

export function buildMethodologyLearningReview(signals, {
  approvedBaseline = null,
  trigger = "related-signal-cluster",
  synthesis = null
} = {}) {
  if (!Array.isArray(signals) || !signals.length) {
    throw new Error("A Methodology Learning Review requires at least one retained signal.");
  }
  const combined = synthesis || (signals.length > 1
    ? synthesiseMethodologySignals(signals)
    : {
        signalIds: [signals[0].id],
        theme: [...signalComponents(signals[0])].join(", ") || "Single retained signal",
        components: [...signalComponents(signals[0])],
        dispositions: [signals[0].learning_disposition || signals[0].disposition || "untriaged"],
        sources: [],
        limitations: [signals[0].evidence_limitations || "Not independently validated."],
        recommendation: "Retain the signal and perform a proportionate review before proposing change.",
        status: "proposed",
        approvalState: "not-approved"
      });
  const interpretations = signals.map((item) => item.contextual_meaning || item.ai_interpretation || item.interpretation).filter(Boolean);
  const contradictions = signals.flatMap((item) => item.contradictions || []);
  const counterTests = signals.map((item) => item.counter_test).filter(Boolean);
  const corrections = signals
    .filter((item) => ["answer-only-correction", "reusable-correction"].includes(item.learning_disposition))
    .map((item) => item.accepted_correction || item.original_wording || item.wording)
    .filter(Boolean);
  const evidence = signals.flatMap((item) => item.evidence || []);
  const unresolved = signals.filter((item) => [
    "clarification", "example-or-guidance-need", "more-evidence", "methodology-change-candidate",
    "product-change-candidate", "separate-project-candidate", "urgent-review"
  ].includes(item.learning_disposition));
  const proposedDisposition = unresolved.find((item) => item.learning_disposition === "urgent-review")?.learning_disposition
    || unresolved.find((item) => item.learning_disposition === "methodology-change-candidate")?.learning_disposition
    || unresolved[0]?.learning_disposition
    || signals.at(-1)?.learning_disposition
    || "more-evidence";
  return {
    signalIds: combined.signalIds,
    trigger,
    signalsConsidered: signals.map((item) => ({
      id: item.id,
      originalWording: item.original_wording || item.wording || "",
      source: item.source_reference || item.source || "Workbench feedback",
      boundary: item.confidentiality_boundary || "Non-confidential project context only",
      disposition: item.learning_disposition || "more-evidence"
    })),
    originalSources: signals.map((item) => item.source_reference || item.source || "Workbench feedback"),
    relatedCorrections: corrections,
    currentApprovedMethodology: approvedBaseline ? {
      version: approvedBaseline.baseline_version || "unknown",
      sourceRef: approvedBaseline.source_ref || "working-tree",
      approvedSourceCount: Number(approvedBaseline.approved_count || 0)
    } : { version: "unknown", sourceRef: "not-indexed", approvedSourceCount: 0 },
    whatIsAlreadyCovered: signals
      .filter((item) => item.learning_disposition === "already-covered")
      .map((item) => item.disposition_reason || item.original_wording || item.wording),
    whatIsUnclear: signals.map((item) => item.uncertainty).filter(Boolean),
    whatAppearsMissing: interpretations,
    contradictions,
    evidenceStrength: evidence.length
      ? `${evidence.length} retained evidence item${evidence.length === 1 ? "" : "s"}; source limitations still apply.`
      : "No corroborating evidence is retained beyond the originating signal.",
    counterEvidence: counterTests,
    contextualLimits: [...new Set(signals.map((item) => item.evidence_limitations).filter(Boolean))],
    proposedDisposition,
    proposedDispositionLabel: LEARNING_DISPOSITION_LABELS[proposedDisposition] || proposedDisposition,
    strongestNoChangeCase: "The approved Methodology may already be sufficient and the observed problem may be answer quality, guidance or product behaviour rather than missing Methodology meaning.",
    recommendation: combined.recommendation,
    exactDecisionOrEvidenceRequired: proposedDisposition === "methodology-change-candidate"
      ? "Jamie Peppard decides whether to prepare, revise, defer or reject a bounded Methodology proposal. Preparation would not approve meaning or release."
      : proposedDisposition === "urgent-review"
        ? "Jamie Peppard reviews the possible legal, safety, security, ethical or authority failure and decides the bounded response."
        : "Name the next evidence or review trigger, or record why the signal is dealt with without Methodology change.",
    approvalState: "not-approved"
  };
}

export function defaultLearningDisposition(classification) {
  return {
    "answer-only-correction": "answer-only-correction",
    "conversation-context": "conversation-context",
    "reusable-project-memory": "reusable-correction",
    "evidence-submission": "more-evidence",
    "methodology-change-candidate": "methodology-change-candidate",
    "product-change-candidate": "product-change-candidate",
    "no-action-required": "no-action"
  }[classification] || "more-evidence";
}

export function defaultDispositionReason(classification, disposition = defaultLearningDisposition(classification)) {
  return ({
    "answer-only-correction": "The correction changes the originating answer only; it does not justify a Methodology proposal.",
    "conversation-context": "The signal is retained with the originating conversation for contextual continuity.",
    "reusable-correction": "The accepted correction may inform later authorised Workbench responses without changing approved Methodology.",
    "already-covered": "The current approved Methodology covers the point; application or explanation should be corrected instead.",
    clarification: "The approved meaning may be sound, but the wording or route is not yet clear enough.",
    "example-or-guidance-need": "Practical guidance may be missing even though approved Methodology meaning need not change.",
    "more-evidence": "The signal is plausible but needs more evidence or transfer testing before a change is justified.",
    "methodology-change-candidate": "The signal may affect approved Methodology meaning and requires synthesis, assurance and a human Decision.",
    "product-change-candidate": "The signal concerns Workbench or delivery behaviour and should follow the product change route.",
    "separate-project-candidate": "The request may belong to a product with a separate purpose, data and authority boundary.",
    deferred: "The issue is retained until its named review trigger occurs.",
    rejected: "The proposal or signal was considered and rejected with retained reasoning.",
    superseded: "Later retained learning replaces this position without erasing its history.",
    "urgent-review": "The signal may concern a material legal, safety, security, ethical or authority failure.",
    "no-action": "The retained evidence does not justify further action."
  })[disposition] || `The feedback is retained as ${classification.replaceAll("-", " ")}; this creates no approval.`;
}

export function validateLearningDisposition(value) {
  if (!LEARNING_DISPOSITIONS.includes(value)) {
    throw new Error("Choose a recognised methodology-learning disposition.");
  }
  return value;
}
