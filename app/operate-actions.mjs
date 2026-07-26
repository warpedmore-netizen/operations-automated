function action(id, label, targetStatus, outcome, options = {}) {
  return Object.freeze({
    id,
    label,
    targetStatus,
    outcome,
    authority: options.authority || "owner",
    confirmation: options.confirmation || "",
    noteRequired: Boolean(options.noteRequired),
    style: options.style || "secondary",
    decision: Boolean(options.decision)
  });
}

export const OPERATE_ACTION_CONTRACT = Object.freeze({
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
      action("request-change-approval", "Request change approval", "awaiting-approval", "The Change is ready for an explicit authority decision.", { noteRequired: true, style: "primary" }),
      action("reject-change", "Reject change", "rejected", "The Change leaves the open inbox with the decision rationale retained.", { noteRequired: true, style: "danger", decision: true })
    ],
    "awaiting-approval": [
      action("approve-change", "Approve and schedule", "scheduled", "The Change is authorised for bounded scheduling; implementation has not yet occurred.", { authority: "founder", confirmation: "Approve change", noteRequired: true, style: "primary", decision: true }),
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
      action("accept-risk", "Accept risk", "accepted", "The residual exposure, conditions and review trigger remain visible after acceptance.", { authority: "founder", confirmation: "Accept risk", noteRequired: true, style: "danger", decision: true })
    ],
    treating: [action("monitor-risk", "Move to monitoring", "monitoring", "Treatment evidence and remaining exposure will be observed.", { noteRequired: true, style: "primary" })],
    monitoring: [
      action("close-risk", "Close risk", "closed", "The reason the exposure no longer needs active governance is retained.", { noteRequired: true, style: "primary", decision: true }),
      action("resume-risk-treatment", "Resume treatment", "treating", "The Risk returns to active treatment with the trigger retained.", { noteRequired: true }),
      action("accept-risk", "Accept residual risk", "accepted", "The residual exposure, conditions and review trigger remain visible after acceptance.", { authority: "founder", confirmation: "Accept risk", noteRequired: true, style: "danger", decision: true })
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
    needed: [action("prepare-decision", "Prepare decision", "ready", "The evidence, options, trade-offs and authority are ready for judgement.", { noteRequired: true, style: "primary" })],
    ready: [
      action("record-decision", "Record decision", "decided", "The material judgement, rationale and accountable authority are retained.", { authority: "founder", confirmation: "Record decision", noteRequired: true, style: "primary", decision: true }),
      action("defer-decision", "Defer decision", "deferred", "The reason, interim position and review trigger remain visible.", { authority: "founder", noteRequired: true, decision: true })
    ],
    deferred: [
      action("resume-decision", "Return decision to review", "ready", "The Decision becomes ready for judgement again.", { noteRequired: true, style: "primary" }),
      action("supersede-decision", "Supersede decision", "superseded", "The replacement or reason this Decision is no longer needed is retained.", { noteRequired: true, style: "danger", decision: true })
    ]
  },
  approval: {
    requested: [
      action("ready-approval", "Prepare approval decision", "ready", "The bounded action, evidence and authority are ready for an explicit decision.", { noteRequired: true, style: "primary" }),
      action("expire-approval", "Expire approval request", "expired", "The Approval leaves the open inbox with the reason retained.", { noteRequired: true, style: "danger" })
    ],
    ready: [
      action("approve", "Approve", "approved", "The bounded action is explicitly authorised; no wider permission is created.", { authority: "founder", confirmation: "Approve", noteRequired: true, style: "primary", decision: true }),
      action("reject-approval", "Reject", "rejected", "The Approval leaves the open inbox with the decision rationale retained.", { authority: "founder", noteRequired: true, style: "danger", decision: true }),
      action("expire-approval", "Expire", "expired", "The Approval leaves the open inbox with the reason retained.", { noteRequired: true })
    ]
  }
});

export function actionsForOperateRecord(record, { openChildren = 0 } = {}) {
  const recordType = String(record?.recordType ?? record?.record_type ?? "");
  const status = String(record?.status || "");
  const actions = OPERATE_ACTION_CONTRACT[recordType]?.[status] || [];
  return actions.map((item) => {
    if (recordType === "case" && item.targetStatus === "closed" && openChildren > 0) {
      return {
        ...item,
        disabled: true,
        unavailableReason: `${openChildren} contained ${openChildren === 1 ? "record remains" : "records remain"} open.`
      };
    }
    return { ...item, disabled: false, unavailableReason: "" };
  });
}
