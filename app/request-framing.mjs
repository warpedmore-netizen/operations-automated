import { createHash } from "node:crypto";
import {
  buildProvenanceFor,
  classifyRequest,
  validateBuildProvenance
} from "./steering-control.mjs";

export const FRAMING_PROMPT = Object.freeze({
  id: "OA-PROMPT-REQUEST-FRAMING-001",
  version: "1.0",
  status: "draft"
});

export const READINESS_STAGES = Object.freeze([
  { id: "A", label: "Capture", outcome: "The source request and its context are retained." },
  { id: "B", label: "Explore", outcome: "The need is understood well enough to explore without committing delivery." },
  { id: "C", label: "Define", outcome: "Material scope, authority or acceptance questions still need resolution." },
  { id: "D", label: "Implementation Ready", outcome: "The bounded implementation package and authority to prepare are complete." },
  { id: "E", label: "Implement and Verify", outcome: "Implementation is in progress and must return testable evidence." },
  { id: "F", label: "Pre-approval Assurance", outcome: "Implementation evidence is ready for a separate human release decision." },
  { id: "G", label: "Approved Execution", outcome: "The exact approved execution may proceed within its recorded boundary." }
]);

const CLASSIFICATION_DETAILS = Object.freeze({
  "ordinary-answer": ["answer-only", "Answer only"],
  "methodology-application": ["methodology-application", "Methodology application"],
  "methodology-challenge": ["methodology-challenge", "Methodology challenge"],
  "methodology-clarification": ["methodology-clarification", "Methodology clarification"],
  "methodology-change-candidate": ["methodology-change-candidate", "Methodology change candidate"],
  "workbench-product-change": ["workbench-feature", "Workbench feature"],
  "governance-tool-product-change": ["governance-tool-request", "Governance Tool request"],
  "defect-corrective-change": ["workbench-corrective-change", "Workbench corrective change"],
  "research-evidence-request": ["research-evidence", "Research or evidence"],
  "operational-work-item": ["operational-task", "Operational Task"],
  "idea-later-consideration": ["idea", "Idea"],
  "cross-product-dependency": ["cross-product-dependency", "Cross-product dependency"],
  "purpose-boundary-change": ["purpose-change", "Purpose change"],
  "new-project-candidate": ["new-project-candidate", "New-project candidate"],
  "urgent-security-safety-legal-authority-review": ["urgent-specialist-review", "Urgent specialist review"],
  "no-action-required": ["no-action", "No action"]
});

const IMPLEMENTATION_CLASSES = new Set([
  "workbench-product-change",
  "governance-tool-product-change",
  "defect-corrective-change"
]);

const NON_IMPLEMENTATION_CLASSES = new Set([
  "ordinary-answer",
  "methodology-application",
  "methodology-challenge",
  "methodology-clarification",
  "research-evidence-request",
  "idea-later-consideration",
  "purpose-boundary-change",
  "new-project-candidate",
  "urgent-security-safety-legal-authority-review",
  "no-action-required"
]);

const asArray = (value) => Array.isArray(value)
  ? value.map((item) => String(item).trim()).filter(Boolean)
  : String(value || "").split(/\r?\n|;/).map((item) => item.replace(/^[-*]\s*/, "").trim()).filter(Boolean);

const unique = (values) => [...new Set(values.filter(Boolean))];

const sentence = (value, fallback) => {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  return clean || fallback;
};

const hasAny = (value, expression) => expression.test(String(value || ""));

const sourceReference = (request, generatedAt) => request.sourceReference
  || `OA-REQUEST-${createHash("sha256").update(`${generatedAt}:${request.originalWording}`).digest("hex").slice(0, 10).toUpperCase()}`;

function projectFor(controls, projectId) {
  return controls.projects.find((project) => project.project_id === projectId) || null;
}

function extractOutcome(request) {
  if (request.userStatedOutcome) return request.userStatedOutcome;
  const text = request.originalWording;
  const explicit = text.match(/\b(?:outcome|so that|so I can|so users? can|in order to)\s*[:,-]?\s*(.+?)(?:[.!?]\s|$)/i);
  if (explicit?.[1]) return sentence(explicit[1], "");
  if (/\b(?:add|build|create|implement|fix|correct|change|update)\b/i.test(text)) {
    return sentence(text.replace(/^(?:please\s+)?/i, ""), "Complete the requested bounded change.");
  }
  return sentence(text, "Return a useful response to the request.");
}

function inferRequirements(request, classificationKeys) {
  const text = request.originalWording;
  const explicitCriteria = asArray(request.acceptanceCriteria);
  const functional = asArray(request.functionalRequirements);
  if (!functional.length && classificationKeys.some((key) => IMPLEMENTATION_CLASSES.has(key))) {
    functional.push(`Deliver the bounded user outcome: ${request.userStatedOutcome || extractOutcome(request)}`);
    functional.push("Preserve existing records, histories, controls and specialist workflows.");
  }
  if (!explicitCriteria.length && /\b(?:must|complete when|required behaviour|acceptance criteria)\b/i.test(text)) {
    explicitCriteria.push(...text.split(/\r?\n/).filter((line) => /\b(?:must|complete when|can |cannot |only when)\b/i.test(line)).map((line) => line.replace(/^[-*\d.)\s]+/, "").trim()));
  }
  return {
    functional: unique(functional),
    acceptance: unique(explicitCriteria),
    tests: unique(asArray(request.testScenarios)),
    currentBehaviour: sentence(request.currentBehaviour, "Current behaviour was not separately stated; use the retrieved implementation context and verify before changing it."),
    requiredBehaviour: sentence(request.requiredBehaviour, request.userStatedOutcome || extractOutcome(request))
  };
}

