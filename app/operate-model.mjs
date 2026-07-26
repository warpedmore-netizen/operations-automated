import { readFileSync } from "node:fs";

const LEVELS = Object.freeze({
  none: 1,
  low: 1,
  medium: 3,
  high: 4,
  critical: 5
});

function loadControlledJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export const OPERATIONS_BIBLE_SOURCE = Object.freeze(loadControlledJson(
  new URL("./operations-bible.v0.1.json", import.meta.url)
));
export const WORK_PROFILES_SOURCE = Object.freeze(loadControlledJson(
  new URL("./work-profiles.v0.1.json", import.meta.url)
));
export const OPERATIONS_BIBLE = Object.freeze(OPERATIONS_BIBLE_SOURCE.recordTypes.map((entry) => Object.freeze(entry)));
export const WORK_PROFILES = Object.freeze(WORK_PROFILES_SOURCE.profiles.map((entry) => Object.freeze(entry)));
export const BIBLE_BY_TYPE = new Map(OPERATIONS_BIBLE.map((entry) => [entry.type, entry]));
export const PROFILE_BY_ID = new Map(WORK_PROFILES.map((entry) => [entry.id, entry]));
export const OPERATE_RELATIONSHIPS = Object.freeze([...OPERATIONS_BIBLE_SOURCE.relationships]);

function action(id, label, targetStatus, outcome, options = {}) {
  return Object.freeze({
    id,
    label,
    targetStatus,
    outcome,
    authority: options.authority || "owner",
    confirmation: options.confirmation || "",
    typedConfirmation: Boolean(options.typedConfirmation),
    noteRequired: Boolean(options.noteRequired),
    suggestedNote: options.suggestedNote || "",
    choices: Object.freeze((options.choices || []).map((choice) => Object.freeze({ ...choice }))),
    style: options.style || "secondary",
    decision: Boolean(options.decision)
  });
}

