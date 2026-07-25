const LEVELS = Object.freeze({
  none: 1,
  low: 1,
  medium: 3,
  high: 4,
  critical: 5
});

export const OPERATIONS_BIBLE = Object.freeze([
  {
    type: "case",
    label: "Case",
    plural: "Cases",
    definition: "The main container for an outcome, issue, need or body of related work.",
    useWhen: "Several actions, decisions or operational records contribute to one outcome.",
    avoidWhen: "A single lightweight task is enough and no wider history needs to be retained.",
    statuses: ["open", "in-progress", "waiting", "resolved", "closed"],
    defaultStatus: "open",
    approval: "Creating or organising a case does not approve any consequential action.",
    automation: "Capture and routing may be assisted; consequential decisions remain governed."
  },
  {
    type: "request",
    label: "Request",
    plural: "Requests",
    definition: "Something somebody wants to happen, receive, change or understand.",
    useWhen: "There is a clear requested outcome or fulfilment need.",
    avoidWhen: "The item is only a small executable step within existing work.",
    statuses: ["new", "qualified", "in-progress", "waiting", "fulfilled", "closed"],
    defaultStatus: "new",
    approval: "A request can be fulfilled only within the applicable authority and change policy.",
    automation: "May be manual, assisted, standard pre-authorised or zero-touch where policy permits."
  },
  {
    type: "task",
    label: "Task",
    plural: "Tasks",
    definition: "A lightweight executable action that should not become a formal request by default.",
    useWhen: "One clear action can be completed by an owner.",
    avoidWhen: "The work needs its own outcome, approval, investigation or risk history.",
    statuses: ["to-do", "in-progress", "blocked", "done", "cancelled"],
    defaultStatus: "to-do",
    approval: "Completing a task records execution, not approval of a wider decision.",
    automation: "Repeatable low-consequence tasks may be automated within an approved rule."
  },
  {
    type: "incident",
    label: "Incident",
    plural: "Incidents",
    definition: "An unexpected disruption, failure, harmful event or loss of expected service.",
    useWhen: "Something has gone wrong or the expected operation has been disrupted.",
    avoidWhen: "The work is a planned request or a possible future uncertainty only.",
    statuses: ["reported", "triaged", "responding", "monitoring", "resolved", "closed"],
    defaultStatus: "reported",
    approval: "Urgent containment may be delegated; material risk and recovery decisions retain named authority.",
    automation: "Detection and bounded response may be automated with monitoring, escalation and recovery."
  },
  {
    type: "problem",
    label: "Problem",
    plural: "Problems",
    definition: "An investigation into an underlying, recurring or systemic cause.",
    useWhen: "A serious or repeated signal justifies investigation beyond immediate restoration.",
    avoidWhen: "The immediate incident or request can be resolved without a cause investigation.",
    statuses: ["identified", "investigating", "cause-known", "treatment-planned", "resolved", "closed"],
    defaultStatus: "identified",
    approval: "A finding or recommendation does not itself authorise treatment.",
    automation: "Pattern detection and evidence preparation may be assisted; causal judgement remains reviewable."
  },
  {
    type: "change",
    label: "Change",
    plural: "Changes",
    definition: "A controlled alteration to a product, service, process, system, policy, control or operation.",
    useWhen: "An agreed outcome requires an alteration whose effect should be assessed and verified.",
    avoidWhen: "The request can be fulfilled safely without changing the controlled operation.",
    statuses: ["draft", "assessing", "awaiting-approval", "scheduled", "implementing", "verifying", "completed", "rejected"],
    defaultStatus: "draft",
    approval: "Novel, sensitive or higher-risk changes require the authorised human or policy decision.",
    automation: "Standard changes may be pre-authorised; zero-touch execution requires defined rules and verification."
  },
  {
    type: "risk",
    label: "Risk",
    plural: "Risks",
    definition: "Uncertainty or a condition that could affect intended outcomes.",
    useWhen: "A signal is credible enough to require ownership, assessment, treatment or monitoring.",
    avoidWhen: "An observation is not yet sufficiently evidenced; retain it as a finding or signal first.",
    statuses: ["signal", "assessing", "open", "treating", "monitoring", "accepted", "closed"],
    defaultStatus: "signal",
    approval: "AI may surface a signal; registration, treatment and acceptance follow defined human or policy authority.",
    automation: "Signals may be detected automatically without creating excessive formal risk records."
  },
  {
    type: "finding",
    label: "Finding",
    plural: "Findings",
    definition: "An evidenced observation that requires consideration without presuming an action.",
    useWhen: "Evidence should be retained and assessed before deciding what follows.",
    avoidWhen: "A known executable action or already registered risk is the clearer record.",
    statuses: ["recorded", "reviewing", "actioned", "no-action", "closed"],
    defaultStatus: "recorded",
    approval: "A finding can result in no action when the rationale is retained.",
    automation: "Analysis may draft findings; evidence, interpretation and disposition remain traceable."
  },
  {
    type: "improvement",
    label: "Improvement",
    plural: "Improvements",
    definition: "An intentional effort to improve how the business operates, linked to evidence and outcomes.",
    useWhen: "A problem or opportunity warrants owned, measured improvement work.",
    avoidWhen: "The idea has no evidence, intended outcome or plausible measure yet.",
    statuses: ["idea", "qualified", "prioritised", "in-progress", "measuring", "embedded", "closed"],
    defaultStatus: "idea",
    approval: "Prioritisation and investment follow the consequence and spending authority involved.",
    automation: "Oppa Mate may identify and prepare opportunities; it does not silently commit resources."
  },
  {
    type: "scenario-test",
    label: "Scenario test",
    plural: "Scenario tests",
    definition: "A planned exercise used to practise, observe weaknesses, improve and re-test.",
    useWhen: "A plausible failure or operating condition should be tested before it occurs for real.",
    avoidWhen: "A live disruption is already happening; use an incident.",
    statuses: ["draft", "planned", "running", "debrief", "actions-open", "completed", "re-test"],
    defaultStatus: "draft",
    approval: "The test scope must not create uncontrolled harm or access.",
    automation: "Preparation, observation and evidence capture may be assisted within the approved scenario boundary."
  },
  {
    type: "decision",
    label: "Decision",
    plural: "Decisions",
    definition: "A retained material judgement, authority, rationale, conditions and review trigger.",
    useWhen: "Value, risk, control, release, spending or delegated authority is materially affected.",
    avoidWhen: "Routine low-consequence choices are already clear in the activity history.",
    statuses: ["needed", "ready", "decided", "deferred", "superseded"],
    defaultStatus: "needed",
    approval: "The decision records who held authority; AI cannot infer or acquire it.",
    automation: "AI may prepare the evidence and recommendation, never invent the accountable decision."
  },
  {
    type: "approval",
    label: "Approval",
    plural: "Approvals",
    definition: "A permitted human or policy authorisation for a bounded action or transition.",
    useWhen: "A defined gate requires explicit authority before work may progress.",
    avoidWhen: "A review, recommendation or technical readiness signal is being mistaken for authority.",
    statuses: ["requested", "ready", "approved", "rejected", "expired"],
    defaultStatus: "requested",
    approval: "Silence, continued discussion and an AI recommendation are never approval.",
    automation: "A policy may approve only where the Operations Bible explicitly delegates that authority."
  }
]);