function interpretationFor(request, classification, requirements) {
  const outcome = extractOutcome(request);
  const inferred = [
    `The strongest reasonable interpretation is that the user wants ${outcome.replace(/^[A-Z]/, (letter) => letter.toLowerCase())}.`,
    classification.boundary.recommendation === "remain-current-product"
      ? "The request appears to fit the current product boundary."
      : `The project-boundary route is ${classification.boundary.recommendation}.`
  ];
  const safeAssumptions = [
    "Existing Workbench records, histories, specialist workflows and authority gates remain in place.",
    "Only non-confidential information already authorised for the private Workbench is in scope.",
    "Preparation, merge, release and publication remain separate states."
  ];
  const mustNotAssume = [
    "Do not infer Product Purpose change, approval, release, publication, spending, risk acceptance or delegated authority.",
    "Do not import another product's internal data, repository or authority model.",
    "Do not treat a passing technical check as evidence of user value or human approval."
  ];
  if (!requirements.acceptance.length && IMPLEMENTATION_CLASSES.has(classification.candidates[0]?.classification)) {
    safeAssumptions.push("Draft acceptance criteria may be proposed from the stated outcome, but remain editable until the route is accepted.");
  }
  return {
    explicitlyAsked: request.originalWording,
    apparentOutcome: outcome,
    inferred,
    uncertain: [],
    materiallyRouteChanging: [],
    safeAssumptions,
    mustNotAssume
  };
}

function displayClassifications(classification, sourceText) {
  const values = classification.candidates.map((candidate) => {
    const [key, label] = CLASSIFICATION_DETAILS[candidate.classification] || [candidate.classification, candidate.classification];
    return {
      key,
      label,
      canonical: candidate.classification,
      targetProject: candidate.targetProject,
      rationale: candidate.rationale
    };
  });
  const canonicals = new Set(classification.candidates.map((item) => item.classification));
  if (canonicals.has("workbench-product-change") || canonicals.has("governance-tool-product-change")) {
    values.push({
      key: "improvement",
      label: "Improvement",
      canonical: "improvement",
      targetProject: classification.primaryTarget,
      rationale: "The request seeks a better product outcome and must be framed above individual implementation tasks."
    });
    values.push({
      key: "change",
      label: "Change",
      canonical: "change",
      targetProject: classification.primaryTarget,
      rationale: "Implementation would alter controlled product behaviour and therefore needs a governed Change."
    });
  }
  if (canonicals.has("purpose-boundary-change") || canonicals.has("new-project-candidate")) {
    values.push({
      key: "decision",
      label: "Decision",
      canonical: "decision",
      targetProject: classification.primaryTarget,
      rationale: "The route requires a bounded human decision before implementation."
    });
  }
  if (canonicals.has("idea-later-consideration")) {
    values.push({
      key: "idea",
      label: "Idea",
      canonical: "idea",
      targetProject: classification.primaryTarget,
      rationale: "The proposition should remain in the Ideas Space until its trigger or evidence changes."
    });
  }
  if (/\b(?:decision|decide|choose between|choose whether)\b/i.test(sourceText) && !values.some((item) => item.key === "decision")) {
    values.push({
      key: "decision",
      label: "Decision",
      canonical: "decision",
      targetProject: classification.primaryTarget,
      rationale: "The request explicitly asks for a consequential choice to be retained."
    });
  }
  if (/\b(?:approval|approve|authorise|authorize)\b/i.test(sourceText)) {
    values.push({
      key: "approval",
      label: "Approval",
      canonical: "approval",
      targetProject: classification.primaryTarget,
      rationale: "The request explicitly refers to permission for a bounded action; no approval is inferred from classification."
    });
  }
  if (/\bimprov(?:e|ement|ing)\b/i.test(sourceText) && !values.some((item) => item.key === "improvement")) {
    values.push({
      key: "improvement",
      label: "Improvement",
      canonical: "improvement",
      targetProject: classification.primaryTarget,
      rationale: "The request explicitly seeks a better operational or product outcome."
    });
  }
  if (/\bchange\b/i.test(sourceText) && !values.some((item) => item.key === "change")) {
    values.push({
      key: "change",
      label: "Change",
      canonical: "change",
      targetProject: classification.primaryTarget,
      rationale: "The request explicitly proposes altering controlled behaviour or meaning."
    });
  }
  return values.filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key && candidate.targetProject === item.targetProject) === index);
}

function materialQuestionsFor(request, classification, requirements, context) {
  const questions = [];
  const text = request.originalWording;
  const implementationRequested = classification.candidates.some((item) => IMPLEMENTATION_CLASSES.has(item.classification));
  const vagueImplementation = implementationRequested
    && text.split(/\s+/).length < 9
    && !request.userStatedOutcome
    && !requirements.acceptance.length;
  if (vagueImplementation || /\b(?:make it better|improve it|add ai|modernise|do something)\b/i.test(text)) {
    questions.push({
      id: "intended-outcome",
      question: "What must the user be able to complete or observe when this is successful?",
      affects: ["outcome", "acceptance criteria", "readiness"],
      whyMaterial: "Without the intended observable outcome, the Workbench cannot distinguish a bounded feature from a broader redesign."
    });
  }
  const sensitive = /\b(?:customer|client|employer|personal data|health|payment|confidential|secret|credential|token)\b/i.test(text);
  if (sensitive && !request.dataBoundary) {
    questions.push({
      id: "data-boundary",
      question: "What authorised information boundary applies, and must any confidential or personal data be excluded?",
      affects: ["data boundary", "security", "product route"],
      whyMaterial: "The current private Workbench excludes confidential employer, client and third-party information."
    });
  }
  if (classification.boundary.recommendation === "shared-capability" && !request.authorityStatement) {
    questions.push({
      id: "shared-authority",
      question: "Which product owns the shared contract, and which product authorities remain independent?",
      affects: ["product", "authority", "irreversible architecture"],
      whyMaterial: "A shared implementation cannot silently create shared data or approval authority."
    });
  }
  if (context.existingAnswers?.length) {
    const known = context.existingAnswers.map((item) => String(item.questionId || item.id || ""));
    return questions.filter((question) => !known.includes(question.id)).slice(0, 2);
  }
  return questions.slice(0, 2);
}