const OPERATE_ACTION_CONTRACT = Object.freeze({
  case: {
    open: [
      action("start-case", "Start case", "in-progress", "The Case becomes active and remains the context for its connected work.", { style: "primary" }),
      action("wait-case", "Put case on hold", "waiting", "The Case remains open with the reason for waiting retained.", { noteRequired: true })
    ],
    "in-progress": [
      action("resolve-case", "Resolve case", "resolved", "The intended Case outcome is recorded as reached, ready for closure review.", { noteRequired: true, style: "primary" }),
      action("wait-case", "Put case on hold", "waiting", "The Case remains open with the reason for waiting retained.", { noteRequired: true })
    ],
    waiting: [
      action("resume-case", "Resume case", "in-progress", "The Case returns to active work.", { style: "primary" }),
      action("resolve-case", "Resolve case", "resolved", "The intended Case outcome is recorded as reached, ready for closure review.", { noteRequired: true })
    ],
    resolved: [
      action("close-case", "Close case", "closed", "The resolved Case leaves the open inbox while its history and relationships remain available.", { noteRequired: true, style: "primary" }),
      action("reopen-case", "Reopen case", "in-progress", "The Case returns to active work with the reason retained.", { noteRequired: true })
    ]
  },
  request: {
    new: [action("qualify-request", "Qualify request", "qualified", "The requested outcome is clear enough to route and progress.", { style: "primary" })],
    qualified: [
      action("start-request", "Start fulfilment", "in-progress", "Fulfilment work begins within the applicable authority.", { style: "primary" }),
      action("close-request", "Close without fulfilment", "closed", "The Request leaves the open inbox with the reason retained.", { noteRequired: true, style: "danger", decision: true })
    ],
    "in-progress": [
      action("fulfil-request", "Record fulfilment", "fulfilled", "The delivered outcome is retained, ready for closure.", { noteRequired: true, style: "primary" }),
      action("wait-request", "Wait for input", "waiting", "The Request remains open with the dependency or missing input retained.", { noteRequired: true })
    ],
    waiting: [
      action("resume-request", "Resume fulfilment", "in-progress", "The Request returns to active fulfilment.", { style: "primary" }),
      action("fulfil-request", "Record fulfilment", "fulfilled", "The delivered outcome is retained, ready for closure.", { noteRequired: true })
    ],
    fulfilled: [
      action("close-request", "Close request", "closed", "The fulfilled Request leaves the open inbox while its evidence remains available.", { style: "primary" }),
      action("reopen-request", "Reopen request", "in-progress", "The Request returns to active fulfilment with the reason retained.", { noteRequired: true })
    ]
  },
  task: {
    "to-do": [
      action("complete-task", "Mark task done", "done", "The Task leaves the open inbox while its completion remains in the activity history.", { style: "primary" }),
      action("start-task", "Start task", "in-progress", "The Task becomes active work."),
      action("cancel-task", "Cancel task", "cancelled", "The Task leaves the open inbox with the reason retained.", { noteRequired: true, style: "danger" })
    ],
    "in-progress": [
      action("complete-task", "Mark task done", "done", "The Task leaves the open inbox while its completion remains in the activity history.", { style: "primary" }),
      action("block-task", "Record blocker", "blocked", "The Task remains visible as blocked with the cause retained.", { noteRequired: true }),
      action("cancel-task", "Cancel task", "cancelled", "The Task leaves the open inbox with the reason retained.", { noteRequired: true, style: "danger" })
    ],
    blocked: [
      action("resume-task", "Remove blocker and resume", "in-progress", "The Task returns to active work.", { noteRequired: true, style: "primary" }),
      action("complete-task", "Mark task done", "done", "The Task leaves the open inbox while its completion remains in the activity history."),
      action("cancel-task", "Cancel task", "cancelled", "The Task leaves the open inbox with the reason retained.", { noteRequired: true, style: "danger" })
    ]
  },
  incident: {
    reported: [action("triage-incident", "Triage incident", "triaged", "Impact, ownership and the immediate response route can now be confirmed.", { style: "primary" })],
    triaged: [
      action("respond-incident", "Start response", "responding", "The Incident enters active response.", { style: "primary" }),
      action("resolve-incident", "Resolve incident", "resolved", "Restoration and the reason for resolution are retained.", { noteRequired: true })
    ],
    responding: [
      action("monitor-incident", "Move to monitoring", "monitoring", "The immediate response is complete and the outcome is being observed.", { noteRequired: true, style: "primary" }),
      action("resolve-incident", "Resolve incident", "resolved", "Restoration and the reason for resolution are retained.", { noteRequired: true })
    ],
    monitoring: [
      action("resolve-incident", "Resolve incident", "resolved", "Restoration and the reason for resolution are retained.", { noteRequired: true, style: "primary" }),
      action("resume-incident-response", "Resume response", "responding", "The Incident returns to active response with the reason retained.", { noteRequired: true })
    ],
    resolved: [
      action("close-incident", "Close incident", "closed", "The resolved Incident leaves the open inbox while its evidence remains available.", { style: "primary" }),
      action("reopen-incident", "Reopen incident", "responding", "The Incident returns to active response with the reason retained.", { noteRequired: true })
    ]
  },
  problem: {
    identified: [action("investigate-problem", "Start investigation", "investigating", "Cause investigation begins and remains linked to its evidence.", { style: "primary" })],
    investigating: [
      action("record-cause", "Record known cause", "cause-known", "The supported cause and uncertainty are retained.", { noteRequired: true, style: "primary" }),
      action("resolve-problem", "Resolve problem", "resolved", "The reason no further cause or treatment work is needed is retained.", { noteRequired: true })
    ],
    "cause-known": [action("plan-problem-treatment", "Record treatment plan", "treatment-planned", "The proposed treatment route is retained without implying its approval.", { noteRequired: true, style: "primary" })],
    "treatment-planned": [action("resolve-problem", "Resolve problem", "resolved", "Treatment evidence and remaining uncertainty are retained.", { noteRequired: true, style: "primary" })],
    resolved: [
      action("close-problem", "Close problem", "closed", "The resolved Problem leaves the open inbox while its causal evidence remains available.", { style: "primary" }),
      action("reopen-problem", "Reopen investigation", "investigating", "Cause investigation resumes with the reason retained.", { noteRequired: true })
    ]
  },
  change: {
    draft: [action("assess-change", "Assess change", "assessing", "Impact, risk, controls and authority can now be examined.", { style: "primary" })],
    assessing: [
      action("request-change-approval", "Request change approval", "awaiting-approval", "The Change is ready for an explicit authority decision.", { noteRequired: true, suggestedNote: "Scope, evidence, controls and authority are ready for review.", style: "primary" }),
      action("reject-change", "Reject change", "rejected", "The Change leaves the open inbox with the decision rationale retained.", { noteRequired: true, style: "danger", decision: true })
    ],
    "awaiting-approval": [
      action("approve-change", "Approve and schedule", "scheduled", "The Change is authorised for bounded scheduling; implementation has not yet occurred.", { authority: "founder", confirmation: "Approve change", noteRequired: true, suggestedNote: "Approved for the bounded scope recorded above; no wider authority is created.", style: "primary", decision: true }),
      action("reject-change", "Reject change", "rejected", "The Change leaves the open inbox with the decision rationale retained.", { authority: "founder", noteRequired: true, style: "danger", decision: true })
    ],
    scheduled: [action("start-change", "Start implementation", "implementing", "The authorised Change enters bounded implementation.", { style: "primary" })],
    implementing: [action("verify-change", "Start verification", "verifying", "Implementation stops advancing until its intended outcome and controls are checked.", { noteRequired: true, style: "primary" })],
    verifying: [
      action("complete-change", "Complete change", "completed", "Verification evidence and the resulting outcome are retained.", { noteRequired: true, style: "primary" }),
      action("return-change", "Return to implementation", "implementing", "The Change returns for correction with the failed check retained.", { noteRequired: true })
    ]
  },
  risk: {
    signal: [action("assess-risk", "Assess risk signal", "assessing", "The signal moves into a proportionate assessment without implying acceptance.", { style: "primary" })],
    assessing: [action("register-risk", "Register open risk", "open", "The credible exposure becomes owned open work.", { noteRequired: true, style: "primary" })],
    open: [
      action("treat-risk", "Start risk treatment", "treating", "Treatment work begins while residual exposure remains visible.", { noteRequired: true, style: "primary" }),
      action("accept-risk", "Accept risk", "accepted", "The residual exposure, conditions and review trigger remain visible after acceptance.", { authority: "founder", confirmation: "Accept risk", typedConfirmation: true, noteRequired: true, style: "danger", decision: true })
    ],
    treating: [action("monitor-risk", "Move to monitoring", "monitoring", "Treatment evidence and remaining exposure will be observed.", { noteRequired: true, style: "primary" })],
    monitoring: [
      action("close-risk", "Close risk", "closed", "The reason the exposure no longer needs active governance is retained.", { noteRequired: true, style: "primary", decision: true }),
      action("resume-risk-treatment", "Resume treatment", "treating", "The Risk returns to active treatment with the trigger retained.", { noteRequired: true }),
      action("accept-risk", "Accept residual risk", "accepted", "The residual exposure, conditions and review trigger remain visible after acceptance.", { authority: "founder", confirmation: "Accept risk", typedConfirmation: true, noteRequired: true, style: "danger", decision: true })
    ],
    accepted: [
      action("reassess-risk", "Reassess accepted risk", "assessing", "The acceptance is reopened for assessment because its conditions or evidence changed.", { noteRequired: true, style: "primary" }),
      action("close-risk", "Close risk", "closed", "The reason the exposure no longer needs active governance is retained.", { noteRequired: true, decision: true })
    ]
  },
  finding: {
    recorded: [action("review-finding", "Review finding", "reviewing", "Evidence and possible consequences can now be assessed.", { style: "primary" })],
    reviewing: [
      action("action-finding", "Record resulting action", "actioned", "The resulting work or decision is retained and should remain connected to the Finding.", { noteRequired: true, style: "primary" }),
      action("no-action-finding", "Record no action", "no-action", "The Finding leaves the open inbox with the no-action rationale retained.", { noteRequired: true, style: "danger", decision: true })
    ],
    actioned: [action("close-finding", "Close finding", "closed", "The Finding leaves the open inbox while its evidence and resulting work remain connected.", { style: "primary" })]
  },
  improvement: {
    idea: [action("qualify-improvement", "Qualify improvement", "qualified", "The intended value, evidence and plausible measure can now be compared.", { style: "primary" })],
    qualified: [
      action("prioritise-improvement", "Prioritise improvement", "prioritised", "The reason for committing attention is retained without implying spending authority.", { noteRequired: true, style: "primary", decision: true }),
      action("close-improvement", "Close improvement", "closed", "The Improvement leaves the open inbox with the reason retained.", { noteRequired: true, style: "danger" })
    ],
    prioritised: [action("start-improvement", "Start improvement", "in-progress", "The Improvement enters active work.", { style: "primary" })],
    "in-progress": [action("measure-improvement", "Start outcome measurement", "measuring", "The change in outcome or capability is now being measured.", { noteRequired: true, style: "primary" })],
    measuring: [action("embed-improvement", "Record improvement embedded", "embedded", "The observed outcome and operating change are retained.", { noteRequired: true, style: "primary" })],
    embedded: [action("close-improvement", "Close improvement", "closed", "The Improvement leaves the open inbox while its outcome evidence remains available.", { style: "primary" })]
  },
  "scenario-test": {
    draft: [action("plan-scenario-test", "Plan scenario test", "planned", "Scope, safety boundary and expected evidence are ready for review.", { noteRequired: true, style: "primary" })],
    planned: [action("start-scenario-test", "Start scenario test", "running", "The bounded test begins within its recorded safety and authority boundary.", { style: "primary" })],
    running: [action("debrief-scenario-test", "Start debrief", "debrief", "Observed behaviour, failures and uncertainty can now be retained.", { noteRequired: true, style: "primary" })],
    debrief: [
      action("open-scenario-actions", "Record actions to complete", "actions-open", "Follow-up work remains open and should be connected to the test.", { noteRequired: true, style: "primary" }),
      action("complete-scenario-test", "Complete scenario test", "completed", "The test outcome and why no further action is open are retained.", { noteRequired: true })
    ],
    "actions-open": [
      action("schedule-retest", "Schedule re-test", "re-test", "The need to test the changed operation again remains visible.", { noteRequired: true, style: "primary" }),
      action("complete-scenario-test", "Complete scenario test", "completed", "The completed actions and test outcome are retained.", { noteRequired: true })
    ],
    "re-test": [action("plan-retest", "Plan re-test", "planned", "The next bounded test is ready to be planned against previous evidence.", { style: "primary" })]
  },
  decision: {
    needed: [action("prepare-decision", "Prepare decision", "ready", "The evidence, options, trade-offs and authority are ready for judgement.", { noteRequired: true, suggestedNote: "Evidence, options, trade-offs and authority are prepared for review.", style: "primary" })],
    ready: [
      action("record-decision", "Record decision", "decided", "The material judgement, rationale and accountable authority are retained.", { authority: "founder", confirmation: "Record decision", noteRequired: true, choices: [
        { value: "proceed", label: "Proceed" },
        { value: "revise", label: "Revise first" },
        { value: "do-not-proceed", label: "Do not proceed" }
      ], style: "primary", decision: true }),
      action("defer-decision", "Defer decision", "deferred", "The reason, interim position and review trigger remain visible.", { authority: "founder", noteRequired: true, decision: true })
    ],
    deferred: [
      action("resume-decision", "Return decision to review", "ready", "The Decision becomes ready for judgement again.", { noteRequired: true, style: "primary" }),
      action("supersede-decision", "Supersede decision", "superseded", "The replacement or reason this Decision is no longer needed is retained.", { noteRequired: true, style: "danger", decision: true })
    ]
  },
  approval: {
    requested: [
      action("ready-approval", "Prepare approval decision", "ready", "The bounded action, evidence and authority are ready for an explicit decision.", { noteRequired: true, suggestedNote: "Scope, evidence and authority are prepared for review.", style: "primary" }),
      action("expire-approval", "Expire approval request", "expired", "The Approval leaves the open inbox with the reason retained.", { noteRequired: true, style: "danger" })
    ],
    ready: [
      action("approve", "Approve", "approved", "The bounded action is explicitly authorised; no wider permission is created.", { authority: "founder", confirmation: "Approve", noteRequired: true, suggestedNote: "Approved within the recorded scope and authority boundary; no wider permission is created.", style: "primary", decision: true }),
      action("reject-approval", "Reject", "rejected", "The Approval leaves the open inbox with the decision rationale retained.", { authority: "founder", noteRequired: true, style: "danger", decision: true }),
      action("expire-approval", "Expire", "expired", "The Approval leaves the open inbox with the reason retained.", { noteRequired: true })
    ]
  }
});