export const BIBLE_BY_TYPE = new Map(OPERATIONS_BIBLE.map((entry) => [entry.type, entry]));

const CLOSED_STATUSES = new Set([
  "closed", "done", "cancelled", "completed", "rejected", "no-action",
  "decided", "superseded",
  "approved", "expired", "implemented"
]);

function clampLevel(value, fallback = 2) {
  const resolved = typeof value === "string" && Number.isNaN(Number(value))
    ? LEVELS[value.toLowerCase()]
    : Number(value);
  return Math.min(5, Math.max(1, Number.isFinite(resolved) ? Math.round(resolved) : fallback));
}

function daysBetween(earlier, later) {
  const start = new Date(earlier).getTime();
  const end = new Date(later).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, (end - start) / 86_400_000);
}

function dueUrgency(dueAt, currentUrgency, referenceTime) {
  if (!dueAt) return currentUrgency;
  const due = new Date(dueAt).getTime();
  const reference = new Date(referenceTime).getTime();
  if (!Number.isFinite(due) || !Number.isFinite(reference)) return currentUrgency;
  const days = (due - reference) / 86_400_000;
  if (days < 0) return 5;
  if (days <= 1) return Math.max(currentUrgency, 5);
  if (days <= 3) return Math.max(currentUrgency, 4);
  if (days <= 7) return Math.max(currentUrgency, 3);
  return currentUrgency;
}