function routeFor(classification, questions, controls, request, requirements) {
  const keys = new Set(classification.candidates.map((item) => item.classification));
  const implementationRequested = [...keys].some((key) => IMPLEMENTATION_CLASSES.has(key));
  const answerOnly = keys.has("ordinary-answer") && !implementationRequested && !keys.has("operational-work-item");
  const noAction = keys.has("no-action-required");
  const separate = classification.boundary.recommendation === "create-separate-project";
  const idea = classification.boundary.recommendation === "retain-ideas-space";
  const deferred = classification.boundary.recommendation === "defer-pending-evidence";
  const purpose = keys.has("purpose-boundary-change");
  const urgent = keys.has("urgent-security-safety-legal-authority-review");
  const authorityToPrepare = Boolean(request.authorityToPrepare
    || /\b(?:authorise|authorize|approved for preparation|prepare and implement|build this|implement this)\b/i.test(request.authorityStatement || ""));

  const readinessBlockers = [];
  if (questions.length) readinessBlockers.push(...questions.map((item) => item.question));
  if (separate) readinessBlockers.push("A separate Product Purpose, repository boundary and authority decision must be made before implementation.");
  if (purpose) readinessBlockers.push("The exact Product Purpose change must be separately reviewed and decided.");
  if (urgent) readinessBlockers.push("Specialist security, safety, legal or authority review is required before ordinary implementation.");
  if (classification.conflicts.some((item) => item.severity === "blocking")) {
    readinessBlockers.push(...classification.conflicts.filter((item) => item.severity === "blocking").map((item) => item.summary));
  }

  let provenance = null;
  let provenanceCheck = { valid: false, missing: [] };
  if (implementationRequested && !separate && !purpose && !urgent) {
    try {
      provenance = buildProvenanceFor(controls, {
        targetProject: classification.primaryTarget,
        targetCapability: "product-application-build"
      });
      provenanceCheck = validateBuildProvenance(controls, provenance);
    } catch (error) {
      provenanceCheck = { valid: false, missing: [String(error.message || error)] };
    }
    if (!provenanceCheck.valid) readinessBlockers.push(...provenanceCheck.missing);
    if (!authorityToPrepare) readinessBlockers.push("Explicit authority to prepare implementation is not recorded.");
  }

  const definitionSignals = [
    request.userStatedOutcome,
    request.currentBehaviour,
    request.requiredBehaviour,
    requirements.acceptance.length >= 2,
    requirements.tests.length >= 1,
    asArray(request.constraints).length,
    asArray(request.exclusions).length
  ].filter(Boolean).length;
  let stage = "A";
  let reason = "The request is captured and can be answered or routed without implementation.";
  if (noAction || answerOnly) {
    stage = "A";
    reason = noAction ? "The source explicitly requests no action." : "A useful answer can be returned without creating delivery work.";
  } else if (idea || separate || deferred || /\b(?:explore|maybe|investigate feasibility|not sure)\b/i.test(request.originalWording)) {
    stage = "B";
    reason = idea
      ? "The proposition belongs in the Ideas Space."
      : separate
        ? "The new-project proposition needs a boundary decision before definition."
        : deferred
          ? "Earlier rejection or insufficient evidence prevents the work from being reopened as committed delivery."
          : "The proposition needs bounded exploration.";
  } else if (implementationRequested && !readinessBlockers.length && definitionSignals >= 4) {
    stage = "D";
    reason = "The outcome, boundary, acceptance evidence, preparation authority and exact control provenance are complete.";
  } else {
    stage = "C";
    reason = implementationRequested
      ? "The request is framed, but material definition or authority conditions still block implementation."
      : "The request has a governed route and requires a bounded decision or evidence step.";
  }

  const simpleClassification = noAction || answerOnly || keys.has("idea-later-consideration");
  let modelToolRoute = {
    route: simpleClassification ? "deterministic-local" : keys.has("research-evidence-request") ? "reasoning-with-governed-retrieval" : "local-framing-engine",
    costClass: simpleClassification ? "no-provider-cost" : keys.has("research-evidence-request") ? "bounded-provider-use-if-configured" : "no-provider-cost",
    reason: simpleClassification
      ? "The request can be classified and routed from controlled local context without a paid model."
      : keys.has("research-evidence-request")
        ? "Research may need bounded external evidence or reasoning after the question is defined."
        : "The framing engine can prepare the route from local controlled sources; implementation is a later Codex step."
  };
  if (stage === "D" && implementationRequested) {
    modelToolRoute = {
      route: "codex-implementation",
      costClass: "implementation-only",
      reason: "Source-code implementation is required and the complete stage-D package has passed its control gates."
    };
  }
  return {
    readiness: {
      stage,
      label: READINESS_STAGES.find((item) => item.id === stage).label,
      reason,
      blockers: unique(readinessBlockers),
      definitionSignals,
      implementationReady: stage === "D"
    },
    modelToolRoute,
    codex: {
      required: implementationRequested,
      selected: stage === "D" && implementationRequested,
      reason: implementationRequested
        ? stage === "D" ? "Repository implementation is ready for Codex." : "Codex remains blocked until every stage-D condition is met."
        : "Codex is not required to answer, classify, research or retain the route.",
      escalationTrigger: "Escalate to Codex only after the outcome, product, acceptance, recovery, authority and exact prompt provenance gates pass.",
      provenance,
      provenanceCheck
    }
  };
}