export function actionsForOperateRecord(record, { openChildren = 0 } = {}) {
  const recordType = String(valueFor(record, "recordType", "record_type") || "");
  const status = String(record?.status || "");
  const actions = BIBLE_BY_TYPE.get(recordType)?.transitions?.[status] || [];
  return actions.map((item) => {
    const configured = {
      ...item,
      authority: item.authority || "owner",
      confirmation: item.confirmation || "",
      typedConfirmation: Boolean(item.typedConfirmation),
      noteRequired: Boolean(item.noteRequired),
      suggestedNote: item.suggestedNote || "",
      choices: item.choices || [],
      style: item.style || "secondary",
      decision: Boolean(item.decision)
    };
    if (recordType === "case" && item.targetStatus === "closed" && openChildren > 0) {
      return {
        ...configured,
        disabled: true,
        unavailableReason: `${openChildren} contained ${openChildren === 1 ? "record remains" : "records remain"} open.`
      };
    }
    return { ...configured, disabled: false, unavailableReason: "" };
  });
}

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

const TITLE_PREFIXES = Object.freeze({
  approval: "Approve",
  decision: "Decide",
  request: "Request",
  task: "Complete",
  change: "Change",
  risk: "Manage risk to",
  improvement: "Improve",
  "scenario-test": "Test"
});

