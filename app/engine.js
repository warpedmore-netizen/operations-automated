(function attachEngine(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.OPERATEEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function engineFactory() {
  "use strict";

  const METHODOLOGY_VERSION = "0.3";
  const STAGES = [
    { id: "observe", name: "Observe", purpose: "Understand real work and its context", question: "What actually happens?" },
    { id: "prioritise", name: "Prioritise", purpose: "Select work using user-defined value, impact, effort and risk", question: "What matters most?" },
    { id: "examine", name: "Examine", purpose: "Understand causes, dependencies, decisions and friction", question: "Why does it work this way?" },
    { id: "redesign", name: "Redesign", purpose: "Simplify and improve the intended flow", question: "What should happen?" },
    { id: "automate", name: "Automate", purpose: "Apply proportionate technology with human control", question: "What should machines handle?" },
    { id: "test", name: "Test", purpose: "Prove the change under normal and adverse conditions", question: "Does it work in reality?" },
    { id: "evolve", name: "Evolve", purpose: "Measure, retain learning and begin the next cycle", question: "What have we learned and kept?" }
  ];

  const STAGE_PROMPTS = {
    observe: ["What happens in reality?", "Who is involved or affected?", "Which evidence and exceptions can we see?"],
    prioritise: ["Which outcome creates the most important value?", "What is the impact, effort and risk?", "What should not be prioritised now?"],
    examine: ["What causes the current result?", "Which dependencies and decisions shape it?", "Where is knowledge hidden?"],
    redesign: ["What can be removed or simplified?", "How should exceptions and recovery work?", "What could this unintentionally make worse?"],
    automate: ["Which work is repeatable?", "Where must human judgement remain?", "Who owns the automated outcome and recovery?"],
    test: ["What happened in normal and adverse conditions?", "Which failure signals were observable?", "Can the change be recovered or reversed?"],
    evolve: ["What lesson, decision or improvement will be retained?", "What changed in the value matrix?", "What triggers the next review?" ]
  };

  const APPROVAL_GATES = {
    prioritise: "Confirm the value proposition and priorities",
    redesign: "Approve the proposed redesign",
    automate: "Authorise the automation boundary",
    test: "Accept the test evidence and residual risk",
    evolve: "Accept the retained learning and next cycle"
  };

  const SETUP_FIELDS = ["title", "problem", "peopleAffected", "owner"];
  const VALUE_FIELDS = ["proposition", "desiredOutcome", "beneficiary", "formsOfValue", "priorities", "minimumOutcome", "constraints", "decisionAuthority"];

  function uid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `workspace-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function timestamp(now) {
    return (now instanceof Date ? now : new Date(now ?? Date.now())).toISOString();
  }

  function emptyStageRecords() {
    return Object.fromEntries(STAGES.map((stage) => [stage.id, { evidence: "", decision: "", owner: "" }]));
  }

  function createWorkspace(now) {
    const createdAt = timestamp(now);
    return {
      schemaVersion: 1,
      methodologyVersion: METHODOLOGY_VERSION,
      id: uid(),
      status: "active",
      currentStage: "observe",
      createdAt,
      updatedAt: createdAt,
      project: { title: "", problem: "", peopleAffected: "", owner: "" },
      value: {
        proposition: "",
        desiredOutcome: "",
        beneficiary: "",
        formsOfValue: "",
        priorities: "",
        minimumOutcome: "",
        constraints: "",
        decisionAuthority: ""
      },
      stages: emptyStageRecords(),
      approvals: {},
      activity: [{ at: createdAt, type: "workspace-created", message: "Private workspace created" }]
    };
  }

  function isFilled(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function normaliseWorkspace(input, now) {
    if (!input || typeof input !== "object") throw new Error("Workspace must be an object");
    const base = createWorkspace(now);
    const currentStage = STAGES.some((stage) => stage.id === input.currentStage) ? input.currentStage : "observe";
    return {
      ...base,
      ...input,
      schemaVersion: 1,
      methodologyVersion: input.methodologyVersion ?? METHODOLOGY_VERSION,
      currentStage,
      project: { ...base.project, ...(input.project ?? {}) },
      value: { ...base.value, ...(input.value ?? {}) },
      stages: Object.fromEntries(STAGES.map((stage) => [stage.id, { ...base.stages[stage.id], ...(input.stages?.[stage.id] ?? {}) }])),
      approvals: input.approvals && typeof input.approvals === "object" ? input.approvals : {},
      activity: Array.isArray(input.activity) ? input.activity.slice(-100) : base.activity,
      updatedAt: timestamp(now)
    };
  }

  function stageIndex(stageId) {
    return Math.max(0, STAGES.findIndex((stage) => stage.id === stageId));
  }

  function assessWorkspace(workspace) {
    const setupMissing = SETUP_FIELDS.filter((field) => !isFilled(workspace.project[field]));
    const valueMissing = VALUE_FIELDS.filter((field) => !isFilled(workspace.value[field]));
    const index = stageIndex(workspace.currentStage);
    const stage = STAGES[index];
    const record = workspace.stages[stage.id] ?? {};
    const recordMissing = ["evidence", "decision", "owner"].filter((field) => !isFilled(record[field]));
    const gateLabel = APPROVAL_GATES[stage.id] ?? null;
    const approval = workspace.approvals[stage.id];
    const gateMissing = Boolean(gateLabel && !approval?.approved);

    let nextAction;
    let detail;
    let control = "AI can assist";
    let canAdvance = false;

    if (workspace.status === "complete") {
      nextAction = "Begin the next OPERATE cycle";
      detail = "This cycle is complete. Review the retained learning before creating a new workspace.";
      control = "Human direction required";
    } else if (setupMissing.length) {
      nextAction = "Define the problem and ownership";
      detail = `Complete ${setupMissing.length} project field${setupMissing.length === 1 ? "" : "s"}: ${setupMissing.join(", ")}.`;
    } else if (valueMissing.length) {
      nextAction = "Complete the user-defined value matrix";
      detail = `Define ${valueMissing.length} remaining value field${valueMissing.length === 1 ? "" : "s"} before deciding what better means.`;
    } else if (recordMissing.length) {
      nextAction = `Complete the ${stage.name} record`;
      detail = `Retain the ${recordMissing.join(", ")} for this stage.`;
    } else if (gateMissing) {
      nextAction = gateLabel;
      detail = "A named authorised human must make this decision before the workspace can progress.";
      control = "Human approval required";
    } else {
      canAdvance = true;
      nextAction = index === STAGES.length - 1 ? "Complete this OPERATE cycle" : `Move to ${STAGES[index + 1].name}`;
      detail = index === STAGES.length - 1
        ? "The evidence, decision, ownership and retained learning are recorded."
        : `The ${stage.name} requirements and any approval gate are satisfied.`;
    }

    const completedSetup = SETUP_FIELDS.length - setupMissing.length;
    const completedValue = VALUE_FIELDS.length - valueMissing.length;
    const completedRecords = STAGES.reduce((total, item) => {
      const itemRecord = workspace.stages[item.id] ?? {};
      return total + ["evidence", "decision", "owner"].filter((field) => isFilled(itemRecord[field])).length;
    }, 0);
    const completedApprovals = Object.keys(APPROVAL_GATES).filter((id) => workspace.approvals[id]?.approved).length;
    const totalChecks = SETUP_FIELDS.length + VALUE_FIELDS.length + STAGES.length * 3 + Object.keys(APPROVAL_GATES).length;
    const completedChecks = completedSetup + completedValue + completedRecords + completedApprovals;

    return {
      stage,
      stageIndex: index,
      prompts: STAGE_PROMPTS[stage.id],
      gateLabel,
      gateMissing,
      approval,
      setupMissing,
      valueMissing,
      recordMissing,
      nextAction,
      detail,
      control,
      canAdvance,
      progress: Math.round((completedChecks / totalChecks) * 100)
    };
  }

  function addActivity(workspace, type, message, now) {
    const copy = normaliseWorkspace(workspace, now);
    copy.activity = [...copy.activity, { at: timestamp(now), type, message }].slice(-100);
    copy.updatedAt = timestamp(now);
    return copy;
  }

  function setApproval(workspace, stageId, approvedBy, now) {
    if (!APPROVAL_GATES[stageId]) throw new Error("This stage has no approval gate");
    if (!isFilled(approvedBy)) throw new Error("Record the authorised human's name");
    const copy = normaliseWorkspace(workspace, now);
    copy.approvals[stageId] = { approved: true, approvedBy: approvedBy.trim(), approvedAt: timestamp(now), label: APPROVAL_GATES[stageId] };
    return addActivity(copy, "human-approval", `${APPROVAL_GATES[stageId]} — approved by ${approvedBy.trim()}`, now);
  }

  function revokeApproval(workspace, stageId, now) {
    const copy = normaliseWorkspace(workspace, now);
    delete copy.approvals[stageId];
    return addActivity(copy, "approval-revoked", `${APPROVAL_GATES[stageId]} — approval removed`, now);
  }

  function invalidateFromStage(workspace, stageId, reason, now) {
    const startIndex = STAGES.findIndex((stage) => stage.id === stageId);
    if (startIndex < 0) throw new Error("Unknown review stage");
    const copy = normaliseWorkspace(workspace, now);
    let changed = false;

    for (const approvalStage of Object.keys(APPROVAL_GATES)) {
      if (stageIndex(approvalStage) >= startIndex && copy.approvals[approvalStage]) {
        delete copy.approvals[approvalStage];
        changed = true;
      }
    }

    if (stageIndex(copy.currentStage) > startIndex || copy.status === "complete") {
      copy.currentStage = stageId;
      copy.status = "active";
      changed = true;
    }

    return changed
      ? addActivity(copy, "governance-reset", reason || `Changed evidence requires review from ${STAGES[startIndex].name}`, now)
      : copy;
  }

  function advanceStage(workspace, now) {
    const assessment = assessWorkspace(workspace);
    if (!assessment.canAdvance) return { workspace, advanced: false, reason: assessment.nextAction };
    const copy = normaliseWorkspace(workspace, now);
    if (assessment.stageIndex === STAGES.length - 1) {
      copy.status = "complete";
      return { workspace: addActivity(copy, "cycle-completed", "OPERATE cycle completed", now), advanced: true };
    }
    const next = STAGES[assessment.stageIndex + 1];
    copy.currentStage = next.id;
    return { workspace: addActivity(copy, "stage-advanced", `Moved to ${next.name}`, now), advanced: true };
  }

  function markdownValue(label, value) {
    return `- **${label}:** ${isFilled(value) ? value.trim() : "Not recorded"}`;
  }

  function exportMarkdown(workspace) {
    const lines = [
      `# ${workspace.project.title || "OPERATE workspace"}`,
      "",
      `> Methodology ${workspace.methodologyVersion} · ${workspace.status} · current stage: ${STAGES[stageIndex(workspace.currentStage)].name}`,
      "",
      "## Project",
      "",
      markdownValue("Problem", workspace.project.problem),
      markdownValue("People affected", workspace.project.peopleAffected),
      markdownValue("Owner", workspace.project.owner),
      "",
      "## User-defined value",
      "",
      markdownValue("Value proposition", workspace.value.proposition),
      markdownValue("Desired outcome", workspace.value.desiredOutcome),
      markdownValue("Beneficiary", workspace.value.beneficiary),
      markdownValue("Forms of value", workspace.value.formsOfValue),
      markdownValue("Priorities", workspace.value.priorities),
      markdownValue("Minimum outcome", workspace.value.minimumOutcome),
      markdownValue("Constraints", workspace.value.constraints),
      markdownValue("Decision authority", workspace.value.decisionAuthority)
    ];

    for (const stage of STAGES) {
      const record = workspace.stages[stage.id];
      lines.push("", `## ${stage.name}`, "", markdownValue("Evidence", record.evidence), markdownValue("Decision", record.decision), markdownValue("Owner", record.owner));
      const approval = workspace.approvals[stage.id];
      if (APPROVAL_GATES[stage.id]) {
        lines.push(markdownValue("Human approval", approval?.approved ? `${approval.label}; ${approval.approvedBy} at ${approval.approvedAt}` : "Not approved"));
      }
    }

    lines.push("", "## Activity", "");
    for (const event of workspace.activity) lines.push(`- ${event.at}: ${event.message}`);
    return `${lines.join("\n")}\n`;
  }

  function buildAiBrief(workspace) {
    const assessment = assessWorkspace(workspace);
    const record = workspace.stages[assessment.stage.id];
    return [
      "Help me apply the Operations Automated OPERATE methodology to this private, non-confidential workspace.",
      "",
      `Current stage: ${assessment.stage.name} — ${assessment.stage.question}`,
      `Next governed action: ${assessment.nextAction}`,
      `Control: ${assessment.control}`,
      "",
      `Problem: ${workspace.project.problem || "Not recorded"}`,
      `People affected: ${workspace.project.peopleAffected || "Not recorded"}`,
      `Value proposition: ${workspace.value.proposition || "Not recorded"}`,
      `Desired outcome: ${workspace.value.desiredOutcome || "Not recorded"}`,
      `Value priorities: ${workspace.value.priorities || "Not recorded"}`,
      `Constraints: ${workspace.value.constraints || "Not recorded"}`,
      `Decision authority: ${workspace.value.decisionAuthority || "Not recorded"}`,
      "",
      `Current evidence: ${record.evidence || "Not recorded"}`,
      `Current decision: ${record.decision || "Not recorded"}`,
      "",
      "Ask only the questions needed for this stage. Expose trade-offs. Do not approve on behalf of the authorised human, publish externally, request confidential information or execute consequential actions without explicit authority."
    ].join("\n");
  }

  return {
    APPROVAL_GATES,
    METHODOLOGY_VERSION,
    STAGES,
    STAGE_PROMPTS,
    advanceStage,
    assessWorkspace,
    buildAiBrief,
    createWorkspace,
    exportMarkdown,
    invalidateFromStage,
    normaliseWorkspace,
    revokeApproval,
    setApproval
  };
});