function relatedContext(context) {
  const sources = (context.sources || []).map((item) => ({
    type: item.sourceKind || "repository",
    reference: item.path || item.id,
    title: item.heading || item.title || item.path || item.id,
    status: item.status || "unlabelled",
    authority: item.authority || "context-only",
    reason: item.reason || "Retrieved as relevant controlled context."
  }));
  const groups = [
    ["decision", context.decisions],
    ["approval", context.approvals],
    ["accepted-correction", context.acceptedCorrections],
    ["feedback", context.feedback],
    ["work", context.work],
    ["idea", context.ideas],
    ["pull-request", context.openPullRequests]
  ];
  for (const [type, values] of groups) {
    for (const item of values || []) {
      sources.push({
        type,
        reference: item.reference || item.id || item.url || item.path || "",
        title: item.title || item.summary || item.wording || item.path || type,
        status: item.status || "recorded",
        authority: item.authority || "evidence-only",
        reason: item.reason || `Related ${type.replaceAll("-", " ")} retrieved before framing.`
      });
    }
  }
  return sources.filter((item, index, all) =>
    item.reference && all.findIndex((candidate) => candidate.type === item.type && candidate.reference === item.reference) === index);
}

function recordPlanFor(classification, readiness) {
  const keys = new Set(classification.candidates.map((item) => item.classification));
  const create = [];
  const notCreate = [];
  if (keys.has("no-action-required") || (keys.has("ordinary-answer") && ![...keys].some((item) => IMPLEMENTATION_CLASSES.has(item)))) {
    notCreate.push({ type: "Task", reason: "A useful answer does not need delivery work." });
  } else if (keys.has("methodology-challenge") || keys.has("methodology-change-candidate")) {
    create.push({ type: "Feedback", canonicalRecordType: null, timing: "originating-conversation", reason: "Retain the exact challenge and route it through the methodology learning loop." });
    notCreate.push({ type: "Implementation Job", reason: "A methodology signal is not implementation authority." });
  } else if (keys.has("purpose-boundary-change") || keys.has("new-project-candidate")) {
    create.push({ type: "Decision", canonicalRecordType: "decision", timing: "draft-route", reason: "A human boundary or purpose decision is required before implementation." });
    notCreate.push({ type: "Implementation Job", reason: "Purpose and project boundaries must be decided first." });
  } else if (keys.has("idea-later-consideration")) {
    create.push({ type: "Idea", canonicalRecordType: null, timing: "ideas-space", reason: "Retain the thought without committing delivery." });
    notCreate.push({ type: "Task", reason: "Capturing an Idea does not place it on the roadmap." });
  } else if (keys.has("research-evidence-request")) {
    create.push({ type: "Finding", canonicalRecordType: "finding", timing: "draft-route", reason: "Retain the evidence question, sources and limitations." });
  } else if ([...keys].some((item) => IMPLEMENTATION_CLASSES.has(item))) {
    create.push({
      type: readiness.implementationReady ? "Change" : "Improvement",
      canonicalRecordType: readiness.implementationReady ? "change" : "improvement",
      timing: "draft-route",
      reason: readiness.implementationReady
        ? "The bounded controlled behaviour change is defined."
        : "The desired improvement needs definition before it becomes an implementation Change."
    });
    if (readiness.implementationReady) {
      create.push({ type: "Implementation Job", canonicalRecordType: null, timing: "after-preparation-decision", reason: "Create only after the Change has explicit approved-for-preparation authority." });
    } else {
      notCreate.push({ type: "Implementation Job", reason: "The request has not reached stage D." });
    }
  } else if (keys.has("operational-work-item")) {
    create.push({ type: "Task", canonicalRecordType: "task", timing: "draft-route", reason: "The request is a bounded executable action." });
  }
  return {
    createdNow: [{ type: "Request framing", reason: "Retains source, interpretation, route, assumptions, provenance and next action." }],
    createWhenConfirmed: create,
    notCreated: notCreate,
    ownerNext: readiness.implementationReady
      ? "Jamie Peppard confirms the bounded preparation route; Codex then implements."
      : !create.length
        ? "No further action is required unless Jamie Peppard wants to correct the framing."
        : readiness.blockers.length
          ? "Review the first named readiness blocker or correct the proposed route."
          : "Confirm or correct the minimum draft-record route.",
    remainsUndecided: readiness.blockers
  };
}

function workHierarchyFor(classification, route, outcome) {
  const keys = new Set(classification.candidates.map((item) => item.classification));
  const implementation = [...keys].some((item) => IMPLEMENTATION_CLASSES.has(item));
  return [
    { level: 1, name: "Product Purpose", included: true, value: classification.primaryTarget, state: "controlled-context" },
    { level: 2, name: "Product capability or outcome", included: !keys.has("no-action-required"), value: outcome, state: "framed" },
    { level: 3, name: "Initiative or Improvement", included: implementation && !route.readiness.implementationReady, value: implementation ? outcome : "", state: "proposed" },
    { level: 4, name: "Change", included: implementation, value: implementation ? outcome : "", state: route.readiness.implementationReady ? "defined" : "not-ready" },
    { level: 5, name: "Implementation Job", included: route.codex.selected, value: route.codex.selected ? "Complete the governed repository implementation." : "", state: route.codex.selected ? "ready" : "not-created" },
    { level: 6, name: "Task", included: keys.has("operational-work-item") && !implementation, value: keys.has("operational-work-item") ? outcome : "", state: "bounded" },
    { level: 7, name: "Test and evidence", included: implementation, value: "Validate every acceptance criterion, security boundary, recovery path and user journey.", state: route.codex.selected ? "specified" : "draft" },
    { level: 8, name: "Outcome review", included: !keys.has("no-action-required"), value: "Check the observed outcome against the intended outcome after use.", state: "future-trigger" },
    { level: 9, name: "Learning signal", included: keys.has("methodology-challenge") || keys.has("methodology-change-candidate"), value: "Retain the source, interpretation, disposition and later outcome.", state: "governed-route" }
  ];
}