export function suggestOperateTitle(text, recordType = "case") {
  const plain = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(?:please\s+)?(?:i|we)\s+(?:need|want|would like)\s+(?:to\s+)?/i, "")
    .split(/(?<=[.!?])\s+/)[0]
    .replace(/[.!?]+$/, "")
    .trim();
  if (!plain) return "";
  const prefix = TITLE_PREFIXES[String(recordType || "").toLowerCase()] || "";
  const alreadyActionable = /^(approve|authorise|confirm|decide|choose|request|complete|review|change|manage|improve|test|investigate|resolve|record)\b/i.test(plain);
  const rawTitle = prefix && !alreadyActionable ? `${prefix} ${plain[0].toLowerCase()}${plain.slice(1)}` : plain;
  const proposed = `${rawTitle[0].toUpperCase()}${rawTitle.slice(1)}`;
  if (proposed.length <= 160) return proposed;
  return `${proposed.slice(0, 157).replace(/\s+\S*$/, "")}...`;
}

export function recommendWorkProfile(text) {
  const value = String(text || "").toLowerCase();
  const ranked = WORK_PROFILES.map((profile) => {
    const matches = profile.keywords.filter((keyword) => value.includes(String(keyword).toLowerCase()));
    return {
      id: profile.id,
      label: profile.label,
      suggestedRecordType: profile.suggestedRecordType,
      score: matches.length,
      matches
    };
  }).sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));
  const selected = ranked[0];
  if (selected?.score > 0) {
    return {
      ...selected,
      confidence: Math.min(5, selected.score + 2),
      reason: `Matched ${selected.matches.join(", ")} to the configurable ${selected.label} profile.`
    };
  }
  const fallback = PROFILE_BY_ID.get("general-administration");
  return {
    id: fallback.id,
    label: fallback.label,
    suggestedRecordType: fallback.suggestedRecordType,
    confidence: 2,
    matches: [],
    reason: "No specialist profile is yet supported by the wording, so the general work profile is the safest starting point."
  };
}

