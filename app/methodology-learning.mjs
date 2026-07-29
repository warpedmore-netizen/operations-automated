export const LEARNING_DISPOSITIONS = Object.freeze([
  "already-covered",
  "answer-only-correction",
  "clarification",
  "example-or-guidance-need",
  "more-evidence",
  "methodology-change-candidate",
  "product-change-candidate",
  "separate-project-candidate",
  "urgent-review",
  "no-action"
]);

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

export function defaultLearningDisposition(classification) {
  return {
    "answer-only-correction": "answer-only-correction",
    "conversation-context": "already-covered",
    "reusable-project-memory": "already-covered",
    "evidence-submission": "more-evidence",
    "methodology-change-candidate": "methodology-change-candidate",
    "product-change-candidate": "product-change-candidate",
    "no-action-required": "no-action"
  }[classification] || "more-evidence";
}

export function validateLearningDisposition(value) {
  if (!LEARNING_DISPOSITIONS.includes(value)) {
    throw new Error("Choose a recognised methodology-learning disposition.");
  }
  return value;
}