function defaultAcceptance(outcome) {
  return [
    `The intended user can complete and understand this outcome: ${outcome}`,
    "The correct product and Product Purpose remain visible and cannot be silently changed.",
    "Existing records, histories, authority gates and specialist workflows remain usable.",
    "Every material assumption, question, conflict and unresolved risk is visible.",
    "The route retains source, control and implementation provenance."
  ];
}

function completeWorkPackage({ request, classification, interpretation, requirements, context, route, questions, reference, title }) {
  const project = projectFor(context.controls, classification.primaryTarget);
  const sources = relatedContext(context);
  const acceptanceCriteria = requirements.acceptance.length ? requirements.acceptance : defaultAcceptance(interpretation.apparentOutcome);
  const workProfile = context.workProfile || {
    id: route.codex.required ? "product-application-build" : "general-administration",
    version: "OA-WORK-PROFILES-001@0.1"
  };
  return {
    identity: {
      readableReference: reference,
      title,
      targetProduct: project?.product_name || classification.primaryTarget,
      targetProject: classification.primaryTarget,
      targetRepository: project?.repository || "Not yet decided",
      parentCaseOrInitiative: request.activeWorkContext || null,
      sourceRequest: request.originalWording,
      owner: request.owner || "Jamie Peppard",
      workProfile
    },
    purposeAndScope: {
      productPurpose: project?.purpose_id && project?.purpose_version ? `${project.purpose_id}@${project.purpose_version}` : "not-approved",
      steering: context.controls.steering.id && context.controls.steering.version
        ? `${context.controls.steering.id}@${context.controls.steering.version} (${context.controls.steering.status})`
        : "unavailable",
      purposeAlignment: classification.boundary.rationale,
      inScope: unique(asArray(request.inScope).length ? asArray(request.inScope) : [interpretation.apparentOutcome]),
      explicitlyOutOfScope: unique([
        ...asArray(request.exclusions),
        "Product Purpose change unless explicitly routed and separately approved.",
        "Merge, release, publication, spending, risk acceptance or a new external connection."
      ]),
      affectedUsers: project?.intended_users || ["Not yet established"],
      intendedOutcome: interpretation.apparentOutcome,
      whyNow: sentence(request.whyNow, request.urgency ? `The user recorded urgency as ${request.urgency}.` : "The request is current; no additional urgency was inferred.")
    },
    currentState: {
      currentBehaviour: requirements.currentBehaviour,
      currentArchitecture: [
        "Git is authoritative for approved Methodology and governed meaning.",
        "SQLite is authoritative for private operational memory.",
        "Oppa Mate frames and supports work; Codex performs repository implementation."
      ],
      existingRelevantFeatures: sources.filter((item) => item.type === "repository").slice(0, 8),
      knownDefects: context.knownDefects || [],
      relatedWork: sources.filter((item) => item.type === "work"),
      relatedIdeas: sources.filter((item) => item.type === "idea"),
      relevantDecisions: sources.filter((item) => ["decision", "approval"].includes(item.type)),
      unresolvedConflicts: unique([
        ...classification.conflicts.map((item) => item.summary),
        ...context.controls.conflicts.filter((item) => item.severity === "blocking").map((item) => item.summary)
      ])
    },
    problemAndEvidence: {
      problemStatement: sentence(request.problemStatement, interpretation.apparentOutcome),
      evidence: sources,
      assumptions: interpretation.safeAssumptions,
      limitations: unique([
        "Text classification is an AI inference and remains correctable.",
        ...asArray(request.limitations)
      ]),
      affectedUsersOrOperations: project?.intended_users || [],
      frequencyOrMateriality: sentence(request.frequencyOrMateriality, "Not stated; no frequency or consequence was invented.")
    },
    requirements: {
      userStories: asArray(request.userStories),
      functionalRequirements: requirements.functional.length ? requirements.functional : [interpretation.apparentOutcome],
      aiBehaviour: [
        "Retrieve controlled context before asking questions.",
        "Separate evidence, human judgement, AI inference, assumptions and recommendation.",
        "Ask only questions that materially change purpose, product, outcome, consequence, data, security, authority or acceptance."
      ],
      workflow: workHierarchyFor(classification, route, interpretation.apparentOutcome),
      dataAndRelationships: [
        "Retain the exact source request and originating context.",
        "Link the framing, created records, implementation receipt and outcome review without duplicating authority."
      ],
      userInterface: [
        "Show the route, readiness, assumptions, questions, created records, next owner and undecided points in plain language.",
        "Keep deeper control provenance available through progressive disclosure."
      ],
      accessibility: ["Use semantic headings, labelled controls, keyboard-operable disclosure and an announced result region."],
      permissions: [project?.authority_boundary || "Jamie retains consequential authority."],
      audit: ["Audit framing, route creation, route decisions, handoff generation and return review."],
      observability: ["Expose readiness blockers, route changes, linked records and failed acceptance evidence."],
      modelAndToolRouting: route.modelToolRoute
    },
    governanceAndAuthority: {
      humanDecisions: unique([
        classification.boundary.newProject?.exactHumanDecisionRequired,
        classification.purposeChangeAllowed ? "Approve, revise, defer or reject the exact Product Purpose proposal." : "",
        route.codex.required ? "Approve preparation and later decide release separately." : ""
      ]),
      approvalRequirements: route.codex.required ? ["Preparation authority before Codex; separate release and merge Decisions after evidence."] : [],
      riskAndControlImplications: classification.conflicts,
      dataSensitivity: request.dataBoundary || project?.information_boundary || "No confidential employer, client or third-party information.",
      externalConnections: "No new connection is authorised by framing.",
      publicationBoundary: "Private Draft, Live promotion and external publication remain separate.",
      aiMay: ["Classify, retrieve, infer transparent low-consequence detail, recommend, frame and create draft operational records."],
      aiMayNot: ["Approve, merge, release, publish to Live, spend, connect systems, accept risk or change Product Purpose."]
    },
    implementation: {
      affectedComponents: unique(asArray(request.affectedComponents).length ? asArray(request.affectedComponents) : [classification.primaryTarget]),
      architectureConstraints: [
        "Reuse existing Workbench records and specialist stores.",
        "Use additive, idempotent database changes with a proven restoration route.",
        "Preserve product, data and authority boundaries."
      ],
      dependencies: unique(asArray(request.dependencies)),
      migration: sentence(request.migration, "Use an additive migration; preserve existing records and prove compatibility."),
      backwardCompatibility: "Existing conversations, work, feedback, Decisions, Approvals, Implementation Jobs, Confluence and Brand Review histories must remain readable.",
      rollback: sentence(request.rollback, "Restore the prior application version and verified pre-change SQLite copy in an isolated location before any active replacement."),
      manualFallback: "Retain the framing and copyable handoff in the Workbench if automatic Codex return is unavailable.",
      stopConditions: unique([
        ...questions.map((item) => item.question),
        ...route.readiness.blockers,
        "Stop if a new purpose, security, data, authority or irreversible-design issue appears."
      ])
    },
    acceptanceAndValidation: {
      acceptanceCriteria,
      successCriteria: unique(asArray(request.successCriteria).length ? asArray(request.successCriteria) : [interpretation.apparentOutcome]),
      verticalUserJourneys: unique(asArray(request.verticalUserJourneys).length ? asArray(request.verticalUserJourneys) : ["Natural-language request → governed route → understandable next action."]),
      regressionTests: ["Existing specialist Workbench journeys remain available.", "Answer-only work creates no Build Job.", "Incomplete Codex evidence leaves work open."],
      securityTests: ["Sensitive-data boundaries and external-connection authority cannot be bypassed."],
      recoveryTest: "Open a verified pre-change SQLite copy and confirm governed histories remain readable.",
      evidenceRequired: acceptanceCriteria.map((criterion) => ({ criterion, requiredEvidence: "Automated test, observable user journey or retained governed record." })),
      definitionOfDone: "The intended outcome is demonstrably usable, every criterion has evidence, migration and rollback are understood, unresolved work is visible and no unapproved release action occurred.",
      outcomeReviewTrigger: sentence(request.outcomeReviewTrigger, "After the first real non-confidential use or any failed acceptance, recovery or authority check.")
    },
    nonGoals: unique([
      ...asArray(request.exclusions),
      "Do not create a large initiative for a bounded correction.",
      "Do not hide a Product Purpose change inside a feature.",
      "Do not absorb a separate product because implementation could be shared."
    ]),
    promptAndRoute: {
      framingPrompt: `${FRAMING_PROMPT.id}@${FRAMING_PROMPT.version} (${FRAMING_PROMPT.status})`,
      implementationPrompt: route.codex.provenance
        ? `${route.codex.provenance.promptId}@${route.codex.provenance.promptVersion}`
        : "not selected",
      promptReason: route.codex.selected
        ? "The approved product implementation prompt matches an implementation-ready repository change."
        : "No implementation prompt is selected before stage D.",
      selectedModelOrToolRoute: route.modelToolRoute,
      lowestCostSufficientReason: route.modelToolRoute.reason,
      escalationTrigger: route.codex.escalationTrigger,
      codexRequired: route.codex.required
    }
  };
}