export function validateOperateRecord(input, recommendationOverrides = {}) {
  const summary = String(input.summary || "").trim();
  const suppliedTitle = String(input.title || "").trim();
  if (suppliedTitle.length < 3 && summary.length < 3) throw new Error("Describe what needs attention; Oppa Mate can suggest the name.");
  const combinedText = `${suppliedTitle}\n${summary}`;
  const recommendation = recommendationOverrides.recordType || recommendRecordType(combinedText);
  const profileRecommendation = recommendationOverrides.profile || recommendWorkProfile(combinedText);
  const recordType = String(input.recordType || recommendation.type).toLowerCase();
  const bible = BIBLE_BY_TYPE.get(recordType);
  if (!bible) throw new Error("Choose a record type defined in the Operations Bible.");
  const workProfile = String(input.workProfile || profileRecommendation.id).toLowerCase();
  if (!PROFILE_BY_ID.has(workProfile)) throw new Error("Choose a configured work profile.");
  const title = suppliedTitle || suggestOperateTitle(summary, recordType);
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
    summary: summary.slice(0, 4000),
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
    workProfile,
    recommendation: {
      ...recommendation,
      accepted: !input.recordType || recordType === recommendation.type,
      selectedType: recordType
    },
    profileRecommendation: {
      ...profileRecommendation,
      accepted: !input.workProfile || workProfile === profileRecommendation.id,
      selectedProfile: workProfile
    }
  };
}