export function isClosedStatus(status) {
  return CLOSED_STATUSES.has(String(status || "").toLowerCase());
}

export function recommendRecordType(text) {
  const value = String(text || "").toLowerCase();
  const rules = [
    ["incident", /\b(failed|failure|outage|broken|disruption|down|incident|unexpected|unable to)\b/, "The wording describes an unexpected failure or disruption."],
    ["problem", /\b(recurring|repeated|root cause|underlying cause|keeps? happening|why do we keep)\b/, "The wording asks about a recurring or underlying cause."],
    ["risk", /\b(risk|exposure|could harm|might fail|threat|uncertainty)\b/, "The wording describes a possible exposure or uncertain outcome."],
    ["scenario-test", /\b(scenario|exercise|rehearse|simulation|tabletop|practise|re-test)\b/, "The wording proposes a planned exercise or re-test."],
    ["finding", /\b(finding|observation|evidence shows|audit found|review found)\b/, "The wording records an evidenced observation before choosing an action."],
    ["improvement", /\b(improve|continual improvement|opportunity|better way|benefit)\b/, "The wording proposes an outcome-led improvement."],
    ["change", /\b(change|publish|release|deploy|implement|alter|replace)\b/, "The wording proposes an alteration that may need controlled implementation."],
    ["approval", /\b(approve|approval|authorise|authorization|sign off|permission)\b/, "The wording asks for a bounded authorisation."],
    ["decision", /\b(decide|decision|choose|trade-off|accept or reject)\b/, "The wording asks for a material judgement."],
    ["request", /\b(request|please provide|need access|want someone|produce|review)\b/, "The wording asks for an outcome or fulfilment."],
    ["task", /\b(task|to-do|follow up|check|compare|confirm|call|draft)\b/, "The wording describes a lightweight executable action."]
  ];
  const match = rules.find(([, pattern]) => pattern.test(value));
  if (match) return { type: match[0], confidence: 4, reason: match[2] };
  return {
    type: "case",
    confidence: 2,
    reason: "The wording describes a body of work but does not yet justify a more specific record type."
  };
}