function handoffText(packageValue, route, provenance, generatedAt) {
  const join = (values) => values.length ? values.map((item) => `- ${typeof item === "string" ? item : JSON.stringify(item)}`).join("\n") : "- None.";
  const acceptance = packageValue.acceptanceAndValidation.acceptanceCriteria;
  const reference = packageValue.identity.readableReference;
  return [
    "TITLE",
    packageValue.identity.title,
    "",
    "TARGET",
    `${packageValue.identity.targetProject}, ${packageValue.identity.targetRepository}, proposal branch codex/${packageValue.identity.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48)}`,
    "",
    "AUTHORITY",
    packageValue.governanceAndAuthority.aiMay.join(" ") + " " + packageValue.governanceAndAuthority.aiMayNot.join(" "),
    "",
    "PURPOSE ALIGNMENT",
    `${packageValue.purposeAndScope.productPurpose}. ${packageValue.purposeAndScope.purposeAlignment}`,
    "",
    "SOURCE REQUEST",
    `${packageValue.identity.sourceRequest}\nReference: ${reference}`,
    "",
    "INTENDED OUTCOME",
    packageValue.purposeAndScope.intendedOutcome,
    "",
    "CURRENT BEHAVIOUR",
    packageValue.currentState.currentBehaviour,
    "",
    "REQUIRED BEHAVIOUR",
    packageValue.requirements.functionalRequirements.join("\n"),
    "",
    "IN SCOPE",
    join(packageValue.purposeAndScope.inScope),
    "",
    "OUT OF SCOPE",
    join(packageValue.purposeAndScope.explicitlyOutOfScope),
    "",
    "EXISTING COMPONENTS TO PRESERVE",
    join(packageValue.implementation.architectureConstraints),
    "",
    "DATA AND SECURITY",
    packageValue.governanceAndAuthority.dataSensitivity,
    "",
    "AI AND AUTOMATION BOUNDARY",
    `Allowed: ${packageValue.governanceAndAuthority.aiMay.join(" ")} Prohibited: ${packageValue.governanceAndAuthority.aiMayNot.join(" ")}`,
    "",
    "FUNCTIONAL REQUIREMENTS",
    packageValue.requirements.functionalRequirements.map((item, index) => `${index + 1}. ${item}`).join("\n"),
    "",
    "USER EXPERIENCE",
    join(packageValue.requirements.userInterface),
    "",
    "DATA MODEL",
    join(packageValue.requirements.dataAndRelationships),
    "",
    "MIGRATION",
    packageValue.implementation.migration,
    "",
    "ROLLBACK",
    packageValue.implementation.rollback,
    "",
    "ACCEPTANCE CRITERIA",
    acceptance.map((item, index) => `${index + 1}. ${item}`).join("\n"),
    "",
    "TEST SCENARIOS",
    join([
      ...packageValue.acceptanceAndValidation.verticalUserJourneys,
      ...packageValue.acceptanceAndValidation.regressionTests,
      ...packageValue.acceptanceAndValidation.securityTests,
      packageValue.acceptanceAndValidation.recoveryTest
    ]),
    "",
    "DOCUMENTATION",
    "- Update the Workbench product guide, changelog, build version and assurance evidence.",
    "- Keep status and authority boundaries explicit.",
    "",
    "STRUCTURED RETURN",
    JSON.stringify({
      workReference: reference,
      intendedOutcome: packageValue.purposeAndScope.intendedOutcome,
      branchName: "codex/...",
      pullRequestUrl: "https://github.com/OWNER/REPOSITORY/pull/NUMBER",
      commitSha: "COMMIT_SHA",
      filesChanged: ["path"],
      tests: ["command: result"],
      migrationPerformed: "plain-English result",
      rollbackPath: "tested restoration route",
      unresolvedRisks: [],
      acceptanceCriterionEvidence: acceptance.map((criterion) => ({ criterion, result: "met", evidence: "test or observation" })),
      remainingWork: [],
      authorityBoundary: "No merge, release, publication, Product Purpose change, connection, spending or risk acceptance."
    }, null, 2),
    "",
    "DEFINITION OF DONE",
    packageValue.acceptanceAndValidation.definitionOfDone,
    "",
    "DO NOT",
    "Do not merge, publish, change Product Purpose, extend scope or take any unrelated consequential action.",
    "",
    "PROMPT PROVENANCE",
    `Framing prompt: ${FRAMING_PROMPT.id}@${FRAMING_PROMPT.version}`,
    `Product Purpose: ${provenance.purposeId}@${provenance.purposeVersion}`,
    `Steering: ${provenance.steeringId}@${provenance.steeringVersion}`,
    `Work Profile: ${packageValue.identity.workProfile.version || packageValue.identity.workProfile.id}`,
    `Implementation prompt: ${provenance.promptId}@${provenance.promptVersion}`,
    `Generated: ${generatedAt}`,
    `Source work: ${reference}`,
    "Human changes: none recorded",
    "Final approved handoff version: not yet approved",
    "Resulting branch, pull request and release: not yet available"
  ].join("\n");
}