function valueFor(item, camel, snake = camel) {
  return item?.[camel] ?? item?.[snake] ?? null;
}

function activeLink(link) {
  return String(valueFor(link, "state") || "confirmed") !== "rejected";
}

const LINK_SUGGESTION_RULES = Object.freeze([
  ["incident", "problem", "evidences", "An incident can provide evidence for an underlying problem."],
  ["request", "problem", "evidences", "Repeated or avoidable demand can provide evidence for a problem."],
  ["finding", "problem", "evidences", "A finding can provide evidence for a cause investigation."],
  ["finding", "risk", "evidences", "A finding can provide evidence for a possible risk."],
  ["problem", "change", "generated", "A problem can generate a controlled change."],
  ["problem", "improvement", "generated", "A problem can generate a continual improvement initiative."],
  ["finding", "change", "generated", "A finding can generate a controlled change."],
  ["improvement", "change", "generated", "An improvement can generate a controlled change."],
  ["request", "task", "generated", "A request can generate one or more executable tasks."],
  ["change", "task", "generated", "A change can generate implementation or verification tasks."],
  ["change", "risk", "treats", "A change may treat a linked operational risk."],
  ["scenario-test", "finding", "generated", "A scenario test can generate evidenced findings."],
  ["scenario-test", "risk", "evidences", "A scenario test can provide evidence about a risk."],
  ["scenario-test", "change", "generated", "A scenario test can generate a controlled change."],
  ["scenario-test", "improvement", "generated", "A scenario test can generate an improvement initiative."]
]);

function connectedContext(left, right) {
  const leftCase = valueFor(left, "caseId", "case_id");
  const rightCase = valueFor(right, "caseId", "case_id");
  const leftParent = valueFor(left, "parentId", "parent_id");
  const rightParent = valueFor(right, "parentId", "parent_id");
  return Boolean(
    (leftCase && leftCase === rightCase)
    || leftParent === right.id
    || rightParent === left.id
  );
}

export function suggestOperateLinks(record, records = [], links = []) {
  if (!record || String(valueFor(record, "recordType", "record_type")) === "case") return [];
  const existingPairs = new Set(links.map((link) => {
    const from = valueFor(link, "fromRecordId", "from_record_id");
    const to = valueFor(link, "toRecordId", "to_record_id");
    return [from, to].sort().join(":");
  }));
  const suggestions = [];
  for (const candidate of records) {
    if (!candidate || candidate.id === record.id || isClosedStatus(candidate.status)) continue;
    if (!connectedContext(record, candidate)) continue;
    if (existingPairs.has([record.id, candidate.id].sort().join(":"))) continue;
    const recordType = String(valueFor(record, "recordType", "record_type"));
    const candidateType = String(valueFor(candidate, "recordType", "record_type"));
    const forward = LINK_SUGGESTION_RULES.find(([from, to]) => from === recordType && to === candidateType);
    const reverse = LINK_SUGGESTION_RULES.find(([from, to]) => from === candidateType && to === recordType);
    const rule = forward || reverse;
    if (!rule) continue;
    const [, , relationship, rationale] = rule;
    suggestions.push({
      fromRecordId: forward ? record.id : candidate.id,
      toRecordId: forward ? candidate.id : record.id,
      otherRecordId: candidate.id,
      otherTitle: candidate.title,
      otherType: candidateType,
      relationship,
      rationale,
      confidence: 3,
      proposedBy: "Oppa Mate",
      proposedVia: "ai"
    });
  }
  return suggestions.slice(0, 3);
}