export function validateOperateRecord(input) {
  const title = String(input.title || "").trim();
  if (title.length < 3) throw new Error("Give the work a short, useful title.");
  const recommendation = recommendRecordType(`${title}\n${input.summary || ""}`);
  const recordType = String(input.recordType || recommendation.type).toLowerCase();
  const bible = BIBLE_BY_TYPE.get(recordType);
  if (!bible) throw new Error("Choose a record type defined in the Operations Bible.");
  const requestedStatus = String(input.status || bible.defaultStatus).toLowerCase();
  if (!bible.statuses.includes(requestedStatus)) {
    throw new Error(`${bible.label} status must be one of: ${bible.statuses.join(", ")}.`);
  }
  const dueAt = String(input.dueAt || "").trim() || null;
  if (dueAt && !Number.isFinite(new Date(dueAt).getTime())) {
    throw new Error("Use a valid due date.");
  }
  return {
    recordType,
    title: title.slice(0, 160),
    summary: String(input.summary || "").trim().slice(0, 4000),
    status: requestedStatus,
    owner: String(input.owner || "").trim().slice(0, 120),
    caseId: String(input.caseId || "").trim() || null,
    parentId: String(input.parentId || "").trim() || null,
    impact: clampLevel(input.impact, 3),
    urgency: clampLevel(input.urgency, 2),
    riskExposure: clampLevel(input.riskExposure, 2),
    controlImplication: clampLevel(input.controlImplication, 1),
    blocking: Boolean(input.blocking),
    strategicValue: clampLevel(input.strategicValue, 2),
    confidence: clampLevel(input.confidence, input.recordType ? 4 : recommendation.confidence),
    dueAt,
    journey: String(input.journey || "").trim().slice(0, 160),
    journeyStage: String(input.journeyStage || "").trim().slice(0, 160),
    product: String(input.product || "").trim().slice(0, 160),
    automationMode: String(input.automationMode || "manual").trim().slice(0, 80),
    approvalState: String(input.approvalState || "not-approved").trim().slice(0, 80),
    recommendation: {
      ...recommendation,
      accepted: !input.recordType || recordType === recommendation.type,
      selectedType: recordType
    }
  };
}

export function priorityFor(record, referenceTime = new Date().toISOString()) {
  const impact = clampLevel(record.impact, 3);
  const urgency = dueUrgency(record.dueAt || record.due_at, clampLevel(record.urgency, 2), referenceTime);
  const risk = clampLevel(record.riskExposure ?? record.risk_exposure, 2);
  const control = clampLevel(record.controlImplication ?? record.control_implication, 1);
  const blocking = record.blocking ? 5 : 1;
  const strategic = clampLevel(record.strategicValue ?? record.strategic_value, 2);
  const confidence = clampLevel(record.confidence, 3);
  const age = Math.min(5, Math.max(1, Math.ceil(daysBetween(record.createdAt || record.created_at || referenceTime, referenceTime) / 7)));
  const weighted = {
    impact: impact * 22 / 5,
    urgency: urgency * 18 / 5,
    risk: risk * 20 / 5,
    control: control * 10 / 5,
    blocking: blocking * 12 / 5,
    strategic: strategic * 8 / 5,
    age: age * 5 / 5,
    confidence: confidence * 5 / 5
  };
  const score = Math.round(Object.values(weighted).reduce((sum, value) => sum + value, 0));
  const overdue = Boolean(record.dueAt || record.due_at)
    && new Date(record.dueAt || record.due_at).getTime() < new Date(referenceTime).getTime()
    && !isClosedStatus(record.status);
  const reasons = [
    [impact, "impact"],
    [urgency, overdue ? "overdue" : "urgency"],
    [risk, "risk exposure"],
    [control, "control implications"],
    [strategic, "improvement value"]
  ].sort((a, b) => b[0] - a[0]).slice(0, 2).map((item) => item[1]);
  if (record.blocking && !reasons.includes("blocking other work")) reasons.unshift("blocking other work");
  return {
    score,
    band: score >= 75 ? "act-now" : score >= 55 ? "next" : score >= 35 ? "planned" : "monitor",
    overdue,
    blocked: String(record.status || "") === "blocked",
    blocking: Boolean(record.blocking),
    reasons: [...new Set(reasons)].slice(0, 3),
    factors: { impact, urgency, risk, control, blocking, strategic, age, confidence },
    explanation: `Priority ${score}/100: ${[...new Set(reasons)].slice(0, 3).join(", ")}.`
  };
}

export function sortWorkItems(items, order = "recommended") {
  const values = [...items];
  if (order === "newest") return values.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (order === "oldest") return values.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (order === "deadline") return values.sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return b.priority.score - a.priority.score;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt) - new Date(b.dueAt);
  });
  return values.sort((a, b) => b.priority.score - a.priority.score || new Date(a.createdAt) - new Date(b.createdAt));
}