export function frameRequest(input, controls, context = {}, clock = () => new Date().toISOString()) {
  const generatedAt = clock();
  const request = {
    originalWording: sentence(input?.sourceText || input?.originalWording, ""),
    sourceDate: input?.sourceDate || generatedAt,
    originatingConversation: input?.originatingConversation || input?.conversationId || null,
    activeWorkContext: input?.activeWorkContext || input?.activeRecordId || null,
    attachedEvidence: asArray(input?.attachedEvidence || input?.attachmentIds),
    userStatedOutcome: sentence(input?.userStatedOutcome, ""),
    constraints: asArray(input?.constraints),
    exclusions: asArray(input?.exclusions),
    urgency: sentence(input?.urgency, ""),
    authorityStatement: sentence(input?.authorityStatement, ""),
    authorityToPrepare: Boolean(input?.authorityToPrepare),
    sourceType: sentence(input?.sourceType, "founder-request"),
    sourceAuthority: sentence(input?.sourceAuthority, "explicit-current-authorised-human-instruction"),
    sourceReference: sentence(input?.sourceReference, ""),
    owner: sentence(input?.owner, "Jamie Peppard"),
    dataBoundary: sentence(input?.dataBoundary, ""),
    acceptanceCriteria: asArray(input?.acceptanceCriteria),
    testScenarios: asArray(input?.testScenarios),
    functionalRequirements: asArray(input?.functionalRequirements),
    affectedComponents: asArray(input?.affectedComponents),
    dependencies: asArray(input?.dependencies),
    inScope: asArray(input?.inScope),
    currentBehaviour: sentence(input?.currentBehaviour, ""),
    requiredBehaviour: sentence(input?.requiredBehaviour, ""),
    problemStatement: sentence(input?.problemStatement, ""),
    whyNow: sentence(input?.whyNow, ""),
    frequencyOrMateriality: sentence(input?.frequencyOrMateriality, ""),
    limitations: asArray(input?.limitations),
    userStories: asArray(input?.userStories),
    successCriteria: asArray(input?.successCriteria),
    verticalUserJourneys: asArray(input?.verticalUserJourneys),
    migration: sentence(input?.migration, ""),
    rollback: sentence(input?.rollback, ""),
    outcomeReviewTrigger: sentence(input?.outcomeReviewTrigger, "")
  };
  if (request.originalWording.length < 3) throw new Error("Describe the request to frame.");
  const reference = sourceReference(request, generatedAt);
  const classification = classifyRequest(request.originalWording, controls);
  if ((context.rejectedWork || []).length && !input?.newEvidence) {
    classification.boundary = {
      ...classification.boundary,
      recommendation: "defer-pending-evidence",
      rationale: "Materially similar work was previously rejected or deferred and no new evidence was supplied; retain the earlier reasoning rather than reopening it."
    };
  }
  const classificationKeys = classification.candidates.map((item) => item.classification);
  const requirements = inferRequirements(request, classificationKeys);
  const interpretation = interpretationFor(request, classification, requirements);
  const enrichedContext = { ...context, controls };
  const questions = materialQuestionsFor(request, classification, requirements, enrichedContext);
  interpretation.uncertain = questions.map((item) => item.whyMaterial);
  interpretation.materiallyRouteChanging = questions.map((item) => `${item.question} (${item.affects.join(", ")})`);
  const route = routeFor(classification, questions, controls, request, requirements);
  const title = sentence(input?.title, extractOutcome(request)).slice(0, 160);
  const workPackage = completeWorkPackage({
    request,
    classification,
    interpretation,
    requirements,
    context: enrichedContext,
    route,
    questions,
    reference,
    title
  });
  const recordPlan = recordPlanFor(classification, route.readiness);
  const provenance = {
    framingPromptId: FRAMING_PROMPT.id,
    framingPromptVersion: FRAMING_PROMPT.version,
    framingPromptStatus: FRAMING_PROMPT.status,
    productPurposeVersion: workPackage.purposeAndScope.productPurpose,
    steeringVersion: workPackage.purposeAndScope.steering,
    workProfileVersion: workPackage.identity.workProfile.version || workPackage.identity.workProfile.id,
    generationTime: generatedAt,
    sourceWorkReference: reference,
    humanChanges: [],
    finalApprovedHandoffVersion: null,
    resultingBranch: null,
    resultingPullRequest: null,
    resultingRelease: null
  };
  const codexHandoff = route.codex.selected
    ? {
        status: "ready-for-codex",
        workReference: reference,
        prompt: handoffText(workPackage, route, route.codex.provenance, generatedAt),
        provenance
      }
    : null;
  return {
    schemaVersion: 1,
    reference,
    title,
    request,
    preflight: {
      retrievedBeforeFraming: true,
      sources: relatedContext(enrichedContext),
      purpose: workPackage.purposeAndScope.productPurpose,
      steering: workPackage.purposeAndScope.steering,
      promptRegistryVersion: controls.promptRegistry?.version || "unavailable",
      workProfile: workPackage.identity.workProfile,
      securityBoundary: workPackage.governanceAndAuthority.dataSensitivity,
      implementationStatus: context.implementationStatus || "Retrieved from local Workbench records.",
      openPullRequestStatus: context.openPullRequests?.length
        ? "Recorded pull-request references were retrieved; live GitHub status was not inferred."
        : "No relevant pull-request reference is recorded in local Workbench memory."
    },
    interpretation,
    classifications: displayClassifications(classification, request.originalWording),
    steeringClassification: classification,
    projectBoundary: classification.boundary,
    materialQuestions: questions,
    assumptions: interpretation.safeAssumptions,
    readiness: route.readiness,
    workHierarchy: workHierarchyFor(classification, route, interpretation.apparentOutcome),
    workPackage,
    recordPlan,
    modelToolRoute: route.modelToolRoute,
    codex: route.codex,
    codexHandoff,
    provenance,
    nextGovernedAction: route.readiness.implementationReady
      ? "Confirm the bounded preparation route, create the controlled Change and hand only the complete package to Codex."
      : questions.length
        ? `Answer the material question: ${questions[0].question}`
        : classification.boundary.newProject?.exactHumanDecisionRequired
          || recordPlan.ownerNext,
    authorityBoundary: "Framing, classification, readiness and draft-record creation do not approve Product Purpose, implementation, merge, release, publication, spending, connections, risk acceptance or delegated authority."
  };
}