export function summariseOperateNetwork(records = [], links = []) {
  const activeRecords = records.filter((record) => !isClosedStatus(record.status));
  const activeLinks = links.filter(activeLink);
  const linkedIds = new Set();
  for (const link of activeLinks) {
    linkedIds.add(valueFor(link, "fromRecordId", "from_record_id"));
    linkedIds.add(valueFor(link, "toRecordId", "to_record_id"));
  }
  for (const record of records) {
    const caseId = valueFor(record, "caseId", "case_id");
    const parentId = valueFor(record, "parentId", "parent_id");
    if (caseId || parentId) linkedIds.add(record.id);
    if (caseId) linkedIds.add(caseId);
    if (parentId) linkedIds.add(parentId);
  }

  const byId = new Map(records.map((record) => [record.id, record]));
  const depthFor = (record, seen = new Set()) => {
    if (!record || seen.has(record.id)) return 1;
    const nextSeen = new Set(seen).add(record.id);
    const parentId = valueFor(record, "parentId", "parent_id");
    if (parentId) return 1 + depthFor(byId.get(parentId), nextSeen);
    const caseId = valueFor(record, "caseId", "case_id");
    if (caseId && caseId !== record.id) return 1 + depthFor(byId.get(caseId), nextSeen);
    return 1;
  };

  const unlinkedOpen = activeRecords.filter((record) => {
    const type = String(valueFor(record, "recordType", "record_type"));
    return type !== "case" && !linkedIds.has(record.id);
  });
  const treatedRiskIds = new Set(activeLinks
    .filter((link) => String(link.relationship) === "treats")
    .flatMap((link) => [valueFor(link, "fromRecordId", "from_record_id"), valueFor(link, "toRecordId", "to_record_id")]));
  const untreatedRisks = activeRecords.filter((record) =>
    String(valueFor(record, "recordType", "record_type")) === "risk" && !treatedRiskIds.has(record.id));
  const blockerIds = new Set(activeLinks
    .filter((link) => String(link.relationship) === "blocks")
    .flatMap((link) => [valueFor(link, "fromRecordId", "from_record_id"), valueFor(link, "toRecordId", "to_record_id")]));
  for (const record of activeRecords) if (record.blocking) blockerIds.add(record.id);

  const caseHotspots = activeRecords
    .filter((record) => String(valueFor(record, "recordType", "record_type")) === "case")
    .map((record) => {
      const children = activeRecords.filter((item) => valueFor(item, "caseId", "case_id") === record.id);
      return {
        id: record.id,
        title: record.title,
        openRecords: children.length,
        highestPriority: children.reduce((highest, item) => Math.max(highest, priorityFor(item).score), 0)
      };
    })
    .filter((item) => item.openRecords > 0)
    .sort((left, right) => right.highestPriority - left.highestPriority || right.openRecords - left.openRecords)
    .slice(0, 3);

  const signals = [];
  if (unlinkedOpen.length) signals.push({
    kind: "connection-gap",
    title: `${unlinkedOpen.length} open ${unlinkedOpen.length === 1 ? "record is" : "records are"} not connected`,
    detail: "Linking the work may expose a shared outcome, cause, dependency or duplicate demand."
  });
  if (untreatedRisks.length) signals.push({
    kind: "risk-gap",
    title: `${untreatedRisks.length} open ${untreatedRisks.length === 1 ? "risk has" : "risks have"} no linked treatment`,
    detail: "This is a relationship signal, not evidence that no treatment exists."
  });
  if (blockerIds.size) signals.push({
    kind: "blocked-flow",
    title: `${blockerIds.size} ${blockerIds.size === 1 ? "record affects" : "records affect"} blocked flow`,
    detail: "Review the connected dependency before optimising an isolated task."
  });
  if (caseHotspots[0]) signals.push({
    kind: "case-hotspot",
    title: `${caseHotspots[0].title} has the strongest connected attention signal`,
    detail: `${caseHotspots[0].openRecords} open linked records; highest priority ${caseHotspots[0].highestPriority}/100.`
  });
  if (!signals.length) signals.push({
    kind: "no-signal",
    title: "No immediate network gap is visible",
    detail: "Add and correct relationships as evidence develops; absence of a signal is not proof of absence."
  });

  return {
    totals: {
      records: records.length,
      open: activeRecords.length,
      explicitLinks: activeLinks.length,
      connectedOpen: activeRecords.filter((record) => linkedIds.has(record.id)).length,
      unlinkedOpen: unlinkedOpen.length,
      maxDepth: records.reduce((maximum, record) => Math.max(maximum, depthFor(record)), 0),
      humanConfirmedLinks: activeLinks.filter((link) => String(valueFor(link, "proposedVia", "proposed_via") || "human") === "human").length,
      aiConfirmedLinks: activeLinks.filter((link) => String(valueFor(link, "proposedVia", "proposed_via")) === "ai").length
    },
    caseHotspots,
    signals,
    boundary: "These signals are derived from recorded relationships. They support investigation and prioritisation; they are not facts, approvals or risk acceptance."
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