export function reviewCodexReturn(framing, result) {
  const acceptance = framing?.workPackage?.acceptanceAndValidation?.acceptanceCriteria || [];
  const evidence = Array.isArray(result?.acceptanceCriterionEvidence) ? result.acceptanceCriterionEvidence : [];
  const failedCriteria = acceptance.filter((criterion) => {
    const match = evidence.find((item) => item.criterion === criterion);
    return !match || match.result !== "met" || !String(match.evidence || "").trim();
  });
  const missing = [];
  if (String(result?.workReference || "") !== String(framing?.reference || "")) missing.push("correct work reference");
  if (!String(result?.intendedOutcome || "").trim()) missing.push("intended outcome");
  if (!Array.isArray(result?.tests) || !result.tests.length) missing.push("tests");
  if (!Array.isArray(result?.filesChanged) || !result.filesChanged.length) missing.push("changed files");
  if (!String(result?.migrationPerformed || "").trim()) missing.push("migration result");
  if (!String(result?.rollbackPath || "").trim()) missing.push("rollback path");
  if (!Array.isArray(result?.unresolvedRisks)) missing.push("unresolved risks");
  if (!Array.isArray(result?.remainingWork)) missing.push("remaining work");
  if (!String(result?.authorityBoundary || "").trim()) missing.push("authority boundary");
  if (failedCriteria.length) missing.push("evidence for every acceptance criterion");
  return {
    complete: missing.length === 0,
    status: missing.length ? "open-inadequate-return" : "ready-for-pre-approval-assurance",
    missing: unique(missing),
    failedCriteria,
    nextAction: missing.length
      ? "Keep the work open and return the exact missing evidence to Codex in a corrected follow-up."
      : "Present the complete evidence for a separate human release decision."
  };
}
