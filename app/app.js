const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = {
  conversation: null,
  conversations: [],
  preview: null,
  pending: null,
  settings: null,
  apiConfigured: false,
  attachments: [],
  recording: null,
  recordingStream: null,
  recordingChunks: [],
  recordingTimer: null,
  recordingClock: null,
  recordingStartedAt: null,
  recordingMonitor: null,
  recordingError: null,
  pendingRecording: null,
  proposals: [],
  selectedProposalId: null,
  methodologyLearning: null,
  currentUser: "Jamie Peppard",
  repositoryMode: "manual",
  capture: null,
  confluence: null,
  confluenceTest: null,
  confluencePublicationPlan: null,
  brandReview: null,
  steering: null,
  myWork: null,
  workOrder: "recommended",
  workFilters: { view: "all", search: "", profile: "", recordType: "" },
  selectedWorkItemId: null,
  selectedImplementationJob: null,
  operateRecords: [],
  operationsBible: [],
  workProfiles: [],
  operateNetwork: null,
  currentOperateRecord: null,
  currentWorkItem: null,
  inlineWorkHelp: null,
  serverCompatible: true
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const value = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(value.error || "Request failed."), { status: response.status, value });
  return value;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function markdown(value) {
  return escapeHtml(value)
    .replace(/^### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^# (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
    .replace(/^- \[ \] (.+)$/gm, '<li class="check-item"><span aria-hidden="true">&#9633;</span> $1</li>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li(?: class="check-item")?>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

function toast(message, error = false) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.toggle("error", error);
  element.classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("visible"), 3200);
}

function setProcessing(active, title = "Working on your request", detail = "Retrieving controlled evidence...") {
  $("#processing-state").hidden = !active;
  $("#processing-title").textContent = title;
  $("#processing-detail").textContent = detail;
  if (active) $("#processing-state").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function formatCost(value) {
  return `$${Number(value || 0).toFixed(4)} USD`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatDateOnly(value) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

function workTypeClass(value) {
  return String(value || "work").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

function isAiOwner(owner) {
  return /\b(?:codex|oppa mate|operations automated ai|ai owner)\b/i.test(String(owner || ""));
}

function isTerminalRecordStatus(status) {
  return new Set([
    "closed", "done", "cancelled", "completed", "rejected", "no-action",
    "decided", "superseded", "approved", "expired", "implemented"
  ]).has(String(status || "").toLowerCase());
}

function workflowSteps(record) {
  const job = record.implementationJob;
  if (job) {
    const currentByStatus = {
      "waiting-on-codex": 1,
      "waiting-for-review": 2,
      "release-authorised": 3,
      merged: 4
    };
    const current = currentByStatus[job.status] ?? 0;
    return [
      ["Requirement approved for preparation", 0],
      ["Codex returns a tested draft", 1],
      ["Jamie reviews the exact release", 2],
      ["Authorised merge is recorded", 3]
    ].map(([label, position]) => ({ label, state: position < current ? "complete" : position === current ? "current" : "upcoming" }));
  }
  if (record.recordType === "case") {
    const current = record.status === "open" ? 0 : record.openChildren ? 1 : ["resolved", "closed"].includes(record.status) ? 2 : 1;
    const terminal = isTerminalRecordStatus(record.status);
    return [
      ["Outcome and scope recorded", 0],
      ["Contained work completed", 1],
      ["Outcome reviewed and Case closed", 2]
    ].map(([label, position]) => ({ label, state: terminal && position <= current ? "complete" : position < current ? "complete" : position === current ? "current" : "upcoming" }));
  }
  if (record.recordType === "task") {
    const current = record.status === "to-do" ? 0 : ["in-progress", "blocked"].includes(record.status) ? 1 : 2;
    const terminal = isTerminalRecordStatus(record.status);
    return [
      ["Task ready for its owner", 0],
      ["Work carried out", 1],
      ["Completion evidence retained", 2]
    ].map(([label, position]) => ({ label, state: terminal && position <= current ? "complete" : position < current ? "complete" : position === current ? "current" : "upcoming" }));
  }
  return [
    { label: "Work and evidence recorded", state: "complete" },
    { label: record.nextAction?.label || "Current work completed", state: "current" },
    { label: "Outcome and rationale retained", state: "upcoming" }
  ];
}

function workflowMarkup(record) {
  const next = record.nextAction || {};
  const terminal = isTerminalRecordStatus(record.status);
  const aiOwned = !terminal && (next.authority === "ai-owner" || isAiOwner(record.owner));
  const completedReview = terminal ? record.codexHandoff?.lastReview : null;
  const completionEvidence = [...new Set([
    ...(record.implementationJob?.acceptanceCriteria || []),
    ...(record.bible?.completionEvidence || []),
    ...(record.profile?.completionEvidence || [])
  ].filter(Boolean))];
  const steps = workflowSteps(record);
  return `<section class="work-now" aria-label="Current workflow step">
    <span>${terminal ? "Completed" : aiOwned ? "Being handled" : "Your next step"}</span>
    <h4>${escapeHtml(terminal ? "Outcome and evidence retained" : next.label || "Review this work")}</h4>
    <p>${escapeHtml(terminal ? completedReview?.outcome || "This record reached its terminal state and its completion evidence remains available." : next.outcome || "Review the recorded outcome, evidence and owner before acting.")}</p>
    <dl><div><dt>${terminal ? "Completed by" : "Owner now"}</dt><dd>${escapeHtml(record.owner || "Unassigned")}</dd></div><div><dt>${terminal ? "What now" : "Your part"}</dt><dd>${terminal ? "No further action is due. Reopen or create governed follow-up work only if the retained outcome proves incomplete." : aiOwned ? "Nothing to fill in now. This returns to you only if a decision or clarification is needed." : "Complete the one action shown here; the Workbench will retain the result and update what comes next."}</dd></div></dl>
  </section>
  <section class="workflow-progress" aria-label="Workflow progress">
    <div class="workflow-heading"><span>Workflow</span><strong>${escapeHtml(record.profile?.label || record.bible?.label || "Work")}</strong></div>
    <ol>${steps.map((step) => `<li class="workflow-step-${step.state}"><span aria-hidden="true">${step.state === "complete" ? "✓" : step.state === "current" ? "●" : "○"}</span><p>${escapeHtml(step.label)}</p><small>${step.state === "complete" ? "Done" : step.state === "current" ? "Now" : "Later"}</small></li>`).join("")}</ol>
    <details><summary>Done when</summary>${completionEvidence.length ? `<ul>${completionEvidence.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>The intended outcome and enough evidence to support closure are retained.</p>"}</details>
  </section>`;
}

function sourceLinkMarkup(sourceContext, className = "source-link") {
  if (!sourceContext?.url) return "";
  return `<a class="${className}" href="${escapeHtml(sourceContext.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceContext.label || "Open source")} <span aria-hidden="true">↗</span></a>`;
}

function sourceWorkPackageMarkup(sourceContext) {
  if (!sourceContext) return "";
  const evidence = Array.isArray(sourceContext.evidence) ? sourceContext.evidence.filter(Boolean) : [];
  const alternatives = Array.isArray(sourceContext.alternatives) ? sourceContext.alternatives.filter(Boolean) : [];
  const remainsUnauthorised = Array.isArray(sourceContext.remainsUnauthorised) ? sourceContext.remainsUnauthorised.filter(Boolean) : [];
  return `<section class="source-work-package" aria-label="Linked source work package">
    <div class="source-work-package-heading">
      <div><span>Linked source</span><strong>${escapeHtml(sourceContext.title || sourceContext.label)}</strong><small>${escapeHtml(statusLabel(sourceContext.status))}</small></div>
      ${sourceLinkMarkup(sourceContext, "primary source-package-link") || '<span class="source-link-pending">Current draft link not returned yet</span>'}
    </div>
    <dl>
      <div><dt>Why this exists</dt><dd>${escapeHtml(sourceContext.summary || "No source summary was retained.")}</dd></div>
      <div><dt>What this changes</dt><dd>${escapeHtml(sourceContext.whatChanges || sourceContext.summary || "Review the linked source for the bounded change.")}</dd></div>
      <div class="source-decision"><dt>Your decision</dt><dd>${escapeHtml(sourceContext.exactDecision || "Review the source and decide the recorded next action.")}</dd></div>
    </dl>
    ${(evidence.length || alternatives.length || sourceContext.tradeOffs || remainsUnauthorised.length) ? `<details><summary>Evidence, options and boundary</summary>
      ${evidence.length ? `<strong>Evidence</strong><ul>${evidence.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : JSON.stringify(item))}</li>`).join("")}</ul>` : ""}
      ${alternatives.length ? `<strong>Options</strong><ul>${alternatives.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : JSON.stringify(item))}</li>`).join("")}</ul>` : ""}
      ${sourceContext.tradeOffs ? `<strong>Trade-offs or risk</strong><p>${escapeHtml(sourceContext.tradeOffs)}</p>` : ""}
      ${remainsUnauthorised.length ? `<strong>Still not authorised</strong><p>${escapeHtml(remainsUnauthorised.join(", "))}</p>` : ""}
    </details>` : ""}
    <p>${escapeHtml(sourceContext.sourceAuthority || "The source informs the work; it does not approve it.")}</p>
  </section>`;
}

function inlineWorkHelpMarkup(record) {
  const help = state.inlineWorkHelp;
  if (!record || help?.recordId !== record.id) return "";
  const response = help.response;
  const prompts = ["Summarise this work", "What do I need to decide?", "What could go wrong?", "Explain the evidence"];
  return `<section class="inline-work-help" aria-label="Ask Oppa Mate about this work">
    <div class="inline-work-context">
      <span class="oppa-account-avatar" aria-hidden="true">OM</span>
      <div><small>You are asking from this work item</small><strong>${escapeHtml(record.title)}</strong>${sourceLinkMarkup(record.sourceContext, "inline-source-link")}</div>
    </div>
    <div class="inline-help-prompts">${prompts.map((prompt) => `<button type="button" class="ghost" data-inline-help-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}</div>
    <form data-inline-work-help="${escapeHtml(record.id)}">
      <label>Ask a question<input name="question" required maxlength="2000" placeholder="Ask Oppa Mate about this exact work item..."></label>
      <button class="primary" type="submit">Ask here</button>
    </form>
    <p class="inline-help-status" data-inline-help-status>${help.status ? escapeHtml(help.status) : "The linked work, source and authority boundary will stay attached to the question."}</p>
    ${response ? `<article class="inline-help-response"><div class="message-role">OM</div><div>${markdown(userFacingAnswer(response.working_text))}${technicalDetails(response, response.metadata?.sources || [])}</div></article>` : ""}
    <button type="button" class="ghost open-full-conversation" data-open-work-conversation>Open full conversation with this context</button>
  </section>`;
}

function workItemMarkup(item, compact = false) {
  const reasons = item.priority?.reasons || [];
  const aiOwned = item.humanActionRequired === false;
  return `<article class="work-item-wrap ${compact ? "work-item-wrap-compact" : ""}"><button class="work-item ${compact ? "work-item-compact" : ""} ${state.selectedWorkItemId === item.id ? "current" : ""}" data-work-item-id="${escapeHtml(item.id)}">
    <span class="work-type work-type-${workTypeClass(item.recordType || item.sourceType)}">${escapeHtml(item.typeLabel)}</span>
    <span class="work-item-copy">
      <strong>${escapeHtml(item.title)}</strong>
      ${item.reference ? `<small class="work-reference">${escapeHtml(item.reference)}</small>` : ""}
      ${compact ? "" : `<small>${escapeHtml(item.summary || "Open the underlying record for context.")}</small>`}
      <span class="work-item-next">${aiOwned ? "With its owner" : "Next for you"}: ${escapeHtml(item.nextAction?.label || item.actionLabel || "Review work")}${item.nextAction?.disabled ? ` · blocked — ${escapeHtml(item.nextAction.unavailableReason)}` : ""}</span>
      <span class="work-item-meta">${escapeHtml(item.source)} &middot; ${escapeHtml(statusLabel(item.status))}${item.dueAt ? ` &middot; due ${escapeHtml(formatDateOnly(item.dueAt))}` : ""}</span>
    </span>
    <span class="priority-score priority-${escapeHtml(item.priority?.band || "planned")}"><b>${Number(item.priority?.score || 0)}</b><small>${item.priority?.overdue ? "Overdue" : reasons[0] || "Priority"}</small></span>
  </button>${sourceLinkMarkup(item.sourceContext, "work-item-source-link")}</article>`;
}

function recordAsWorkItem(record) {
  return {
    id: `operate:${record.id}`,
    source: "Operate",
    sourceType: "operate-record",
    sourceId: record.id,
    routeView: "operate",
    recordType: record.recordType,
    typeLabel: record.bible?.label || record.recordType,
    title: record.title,
    summary: record.summary || record.bible?.definition || "",
    status: record.status,
    owner: record.owner,
    dueAt: record.dueAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    actionLabel: record.nextAction?.label || "Review work",
    nextAction: record.nextAction,
    decisionRequired: Boolean(record.nextAction?.decision),
    humanActionRequired: record.humanActionRequired,
    priority: record.priority,
    approvalState: record.approvalState,
    workProfile: record.workProfile,
    workProfileLabel: record.profile?.label || record.workProfile,
    sourceContext: record.sourceContext,
    implementationJob: record.implementationJob,
    reference: record.reference
  };
}

function activitySummary(activity) {
  const detail = activity.detail || {};
  if (activity.action === "workflow.action-completed") {
    return `${detail.actionLabel || "Action completed"}: ${statusLabel(detail.statusBefore)} to ${statusLabel(detail.statusAfter)}${detail.note ? ` — ${detail.note}` : ""}`;
  }
  if (activity.action === "record.created") return "Work record created.";
  if (activity.action === "relationship.confirmed") return "Related work confirmed.";
  if (activity.action === "relationship.rejected") return `Relationship rejected${detail.reason ? ` — ${detail.reason}` : ""}.`;
  if (activity.action === "ai-handoff.sent") return `Started in Codex${detail.codexTaskReference ? ` — ${detail.codexTaskReference}` : ""}.`;
  if (activity.action === "ai-handoff.reviewed") return detail.result === "completed"
    ? "Codex return checked against the success criteria; task completed."
    : detail.result === "needs-more-work"
      ? `Codex return reviewed; more work needed${detail.missing?.length ? ` — ${detail.missing.join(" ")}` : ""}.`
      : "Codex return checked and ready for the next governed action.";
  if (activity.action === "implementation-job.sent") return `${detail.phase === "merge" ? "Authorised merge" : "Build"} started in Codex${detail.codexTaskReference ? ` — ${detail.codexTaskReference}` : ""}.`;
  return activity.action.replaceAll(".", " ").replaceAll("-", " ");
}

function codexTaskHandoffMarkup(record) {
  const handoff = record.codexHandoff;
  if (!handoff || ["completed", "ready-for-founder-review"].includes(handoff.status)) return "";
  if (handoff.status === "needs-clarification") {
    return `<section class="codex-handoff-panel codex-handoff-ready">
      <div class="work-action-heading"><span>Clarification needed</span><h4>The AI owner needs one missing outcome detail</h4><p>${escapeHtml(handoff.questions[0] || "Clarify the intended outcome before this task can run.")}</p></div>
      <p class="work-action-authority">The scheduled worker will not claim this task until the missing information is recorded.</p>
    </section>`;
  }
  const queued = ["ready-for-codex", "needs-more-work"].includes(handoff.status);
  return `<section class="codex-handoff-panel ${queued ? "codex-handoff-ready" : "codex-handoff-running"}">
    <div class="work-action-heading">
      <span>${queued ? "Queued for the AI owner" : "With the AI owner"}</span>
      <h4>${queued ? (handoff.status === "needs-more-work" ? "The corrected task is ready for automatic retry" : "The scheduled worker will pick up this task") : "The AI owner has claimed this task"}</h4>
      <p>${queued ? "Nothing needs copying during the normal route. The worker will claim the task, carry it out and return evidence here." : "When the AI owner finishes it can update this ticket automatically. If that return fails, the result can still be pasted below."}</p>
    </div>
    <dl class="handoff-outcome">
      <div><dt>Ticket</dt><dd>${escapeHtml(handoff.reference)}</dd></div>
      <div><dt>Outcome</dt><dd>${escapeHtml(record.summary || record.title)}</dd></div>
      <div><dt>Done when</dt><dd><ul>${handoff.criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></dd></div>
      <div><dt>Questions before starting</dt><dd>${handoff.questions.length ? `<ul>${handoff.questions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "Nothing else is needed from you."}</dd></div>
    </dl>
    ${queued ? `<details><summary>Manual fallback if the scheduled worker is unavailable</summary><label class="codex-prompt">Ready-to-copy Codex task
      <textarea readonly rows="18" data-codex-task-prompt>${escapeHtml(handoff.prompt)}</textarea>
    </label><div class="work-action-buttons"><button class="primary" type="button" data-copy-codex-task>Copy Codex task</button></div>
    <label class="codex-task-reference">Codex task name or link <small>Optional, but useful if you want to return to it.</small><input maxlength="500" data-codex-task-reference placeholder="Paste the Codex task name or link"></label>
    <button class="primary" type="button" data-mark-codex-task-sent>I've started this in Codex</button></details>` : `<p class="work-action-authority">Recorded Codex task: ${escapeHtml(handoff.lastSent?.codexTaskReference || "Scheduled AI-owner worker")}</p>`}
    <form class="codex-return-form" data-codex-task-review="${escapeHtml(record.id)}">
      <label>Codex finished but did not update this ticket?
        <textarea name="outcomeText" rows="7" required placeholder="Paste the complete Codex final response, including the OA_WORKBENCH_RETURN block."></textarea>
      </label>
      <button class="ghost" type="submit">I've done this — review the outcome</button>
    </form>
    ${handoff.lastReview?.missing?.length ? `<div class="handoff-gaps"><strong>What still needs fixing</strong><ul>${handoff.lastReview.missing.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
    <p class="work-action-authority">Assignment and claiming are not completion. The ticket closes only after returned evidence passes the success checks.</p>
  </section>`;
}

function operateActionMarkup(record) {
  const actions = record.actions || [];
  if (isTerminalRecordStatus(record.status)) {
    const review = record.codexHandoff?.lastReview;
    const evidence = Array.isArray(review?.evidence) ? review.evidence.filter(Boolean) : [];
    return `<section class="work-action-panel work-action-complete"><span>Completed outcome</span><h4>No further action is due</h4><p>${escapeHtml(review?.outcome || "This record is complete or terminal. Its evidence and relationships remain available.")}</p>${evidence.length ? `<strong>Returned evidence</strong><ul>${evidence.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</section>`;
  }
  if (record.codexHandoff && !["completed", "ready-for-founder-review"].includes(record.codexHandoff.status)) {
    return codexTaskHandoffMarkup(record);
  }
  if (record.sourceBacked && record.nextAction) {
    const routeButton = record.nextAction.implementationJobId
      ? `<button class="ghost" data-open-implementation-job="${escapeHtml(record.nextAction.implementationJobId)}">Open Codex build</button>`
      : `<button class="primary" data-open-work-source="${escapeHtml(record.nextAction.routeView)}" data-source-id="${escapeHtml(record.sourceId)}">${escapeHtml(record.nextAction.label)}</button>`;
    return `<section class="work-action-panel">
      <div class="work-action-heading"><span>${record.nextAction.authority === "ai-owner" ? "Being handled" : "Next action"}</span><h4>${escapeHtml(record.nextAction.label)}</h4><p>${escapeHtml(record.nextAction.outcome)}</p></div>
      ${routeButton}
      <p class="work-action-authority">The specialist history remains intact. This view follows the same workflow instead of creating a second decision or form.</p>
    </section>`;
  }
  if (record.nextAction?.routeRecordId) {
    return `<section class="work-action-panel">
      <div class="work-action-heading"><span>Continue the Case</span><h4>${escapeHtml(record.nextAction.label)}</h4><p>${escapeHtml(record.nextAction.outcome)}</p></div>
      <button class="primary" data-open-operate-record="${escapeHtml(record.nextAction.routeRecordId)}">Open ${escapeHtml(record.nextAction.routeRecordTitle || "contained work")}</button>
      <p class="work-action-authority">The Case cannot be resolved while contained work remains open.</p>
    </section>`;
  }
  if (record.nextAction?.authority === "ai-owner" || isAiOwner(record.owner)) {
    return `<section class="work-action-panel work-action-owned">
      <div class="work-action-heading"><span>Being handled</span><h4>${escapeHtml(record.nextAction?.label || "Waiting for the assigned owner")}</h4><p>${escapeHtml(record.nextAction?.outcome || "The assigned owner must return completion evidence.")}</p></div>
      <p class="work-action-authority">There is nothing for Jamie to mark as done. The item returns to your action list only if a decision, clarification or review is needed.</p>
    </section>`;
  }
  if (!actions.length) {
    return `<section class="work-action-panel work-action-complete"><span>Current outcome</span><h4>No further action is due</h4><p>This record is complete or terminal. Its evidence and relationships remain available.</p></section>`;
  }
  const nextAction = record.nextAction || actions[0];
  const noteRequired = actions.some((item) => item.noteRequired);
  const confirmations = [...new Set(actions.filter((item) => item.typedConfirmation).map((item) => item.confirmation).filter(Boolean))];
  const choiceAction = actions.find((item) => item.choices?.length);
  const suggestedNote = nextAction.suggestedNote || "";
  return `<section class="work-action-panel">
    <div class="work-action-heading"><span>Governed next action</span><h4>${escapeHtml(nextAction.label)}</h4><p>${escapeHtml(nextAction.outcome)}</p></div>
    <label class="work-action-note">Decision note <small>${suggestedNote ? "Suggested for the recommended action; edit it if it does not reflect the outcome." : noteRequired ? "Required only when the selected action needs evidence or a reason." : "Optional."}</small>
      <textarea rows="3" maxlength="2000" data-operate-action-note data-user-edited="false" placeholder="${noteRequired ? "Add the evidence, outcome or reason that is not already recorded." : "Optional context for the retained activity history."}">${escapeHtml(suggestedNote)}</textarea>
    </label>
    ${choiceAction ? `<label class="work-action-choice">Decision outcome <small>Choose one option to enable ${escapeHtml(choiceAction.label)}.</small>
      <select data-operate-action-choice><option value="">Choose an outcome</option>${choiceAction.choices.map((choice) => `<option value="${escapeHtml(choice.value)}">${escapeHtml(choice.label)}</option>`).join("")}</select>
    </label>` : ""}
    ${confirmations.length ? `<label class="work-action-confirmation">Exact confirmation
      <input maxlength="100" data-operate-action-confirmation autocomplete="off" placeholder="Type ${escapeHtml(confirmations.join(" or "))} for the consequential action">
      <small>Typing remains necessary only for higher-consequence actions such as accepting risk.</small>
    </label>` : ""}
    <div class="work-action-buttons">${actions.map((item) => `<button
      class="${item.style === "primary" ? "primary" : item.style === "danger" ? "danger-outline" : "ghost"}"
      data-operate-action="${escapeHtml(item.id)}"
      ${item.choices?.length ? 'data-choice-required="true"' : ""}
      data-action-blocked="${item.disabled ? "true" : "false"}"
      ${item.disabled || item.choices?.length ? "disabled" : ""}
      title="${escapeHtml(item.unavailableReason || item.outcome)}">${escapeHtml(item.label)}</button>`).join("")}</div>
    ${actions.filter((item) => item.disabled).map((item) => `<p class="work-action-blocked"><strong>${escapeHtml(item.label)} is blocked.</strong> ${escapeHtml(item.unavailableReason)}</p>`).join("")}
    <p class="work-action-authority">${nextAction.authority === "founder" ? "This action requires Jamie Peppard’s explicit authority." : "This action records progress; it does not create wider approval."}</p>
  </section>`;
}

function operateActivityMarkup(record) {
  const activities = (record.activity || []).slice(0, 8);
  if (!activities.length) return "";
  return `<details class="work-activity"><summary>Recent activity</summary><ol>${activities.map((activity) => `<li><span>${escapeHtml(activitySummary(activity))}</span><small>${escapeHtml(activity.actor)} · ${escapeHtml(formatDate(activity.created_at))}</small></li>`).join("")}</ol></details>`;
}

function renderWorkDetail(item, record = null) {
  state.selectedWorkItemId = item?.id || null;
  state.currentOperateRecord = record;
  state.currentWorkItem = item;
  state.selectedImplementationJob = null;
  if (!item) {
    state.currentWorkItem = null;
    $("#work-detail").innerHTML = '<div class="work-detail-empty"><span aria-hidden="true">↗</span><strong>Select an item</strong><p>The underlying record, priority explanation, authority boundary and next action will appear here.</p></div>';
    return;
  }
  const priority = item.priority || {};
  const factors = priority.factors || {};
  const factorLabels = {
    impact: "Impact", urgency: "Urgency", risk: "Risk", control: "Controls",
    blocking: "Blocking", strategic: "Improvement", age: "Age", confidence: "Confidence"
  };
  const sourceAction = record ? "" : item.sourceType === "daily-challenge"
    ? `<button class="primary" data-start-daily-challenge="${escapeHtml(item.nextAction?.challengeDate || "today")}">${escapeHtml(item.actionLabel || "Start today's challenge")}</button>`
    : `<button class="primary" data-open-work-source="${escapeHtml(item.routeView)}" data-source-id="${escapeHtml(item.sourceId)}">${escapeHtml(item.actionLabel || "Open source")}</button>`;
  const recordBody = record ? `
    ${workflowMarkup(record)}
    <dl class="work-detail-facts">
      <div><dt>Ticket</dt><dd>${escapeHtml(record.reference || "Not assigned")}</dd></div>
      <div><dt>Who acts next</dt><dd>${escapeHtml(record.owner || "Unassigned")}</dd></div>
      ${record.assignedOwner && record.assignedOwner !== record.owner ? `<div><dt>Work owner</dt><dd>${escapeHtml(record.assignedOwner)}</dd></div>` : ""}
      <div><dt>Status</dt><dd>${escapeHtml(statusLabel(record.status))}</dd></div>
      <div><dt>Due</dt><dd>${escapeHtml(formatDateOnly(record.dueAt))}</dd></div>
      <div><dt>Automation</dt><dd>${escapeHtml(record.automationMode || "manual")}</dd></div>
      ${record.profile ? `<div><dt>Work profile</dt><dd>${escapeHtml(record.profile.label)}</dd></div>` : ""}
      ${record.case ? `<div><dt>Case</dt><dd>${escapeHtml(record.case.title)}</dd></div>` : ""}
      ${record.parent ? `<div><dt>Parent work</dt><dd>${escapeHtml(record.parent.title)}</dd></div>` : ""}
      ${record.journey ? `<div><dt>Journey</dt><dd>${escapeHtml(record.journey)}${record.journeyStage ? ` · ${escapeHtml(record.journeyStage)}` : ""}</dd></div>` : ""}
    </dl>
    ${record.bible ? `<div class="record-boundary"><strong>${escapeHtml(record.bible.definition)}</strong><p>${escapeHtml(record.bible.approval)}</p></div>` : ""}
    ${record.profile ? `<details class="why-recommended"><summary>Why this work profile</summary><p>${escapeHtml(record.profile.purpose)}</p><strong>Questions Oppa Mate may ask</strong><ul>${(record.profile.additionalQuestions || []).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></details>` : ""}
    ${record.knowledgeSnapshot?.sources?.length ? `<details class="why-recommended"><summary>Why Oppa Mate recommended this</summary><p>${escapeHtml(record.knowledgeSnapshot.explanation)}</p><ul>${record.knowledgeSnapshot.sources.map((source) => `<li><strong>${escapeHtml(source.title || source.path)}</strong><span>${escapeHtml(source.status)} · ${source.normative ? "approved normative" : "evidence only"} · ${escapeHtml(source.heading || "document")}</span><code>${escapeHtml(String(source.hash || "").slice(0, 12))}</code></li>`).join("")}</ul></details>` : ""}
    ${record.children?.length ? `<section class="work-relations"><h4>Contained work</h4>${record.children.map((child) => `<button data-open-operate-record="${child.id}"><span>${escapeHtml(child.bible?.label || child.recordType)}</span><strong>${escapeHtml(child.title)}</strong><small>${escapeHtml(statusLabel(child.status))} · ${escapeHtml(child.owner || "Unassigned")}</small></button>`).join("")}</section>` : ""}
    ${record.links?.length ? `<section class="work-relations"><h4>Relationships</h4>${record.links.map((link) => {
      const otherTitle = link.fromRecordId === record.id ? link.to_title : link.from_title;
      const otherStatus = link.fromRecordId === record.id ? link.toStatus : link.fromStatus;
      const otherOwner = link.fromRecordId === record.id ? link.toOwner : link.fromOwner;
      const provenance = link.proposedVia === "ai"
        ? `Suggested by Oppa Mate · confirmed by ${link.confirmedBy}`
        : `Linked by ${link.confirmedBy || link.proposedBy}`;
      return `<div class="relationship-row"><span><small>${escapeHtml(link.relationship.replaceAll("-", " "))}</small><strong>${escapeHtml(otherTitle)}</strong><em>${escapeHtml(statusLabel(otherStatus))} · ${escapeHtml(otherOwner || "Unassigned")}</em><em>${escapeHtml(provenance)}</em></span><details class="link-correction"><summary>Correct</summary><label>Why is this link wrong?<input data-link-rejection-reason="${link.id}" maxlength="500"></label><button class="link-reject" data-reject-operate-link="${link.id}">Reject link</button></details></div>`;
    }).join("")}</section>` : ""}
    ${record.linkSuggestions?.length ? `<section class="link-suggestions"><div><h4>Oppa Mate sees possible connections</h4><p>These are inferences from record types and shared context. Accept only when the relationship is operationally true.</p></div>${record.linkSuggestions.map((suggestion, index) => `<article><span class="work-type work-type-${workTypeClass(suggestion.otherType)}">${escapeHtml(suggestion.otherType)}</span><strong>${escapeHtml(suggestion.otherTitle)}</strong><p>${escapeHtml(suggestion.rationale)}</p><button class="ghost" data-accept-link-suggestion="${index}">Confirm link</button></article>`).join("")}</section>` : ""}
    ${operateActionMarkup(record)}
    ${record.buildReady ? `<button class="primary prepare-build-action" data-prepare-build="${record.id}">Prepare Codex build</button>` : ""}
    <button class="ghost discuss-work-action" data-discuss-operate-record="${record.id}">Ask Oppa Mate about this work</button>
    ${inlineWorkHelpMarkup(record)}
    <button class="ghost link-work-action" data-link-operate-record="${record.id}">Link related work</button>
    ${operateActivityMarkup(record)}
  ` : item.sourceType === "daily-challenge" ? `<section class="work-now" aria-label="Current workflow step">
      <span>${item.nextAction?.authority === "ai-owner" ? "Being handled" : "Your next step"}</span>
      <h4>${escapeHtml(item.nextAction?.label || "Start today's challenge")}</h4>
      <p>${escapeHtml(item.nextAction?.outcome || item.summary)}</p>
      <dl><div><dt>Owner now</dt><dd>${escapeHtml(item.owner)}</dd></div><div><dt>Done when</dt><dd>Jamie has answered the one primary question, or deliberately skipped today's challenge.</dd></div></dl>
    </section>${sourceAction}<p class="work-action-authority">This challenge stays in its own Workbench conversation. It does not create methodology approval or a repository change.</p>`
    : `<div class="record-boundary"><strong>Underlying source: ${escapeHtml(item.source)}</strong><p>This inbox item remains governed in its existing workflow. Opening it here does not approve, reject or complete it.</p></div>${sourceAction}`;
  $("#work-detail").innerHTML = `
    <div class="work-detail-heading">
      <div><span class="work-type work-type-${workTypeClass(item.recordType || item.sourceType)}">${escapeHtml(item.typeLabel)}</span><h3>${escapeHtml(item.title)}</h3></div>
      <span class="priority-score priority-${escapeHtml(priority.band || "planned")}"><b>${Number(priority.score || 0)}</b><small>Priority</small></span>
    </div>
    <p class="work-detail-summary">${escapeHtml(item.summary || "No additional summary was recorded.")}</p>
    ${sourceWorkPackageMarkup(record?.sourceContext || item.sourceContext)}
    <div class="priority-explanation"><strong>Why this is here</strong><p>${escapeHtml(priority.explanation || "This item requires attention in the selected order.")}</p></div>
    ${Object.keys(factors).length ? `<details class="priority-factors"><summary>See priority factors</summary><div>${Object.entries(factors).map(([key, value]) => `<span><small>${escapeHtml(factorLabels[key] || key)}</small><b>${Number(value)}/5</b></span>`).join("")}</div></details>` : ""}
    ${recordBody}
    <p class="approval-boundary">Recommendation and classification do not create approval or accept consequence.</p>
  `;
  $$(".work-item").forEach((element) => element.classList.toggle("current", element.dataset.workItemId === item.id));
}

function linesMarkup(values) {
  return (values || []).map((value) => `<li>${escapeHtml(value)}</li>`).join("");
}

function returnedJson(text) {
  const value = String(text || "").trim();
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The returned Codex response does not contain a complete JSON result.");
  try { return JSON.parse(value.slice(start, end + 1)); }
  catch { throw new Error("The returned Codex JSON could not be read. Copy the complete final result and try again."); }
}

function implementationReceiptMarkup(job) {
  if (["waiting-on-codex", "release-authorised"].includes(job.status)) {
    const queued = job.handoff?.status !== "in-codex";
    const mergePhase = job.handoff?.phase === "merge";
    return `<section class="codex-handoff-panel ${queued ? "codex-handoff-ready" : "codex-handoff-running"}">
      <div class="work-action-heading">
        <span>${queued ? "Queued for the AI owner" : "With the AI owner"}</span>
        <h4>${queued ? (mergePhase ? "The authorised merge is ready for automatic pickup" : "The prepared build is ready for automatic pickup") : (mergePhase ? "Codex is carrying out the authorised merge" : "Codex is preparing and testing the draft")}</h4>
        <p>${queued ? "Nothing needs copying during the normal route. The scheduled worker will claim the exact prompt and return the required evidence." : "The next Workbench step begins when Codex returns the required evidence. If automatic return fails, paste the final JSON below."}</p>
      </div>
      <dl class="handoff-outcome">
        <div><dt>Ticket</dt><dd>${escapeHtml(job.handoff?.reference || "Build reference unavailable")}</dd></div>
        <div><dt>Outcome</dt><dd>${escapeHtml(mergePhase ? `Merge only the approved commit ${job.commitSha}.` : job.approvedRequirement)}</dd></div>
        <div><dt>Done when</dt><dd>${escapeHtml(mergePhase ? "The exact merge receipt is returned and the repository is re-indexed." : "The structured return proves every acceptance criterion, implemented behaviour, migration, rollback, risks, remaining work and version impact.")}</dd></div>
      </dl>
      ${queued ? `<details><summary>Manual fallback if the scheduled worker is unavailable</summary><label class="codex-prompt">Ready-to-copy Codex task<textarea readonly rows="20" data-build-handoff-prompt>${escapeHtml(job.handoff?.prompt || job.briefText)}</textarea></label>
      <button class="primary" type="button" data-copy-build-handoff>Copy Codex task</button>
      <label class="codex-task-reference">Codex task name or link <small>Optional.</small><input maxlength="500" data-build-task-reference></label><button class="primary" type="button" data-mark-build-sent>I've started this in Codex</button></details>` : `<p class="work-action-authority">Recorded Codex task: ${escapeHtml(job.handoff?.lastSent?.codexTaskReference || "Scheduled AI-owner worker")}</p>`}
      <form class="codex-return-form" data-build-return="${escapeHtml(job.id)}" data-build-return-phase="${escapeHtml(job.handoff?.phase || "implementation")}">
        <label>Codex finished but did not update this ticket?<textarea name="outcomeText" rows="7" required placeholder="Paste the completed OA_WORKBENCH_${mergePhase ? "MERGE" : "BUILD"}_RETURN JSON."></textarea></label>
        <button class="ghost" type="submit">I've done this — review the outcome</button>
      </form>
      <p class="work-action-authority">Assignment and claiming do not mark the job complete. Returned evidence must pass the next workflow check.</p>
    </section>`;
  }
  if (job.status === "waiting-for-review") {
    return `<section class="release-decision-panel">
      <span>PR ready for your review</span>
      <h4>Review the linked pull request, then decide whether this exact commit may merge</h4>
      ${job.pullRequestUrl ? `<a class="primary text-link" href="${escapeHtml(job.pullRequestUrl)}" target="_blank" rel="noreferrer">Open the pull request</a>` : ""}
      <ul class="release-review-checklist"><li>Does the change deliver the outcome above?</li><li>Do the tests and visible journey checks pass?</li><li>Are the unresolved risks acceptable for this release decision?</li><li>Does the PR still contain commit ${escapeHtml(job.commitSha)}?</li></ul>
      <label>Decision reason<textarea data-release-reason rows="3" placeholder="Required for request changes, reject or defer."></textarea></label>
      <label>Exact confirmation<input data-release-confirmation autocomplete="off" placeholder="Type Approve release"></label>
      <div class="work-action-buttons">
        <button class="primary" data-build-release-action="approve">Approve release</button>
        <button class="ghost" data-build-release-action="request-changes">Request changes</button>
        <button class="danger-outline" data-build-release-action="reject">Reject</button>
        <button class="ghost" data-build-release-action="defer">Defer</button>
      </div>
      <p>Approval authorises only ${escapeHtml(job.commitSha)} in the linked pull request. The next screen supplies the exact Codex merge command; external publication remains separate.</p>
    </section>`;
  }
  return "";
}

function renderImplementationJobDetail(item, job) {
  state.selectedWorkItemId = item.id;
  state.currentOperateRecord = null;
  state.currentWorkItem = item;
  state.selectedImplementationJob = job;
  const approval = job.releaseApproval;
  $("#work-detail").innerHTML = `
    <div class="work-detail-heading">
      <div><span class="work-type work-type-change">Build job</span><h3>${escapeHtml(job.title)}</h3></div>
      <span class="status-pill status-${workTypeClass(job.status)}">${escapeHtml(statusLabel(job.status))}</span>
    </div>
    <p class="work-detail-summary">${escapeHtml(job.approvedRequirement)}</p>
    ${workflowMarkup({
      recordType: "change",
      status: job.status,
      owner: item.owner,
      nextAction: item.nextAction,
      implementationJob: job,
      profile: { label: "Product or application build", completionEvidence: ["implementation receipt reviewed", "separate release outcome retained"] }
    })}
    ${sourceWorkPackageMarkup(item.sourceContext)}
    <dl class="work-detail-facts">
      <div><dt>Ticket</dt><dd>${escapeHtml(job.handoff?.reference || item.reference || "Not assigned")}</dd></div>
      <div><dt>Who acts next</dt><dd>${escapeHtml(item.owner)}</dd></div>
      <div><dt>Branch</dt><dd>${escapeHtml(job.branchName || "Not returned yet")}</dd></div>
      <div><dt>Commit</dt><dd>${escapeHtml(job.commitSha || "Not returned yet")}</dd></div>
    </dl>
    <div class="record-boundary"><strong>Authority boundary</strong><p>${escapeHtml(job.authorityBoundary)}</p></div>
    <details class="implementation-brief">
      <summary>Technical: original governed build brief</summary>
      <textarea readonly rows="18">${escapeHtml(job.briefText)}</textarea>
      <button class="ghost" type="button" data-copy-build-brief>Copy brief</button>
    </details>
    ${job.pullRequestUrl ? `<p class="build-pr-link"><a class="primary text-link" href="${escapeHtml(job.pullRequestUrl)}" target="_blank" rel="noreferrer">Open and review the pull request</a><small>This is the exact PR linked to this Build Job.</small></p>` : ""}
    ${job.filesChanged?.length ? `<details class="build-evidence" open><summary>Implementation receipt</summary>
      <h4>Files changed</h4><ul>${linesMarkup(job.filesChanged)}</ul>
      <h4>Behaviour implemented</h4><p>${escapeHtml(job.receipt?.behaviourImplemented || "Not recorded")}</p>
      <h4>Tests</h4><ul>${linesMarkup(job.tests)}</ul>
      <h4>Validation</h4><ul>${linesMarkup(job.validation)}</ul>
      <h4>Acceptance-criterion evidence</h4>${job.receipt?.acceptanceCriterionEvidence?.length ? `<ul>${job.receipt.acceptanceCriterionEvidence.map((item) => `<li><strong>${escapeHtml(item.criterion)}</strong>: ${escapeHtml(item.result)} &mdash; ${escapeHtml(item.evidence)}</li>`).join("")}</ul>` : "<p>Not recorded.</p>"}
      <h4>Migration performed</h4><p>${escapeHtml(job.receipt?.migrationPerformed || "Not recorded")}</p>
      <h4>Rollback path</h4><p>${escapeHtml(job.receipt?.rollbackPath || "Not recorded")}</p>
      <h4>Unresolved risks</h4>${job.unresolvedRisks.length ? `<ul>${linesMarkup(job.unresolvedRisks)}</ul>` : "<p>None recorded.</p>"}
      <h4>Remaining work</h4>${job.receipt?.remainingWork?.length ? `<ul>${linesMarkup(job.receipt.remainingWork)}</ul>` : "<p>None recorded.</p>"}
      <h4>Version impact</h4><p>${escapeHtml(job.versionImpact)}</p>
    </details>` : ""}
    ${approval ? `<details class="universal-control" open><summary>Universal approval record</summary>
      <dl>
        <div><dt>Scope</dt><dd>${escapeHtml(approval.scope)}</dd></div>
        <div><dt>Exact decision</dt><dd>${escapeHtml(approval.exact_decision)}</dd></div>
        <div><dt>Approver</dt><dd>${escapeHtml(approval.approver)}</dd></div>
        <div><dt>Recommendation</dt><dd>${escapeHtml(approval.recommendation)}</dd></div>
        <div><dt>Trade-offs</dt><dd>${escapeHtml(approval.trade_offs || "None recorded")}</dd></div>
        <div><dt>Conditions</dt><dd>${escapeHtml(approval.conditions || "Pending decision")}</dd></div>
        <div><dt>Result</dt><dd>${escapeHtml(statusLabel(approval.result))}</dd></div>
        <div><dt>What remains unauthorised</dt><dd>${escapeHtml((approval.remainsUnauthorised || []).join(", "))}</dd></div>
      </dl>
    </details>` : ""}
    ${implementationReceiptMarkup(job)}
    <button class="ghost discuss-work-action" data-discuss-operate-record="${escapeHtml(job.changeId)}">Ask Oppa Mate about this work</button>
    ${inlineWorkHelpMarkup(state.conversation?.activeRecord?.id === job.changeId ? state.conversation.activeRecord : null)}
    <p class="approval-boundary">A complete receipt proves what was prepared; it does not approve release, merge or publication.</p>
  `;
  $$(".work-item").forEach((element) => element.classList.toggle("current", element.dataset.workItemId === item.id));
}

async function openWorkItem(itemId) {
  const item = state.myWork?.items.find((candidate) => candidate.id === itemId);
  if (!item) return;
  if (item.sourceType === "operate-record") {
    const value = await request(`/api/operate/records/${encodeURIComponent(item.sourceId)}`);
    renderWorkDetail(item, value.record);
  } else if (item.sourceType === "implementation-job") {
    const value = await request(`/api/implementation-jobs/${encodeURIComponent(item.sourceId)}`);
    renderImplementationJobDetail(item, value.job);
  } else {
    renderWorkDetail(item);
  }
}

function renderMyWork(value) {
  state.myWork = value;
  const summary = value.summary;
  $("#work-summary").innerHTML = `
    <div><span>Your actions</span><strong>${summary.total}</strong></div>
    <div><span>Being handled</span><strong>${summary.beingHandled || 0}</strong></div>
    <div><span>Blocked</span><strong>${summary.blocked}</strong></div>
    <div><span>Decisions</span><strong>${summary.decisions}</strong></div>`;
  $("#do-next-list").innerHTML = value.doNext.length
    ? value.doNext.map((item) => workItemMarkup(item, true)).join("")
    : '<div class="empty-records"><strong>Nothing needs an action from you.</strong><p>Work owned by Codex or Oppa Mate remains visible below and will return here only when you need to decide or clarify something.</p></div>';
  $("#work-inbox-list").innerHTML = value.items.length
    ? value.items.map((item) => workItemMarkup(item)).join("")
    : '<div class="empty-records"><strong>Your inbox is clear.</strong><p>Capture work in ordinary language and Oppa Mate will recommend a record type.</p></div>';
  const orderLabel = $("#work-order").selectedOptions[0]?.textContent || "Recommended order";
  $("#work-order-explanation").textContent = orderLabel;
  if (state.selectedWorkItemId) {
    const retained = value.items.find((item) => item.id === state.selectedWorkItemId);
    if (retained) openWorkItem(retained.id).catch((error) => toast(error.message, true));
    else renderWorkDetail(null);
  }
}

async function loadMyWork(order = state.workOrder) {
  state.workOrder = order;
  $("#work-order").value = order;
  const query = new URLSearchParams({
    order,
    view: state.workFilters.view,
    search: state.workFilters.search,
    profile: state.workFilters.profile,
    type: state.workFilters.recordType
  });
  renderMyWork(await request(`/api/my-work?${query}`));
}

function populateCaptureSelectors() {
  const typeSelect = $("#capture-record-type");
  const selectedType = typeSelect.value;
  typeSelect.innerHTML = '<option value="">Let Oppa Mate recommend</option>'
    + state.operationsBible.map((entry) => `<option value="${escapeHtml(entry.type)}">${escapeHtml(entry.label)}</option>`).join("");
  if ([...typeSelect.options].some((option) => option.value === selectedType)) typeSelect.value = selectedType;
  const profileSelect = $("#capture-work-profile");
  const selectedProfile = profileSelect.value;
  profileSelect.innerHTML = '<option value="">Let Oppa Mate recommend</option>'
    + state.workProfiles.map((profile) => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.label)}</option>`).join("");
  if ([...profileSelect.options].some((option) => option.value === selectedProfile)) profileSelect.value = selectedProfile;
  const caseSelect = $("#capture-case");
  const selectedCase = caseSelect.value;
  const cases = state.operateRecords.filter((record) => record.recordType === "case" && !["closed"].includes(record.status));
  caseSelect.innerHTML = '<option value="">No case yet</option>'
    + cases.map((record) => `<option value="${record.id}">${escapeHtml(record.title)}</option>`).join("");
  if ([...caseSelect.options].some((option) => option.value === selectedCase)) caseSelect.value = selectedCase;
  const parentSelect = $("#capture-parent");
  const selectedParent = parentSelect.value;
  parentSelect.innerHTML = '<option value="">No parent work</option>'
    + state.operateRecords
      .filter((record) => !["closed", "done", "cancelled", "completed", "rejected"].includes(record.status))
      .map((record) => `<option value="${record.id}">${escapeHtml(record.bible?.label || record.recordType)} · ${escapeHtml(record.title)}</option>`).join("");
  if ([...parentSelect.options].some((option) => option.value === selectedParent)) parentSelect.value = selectedParent;
}

let captureSuggestionTimer = null;
let captureSuggestionRequest = 0;

function resetCaptureSuggestion() {
  const suggestion = $("#capture-suggestion");
  suggestion.innerHTML = "<strong>Start with the description.</strong><span>The suggestions will appear here before you capture the work.</span>";
  suggestion.classList.remove("ready");
}

async function refreshCaptureSuggestion() {
  const form = $("#work-capture-form");
  const summary = form.elements.summary.value.trim();
  const title = form.elements.title.value.trim();
  if (`${title} ${summary}`.trim().length < 3) {
    resetCaptureSuggestion();
    return;
  }
  const requestNumber = ++captureSuggestionRequest;
  try {
    const value = await request("/api/operate/recommendation", {
      method: "POST",
      body: JSON.stringify({
        title,
        summary,
        recordType: form.elements.recordType.value,
        workProfile: form.elements.workProfile.value
      })
    });
    if (requestNumber !== captureSuggestionRequest) return;
    const titleInput = form.elements.title;
    if (titleInput.dataset.userEdited !== "true" && value.suggestedTitle) {
      titleInput.value = value.suggestedTitle;
      titleInput.dataset.suggestedValue = value.suggestedTitle;
    }
    const suggestion = $("#capture-suggestion");
    suggestion.innerHTML = `<strong>Suggested: ${escapeHtml(value.recordType.label)} &middot; ${escapeHtml(value.workProfile.label)}</strong><span>${escapeHtml(value.recordType.reason)} Change either suggestion only if the context says it is wrong.</span>`;
    suggestion.classList.add("ready");
  } catch (error) {
    if (requestNumber !== captureSuggestionRequest) return;
    $("#capture-suggestion").innerHTML = `<strong>Suggestions are temporarily unavailable.</strong><span>${escapeHtml(error.message)} You can still capture the work normally.</span>`;
  }
}

function scheduleCaptureSuggestion() {
  clearTimeout(captureSuggestionTimer);
  captureSuggestionTimer = setTimeout(() => refreshCaptureSuggestion(), 220);
}

function renderOperateNetwork() {
  const network = state.operateNetwork;
  if (!network) return;
  const totals = network.totals;
  $("#operate-network-summary").innerHTML = `
    <div><span>Connected open work</span><strong>${totals.connectedOpen}/${totals.open}</strong></div>
    <div><span>Explicit links</span><strong>${totals.explicitLinks}</strong></div>
    <div><span>Deepest structure</span><strong>${totals.maxDepth} ${totals.maxDepth === 1 ? "level" : "levels"}</strong></div>
    <div><span>Link provenance</span><strong>${totals.humanConfirmedLinks} human · ${totals.aiConfirmedLinks} AI-assisted</strong></div>`;
  $("#operate-network-signals").innerHTML = network.signals.map((signal) => `
    <article class="network-signal network-signal-${escapeHtml(signal.kind)}">
      <strong>${escapeHtml(signal.title)}</strong><p>${escapeHtml(signal.detail)}</p>
    </article>`).join("");
  $("#operate-network-boundary").textContent = network.boundary;
}

function renderOperate() {
  const records = state.operateRecords;
  const cases = records.filter((record) => record.recordType === "case");
  const linkedWork = records.filter((record) => record.recordType !== "case");
  const improvements = records.filter((record) => record.recordType === "improvement");
  const changes = records.filter((record) => record.recordType === "change");
  const registerMarkup = (items, emptyLabel) => items.length ? items.map((record) => `
    <button data-open-operate-record="${record.id}">
      <span class="work-type work-type-${workTypeClass(record.recordType)}">${escapeHtml(record.reference || record.bible?.label || record.recordType)}</span>
      <strong>${escapeHtml(record.title)}</strong>
      <small>${escapeHtml(statusLabel(record.status))} &middot; next: ${escapeHtml(record.nextAction?.label || "No further action")}</small>
    </button>`).join("") : `<div class="empty-records"><strong>No ${escapeHtml(emptyLabel)} yet.</strong><p>Capture or generate one and it will remain visible here throughout its workflow.</p></div>`;
  $("#case-register-count").textContent = `${cases.length} ${cases.length === 1 ? "case" : "cases"}`;
  $("#operate-record-count").textContent = `${linkedWork.length} operational ${linkedWork.length === 1 ? "record" : "records"}`;
  $("#case-register").innerHTML = cases.length ? cases.map((record) => `
    <button class="case-card" data-open-operate-record="${record.id}">
      <span>${escapeHtml(statusLabel(record.status))}</span>
      <strong>${escapeHtml(record.title)}</strong>
      <p>${escapeHtml(record.summary || "No case summary recorded.")}</p>
      <small>${records.filter((candidate) => candidate.caseId === record.id).length} linked records &middot; priority ${record.priority.score}</small>
    </button>`).join("") : '<div class="empty-records"><strong>No Cases yet.</strong><p>Create a Case when several pieces of work contribute to one outcome.</p></div>';
  $("#operate-record-list").innerHTML = linkedWork.length ? linkedWork.map((record) => `
    <button data-open-operate-record="${record.id}">
      <span class="work-type work-type-${workTypeClass(record.recordType)}">${escapeHtml(record.bible?.label || record.recordType)}</span>
      <strong>${escapeHtml(record.title)}</strong>
      <small>${escapeHtml(statusLabel(record.status))} &middot; priority ${record.priority.score}${record.caseId ? " &middot; linked to case" : ""}</small>
    </button>`).join("") : '<div class="empty-records"><strong>No operational work yet.</strong><p>Capture a Request or Task directly, or connect it to a Case.</p></div>';
  $("#improvement-register-count").textContent = `${improvements.length}`;
  $("#change-register-count").textContent = `${changes.length}`;
  $("#improvement-register").innerHTML = registerMarkup(improvements, "improvement initiatives");
  $("#change-register").innerHTML = registerMarkup(changes, "Changes");
  $("#bible-boundary").innerHTML = '<strong>The Operations Bible recommends classification, routing and automation eligibility.</strong><span>It remains a proposed product dictionary and does not change the approved methodology baseline.</span>';
  $("#operations-bible").innerHTML = state.operationsBible.map((entry) => `
    <article>
      <span>${escapeHtml(entry.label)}</span>
      <p>${escapeHtml(entry.definition)}</p>
      <dl><div><dt>Use when</dt><dd>${escapeHtml(entry.useWhen)}</dd></div><div><dt>Do not use when</dt><dd>${escapeHtml(entry.avoidWhen)}</dd></div></dl>
      <details><summary>Authority and automation</summary><p><strong>Authority:</strong> ${escapeHtml(entry.approval)}</p><p><strong>Automation:</strong> ${escapeHtml(entry.automation)}</p></details>
    </article>`).join("");
  renderOperateNetwork();
  populateCaptureSelectors();
}

async function loadOperate() {
  const [recordsValue, bibleValue, networkValue, profileValue] = await Promise.all([
    request("/api/operate/records"),
    request("/api/operate/bible"),
    request("/api/operate/network"),
    request("/api/work-profiles")
  ]);
  state.operateRecords = recordsValue.records;
  state.operationsBible = bibleValue.entries;
  state.operateNetwork = networkValue.network;
  state.workProfiles = profileValue.profiles;
  const profileFilter = $("#work-profile-filter");
  const retainedProfile = profileFilter.value;
  profileFilter.innerHTML = '<option value="">All work profiles</option>'
    + state.workProfiles.map((profile) => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.label)}</option>`).join("");
  profileFilter.value = retainedProfile;
  renderOperate();
}

async function openOperateRecord(recordId) {
  const value = await request(`/api/operate/records/${encodeURIComponent(recordId)}`);
  switchView("my-work", true, false);
  renderWorkDetail(recordAsWorkItem(value.record), value.record);
}

function openWorkCapture() {
  populateCaptureSelectors();
  $("#work-capture-dialog").showModal();
  $("#work-capture-form [name=summary]").focus();
  scheduleCaptureSuggestion();
}

function openLinkCapture(record) {
  if (!record) return;
  const form = $("#work-link-form");
  form.dataset.fromRecordId = record.id;
  $("#work-link-source").textContent = record.title;
  const target = $("#work-link-target");
  target.innerHTML = state.operateRecords
    .filter((candidate) => candidate.id !== record.id)
    .map((candidate) => `<option value="${candidate.id}">${escapeHtml(candidate.bible?.label || candidate.recordType)} · ${escapeHtml(candidate.title)}</option>`)
    .join("");
  form.reset();
  $("#work-link-dialog").showModal();
  target.focus();
}

async function ensureConversation() {
  if (state.conversation) return state.conversation;
  return createConversation();
}

async function createConversation({ title = "New conversation", workspace = $("#workspace").value, activeRecordId = null } = {}) {
  const value = await request("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ workspace, title, activeRecordId })
  });
  state.conversation = value.conversation;
  $("#workspace").value = state.conversation.workspace;
  $("#workspace-label").textContent = $("#workspace").selectedOptions[0].textContent;
  renderConversation();
  await loadConversationList();
  return state.conversation;
}

async function loadConversation(id) {
  state.conversation = (await request(`/api/conversations/${id}`)).conversation;
  $("#workspace").value = state.conversation.workspace;
  $("#workspace-label").textContent = $("#workspace").selectedOptions[0].textContent;
  renderConversation();
  switchView("conversation");
}

async function loadConversationList() {
  state.conversations = (await request("/api/conversations")).conversations;
  $("#conversation-list").innerHTML = state.conversations.length
    ? state.conversations.slice(0, 10).map((conversation) => `
      <button class="conversation-link ${state.conversation?.id === conversation.id ? "current" : ""}" data-conversation-id="${conversation.id}">
        <strong>${escapeHtml(conversation.title)}</strong>
        <span>${conversation.message_count || 0} messages &middot; ${escapeHtml(formatDate(conversation.updated_at))}</span>
      </button>`).join("")
    : '<p class="rail-empty">No conversations yet.</p>';
}

const feedbackOptions = [
  ["useful", "Helpful", "Saves that this answer helped. No follow-up or change starts."],
  ["correct-interpretation", "You understood me", "Saves that the answer understood your meaning. Nothing else changes."],
  ["needs-clarification", "You misunderstood me", "Asks what was unclear, then saves your correction for review."],
  ["challenge-conclusion", "I disagree", "Asks what you disagree with, then saves it beside this answer."],
  ["add-evidence", "I have more information", "Asks for the missing information, then saves it as evidence to review."],
  ["record-methodology-feedback", "The method should change", "Asks what should change, then saves a change candidate and opens its review automatically. It does not approve or implement the change."]
];

const challengePrompts = {
  balanced: "Prepare today's 10-minute Operations Automated methodology challenge inside this Workbench. Choose the unresolved tension with the greatest decision value. Give me a concrete situation, the strongest provisional Operations Automated response, the reverse or boundary case most likely to change it, and one primary plain-language question. Separate recorded evidence, Jamie's judgement, AI inference and assumptions. Use only evidence actually supplied to this Workbench; if current public evidence is not connected, state that limitation and do not invent a public signal. Explain that my answer becomes feedback rather than approval, and ask what is wrong, missing, impractical or inconsistent. Do not give me a questionnaire.",
  principles: "Challenge one Operations Automated principle with a concrete situation where two reasonable principles, values or stakeholder needs conflict. Briefly give the strongest provisional response, identify what remains uncertain, and ask me one primary plain-language question. Do not give me a questionnaire. Treat my answer as evidence, not approval.",
  "ai-suitability": "Challenge whether the Operations Automated methodology is genuinely suitable for AI to interpret and apply. Use a concrete situation where machine-readable guidance, human-readable meaning, evidence, judgement and authority could diverge. Briefly give the strongest provisional response, identify what remains uncertain, and ask me one primary plain-language question. Treat my answer as evidence, not approval.",
  "manual-work": "Challenge how Operations Automated decides that work should remain manual. Use a concrete situation involving human judgement, facilitation, empathy, tacit knowledge or physical work that cannot responsibly be automated yet. Briefly give the strongest provisional response, identify what further thinking is needed, and ask me one primary plain-language question. Treat my answer as evidence, not approval.",
  "delivery-capability": "Challenge how Operations Automated should work with development teams while building lasting internal capability. Use a concrete situation involving product ownership, technical delivery, knowledge transfer and the organisation's ability to operate the result. Briefly give the strongest provisional response, identify what remains uncertain, and ask me one primary plain-language question. Treat my answer as evidence, not approval."
};

function feedbackControls(messageId) {
  return `<details class="feedback-panel" data-message="${messageId}">
    <summary>Was this useful?</summary>
    <p>Choose the result you want. Each option explains what will be saved before you select it.</p>
    <div class="feedback-controls">
      ${feedbackOptions.map(([value, label, outcome]) => `<article class="feedback-choice"><div><strong>${label}</strong><span>${outcome}</span></div><button data-feedback="${value}">Choose ${label.toLowerCase()}</button></article>`).join("")}
    </div>
  </details>`;
}

function userFacingAnswer(value) {
  let text = String(value || "");
  for (const heading of [
    "Current understanding",
    "What the controlled material supports",
    "Sources used",
    "Internal references",
    "Repository sources",
    "Repository status",
    "Technical details",
    "Governance mechanics",
    "Uncertainty and control"
  ]) {
    text = text.replace(new RegExp(`\\n?#{2,3} ${heading}\\s*[\\s\\S]*?(?=\\n#{2,3} |$)`, "gi"), "");
  }
  return text
    .replace(/^## (?:Repository-grounded answer|Detailed grounded analysis|Concise grounded summary)\s*/i, "")
    .replace(/_\[[^\]]+\.(?:md|markdown|txt|json|csv)\]_/gi, "")
    .replace(/`?(?:\.\.\/|\.\/)?(?:methodology|evolution|product|proposals|feedback|app|brand|templates|decisions|pilots)\/[A-Za-z0-9._/-]+\.(?:md|markdown|txt|json|csv)`?/gi, "the supporting guidance")
    .replace(/^\s*(?:Repository )?(?:status|source path|source commit|source hash|approval state|answer method|execution mode)\s*:\s*.*$/gim, "")
    .replace(/\bapproved normative sources?\b/gi, "agreed guidance")
    .replace(/\bnon-approved material\b/gi, "additional evidence")
    .replace(/\bdeterministic local synthesis\b/gi, "local answer")
    .replace(/\bgoverned next action\b/gi, "next action")
    .replace(/\bproposal packet\b/gi, "change review")
    .replace(/[^.\n]*\b(?:approved|proposed|selected|normative)\s+source(?:\(s\)|s)?\b[^.\n]*\.\s*/gi, "")
    .replace(/If (?:your|the) request changes controlled methodology,[^.]*\.\s*/gi, "")
    .replace(/[^.\n]*(?:does not|cannot) (?:create|record|grant|constitute) (?:an? )?(?:approval|release|publication)[^.\n]*\.\s*/gi, "")
    .replace(/### Interpretation/gi, "## What this means")
    .replace(/### Recommended next action/gi, "## What to do next")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function technicalDetails(message, sources) {
  const uniqueSources = [...new Map(sources.map((source) => [`${source.path}:${source.heading || ""}:${source.hash}`, source])).values()];
  const execution = message.metadata?.localSynthesis ? "Local fallback" : "Connected AI";
  const activeWork = message.metadata?.activeWorkDetails;
  if (!uniqueSources.length && !message.metadata && !activeWork) return "";
  return `<details class="answer-details">
    <summary>Optional: sources, status and controls</summary>
    <p class="answer-details-intro">These details support review and traceability. They are not part of the main answer.</p>
    ${message.metadata?.whyRecommended ? `<p>${escapeHtml(message.metadata.whyRecommended)}</p>` : ""}
    <div class="answer-detail-grid">
      <div><span>Answer method</span><strong>${execution}</strong></div>
      <div><span>Internal references</span><strong>${uniqueSources.length}</strong></div>
    </div>
    ${uniqueSources.length ? `<ul>${uniqueSources.map((source) => `<li><span><strong>${escapeHtml(source.title || source.path)}</strong><small>${escapeHtml(source.heading || "Document context")} · ${escapeHtml(String(source.hash || "").slice(0, 12))}</small></span><em class="${source.normative ? "approved" : "proposed"}">${source.normative ? "approved normative" : `${escapeHtml(source.status)} evidence`}</em></li>`).join("")}</ul>` : "<p>No internal reference was attached to this answer.</p>"}
    ${activeWork ? `<section class="answer-control-details"><strong>Work status and control</strong><p>${escapeHtml(activeWork.title || "Linked work")} is ${escapeHtml(statusLabel(activeWork.status))}. ${escapeHtml(activeWork.boundary || "This answer does not record a decision or approval.")}</p>${activeWork.remainsUnauthorised?.length ? `<p><strong>Still not authorised:</strong> ${escapeHtml(activeWork.remainsUnauthorised.join(", "))}.</p>` : ""}${activeWork.url ? `<a href="${escapeHtml(activeWork.url)}" target="_blank" rel="noopener noreferrer">Open the linked source <span aria-hidden="true">↗</span></a>` : ""}</section>` : `<p class="answer-control-details">This answer provides guidance. It does not record a decision, approval, release or publication.</p>`}
  </details>`;
}

function renderConversation() {
  const messages = state.conversation?.messages || [];
  const activeRecord = state.conversation?.activeRecord;
  const workContext = $("#conversation-work-context");
  workContext.hidden = !activeRecord;
  workContext.innerHTML = activeRecord ? `
    <div><span class="oppa-account-avatar" aria-hidden="true">OM</span><p><small>Conversation opened from this work item</small><strong>${escapeHtml(activeRecord.title)}</strong><span>${escapeHtml(activeRecord.bible?.label || activeRecord.recordType)} · ${escapeHtml(statusLabel(activeRecord.status))}</span></p></div>
    <div>${sourceLinkMarkup(activeRecord.sourceContext, "conversation-source-link")}<button type="button" class="ghost" data-back-to-work-item="${escapeHtml(activeRecord.id)}">Back to work item</button></div>
  ` : "";
  $("#welcome").hidden = messages.length > 0;
  $("#conversation-title").textContent = state.conversation?.title || "New conversation";
  $("#messages").innerHTML = messages.map((message) => {
    const sources = message.metadata?.sources || [];
    return `<article class="message ${message.role}">
      <div class="message-role">${message.role === "user" ? "You" : "OM"}</div>
      <div class="message-body">
        ${message.role === "assistant" ? markdown(userFacingAnswer(message.working_text)) : `<p>${escapeHtml(message.working_text)}</p>`}
        ${message.role === "assistant" ? technicalDetails(message, sources) + feedbackControls(message.id) : ""}
      </div>
    </article>`;
  }).join("");
  $("#messages").scrollTop = $("#messages").scrollHeight;
  loadConversationList().catch(() => {});
}

function renderPreview(preview, target = "panel") {
  const sources = preview.sources || [];
  const execution = preview.executionMode || `Tier ${preview.route.tier}`;
  if (target === "panel") {
    $("#context-empty").hidden = true;
    $("#context-content").hidden = false;
    $("#classification").textContent = preview.classification;
    $("#route-tier").textContent = execution;
    $("#context-size").textContent = `~${preview.estimatedContextTokens.toLocaleString()} tokens`;
    $("#estimated-cost").textContent = preview.estimatedCost ? formatCost(preview.estimatedCost) : "$0 local";
    $("#route-reason").textContent = preview.providerAvailable
      ? preview.route.reason
      : `${preview.route.reason}; processed locally without an API call`;
    $("#source-count").textContent = `${sources.length} selected`;
    $("#sources").innerHTML = sources.map((source) => `<article>
      <div><strong>${escapeHtml(source.path.split("/").at(-1))}</strong><span class="${source.status === "approved" ? "approved" : "proposed"}">${escapeHtml(source.status)}</span></div>
      <code>${escapeHtml(source.path)}</code><p>${escapeHtml(source.reason)}</p>
    </article>`).join("") || "<p>No relevant source selected.</p>";
    return;
  }
  const attachmentLine = state.attachments.length
    ? `<h3>Attached evidence</h3>${state.attachments.map((item) => `<p><code>${escapeHtml(item.filename)}</code> &middot; extracted once &middot; ${item.size.toLocaleString()} bytes</p>`).join("")}`
    : "";
  const budgetMessage = preview.monthlyHardBlocked
    ? `<p class="budget-block"><strong>Monthly limit reached.</strong> This paid request cannot be sent unless you raise the limit in Settings.</p>`
    : preview.monthlySoftWarning
      ? `<p class="budget-warning"><strong>Soft budget warning.</strong> This request would bring estimated monthly usage to ${formatCost(preview.projectedMonthlyUsage)}. You can still confirm it.</p>`
      : `<p class="budget-ok">Estimated cost for this request: <strong>${preview.estimatedCost ? formatCost(preview.estimatedCost) : "$0 local"}</strong>.</p>`;
  $("#dialog-preview").innerHTML = `
    <div class="send-summary">
      <strong>You will get a plain-language answer.</strong>
      <p>Your message has been checked and the supporting information will stay behind the answer unless you choose to view it.</p>
    </div>
    ${budgetMessage}
    ${attachmentLine}
    <details class="preview-details">
      <summary>Technical request details</summary>
      <div class="preview-grid">
        <div><span>Workspace</span><strong>${escapeHtml(preview.workspace)}</strong></div>
        <div><span>Execution</span><strong>${escapeHtml(execution)}</strong></div>
        <div><span>Internal context</span><strong>~${preview.estimatedContextTokens.toLocaleString()} tokens</strong></div>
        <div><span>Internal references</span><strong>${sources.length}</strong></div>
      </div>
      ${sources.map((source) => `<p><code>${escapeHtml(source.path)}</code> &middot; ${escapeHtml(source.status)}</p>`).join("") || "<p>No internal reference selected.</p>"}
    </details>`;
}

function attachmentPayload() {
  return {
    attachmentIds: state.attachments.map((item) => item.id),
    attachmentText: state.attachments.map((item) => `# ${item.filename}\n${item.extractedText || item.extracted_text || ""}`).join("\n\n")
  };
}

async function previewAndSend(text, origin = null) {
  setProcessing(true, "Preparing your request", "Selecting repository evidence and checking cost controls...");
  if (origin?.recordId && state.inlineWorkHelp?.recordId === origin.recordId) {
    state.inlineWorkHelp.status = "Preparing the question with this work item attached...";
    const status = $("#work-detail")?.querySelector("[data-inline-help-status]");
    if (status) status.textContent = state.inlineWorkHelp.status;
  }
  $(".send-button").disabled = true;
  try {
    const conversation = await ensureConversation();
    const payload = {
      conversationId: conversation.id,
      text,
      workspace: $("#workspace").value,
      outputType: $("#output-type").value,
      workOrigin: origin,
      ...attachmentPayload()
    };
    state.pending = payload;
    state.preview = await request("/api/context/preview", { method: "POST", body: JSON.stringify(payload) });
    renderPreview(state.preview);
    renderPreview(state.preview, "dialog");
    $("#confirm-send").disabled = Boolean(state.preview.monthlyHardBlocked);
    $("#preview-dialog").showModal();
  } finally {
    setProcessing(false);
    $(".send-button").disabled = false;
  }
}

async function sendChallenge(focus = "balanced", { title = "Methodology challenge", conversationId = null } = {}) {
  const prompt = challengePrompts[focus] || challengePrompts.balanced;
  if (conversationId) {
    state.conversation = (await request(`/api/conversations/${encodeURIComponent(conversationId)}`)).conversation;
  } else {
    await createConversation({ title, workspace: "living-methodology" });
  }
  switchView("conversation");
  $("#workspace").value = "living-methodology";
  $("#workspace-label").textContent = "Living methodology";
  $("#output-type").value = "analysis";
  $("#input").value = prompt;
  await previewAndSend(prompt);
}

async function startDailyChallenge(item) {
  const conversationId = item?.nextAction?.conversationId;
  if (item?.status === "awaiting-response" && conversationId) {
    await loadConversation(conversationId);
    toast("Today's challenge is open in its own conversation.");
    return;
  }
  const date = item?.nextAction?.challengeDate || new Date().toISOString().slice(0, 10);
  await sendChallenge("balanced", {
    title: `Daily methodology challenge — ${date}`,
    conversationId
  });
}

async function sendPending() {
  const payload = { ...state.pending, confirmed: true };
  const workOrigin = payload.workOrigin;
  const submittedText = payload.text;
  $("#preview-dialog").close();
  $("#confirm-send").disabled = true;
  $(".send-button").disabled = true;
  $("#input").value = "";
  setProcessing(true, "Sending your request", "Saving your reviewed input to the local conversation...");
  try {
    await request(`/api/conversations/${state.conversation.id}/messages`, {
      method: "POST",
      body: JSON.stringify({
        workingText: payload.text,
        originalText: state.capture?.originalText || payload.text,
        inputType: state.capture ? "voice" : "text",
        language: state.capture?.language || "en",
        editedAfterCapture: Boolean(state.capture),
        role: "user",
        metadata: {
          attachments: state.attachments.map(({ id, filename, hash }) => ({ id, filename, hash })),
          translated: Boolean(state.capture?.translated),
          originalLanguage: state.capture?.language || null
        }
      })
    });
    state.conversation = (await request(`/api/conversations/${state.conversation.id}`)).conversation;
    renderConversation();
    if (workOrigin?.recordId && state.inlineWorkHelp?.recordId === workOrigin.recordId) {
      state.inlineWorkHelp.status = "Oppa Mate is working from the linked record and source...";
      const status = $("#work-detail")?.querySelector("[data-inline-help-status]");
      if (status) status.textContent = state.inlineWorkHelp.status;
    }
    setProcessing(true, "AI response in progress", "The model is reasoning over the selected evidence. This can take a little while...");
    const result = await request("/api/respond", { method: "POST", body: JSON.stringify(payload) });
    setProcessing(true, "Response received", "Saving the result and updating usage records...");
    state.conversation = (await request(`/api/conversations/${state.conversation.id}`)).conversation;
    renderConversation();
    if (workOrigin?.recordId && state.inlineWorkHelp?.recordId === workOrigin.recordId) {
      state.inlineWorkHelp.response = [...state.conversation.messages].reverse().find((message) => message.role === "assistant") || null;
      state.inlineWorkHelp.status = "Answer retained with this work context.";
      if (state.selectedImplementationJob && state.currentWorkItem) {
        renderImplementationJobDetail(state.currentWorkItem, state.selectedImplementationJob);
      } else if (state.currentOperateRecord && state.currentWorkItem) {
        renderWorkDetail(state.currentWorkItem, state.currentOperateRecord);
      }
    }
    toast(result.usage.status === "offline"
      ? "Grounded local response completed. No API call or cost."
      : "Provider response completed and usage recorded.");
    state.capture = null;
    state.attachments = [];
    renderAttachments();
  } catch (error) {
    if (workOrigin?.recordId && state.inlineWorkHelp?.recordId === workOrigin.recordId) {
      state.inlineWorkHelp.status = `Oppa Mate could not answer yet: ${error.message}`;
      if (state.selectedImplementationJob && state.currentWorkItem) {
        renderImplementationJobDetail(state.currentWorkItem, state.selectedImplementationJob);
      } else if (state.currentOperateRecord && state.currentWorkItem) {
        renderWorkDetail(state.currentWorkItem, state.currentOperateRecord);
      }
    }
    if (!$("#input").value.trim()) $("#input").value = submittedText;
    toast(error.message, true);
  } finally {
    setProcessing(false);
    $("#confirm-send").disabled = Boolean(state.preview?.monthlyHardBlocked);
    $(".send-button").disabled = false;
  }
}

async function recordFeedback(button) {
  const container = button.closest("[data-message]");
  const disposition = button.dataset.feedback;
  const needsDetail = ["challenge-conclusion", "add-evidence", "needs-clarification", "record-methodology-feedback"].includes(disposition);
  const prompts = {
    "challenge-conclusion": "What do you disagree with?",
    "add-evidence": "What information should the answer take into account?",
    "needs-clarification": "What did the answer fail to explain clearly?",
    "record-methodology-feedback": "What should change in the Operations Automated method?"
  };
  const wording = needsDetail
    ? window.prompt(prompts[disposition], "") ?? ""
    : disposition.replaceAll("-", " ");
  if (needsDetail && !wording.trim()) return;
  const result = await request("/api/feedback", {
    method: "POST",
    body: JSON.stringify({
      conversationId: state.conversation.id,
      messageId: container.dataset.message,
      disposition,
      wording
    })
  });
  button.classList.add("selected");
  const outcome = feedbackOptions.find(([value]) => value === disposition)?.[2] || "Saved for review.";
  await Promise.all([loadFeedback(), loadMyWork()]);
  if (result.proposal) {
    state.selectedProposalId = result.proposal.id;
    switchView("decisions");
    await loadDecisionInbox(result.proposal.id);
    toast("Feedback retained and its change review created. No change or approval has been made.");
  } else {
    toast(`Done. ${outcome} No My Work action remains.`);
  }
}

async function loadFeedback() {
  const items = (await request("/api/feedback")).feedback;
  const typeLabels = {
    useful: ["Helpful", "You marked this answer as helpful."],
    "correct-interpretation": ["Understood correctly", "You said the answer understood what you meant."],
    "challenge-conclusion": ["You disagree", "You challenged the answer's conclusion."],
    "add-evidence": ["More information", "You added information the answer should consider."],
    "needs-clarification": ["You were misunderstood", "You said the answer did not explain things clearly."],
    "record-methodology-feedback": ["Suggested method change", "You suggested a change to the Operations Automated method."],
    "proposal-requested": ["Change requested", "You asked to prepare a possible methodology change."]
  };
  $("#feedback-list").innerHTML = items.length
    ? items.map((item) => {
      const [title, explanation] = typeLabels[item.feedback_type || item.disposition] || ["Saved feedback", "You saved a reaction to this answer."];
      const canPropose = ["methodology-change-candidate", "product-change-candidate"].includes(item.classification);
      const outcome = classificationOutcome(item.classification);
      return `<article class="record-card">
        <div><strong>${escapeHtml(title)}</strong><span class="status-pill status-${escapeHtml(item.status)}">${escapeHtml(statusLabel(item.status))}</span></div>
        <small>${escapeHtml(explanation)}</small>
        <blockquote>${escapeHtml(item.original_wording || item.wording || "No additional wording")}</blockquote>
        <dl class="feedback-meta">
          <div><dt>Submitted by</dt><dd>${escapeHtml(item.submitting_user || "Jamie Peppard")}</dd></div>
          <div><dt>Workspace</dt><dd>${escapeHtml(item.affected_workspace || "General project")}</dd></div>
          <div><dt>Created</dt><dd>${escapeHtml(formatDate(item.created_at))}</dd></div>
          <div><dt>Conversation</dt><dd>${escapeHtml(item.conversation_title || "Conversation")}</dd></div>
          <div><dt>Current disposition</dt><dd>${escapeHtml(item.visibleDisposition || item.learning_disposition || "More evidence required")}</dd></div>
        </dl>
        <label class="classification-field">How should this feedback be used?
          <select data-feedback-classification="${item.id}">
            ${classificationOptions(item.classification)}
          </select>
        </label>
        <p class="classification-note" data-classification-outcome="${item.id}">${escapeHtml(outcome)}</p>
        <label class="classification-field">Visible learning disposition
          <select data-feedback-learning-disposition="${item.id}">${learningDispositionOptions(item.learning_disposition)}</select>
        </label>
        <label class="classification-field">Why this disposition applies
          <textarea rows="2" data-feedback-disposition-reason="${item.id}">${escapeHtml(item.disposition_reason || "")}</textarea>
        </label>
        <label class="classification-field">Named review trigger, if deferred or awaiting evidence
          <input data-feedback-review-trigger="${item.id}" value="${escapeHtml(item.review_trigger || "")}" placeholder="For example: after the next related case">
        </label>
        <div class="feedback-action-preview"><strong>What happens when you choose</strong><p><strong>Open conversation</strong> returns to the original answer. <strong>Save this use</strong> completes the feedback step. Ordinary corrections, context and evidence leave My Work but remain traceable. ${canPropose ? "A change review is created or opened automatically; it does not edit, approve or implement anything." : "Choosing a methodology or product change creates the separate review automatically when saved."}</p></div>
        <div class="record-actions">
          <button data-open-conversation="${item.conversation_id}" class="ghost">Open conversation</button>
          <button data-save-classification="${item.id}" class="ghost">Save this use</button>
        </div>
      </article>`;
    }).join("")
    : '<div class="empty-records"><strong>You have not saved any feedback yet.</strong><p>Open “Was this useful?” beneath an answer if you want to keep a reaction or correction.</p></div>';
}

const classifications = [
  ["answer-only-correction", "Fix this answer only"],
  ["conversation-context", "Keep with this conversation"],
  ["reusable-project-memory", "Remember across this project"],
  ["evidence-submission", "Treat as evidence to review"],
  ["methodology-change-candidate", "Consider a methodology change"],
  ["product-change-candidate", "Consider a product change"],
  ["no-action-required", "Close with no further action"]
];

function classificationOutcome(value) {
  return ({
    "answer-only-correction": "Saving will keep the correction with this answer. It will not alter the method or other conversations.",
    "conversation-context": "Saving will keep this with the current conversation so later replies can use it.",
    "reusable-project-memory": "Saving will retain this as project context for later authorised Workbench use.",
    "evidence-submission": "Saving will retain this as evidence to assess. It will not be treated as fact or approval.",
    "methodology-change-candidate": "Saving will complete the feedback step and automatically create or open a methodology change review. It will not approve or implement the change.",
    "product-change-candidate": "Saving will complete the feedback step and automatically create or open a product change review. It will not approve or implement the change.",
    "no-action-required": "Saving will close this feedback with no further action while retaining why it was closed."
  })[value] || "Saving will organise this feedback without approving or changing anything.";
}

const statusLabels = {
  due: "Due today",
  "being-prepared": "Being prepared",
  "awaiting-response": "Awaiting your answer",
  retained: "Saved and handled",
  "no-change": "Saved; no change",
  "awaiting-review": "Awaiting review",
  "revision-requested": "Revision requested",
  "approved-for-preparation": "Approved for preparation",
  "implementation-in-progress": "Implementation in progress",
  "awaiting-release-approval": "Awaiting release approval",
  implemented: "Implemented",
  rejected: "Rejected",
  deferred: "Deferred"
};

function statusLabel(value) {
  return statusLabels[value] || String(value || "Awaiting review").replaceAll("-", " ");
}

function classificationOptions(selected) {
  return classifications.map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`).join("");
}

function proposalSection(title, content) {
  if (!content || (Array.isArray(content) && !content.length)) return "";
  const body = Array.isArray(content)
    ? `<ul>${content.map((item) => {
      if (typeof item === "string") return `<li>${escapeHtml(item)}</li>`;
      if (item.path) return `<li><strong>${escapeHtml(item.path)}</strong>${item.status ? ` <span class="source-status">${escapeHtml(item.status)}</span>` : ""}</li>`;
      if (item.type) return `<li><strong>${escapeHtml(item.type.replaceAll("-", " "))}:</strong> ${escapeHtml(item.wording || item.reference || "")}</li>`;
      return `<li>${escapeHtml(JSON.stringify(item))}</li>`;
    }).join("")}</ul>`
    : `<p>${escapeHtml(content)}</p>`;
  return `<section><h3>${title}</h3>${body}</section>`;
}

function decisionNeeded(proposal) {
  if (["awaiting-review", "revision-requested", "deferred"].includes(proposal.status)) return "Decide whether to prepare this change, ask for a revision, reject it or defer it.";
  if (proposal.status === "approved-for-preparation") return "Preparation is authorised. The Workbench should now create the Codex build automatically.";
  if (proposal.status === "implementation-in-progress") return proposal.implementationJob?.status === "waiting-on-codex"
    ? "Nothing is required from you now. Codex must return the draft and test evidence."
    : "Open the linked Codex build for the exact current step.";
  if (proposal.status === "awaiting-release-approval") return proposal.implementationJob
    ? "Open the linked build and make the separate release decision there."
    : "This is the separate release decision. Review the draft and choose whether it may merge.";
  if (proposal.status === "implemented") return "No decision is outstanding. The retained receipt shows what was merged and reindexed.";
  if (proposal.status === "rejected") return "No action is required unless new evidence justifies reopening the issue.";
  return "This change is deferred. Revisit it only when timing, evidence or priorities change.";
}

function readableReview(proposal) {
  return `<section class="review-brief" aria-label="Plain-English change review">
    <div class="review-brief-heading"><span>Your review</span><h3>What am I deciding?</h3></div>
    <dl>
      <div><dt>Why this exists</dt><dd>${escapeHtml(proposal.problem_learning)}</dd></div>
      <div><dt>What would change</dt><dd>${escapeHtml(proposal.proposed_wording)}</dd></div>
      <div><dt>What stays controlled</dt><dd>${proposal.change_kind === "methodology"
        ? "The approved methodology remains unchanged unless you later give the separate Approve and merge decision."
        : "Main remains unchanged until the separate release decision; preparation only creates a reviewable draft."}</dd></div>
      <div class="decision-needed"><dt>Your decision now</dt><dd>${escapeHtml(decisionNeeded(proposal))}</dd></div>
    </dl>
  </section>`;
}

function repositoryReviewLink(proposal) {
  const url = proposal.implementationJob ? proposal.implementationJob.pullRequestUrl : proposal.pull_request_url;
  if (!url) {
    return `<div class="github-link-pending"><strong>GitHub review link</strong><span>The exact draft link will appear here as soon as implementation preparation is recorded.</span></div>`;
  }
  return `<a class="github-review-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">
    <span><strong>Open the draft change on GitHub</strong><small>Read the proposed files and discussion in one place.</small></span>
    <span aria-hidden="true">Open ↗</span>
  </a>`;
}

function decisionActions(proposal) {
  if (["awaiting-review", "revision-requested", "deferred"].includes(proposal.status)) {
    return `<div class="decision-action-panel">
      <label>Decision note<textarea id="decision-reason" rows="2" placeholder="Why are you making this decision?"></textarea></label>
      <div class="decision-actions">
        <button class="primary" data-decision-action="prepare-change" data-phase="preparation">Prepare change</button>
        <button class="ghost" data-decision-action="request-revision" data-phase="preparation">Request revision</button>
        <button class="danger-outline" data-decision-action="reject" data-phase="preparation">Reject</button>
        <button class="ghost" data-decision-action="defer" data-phase="preparation">Defer</button>
      </div>
      <p>Prepare change authorises a bounded instruction only. It does not edit main or approve release.</p>
    </div>`;
  }
  if (proposal.status === "approved-for-preparation") {
    return `<div class="decision-action-panel">
      <strong>Preparation is authorised; the Codex build has not been created yet.</strong>
      <p>Retry the automatic handoff. You will not be asked for repository implementation fields.</p>
      <button class="primary" data-start-handoff>Retry Codex handoff</button>
    </div>`;
  }
  if (proposal.status === "implementation-in-progress") {
    return `<div class="decision-action-panel work-action-owned">
      <strong>${proposal.implementationJob?.status === "waiting-on-codex" ? "Codex is preparing the tested draft." : "Continue through the one Codex build workflow."}</strong>
      <p>${proposal.implementationJob?.status === "waiting-on-codex" ? "There are no branch, pull request, commit or test fields for Jamie to complete. This item returns for the separate release decision after Codex submits its receipt." : "The older manual repository form has been replaced by the linked Build Job."}</p>
      ${proposal.implementationJob ? `<button class="ghost" data-open-proposal-build-job="${escapeHtml(proposal.implementationJob.id)}">Open Codex build</button>` : '<button class="primary" data-start-handoff>Repair Codex handoff</button>'}
    </div>`;
  }
  if (proposal.status === "awaiting-release-approval") {
    if (proposal.implementationJob) {
      return `<div class="decision-action-panel release-panel">
        <strong>The implementation receipt is ready.</strong>
        <p>Use the linked Build Job for the single release decision. The older duplicate release form is no longer shown.</p>
        <button class="primary" data-open-proposal-build-job="${escapeHtml(proposal.implementationJob.id)}">Review exact release</button>
      </div>`;
    }
    const releaseApproval = proposal.decisions.findLast((item) => item.phase === "release" && item.action === "approve-and-merge");
    if (releaseApproval && state.repositoryMode === "manual") {
      return `<form class="repository-form release-receipt-form" id="implementation-receipt-form">
        <h3>Merge authorised; implementation receipt required</h3>
        <p>Complete the authorised merge outside the Workbench, then record the merged commit. The repository will be reindexed and the feedback marked implemented.</p>
        <label>Merged commit SHA<input name="commitSha" required></label>
        <label>Released methodology version, if affected<input name="methodologyVersion" placeholder="No methodology version change"></label>
        <button class="primary" type="submit">Record merged implementation</button>
      </form>`;
    }
    return `<div class="decision-action-panel release-panel">
      <label>Release decision note<textarea id="decision-reason" rows="2" placeholder="Why should this be released, changed, rejected or deferred?"></textarea></label>
      <div class="decision-actions">
        <button class="primary release-button" data-decision-action="approve-and-merge" data-phase="release">Approve and merge</button>
        <button class="ghost" data-decision-action="request-changes" data-phase="release">Request changes</button>
        <button class="danger-outline" data-decision-action="reject" data-phase="release">Reject</button>
        <button class="ghost" data-decision-action="defer" data-phase="release">Defer</button>
      </div>
      <p>Only Jamie Peppard’s explicit “Approve and merge” confirmation can authorise a methodology release.</p>
    </div>`;
  }
  return "";
}

function renderProposalDetail(proposal) {
  if (!proposal) {
    $("#decision-detail").innerHTML = '<div class="empty-records"><strong>Select a change candidate.</strong></div>';
    return;
  }
  const receipt = proposal.receipt;
  $("#decision-detail").innerHTML = `
    <div class="proposal-heading">
      <div><span class="change-kind">${escapeHtml(proposal.change_kind)} change</span><h2>${escapeHtml(proposal.title)}</h2></div>
      <span class="status-pill status-${escapeHtml(proposal.status)}">${escapeHtml(statusLabel(proposal.status))}</span>
    </div>
    ${repositoryReviewLink(proposal)}
    ${workflowMarkup({
      recordType: "change",
      status: proposal.status,
      owner: proposal.implementationJob && ["waiting-on-codex", "release-authorised"].includes(proposal.implementationJob.status) ? "Codex" : "Jamie Peppard",
      nextAction: {
        label: proposal.implementationJob?.status === "waiting-on-codex" ? "Codex prepares and tests the draft" : "Review the current decision",
        outcome: decisionNeeded(proposal),
        authority: proposal.implementationJob?.status === "waiting-on-codex" ? "ai-owner" : "founder"
      },
      implementationJob: proposal.implementationJob,
      profile: { label: `${proposal.change_kind} feedback and change`, completionEvidence: proposal.validationRequirements }
    })}
    ${readableReview(proposal)}
    ${decisionActions(proposal)}
    <details class="proposal-details">
      <summary>Read the full proposal, evidence and risks</summary>
      ${proposalSection("Rationale", proposal.rationale)}
      ${proposalSection("Relevant approved sources", proposal.approvedSources)}
      ${proposalSection("Affected files or components", proposal.affectedFiles)}
      ${proposalSection("Current wording", proposal.current_wording)}
      ${proposalSection("Evidence", proposal.evidence)}
      ${proposalSection("Credible alternatives", proposal.alternatives)}
      ${proposalSection("Risks and unintended consequences", proposal.risks)}
      ${proposalSection("Validation requirements", proposal.validationRequirements)}
      <section><h3>Expected route and cost</h3><p>${escapeHtml(proposal.modelRoute.reason || "Deterministic preparation")} · ${formatCost(proposal.expected_cost)}</p></section>
    </details>
    ${proposal.implementation_instruction ? `<details class="proposal-details"><summary>Bounded implementation instruction</summary>${markdown(proposal.implementation_instruction)}</details>` : ""}
    ${proposal.pull_request_url && !proposal.implementationJob ? `<div class="repository-references"><strong>Earlier repository reference</strong><a href="${escapeHtml(proposal.pull_request_url)}" target="_blank" rel="noreferrer">${escapeHtml(proposal.pull_request_url)}</a><span>Branch: ${escapeHtml(proposal.branch_name)}</span><span>Commit: ${escapeHtml(proposal.implementation_commit_sha)}</span></div>` : ""}
    <section class="decision-history"><h3>Decision history</h3>${proposal.decisions.length ? proposal.decisions.map((decision) => `<article><div><strong>${escapeHtml(decision.action.replaceAll("-", " "))}</strong><span>${escapeHtml(formatDate(decision.created_at))}</span></div><p>${escapeHtml(decision.actor)} · ${escapeHtml(decision.phase)} decision · ${escapeHtml(statusLabel(decision.status_before))} → ${escapeHtml(statusLabel(decision.status_after))}</p>${decision.reason ? `<blockquote>${escapeHtml(decision.reason)}</blockquote>` : ""}</article>`).join("") : "<p>No decisions recorded yet.</p>"}</section>
    ${receipt ? `<section class="implementation-receipt"><span>Implementation receipt</span><h3>Change implemented and reindexed</h3><p>Pull request: <a href="${escapeHtml(receipt.pull_request_url)}" target="_blank" rel="noreferrer">${escapeHtml(receipt.pull_request_url)}</a></p><p>Commit: ${escapeHtml(receipt.commit_sha)} · Baseline: ${escapeHtml(receipt.baseline_version)} · Reindexed ${escapeHtml(formatDate(receipt.reindexed_at))}</p></section>` : ""}
  `;
}

async function loadDecisionInbox(selectedId = state.selectedProposalId, status = "") {
  const value = await request(`/api/decision-inbox${status ? `?status=${encodeURIComponent(status)}` : ""}`);
  state.proposals = value.proposals;
  const allStatuses = Object.keys(statusLabels);
  $("#decision-status-board").innerHTML = `<button class="${status ? "" : "active"}" data-decision-filter="">All<span>${Object.values(value.statusCounts).reduce((sum, count) => sum + count, 0)}</span></button>${allStatuses.map((item) => `<button class="${status === item ? "active" : ""}" data-decision-filter="${item}">${escapeHtml(statusLabel(item))}<span>${value.statusCounts[item] || 0}</span></button>`).join("")}`;
  $("#decision-list").innerHTML = state.proposals.length
    ? state.proposals.map((proposal) => `<button class="decision-link ${selectedId === proposal.id ? "current" : ""}" data-proposal-id="${proposal.id}"><strong>${escapeHtml(proposal.title)}</strong><span>${escapeHtml(proposal.change_kind)} · ${escapeHtml(statusLabel(proposal.status))}</span></button>`).join("")
    : '<div class="empty-records"><strong>No changes in this state.</strong><p>Create a proposal from classified feedback first.</p></div>';
  const selected = state.proposals.find((item) => item.id === selectedId) || state.proposals[0];
  state.selectedProposalId = selected?.id || null;
  renderProposalDetail(selected);
}

const brandDecisionLabels = {
  "approve-internal": "Approved for internal validation",
  revise: "Revision requested",
  reject: "Direction rejected"
};

const brandResponseLabels = {
  "awaiting-codex-review": "Awaiting Codex review",
  reviewed: "Reviewed by Codex",
  "revision-prepared": "Revision prepared · re-review needed",
  "no-change": "Reviewed · no change recommended",
  "needs-clarification": "Clarification needed"
};

function brandPreviewMarkup(item) {
  if (item.preview === "mark") return `
    <div class="brand-preview brand-preview-mark" data-oa-theme="dark">
      <img src="/brand-system/assets/logo/generated/mark-colour-transparent-1024.png" alt="Continuous Operations Automated OA loop">
      <span class="oa-wordmark"><small>Operations</small><strong>Automated</strong></span>
    </div>`;
  if (item.preview === "oppa-service-account") return `
    <div class="brand-preview brand-preview-oppa" data-oa-theme="dark">
      <div class="oppa-preview-lockup">
        <span class="oppa-account-avatar" aria-hidden="true">OM</span>
        <span><em>Service account</em><strong>Oppa <b>Mate</b></strong><small>Operations Automated</small></span>
      </div>
      <div class="oppa-preview-compact"><span aria-hidden="true">OM</span><p><strong>Primary company service account</strong><small>A recognisable company user; authority still comes from assigned permissions and controls</small></p></div>
    </div>`;
  if (item.preview === "tone") return `
    <div class="brand-preview brand-preview-tone">
      <span style="--swatch:#01070f"><b>Obsidian</b><small>#01070F</small></span>
      <span style="--swatch:#063f72"><b>Deep blue</b><small>#063F72</small></span>
      <span style="--swatch:#0b77d2"><b>Action blue</b><small>#0B77D2</small></span>
      <span style="--swatch:#32b6fe"><b>Electric cyan</b><small>#32B6FE</small></span>
    </div>`;
  if (item.preview === "type") return `
    <div class="brand-preview brand-preview-type">
      <small>OPERATIONS</small>
      <strong>AUTOMATED</strong>
      <p><span>Clear operational thinking</span><span>expressed in useful language.</span></p>
    </div>`;
  if (item.preview === "field") return `
    <div class="brand-preview brand-preview-field oa-connection-field" data-oa-theme="dark">
      <span>Connected operations</span>
      <strong>Human outcomes.</strong>
      <i aria-hidden="true"></i>
    </div>`;
  if (item.preview === "application") return `
    <div class="brand-preview brand-preview-application">
      <aside><img src="/brand-system/assets/logo/generated/mark-colour-transparent-1024.png" alt=""><i></i><i></i><i></i></aside>
      <main><small>Decision workspace</small><strong>See the whole operation.</strong><div><span>Evidence</span><span>Human decision</span><span>Next action</span></div></main>
    </div>`;
  if (item.preview === "document") return `
    <div class="brand-preview brand-preview-document">
      <header><img src="/brand-system/assets/logo/generated/mark-navy-transparent-1024.png" alt=""><span>CONTROLLED DOCUMENT</span></header>
      <strong>Operational decision brief</strong>
      <p>Conclusion first, then evidence, judgement, uncertainty and the next governed action.</p>
      <div><i></i><i></i><i></i></div>
    </div>`;
  if (item.preview === "social") return `
    <div class="brand-preview brand-preview-social">
      <img src="/brand-system/templates/social/linkedin-profile-cover-1584x396.png" alt="Operations Automated LinkedIn profile cover">
    </div>`;
  return `
    <div class="brand-preview brand-preview-wording">
      <div><small>Current source descriptor</small><strong>Operations consultancy</strong></div>
      <div><small>Current source strapline</small><strong>Automate. Autonomise. Empower.</strong></div>
      <p>Alternatives for review: Understand. Improve. Automate. · Connect. Improve. Empower.</p>
    </div>`;
}

function renderBrandReview(value) {
  state.brandReview = value;
  const latest = new Map();
  for (const decision of value.decisions) {
    if (!latest.has(decision.item_id)) latest.set(decision.item_id, decision);
  }
  const reviewedCount = value.items.filter((item) => latest.has(item.id)).length;
  $("#brand-review-progress").textContent = `${reviewedCount} of ${value.items.length} reviewed`;
  const feedbackItems = value.feedbackLoop?.items || [];
  const awaitingCount = value.feedbackLoop?.awaitingCodexReview || 0;
  const rereviewCount = value.feedbackLoop?.readyForFounderReview || 0;
  $("#brand-feedback-count").textContent = feedbackItems.length
    ? `${awaitingCount} awaiting Codex · ${rereviewCount} ready for you`
    : "No open revision requests";
  $("#brand-feedback-list").innerHTML = feedbackItems.length ? feedbackItems.map((item) => `
    <article class="brand-feedback-${escapeHtml(item.state)}">
      <div><span>${escapeHtml(item.title)}</span><strong>${escapeHtml(brandResponseLabels[item.state] || item.state)}</strong></div>
      <blockquote>${escapeHtml(item.reason)}</blockquote>
      ${item.response ? `<p><b>Codex response:</b> ${escapeHtml(item.response.summary)}</p>` : `<p>Your note is retained and waiting to be reviewed.</p>`}
    </article>
  `).join("") : `<div class="brand-feedback-empty"><strong>No revision requests are open.</strong><p>Any future Revise or Reject choice will appear here automatically.</p></div>`;
  $("#brand-adoption-list").innerHTML = value.adoption.surfaces.map((surface) => `
    <article>
      <div><strong>${escapeHtml(surface.name)}</strong><small>${escapeHtml(surface.path)}</small></div>
      <span class="adoption-status adoption-${escapeHtml(surface.status)}">${escapeHtml(surface.status.replaceAll("-", " "))}</span>
      <p>${escapeHtml(surface.nextGate)}</p>
    </article>
  `).join("");
  $("#brand-review-grid").innerHTML = value.items.map((item) => {
    const decision = latest.get(item.id);
    const feedback = feedbackItems.find((candidate) => candidate.itemId === item.id);
    const decisionClass = decision ? `brand-review-${decision.action}` : "";
    const decisionText = decision ? brandDecisionLabels[decision.action] : "Awaiting your review";
    return `
      <article class="brand-review-item ${decisionClass}" data-brand-review-item="${escapeHtml(item.id)}">
        ${brandPreviewMarkup(item)}
        <div class="brand-review-content">
          <div class="brand-review-title"><div><span>Review item</span><h3>${escapeHtml(item.title)}</h3></div><em>${escapeHtml(decisionText)}</em></div>
          <p>${escapeHtml(item.description)}</p>
          <strong class="brand-review-question">${escapeHtml(item.question)}</strong>
          ${decision?.reason ? `<blockquote>${escapeHtml(decision.reason)}</blockquote>` : ""}
          ${feedback?.response ? `<div class="brand-review-response"><span>${escapeHtml(brandResponseLabels[feedback.state] || feedback.state)}</span><p>${escapeHtml(feedback.response.summary)}</p></div>` : ""}
          <label>What should change or why?
            <textarea rows="2" data-brand-review-note placeholder="Optional when approving; required for revision or rejection."></textarea>
          </label>
          <div class="brand-review-actions">
            <button type="button" data-brand-review-action="approve-internal">Approve for internal use</button>
            <button type="button" data-brand-review-action="revise">Request revision</button>
            <button type="button" data-brand-review-action="reject">Reject direction</button>
          </div>
        </div>
      </article>`;
  }).join("");
}

function renderBrandReviewUnavailable(progress, heading, message) {
  $("#brand-review-progress").textContent = progress;
  $("#brand-adoption-list").innerHTML = "";
  $("#brand-review-grid").innerHTML = `
    <div class="brand-review-unavailable" role="status">
      <strong>${escapeHtml(heading)}</strong>
      <p>${message}</p>
    </div>`;
}

async function loadBrandReview() {
  if (!state.serverCompatible) {
    renderBrandReviewUnavailable(
      "Restart required",
      "The controlled brand system has not loaded.",
      "Close the existing Workbench server window, then run <code>Launch-Brand-Review.cmd</code> again. This page is not a valid brand preview until the restart warning has cleared."
    );
    return;
  }
  try {
    renderBrandReview(await request("/api/brand-review"));
  } catch (error) {
    renderBrandReviewUnavailable(
      "Review unavailable",
      "The visual review could not be loaded.",
      "The page has stopped instead of presenting incomplete branding. Run <code>Launch-Brand-Review.cmd</code> again; if this message remains, share it with Codex."
    );
    throw error;
  }
}

const learningDispositions = [
  ["answer-only-correction", "Used to correct this answer only"],
  ["conversation-context", "Retained as conversation context"],
  ["reusable-correction", "Retained as a reusable correction"],
  ["already-covered", "Current Methodology already covers it"],
  ["clarification", "Clarification required"],
  ["example-or-guidance-need", "Example or guidance required"],
  ["more-evidence", "More evidence required"],
  ["methodology-change-candidate", "Methodology change proposed"],
  ["product-change-candidate", "Product change proposed"],
  ["separate-project-candidate", "Separate-project candidate"],
  ["deferred", "Deferred until a named trigger"],
  ["rejected", "Rejected with reasoning"],
  ["superseded", "Superseded by later learning"],
  ["urgent-review", "Urgent review"],
  ["no-action", "No further action"]
];

function learningDispositionOptions(selected) {
  return learningDispositions.map(([value, label]) =>
    `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`
  ).join("");
}

function learningSignalMarkup(item) {
  return `<article class="learning-signal-card">
    <div><span class="status-pill status-${escapeHtml(item.status)}">${escapeHtml(item.visibleDisposition || item.learning_disposition || statusLabel(item.status))}</span><small>${escapeHtml(formatDate(item.created_at || item.createdAt))}</small></div>
    <blockquote>${escapeHtml(item.original_wording || item.originalWording || item.wording || "No wording retained")}</blockquote>
    <p>${escapeHtml(item.disposition_reason || item.source || "The reason and source remain available in the retained signal.")}</p>
    <div class="record-actions">
      ${item.conversation_id ? `<button class="ghost" type="button" data-open-conversation="${escapeHtml(item.conversation_id)}">Open conversation</button>` : ""}
      ${item.proposal?.id ? `<button class="ghost" type="button" data-learning-proposal="${escapeHtml(item.proposal.id)}">Open change review</button>` : ""}
    </div>
  </article>`;
}

function learningReviewMarkup(review) {
  if (!review) return "";
  return `<details class="learning-review">
    <summary>Read the Methodology Learning Review</summary>
    <dl>
      <div><dt>Approved baseline</dt><dd>${escapeHtml(review.currentApprovedMethodology?.version || "Unknown")}</dd></div>
      <div><dt>Evidence strength</dt><dd>${escapeHtml(review.evidenceStrength)}</dd></div>
      <div><dt>Proposed disposition</dt><dd>${escapeHtml(review.proposedDispositionLabel)}</dd></div>
      <div><dt>Strongest no-change case</dt><dd>${escapeHtml(review.strongestNoChangeCase)}</dd></div>
      <div><dt>Recommendation</dt><dd>${escapeHtml(review.recommendation)}</dd></div>
      <div><dt>Decision or evidence required</dt><dd>${escapeHtml(review.exactDecisionOrEvidenceRequired)}</dd></div>
    </dl>
    ${review.contradictions?.length ? `<h4>Contradictions</h4><ul>${linesMarkup(review.contradictions)}</ul>` : ""}
    ${review.counterEvidence?.length ? `<h4>Counter-tests</h4><ul>${linesMarkup(review.counterEvidence)}</ul>` : ""}
    ${review.contextualLimits?.length ? `<h4>Contextual limits</h4><ul>${linesMarkup(review.contextualLimits)}</ul>` : ""}
    <p class="approval-boundary">This review is proposed analysis. It cannot approve Methodology meaning.</p>
  </details>`;
}

function learningTraceMarkup(trace) {
  const feedback = trace.feedback;
  const proposal = trace.proposal;
  const release = trace.release;
  return `<article class="learning-trace-card">
    <div class="learning-trace-heading"><div><span>Released by human Decision</span><strong>${escapeHtml(release?.scope || proposal?.proposedMeaning || "Methodology change")}</strong></div><span class="status-pill status-implemented">v${escapeHtml(release?.version || "unknown")}</span></div>
    <ol class="learning-trace">
      <li><span>Feedback</span><p>${escapeHtml(feedback?.originalWording || "Feedback record unavailable")}</p></li>
      <li><span>Interpretation and counter-test</span><p>${escapeHtml(feedback?.interpretation || "No separate interpretation retained")} ${escapeHtml(trace.counterTest || "")}</p></li>
      <li><span>Synthesis and proposal</span><p>${escapeHtml(trace.synthesis?.summary || "No multi-signal synthesis was required.")} ${escapeHtml(proposal?.proposedMeaning || "")}</p></li>
      <li><span>Decision and implementation</span><p>${escapeHtml(`${trace.decisions?.length || 0} retained Decision records`)}${trace.implementation?.reference ? `; ${escapeHtml(trace.implementation.reference)}` : ""}</p></li>
      <li><span>Release and later usage</span><p>${escapeHtml(`${release?.source_commit_sha || "Commit unavailable"}; ${trace.laterUsage?.length || 0} later knowledge snapshot proof(s)`)}</p></li>
      <li><span>Outcome review</span><p>${escapeHtml(trace.outcomeReviews?.[0]?.learning || "Outcome review not yet recorded")}</p></li>
    </ol>
    ${proposal?.id ? `<button class="ghost" type="button" data-learning-proposal="${escapeHtml(proposal.id)}">Open full governed change</button>` : ""}
  </article>`;
}

function renderLearningAnswer(kind) {
  const value = state.methodologyLearning;
  if (!value) return;
  const answer = kind === "approved" ? value.approvedChangesQuestion : value.unresolvedQuestion;
  const records = kind === "approved" ? answer.traces : answer.signals;
  $("#learning-answer").innerHTML = `<strong>${escapeHtml(answer.question)}</strong><p>${escapeHtml(answer.answer)}</p>
    <div class="learning-answer-records">${records.length
      ? records.map((item) => kind === "approved" ? learningTraceMarkup(item) : learningSignalMarkup(item)).join("")
      : '<p class="empty-steering">No matching structured records.</p>'}</div>`;
}

function renderMethodologyLearning(value) {
  state.methodologyLearning = value;
  $("#learning-baseline").textContent = value.baseline
    ? `Approved baseline ${value.baseline.version}`
    : "No approved baseline indexed";
  $("#learning-boundary").textContent = value.boundary;
  const summaryItems = [
    ["Unresolved", value.unresolvedQuestion.signals.length],
    ["Related clusters", value.counts.relatedClusters],
    ["Awaiting evidence", value.counts.awaitingEvidence],
    ["Awaiting Decision", value.counts.awaitingHumanDecision],
    ["Human-authorised releases", value.counts.approvedChanges],
    ["Outcome reviews", value.counts.outcomeReviews]
  ];
  $("#learning-summary").innerHTML = summaryItems.map(([label, count]) => `<div><span>${escapeHtml(label)}</span><strong>${count}</strong></div>`).join("");
  const unresolved = value.unresolvedQuestion.signals;
  $("#learning-signal-count").textContent = String(unresolved.length);
  $("#learning-unresolved-list").innerHTML = unresolved.length
    ? unresolved.map(learningSignalMarkup).join("")
    : '<div class="empty-records"><strong>No unexplained learning remains.</strong><p>Every retained signal has a completed or named next route.</p></div>';
  const clusters = value.buckets.relatedClusters;
  $("#learning-cluster-count").textContent = String(clusters.length);
  $("#learning-clusters").innerHTML = clusters.length ? clusters.map((cluster) => `<article class="learning-cluster-card">
    <div><span>${escapeHtml(cluster.relationship)}</span><strong>${cluster.signalIds.length} signals</strong></div>
    <ul>${cluster.signals.map((signal) => `<li><strong>${escapeHtml(signal.visibleDisposition)}</strong><span>${escapeHtml(signal.originalWording)}</span></li>`).join("")}</ul>
    ${learningReviewMarkup(cluster.review)}
    ${cluster.synthesis ? `<p class="learning-synthesis-state">Synthesis retained ${escapeHtml(formatDate(cluster.synthesis.created_at))}; no approval created.</p>` : `<button class="ghost" type="button" data-synthesise-cluster="${escapeHtml(cluster.signalIds.join(","))}">Retain this synthesis</button>`}
  </article>`).join("") : '<div class="empty-records"><strong>No related-signal cluster yet.</strong><p>Clusters appear when structured records share a Methodology component.</p></div>';
  const pipeline = [
    ["Unprocessed signals", value.counts.unprocessedSignals],
    ["Synthesis in progress", value.counts.synthesisInProgress],
    ["Clarifications or guidance", value.counts.proposedClarifications],
    ["Methodology changes proposed", value.counts.proposedMethodologyChanges],
    ["Awaiting evidence", value.counts.awaitingEvidence],
    ["Awaiting human Decision", value.counts.awaitingHumanDecision],
    ["Approved changes", value.counts.approvedChanges],
    ["Rejected or deferred", value.counts.rejectedOrDeferred],
    ["Outcome reviews", value.counts.outcomeReviews]
  ];
  $("#learning-status-grid").innerHTML = pipeline.map(([label, count]) => `<article><span>${escapeHtml(label)}</span><strong>${count}</strong></article>`).join("");
  const traces = value.approvedChangesQuestion.traces;
  $("#learning-trace-count").textContent = String(traces.length);
  $("#learning-traces").innerHTML = traces.length
    ? traces.map(learningTraceMarkup).join("")
    : '<div class="empty-records"><strong>No feedback-led Methodology release yet.</strong><p>A trace appears only after a separate human release Decision, implementation, merge receipt and repository reindex.</p></div>';
}

async function loadMethodologyLearning() {
  renderMethodologyLearning(await request("/api/methodology-learning"));
}

function steeringStatusLabel(value) {
  return String(value || "unknown").replaceAll("-", " ");
}

function renderSteering(value) {
  state.steering = value;
  $("#steering-version").textContent = `${value.steering?.version || "unavailable"} · ${steeringStatusLabel(value.steering?.status)}`;
  $("#steering-recovery-status").textContent = value.recovery?.restore_status === "succeeded" ? "Restore proved" : "Recovery blocked";
  $("#steering-conflict-count").textContent = `${value.conflicts.length} visible`;
  $("#steering-build-version").textContent = value.buildVersion || "Unknown build";

  $("#steering-projects").innerHTML = value.projects.map((project) => `
    <article class="steering-item">
      <div><span>${escapeHtml(project.project_id)}</span><strong>${escapeHtml(project.product_name)}</strong></div>
      <p>${escapeHtml(project.core_outcome)}</p>
      <dl><div><dt>Purpose</dt><dd>${escapeHtml(project.purpose_id || "Not approved")} ${project.purpose_version ? `@${escapeHtml(project.purpose_version)}` : ""}</dd></div><div><dt>Status</dt><dd>${escapeHtml(project.current_status)}</dd></div><div><dt>Repository</dt><dd>${escapeHtml(project.repository)}</dd></div></dl>
      <details><summary>Show information and authority boundaries</summary><p><strong>Information:</strong> ${escapeHtml(project.information_boundary)}</p><p><strong>Authority:</strong> ${escapeHtml(project.authority_boundary)}</p><p><strong>Excluded:</strong> ${escapeHtml((project.excluded_products || []).join(", ") || "None recorded")}</p></details>
    </article>`).join("");

  const currentPrompts = value.prompts.filter((prompt) => ["approved", "current"].includes(prompt.status));
  $("#steering-prompts").innerHTML = currentPrompts.length ? currentPrompts.map((prompt) => `
    <article class="steering-item">
      <div><span>${escapeHtml(prompt.target_project)} · ${escapeHtml(prompt.target_capability)}</span><strong>${escapeHtml(prompt.prompt_id)}@${escapeHtml(prompt.exact_version)}</strong></div>
      <p>${escapeHtml(prompt.title)}</p>
      <dl><div><dt>Status</dt><dd>${escapeHtml(prompt.status)}</dd></div><div><dt>Effective</dt><dd>${escapeHtml(prompt.effective_date)}</dd></div><div><dt>Purpose</dt><dd>${escapeHtml(prompt.purpose_version)}</dd></div><div><dt>Used by</dt><dd>${escapeHtml((prompt.builds_or_pull_requests || []).join(", "))}</dd></div></dl>
    </article>`).join("") : `<p class="empty-steering">No current approved prompts are registered.</p>`;

  const proposals = [
    ...value.proposals.purposes.map((item) => ({ title: item.metadata.title || item.path, status: item.metadata.status || "unlabelled", detail: item.path })),
    ...value.proposals.prompts.map((item) => ({ title: item.title, status: item.status, detail: `${item.prompt_id}@${item.exact_version}` }))
  ];
  $("#steering-proposals").innerHTML = proposals.length ? proposals.map((item) => `
    <article class="steering-item"><div><span>${escapeHtml(item.status)}</span><strong>${escapeHtml(item.title)}</strong></div><p>${escapeHtml(item.detail)}</p><small>Requires an exact human Decision before Approved status.</small></article>`).join("") : `<p class="empty-steering">No unresolved purpose or prompt proposals.</p>`;

  $("#steering-recommendations").innerHTML = value.intakes.length ? value.intakes.map((intake) => `
    <article class="steering-item steering-recommendation" data-steering-intake-id="${escapeHtml(intake.id)}">
      <div><span>${escapeHtml(intake.status)}</span><strong>${escapeHtml(intake.boundary.recommendation)}</strong></div>
      <p>${escapeHtml(intake.sourceText)}</p>
      <small>${escapeHtml(intake.boundary.rationale)}</small>
      ${intake.decision?.action ? `<p><strong>Recorded decision:</strong> ${escapeHtml(intake.decision.action)} by ${escapeHtml(intake.decision.actor)}${intake.decision.reason ? ` · ${escapeHtml(intake.decision.reason)}` : ""}</p>` : `
        <label>Reason when deferring or rejecting<textarea rows="2" data-steering-decision-reason></textarea></label>
        <div class="steering-decision-actions"><button type="button" data-steering-decision="accept-route">Accept route</button><button type="button" data-steering-decision="defer-route">Defer route</button><button type="button" data-steering-decision="reject-route">Reject route</button></div>`}
      <p class="control-note">A route decision does not approve purpose, repository creation, migration, build, release or publication.</p>
    </article>`).join("") : `<p class="empty-steering">No project-boundary recommendations have been recorded.</p>`;

  $("#steering-conflicts").innerHTML = value.conflicts.length ? value.conflicts.map((conflict) => `
    <article class="steering-item steering-conflict ${escapeHtml(conflict.severity)}"><div><span>${escapeHtml(conflict.severity)} · ${escapeHtml(conflict.status)}</span><strong>${escapeHtml(conflict.summary)}</strong></div><p>${escapeHtml(conflict.decisionRequired)}</p><small>${escapeHtml((conflict.sources || []).join(" · "))}</small></article>`).join("") : `<p class="empty-steering">No control conflicts detected.</p>`;

  $("#steering-builds").innerHTML = value.builds.length ? value.builds.map((build) => `
    <article class="steering-item"><div><span>${escapeHtml(build.status)}</span><strong>${escapeHtml(build.title)}</strong></div><p>${build.provenanceValid ? "Complete provenance recorded." : `Legacy provenance gap: ${escapeHtml(build.missing.join(", "))}`}</p><small>${escapeHtml(build.provenance.promptId || "No prompt recorded")}${build.provenance.promptVersion ? `@${escapeHtml(build.provenance.promptVersion)}` : ""} · ${escapeHtml(build.provenance.purposeId || "No purpose recorded")}${build.provenance.purposeVersion ? `@${escapeHtml(build.provenance.purposeVersion)}` : ""}</small></article>`).join("") : `<p class="empty-steering">No Implementation Jobs are recorded.</p>`;
}

async function loadSteering() {
  renderSteering(await request("/api/steering"));
}

const validViews = new Set(["my-work", "operate", "conversation", "challenges", "feedback", "learning", "decisions", "brand", "steering", "usage", "settings", "connections", "guide"]);
const viewHeadings = {
  "my-work": ["Operate workbench", "My work"],
  operate: ["Connected work", "Cases & work"],
  challenges: ["Knowledge workbench", "Challenge studio"],
  feedback: ["Governed learning", "Saved feedback"],
  learning: ["Structured learning", "Methodology learning"],
  decisions: ["Human-controlled change", "Decision inbox"],
  brand: ["Proposed visual system", "Brand review"],
  steering: ["Product control", "Purpose & steering"],
  usage: ["Local controls", "Cost and usage"],
  settings: ["Local controls", "Settings"],
  connections: ["Controlled sources", "Connections"],
  guide: ["First use", "How the Workbench works"]
};

function switchView(name, updateHash = true, refresh = true) {
  if (!validViews.has(name)) return;
  $$(".view").forEach((view) => { view.hidden = view.id !== `${name}-view`; });
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === name));
  $("#details-button").hidden = name !== "conversation";
  $("#export-button").hidden = name !== "conversation";
  $("#new-conversation").hidden = name !== "conversation";
  $("#oppa-mate-topbar").hidden = name !== "conversation";
  $("#workspace-label").hidden = name === "conversation";
  if (name === "conversation") {
    $("#workspace-label").textContent = $("#workspace").selectedOptions[0]?.textContent || "Oppa Mate";
    $("#conversation-title").textContent = state.conversation?.title || "New conversation";
  } else {
    const [eyebrow, title] = viewHeadings[name] || ["Operate workbench", "Operations Automated"];
    $("#workspace-label").textContent = eyebrow;
    $("#conversation-title").textContent = title;
  }
  if (updateHash) history.replaceState(null, "", name === "my-work" ? `${location.pathname}${location.search}` : `#${name}`);
  if (refresh && name === "my-work") loadMyWork().catch((error) => toast(error.message, true));
  if (refresh && name === "operate") loadOperate().catch((error) => toast(error.message, true));
  if (refresh && name === "usage") loadUsage().catch((error) => toast(error.message, true));
  if (refresh && name === "feedback") loadFeedback().catch((error) => toast(error.message, true));
  if (refresh && name === "learning") loadMethodologyLearning().catch((error) => toast(error.message, true));
  if (refresh && name === "decisions") loadDecisionInbox().catch((error) => toast(error.message, true));
  if (refresh && name === "brand") loadBrandReview().catch((error) => toast(error.message, true));
  if (refresh && name === "steering") loadSteering().catch((error) => toast(error.message, true));
  if (refresh && name === "connections") loadConnections().catch((error) => toast(error.message, true));
}

async function loadUsage() {
  const value = await request("/api/usage");
  const hardBudget = Number(value.settings.monthlyHardBudget || 0);
  const percent = hardBudget ? Math.min(100, (value.monthlyEstimatedCost / hardBudget) * 100) : 0;
  $("#usage-summary").innerHTML = `
    <div class="usage-total"><span>This month</span><strong>${formatCost(value.monthlyEstimatedCost)}</strong></div>
    <div class="budget-meter">
      <div><span>Monthly hard budget</span><strong>${formatCost(hardBudget)}</strong></div>
      <div class="budget-track" role="meter" aria-label="Monthly API budget used" aria-valuemin="0" aria-valuemax="${hardBudget}" aria-valuenow="${value.monthlyEstimatedCost}"><span style="width:${percent}%"></span></div>
      <p>Soft warning at ${formatCost(value.settings.monthlySoftBudget)}. Paid calls stop at the hard budget; local records and retrieval remain available.</p>
    </div>
    <div class="usage-total usage-secondary"><span>All-time estimated API cost</span><strong>${formatCost(value.totalEstimatedCost)}</strong></div>
    ${value.records.map((record) => `<div class="usage-row">
      <span>${escapeHtml(record.provider)} &middot; ${escapeHtml(record.status)}</span>
      <span>${record.input_tokens.toLocaleString()} in / ${record.output_tokens.toLocaleString()} out</span>
      <strong>${formatCost(record.estimated_cost)}</strong>
    </div>`).join("") || "<p>No requests recorded yet.</p>"}`;
}

function renderConnectionStatus(value) {
  const area = $("#confluence-connection-status");
  const actions = $("#confluence-saved-actions");
  const publicationPanel = $("#confluence-publication");
  const record = value?.connection;
  state.confluence = value;
  actions.hidden = !value?.configured;
  publicationPanel.hidden = !value?.configured;
  if (!value?.storageAvailable) {
    area.className = "connection-status error";
    area.innerHTML = `<strong>Encrypted storage is unavailable.</strong><p>${escapeHtml(value?.storageError || "This private connection release requires the Workbench to run under your Windows account.")}</p>`;
    return;
  }
  if (value?.storageError) {
    area.className = "connection-status error";
    area.innerHTML = `<strong>The saved credential could not be opened.</strong><p>${escapeHtml(value.storageError)}</p>`;
    return;
  }
  if (!value?.configured || !record) {
    area.className = "connection-status";
    area.innerHTML = "<strong>No Confluence connection is saved yet.</strong><p>Enter the site, service-account email and token below. Testing does not save anything.</p>";
    return;
  }
  const synced = Number(record.syncedDocuments || 0);
  area.className = `connection-status ${synced ? "connected" : ""}`;
  area.innerHTML = `
    <div><strong>${synced ? "Connected evidence is ready." : "Confluence is connected."}</strong><span>${escapeHtml(record.siteUrl)}</span></div>
    <dl>
      <div><dt>Account</dt><dd>${escapeHtml(record.accountEmailMasked)}</dd></div>
      <div><dt>Internal</dt><dd>${escapeHtml(record.internalSpace?.name || "Not assigned")}</dd></div>
      <div><dt>Methodology</dt><dd>${escapeHtml(record.methodologySpace?.name || "Not assigned")}</dd></div>
      <div><dt>Current session</dt><dd>${synced ? `${synced} pages synchronised` : "Not synchronised"}</dd></div>
    </dl>
    <p>${record.lastSyncedAt ? `Last synchronised ${escapeHtml(formatDate(record.lastSyncedAt))}.` : "Select Synchronise read-only evidence when you want these spaces to influence Workbench answers."}</p>`;
  if (!$("#confluence-form").siteUrl.value) $("#confluence-form").siteUrl.value = record.siteUrl || "";
  renderPublicationSummary(value.publication);
}

async function loadConnections() {
  const value = await request("/api/connections");
  renderConnectionStatus(value.confluence);
}

function renderPublicationSummary(publication) {
  if (!publication || state.confluencePublicationPlan) return;
  const area = $("#confluence-publication-status");
  const lastRun = publication.lastRun;
  const pending = Number(publication.pendingMethodologyReleases || 0);
  const managed = Number(publication.managedPages || 0);
  const updateNeeded = Boolean(publication.repositoryAheadOfConfluence);
  area.className = "publication-status";
  if (!lastRun) {
    area.innerHTML = `
      <strong>No documentation publication has been recorded yet.</strong>
      <p>${pending ? `${pending} implemented methodology release${pending === 1 ? " is" : "s are"} waiting for a reviewed Confluence update.` : "Prepare the first preview to create the readable page tree."}</p>`;
    return;
  }
  const result = lastRun.status === "completed"
    ? `${lastRun.created_count} created, ${lastRun.updated_count} updated and ${lastRun.unchanged_count} unchanged`
    : `Last run ${escapeHtml(lastRun.status)}${lastRun.failure_message ? `: ${escapeHtml(lastRun.failure_message)}` : ""}`;
  area.innerHTML = `
    <strong>${managed} Workbench-managed Confluence page${managed === 1 ? "" : "s"}.</strong>
    <p>${result}. ${pending ? `${pending} later release${pending === 1 ? " requires" : "s require"} publication review.` : updateNeeded ? "The current repository commit has not yet been reconciled with Confluence." : "Confluence is reconciled with the current repository commit."}</p>`;
}

function publicationActionLabel(action) {
  return {
    create: "Create",
    update: "Update",
    unchanged: "Unchanged",
    conflict: "Conflict"
  }[action] || action;
}

function renderConfluencePublicationPlan(plan) {
  state.confluencePublicationPlan = plan;
  const area = $("#confluence-publication-status");
  const target = $("#confluence-publication-plan");
  const form = $("#confluence-publication-approval");
  const summary = plan.summary || {};
  const groups = [
    ["methodology", "Methodology space"],
    ["internal", "Internal space"]
  ];
  const lifecycleGroups = [
    ["live", "Live"],
    ["draft", "Draft"],
    ["archived", "Archived"]
  ];
  area.className = `publication-status ${summary.conflict ? "error" : "connected"}`;
  area.innerHTML = `
    <strong>${escapeHtml(plan.title || `${plan.items.length} controlled pages`)} reviewed against Confluence.</strong>
    <p>${Number(summary.create || 0)} to create · ${Number(summary.update || 0)} to update · ${Number(summary.unchanged || 0)} unchanged · ${Number(summary.conflict || 0)} conflicts.</p>
    <p>Source: ${escapeHtml(plan.sourceBranch)} at ${escapeHtml(String(plan.sourceCommit || "").slice(0, 12))}. No write has happened.</p>`;
  const blockers = Array.isArray(plan.blockers) && plan.blockers.length
    ? `<div class="publication-blockers"><strong>Publication is blocked</strong>${plan.blockers.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div>`
    : "";
  target.innerHTML = `
    ${blockers}
    <div class="publication-summary-grid">
      <article><span>Create</span><strong>${Number(summary.create || 0)}</strong></article>
      <article><span>Update</span><strong>${Number(summary.update || 0)}</strong></article>
      <article><span>Unchanged</span><strong>${Number(summary.unchanged || 0)}</strong></article>
      <article class="${summary.conflict ? "has-conflict" : ""}"><span>Conflict</span><strong>${Number(summary.conflict || 0)}</strong></article>
    </div>
    ${groups.filter(([role]) => plan.items.some((item) => item.role === role)).map(([role, label]) => {
      const items = plan.items.filter((item) => item.role === role);
      const itemByKey = new Map(items.map((item) => [item.key, item]));
      const renderItem = (item) => {
        let depth = 0;
        let parentKey = item.parentKey;
        while (parentKey && itemByKey.has(parentKey)) {
          depth += 1;
          parentKey = itemByKey.get(parentKey).parentKey;
        }
        const level = Math.max(0, depth - 1);
        return `
          <article class="publication-item action-${escapeHtml(item.action)}" data-level="${level}">
            <span class="publication-action">${escapeHtml(publicationActionLabel(item.action))}</span>
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.reason)}</p>
              <small>${escapeHtml(item.sourcePath || "Generated navigation")} · ${escapeHtml(item.sourceStatus || "navigation")}</small>
              ${item.action === "conflict" && item.webUrl ? `<a class="publication-conflict-link" href="${escapeHtml(item.webUrl)}" target="_blank" rel="noreferrer">Open the changed Confluence page</a>` : ""}
              ${item.conflictType === "managed-page-version" ? `<button class="ghost publication-conflict-action" data-reapply-conflict="${escapeHtml(item.key)}" type="button">Use reviewed Git copy</button>` : ""}
            </div>
          </article>`;
      };
      const roots = items.filter((item) => !item.lifecycle);
      return `<details class="publication-tree">
        <summary><strong>${label}</strong><span>${items.length} pages</span></summary>
        <div>
          ${roots.map(renderItem).join("")}
          ${(plan.lifecycleOrder?.length
            ? lifecycleGroups.filter(([lifecycle]) => plan.lifecycleOrder.includes(lifecycle))
            : []).map(([lifecycle, lifecycleLabel]) => {
            const lifecycleItems = items.filter((item) => item.lifecycle === lifecycle);
            const documentCount = lifecycleItems.filter((item) => item.kind === "controlled-document").length;
            return `<details class="publication-lifecycle" ${lifecycle === "live" ? "open" : ""}>
              <summary><strong>${lifecycleLabel}</strong><span>${documentCount} document${documentCount === 1 ? "" : "s"}</span></summary>
              <div>${lifecycleItems.map(renderItem).join("")}</div>
            </details>`;
          }).join("")}
        </div>
      </details>`;
    }).join("")}
    <p class="confirmation-phrase">${plan.founderConfirmationRequired === false
      ? "<strong>Draft publication is AI-managed.</strong> No separate founder confirmation is required; promotion to Live remains controlled."
      : `Required confirmation: <strong>${escapeHtml(plan.confirmationPhrase)}</strong>`}</p>`;
  form.hidden = !plan.publishable || plan.founderConfirmationRequired === false;
  form.reset();
  form.actor.value = "Jamie Peppard";
  form.confirmation.placeholder = plan.confirmationPhrase || "";
}

async function previewConfluencePublication(publicationKind = "controlled-mirror") {
  const methodologyLab = publicationKind === "methodology-lab-pilot";
  const button = $(methodologyLab ? "#preview-methodology-lab" : "#preview-confluence-publication");
  button.disabled = true;
  button.textContent = methodologyLab ? "Preparing methodology Draft preview…" : "Comparing repository and Confluence…";
  try {
    const result = await request("/api/connections/confluence/publication-plan", {
      method: "POST",
      body: JSON.stringify({ publicationKind })
    });
    renderConfluencePublicationPlan(result.plan);
    toast(methodologyLab
      ? "Methodology Draft preview ready. No Live page was changed."
      : "Publication preview ready. No Confluence page was changed.");
  } catch (error) {
    $("#confluence-publication-status").className = "publication-status error";
    $("#confluence-publication-status").innerHTML = `<strong>The documentation preview could not be prepared.</strong><p>${escapeHtml(error.message)}</p>`;
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = methodologyLab ? "Preview methodology draft" : "Preview documentation update";
  }
}

async function publishConfluenceDocumentation(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const plan = state.confluencePublicationPlan;
  if (!plan?.publishable) return toast("Prepare a publishable preview first.", true);
  const values = Object.fromEntries(new FormData(form));
  const button = $("#publish-confluence");
  button.disabled = true;
  button.textContent = "Publishing reviewed pages…";
  try {
    const result = await request("/api/connections/confluence/publish", {
      method: "POST",
      body: JSON.stringify({
        planId: plan.id,
        actor: values.actor,
        reviewed: values.reviewed === "on",
        confirmation: values.confirmation
      })
    });
    const links = result.items.filter((item) => item.webUrl).slice(0, 8);
    $("#confluence-publication-status").className = "publication-status connected";
    $("#confluence-publication-status").innerHTML = `
      <strong>Documentation publication completed.</strong>
      <p>${result.created} created · ${result.updated} updated · ${result.unchanged} unchanged · ${result.pagesDeleted} deleted.</p>
      <p>Source commit ${escapeHtml(String(result.sourceCommitSha || "").slice(0, 12))}; run ${escapeHtml(result.runId)}.</p>`;
    $("#confluence-publication-plan").innerHTML = links.length
      ? `<div class="publication-links"><strong>Open published pages</strong>${links.map((item) => `<a href="${escapeHtml(item.webUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>`).join("")}</div>`
      : "";
    form.hidden = true;
    state.confluencePublicationPlan = null;
    toast(result.publicationKind === "methodology-lab-pilot"
      ? "Consolidated methodology draft published for private review."
      : "Reviewed methodology documentation published to Confluence.");
  } catch (error) {
    $("#confluence-publication-status").className = "publication-status error";
    $("#confluence-publication-status").innerHTML = `<strong>Publication stopped safely.</strong><p>${escapeHtml(error.message)}</p><p>Prepare a new preview before retrying.</p>`;
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Publish reviewed pages";
  }
}

async function reapplyGitCopyAfterConflict(itemKey) {
  const plan = state.confluencePublicationPlan;
  const item = plan?.items.find((candidate) => candidate.key === itemKey);
  if (!plan || !item || item.conflictType !== "managed-page-version") return;
  const accepted = window.confirm(
    `Review “${item.title}” in Confluence and the controlled Git source before continuing.\n\nThis step does not write. It prepares the Git reading copy to replace the independently edited Confluence page in a later, separately confirmed publication.`
  );
  if (!accepted) return;
  const confirmation = window.prompt(`Type this exactly:\n${plan.conflictReapplyPhrase}`);
  if (confirmation === null) return;
  try {
    const result = await request("/api/connections/confluence/publication-conflicts/reapply", {
      method: "POST",
      body: JSON.stringify({
        planId: plan.id,
        itemKey,
        actor: "Jamie Peppard",
        reviewed: true,
        confirmation
      })
    });
    toast(result.message);
    await previewConfluencePublication();
  } catch (error) {
    toast(error.message, true);
  }
}

function populateConfluenceSpaces(spaces) {
  const options = `<option value="">Choose a space</option>${spaces.map((space) =>
    `<option value="${escapeHtml(space.id)}">${escapeHtml(space.name)}${space.key ? ` (${escapeHtml(space.key)})` : ""}</option>`
  ).join("")}`;
  const form = $("#confluence-form");
  form.internalSpaceId.innerHTML = options;
  form.methodologySpaceId.innerHTML = options;
  $("#confluence-space-step").hidden = false;
}

async function testConfluence(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $("#test-confluence");
  button.disabled = true;
  button.textContent = "Testing securely…";
  try {
    const values = Object.fromEntries(new FormData(form));
    const result = await request("/api/connections/confluence/test", {
      method: "POST",
      body: JSON.stringify({
        siteUrl: values.siteUrl,
        accountEmail: values.accountEmail,
        apiToken: values.apiToken
      })
    });
    state.confluenceTest = result;
    populateConfluenceSpaces(result.spaces);
    $("#confluence-connection-status").className = "connection-status connected";
    $("#confluence-connection-status").innerHTML = `<strong>Read-only test passed.</strong><p>${result.spaces.length} visible spaces found. Assign the two roles below, then save the encrypted connection.</p>`;
    toast("Connection tested. Nothing has been saved yet.");
  } catch (error) {
    $("#confluence-connection-status").className = "connection-status error";
    $("#confluence-connection-status").innerHTML = `<strong>The connection test did not pass.</strong><p>${escapeHtml(error.message)}</p>`;
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Test and show spaces";
  }
}

async function saveConfluence() {
  const form = $("#confluence-form");
  const values = Object.fromEntries(new FormData(form));
  const button = $("#save-confluence");
  if (!state.confluenceTest) return toast("Test the connection before saving it.", true);
  if (!values.internalSpaceId || !values.methodologySpaceId) return toast("Choose both space roles.", true);
  button.disabled = true;
  button.textContent = "Encrypting and saving…";
  try {
    const result = await request("/api/connections/confluence", {
      method: "PUT",
      body: JSON.stringify(values)
    });
    form.apiToken.value = "";
    state.confluenceTest = null;
    state.confluencePublicationPlan = null;
    $("#confluence-space-step").hidden = true;
    $("#confluence-publication-plan").innerHTML = "";
    $("#confluence-publication-approval").hidden = true;
    renderConnectionStatus({
      storageAvailable: true,
      configured: result.configured,
      connection: result.connection
    });
    toast("Confluence connection saved with Windows encryption.");
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Save encrypted connection";
  }
}

async function verifyConfluence() {
  const button = $("#verify-confluence");
  button.disabled = true;
  button.textContent = "Verifying…";
  try {
    const result = await request("/api/connections/confluence/verify", { method: "POST", body: "{}" });
    renderConnectionStatus({ storageAvailable: true, configured: true, connection: result.connection });
    toast("Saved Confluence connection verified.");
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Verify saved connection";
  }
}

async function synchroniseConfluence() {
  const button = $("#sync-confluence");
  button.disabled = true;
  button.textContent = "Synchronising read-only…";
  try {
    const result = await request("/api/connections/confluence/synchronise", { method: "POST", body: "{}" });
    renderConnectionStatus({ storageAvailable: true, configured: true, connection: result.connection });
    toast(`${result.connection.syncedDocuments} Confluence pages are now available as evidence.`);
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Synchronise read-only evidence";
  }
}

async function removeConfluence() {
  const confirmed = window.confirm("Remove the saved Confluence credential and clear synchronised page evidence from this Workbench? This does not revoke the token in Atlassian.");
  if (!confirmed) return;
  const button = $("#remove-confluence");
  button.disabled = true;
  try {
    const result = await request("/api/connections/confluence", { method: "DELETE" });
    $("#confluence-form").reset();
    $("#confluence-space-step").hidden = true;
    state.confluenceTest = null;
    state.confluencePublicationPlan = null;
    $("#confluence-publication-plan").innerHTML = "";
    $("#confluence-publication-approval").hidden = true;
    renderConnectionStatus({ storageAvailable: true, configured: false, connection: null });
    toast(result.message);
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function renderAttachments() {
  $("#attachment-name").innerHTML = state.attachments.map((item) =>
    `<span class="attachment-chip">${escapeHtml(item.filename)} <button type="button" data-remove-attachment="${item.id}" aria-label="Remove ${escapeHtml(item.filename)}">&times;</button></span>`
  ).join("");
}

async function attachFile(file) {
  const conversation = await ensureConversation();
  if (!/\.(txt|md|markdown|csv|json)$/i.test(file.name)) throw new Error("Choose a text, Markdown, CSV or JSON file.");
  if (file.size > state.settings.maximumFileSize) throw new Error("That file exceeds the configured size limit.");
  const content = await file.text();
  const value = await request("/api/attachments", {
    method: "POST",
    body: JSON.stringify({ conversationId: conversation.id, filename: file.name, mimeType: file.type, content })
  });
  const attachment = value.attachment;
  attachment.extractedText = attachment.extractedText || attachment.extracted_text || content;
  if (!state.attachments.some((item) => item.id === attachment.id)) state.attachments.push(attachment);
  renderAttachments();
  toast(attachment.duplicate ? "Existing extraction reused; the file was not processed twice." : "Document extracted locally and ready to use.");
}

async function init() {
  const config = await request("/api/settings");
  try {
    const versionResponse = await fetch("/build-version.txt", { cache: "no-store" });
    if (versionResponse.ok) {
      const expectedBuildVersion = (await versionResponse.text()).trim();
      state.serverCompatible = !expectedBuildVersion || config.buildVersion === expectedBuildVersion;
      if (!state.serverCompatible) {
        $("#server-version-message").textContent = `The browser is using Workbench ${config.buildVersion || "from an older build"}, while these page files require ${expectedBuildVersion}. Close the existing Workbench server window, then run Launch-Brand-Review.cmd again.`;
      }
    }
  } catch {
    // A missing build marker must not prevent the otherwise usable Workbench from opening.
  }
  $("#server-version-warning").hidden = state.serverCompatible;
  state.settings = config.settings;
  state.apiConfigured = config.apiConfigured;
  state.currentUser = config.currentUser || "Jamie Peppard";
  state.repositoryMode = config.repositoryMode || "manual";
  $("#baseline-state").textContent = `Approved baseline: ${config.approvedBaseline?.baseline_version || "not indexed"}`;
  $("#baseline-state").title = config.approvedBaseline
    ? `${config.approvedBaseline.approved_count} approved documents indexed ${formatDate(config.approvedBaseline.created_at)}`
    : "No approved repository baseline has been indexed.";
  $("#api-state").textContent = config.apiConfigured ? "Provider connected" : "Local methodology mode";
  $("#api-state").classList.toggle("local", !config.apiConfigured);
  $("#mode-explainer").innerHTML = config.apiConfigured
    ? "<strong>Provider connected.</strong><p>Responses can use the configured AI capability tiers and will record usage.</p>"
    : "<strong>Local methodology mode is active.</strong><p>Repository retrieval, grounded synthesis, documents, feedback and exports work without an API key or cost. Voice and image intelligence are unavailable until a provider is configured.</p>";
  $("#record").hidden = false;
  $("#record").disabled = !config.apiConfigured;
  $("#record").title = config.apiConfigured ? "Record voice" : "Configure an OpenAI API key to enable voice";
  for (const [key, value] of Object.entries(config.settings)) {
    const field = $(`[name="${key}"]`);
    if (field) field.type === "checkbox" ? field.checked = Boolean(value) : field.value = value;
  }
  await Promise.all([loadConversationList(), loadOperate()]);
  if (state.conversations[0]) state.conversation = (await request(`/api/conversations/${state.conversations[0].id}`)).conversation;
  renderConversation();
  const requestedView = location.hash.slice(1);
  switchView(validViews.has(requestedView) ? requestedView : "my-work", false);
}

$("#composer").addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = $("#input").value.trim();
  if (!text) return toast("Describe what you want to work through first.", true);
  try { await previewAndSend(text); } catch (error) { toast(error.message, true); }
});
$("#confirm-send").addEventListener("click", (event) => { event.preventDefault(); sendPending(); });
$("#messages").addEventListener("click", (event) => {
  const button = event.target.closest("[data-feedback]");
  if (button) recordFeedback(button).catch((error) => toast(error.message, true));
});
$("#feedback-list").addEventListener("change", (event) => {
  const select = event.target.closest("[data-feedback-classification]");
  if (!select) return;
  const outcome = $(`[data-classification-outcome="${select.dataset.feedbackClassification}"]`);
  if (outcome) outcome.textContent = classificationOutcome(select.value);
});
$("#feedback-list").addEventListener("click", async (event) => {
  const conversationButton = event.target.closest("[data-open-conversation]");
  if (conversationButton) {
    loadConversation(conversationButton.dataset.openConversation).catch((error) => toast(error.message, true));
    return;
  }
  const classificationButton = event.target.closest("[data-save-classification]");
  if (classificationButton) {
    const id = classificationButton.dataset.saveClassification;
    const select = $(`[data-feedback-classification="${id}"]`);
    try {
      const result = await request(`/api/feedback/${id}/classification`, {
        method: "PATCH",
        body: JSON.stringify({
          classification: select.value,
          learningDisposition: $(`[data-feedback-learning-disposition="${id}"]`)?.value,
          dispositionReason: $(`[data-feedback-disposition-reason="${id}"]`)?.value,
          reviewTrigger: $(`[data-feedback-review-trigger="${id}"]`)?.value
        })
      });
      await Promise.all([loadFeedback(), loadMyWork()]);
      if (result.proposal) {
        state.selectedProposalId = result.proposal.id;
        switchView("decisions");
        await loadDecisionInbox(result.proposal.id);
        toast("Feedback step complete. The separate change review is ready; nothing has been approved or implemented.");
      } else {
        toast("Done. The selected use is retained and this feedback no longer needs an action in My Work.");
      }
    } catch (error) { toast(error.message, true); }
    return;
  }
  const proposalButton = event.target.closest("[data-create-proposal]");
  if (proposalButton) {
    try {
      const result = await request(`/api/feedback/${proposalButton.dataset.createProposal}/change-proposal`, { method: "POST", body: "{}" });
      state.selectedProposalId = result.proposal.id;
      switchView("decisions");
      await loadDecisionInbox(result.proposal.id);
      toast("Change review created. It has not edited the method, started implementation or created approval.");
    } catch (error) { toast(error.message, true); }
  }
});
$("#learning-view").addEventListener("click", async (event) => {
  const question = event.target.closest("[data-learning-question]");
  if (question) {
    renderLearningAnswer(question.dataset.learningQuestion);
    return;
  }
  const conversation = event.target.closest("[data-open-conversation]");
  if (conversation) {
    await loadConversation(conversation.dataset.openConversation);
    return;
  }
  const proposal = event.target.closest("[data-learning-proposal]");
  if (proposal) {
    state.selectedProposalId = proposal.dataset.learningProposal;
    switchView("decisions", true, false);
    await loadDecisionInbox(state.selectedProposalId);
    return;
  }
  const synthesis = event.target.closest("[data-synthesise-cluster]");
  if (synthesis) {
    synthesis.disabled = true;
    try {
      await request("/api/feedback/synthesis", {
        method: "POST",
        body: JSON.stringify({ feedbackIds: synthesis.dataset.synthesiseCluster.split(",").filter(Boolean) })
      });
      await loadMethodologyLearning();
      toast("Methodology Learning Review retained. It remains proposed analysis and created no approval.");
    } catch (error) {
      synthesis.disabled = false;
      toast(error.message, true);
    }
  }
});
$("#decision-status-board").addEventListener("click", (event) => {
  const button = event.target.closest("[data-decision-filter]");
  if (!button) return;
  loadDecisionInbox(null, button.dataset.decisionFilter).catch((error) => toast(error.message, true));
});
$("#decision-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-proposal-id]");
  if (!button) return;
  state.selectedProposalId = button.dataset.proposalId;
  const selected = state.proposals.find((proposal) => proposal.id === state.selectedProposalId);
  $$(".decision-link").forEach((item) => item.classList.toggle("current", item === button));
  renderProposalDetail(selected);
});
$("#decision-detail").addEventListener("click", async (event) => {
  const proposal = state.proposals.find((item) => item.id === state.selectedProposalId);
  if (!proposal) return;
  const buildJobButton = event.target.closest("[data-open-proposal-build-job]");
  if (buildJobButton) {
    switchView("my-work");
    await loadMyWork();
    await openWorkItem(`implementation-job:${buildJobButton.dataset.openProposalBuildJob}`);
    return;
  }
  const decisionButton = event.target.closest("[data-decision-action]");
  if (decisionButton) {
    const action = decisionButton.dataset.decisionAction;
    const phase = decisionButton.dataset.phase;
    let confirmation = "";
    if (action === "approve-and-merge") {
      confirmation = window.prompt('Type "Approve and merge" to confirm Jamie Peppard’s release decision:', "") || "";
      if (confirmation !== "Approve and merge") return toast("Release was not authorised.", true);
    }
    try {
      const result = await request(`/api/change-proposals/${proposal.id}/decisions`, {
        method: "POST",
        body: JSON.stringify({
          phase,
          action,
          actor: state.currentUser,
          reason: document.querySelector("#decision-reason")?.value || "",
          confirmation
        })
      });
      await loadDecisionInbox(proposal.id);
      toast(result.implementationJob
        ? "Preparation recorded and the Codex build created. Nothing else is required from you until its receipt is ready."
        : result.manualMergeRequired
        ? "Merge authorised by Jamie. Complete the merge, then record the implementation receipt."
        : `${action.replaceAll("-", " ")} recorded.`);
    } catch (error) { toast(error.message, true); }
    return;
  }
  if (event.target.closest("[data-start-handoff]")) {
    try {
      await request(`/api/change-proposals/${proposal.id}/implementation-handoff`, { method: "POST", body: "{}" });
      await loadDecisionInbox(proposal.id);
      toast("Bounded implementation handoff created. Main was not changed.");
    } catch (error) { toast(error.message, true); }
  }
});
$("#decision-detail").addEventListener("submit", async (event) => {
  event.preventDefault();
  const proposal = state.proposals.find((item) => item.id === state.selectedProposalId);
  if (!proposal) return;
  if (event.target.id === "repository-reference-form") {
    const form = new FormData(event.target);
    try {
      await request(`/api/change-proposals/${proposal.id}/repository-reference`, {
        method: "POST",
        body: JSON.stringify({
          branchName: form.get("branchName"),
          pullRequestUrl: form.get("pullRequestUrl"),
          isDraft: true,
          commitSha: form.get("commitSha"),
          versionImpact: form.get("versionImpact"),
          methodologyVersion: form.get("methodologyVersion"),
          validationStatus: "passed",
          tests: String(form.get("tests") || "").split(/\r?\n/).filter(Boolean),
          decisionRecordIncluded: form.get("decisionRecordIncluded") === "on",
          changelogUpdated: form.get("changelogUpdated") === "on"
        })
      });
      await loadDecisionInbox(proposal.id);
      toast("Draft pull request recorded. A separate release decision is now required.");
    } catch (error) { toast(error.message, true); }
  }
  if (event.target.id === "implementation-receipt-form") {
    const form = new FormData(event.target);
    try {
      await request(`/api/change-proposals/${proposal.id}/implementation-receipt`, {
        method: "POST",
        body: JSON.stringify({
          pullRequestUrl: proposal.pull_request_url,
          commitSha: form.get("commitSha"),
          methodologyVersion: form.get("methodologyVersion")
        })
      });
      await loadDecisionInbox(proposal.id);
      toast("Implementation receipt recorded. Repository reindexed and feedback marked implemented.");
    } catch (error) { toast(error.message, true); }
  }
});
$("#conversation-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-conversation-id]");
  if (button) loadConversation(button.dataset.conversationId).catch((error) => toast(error.message, true));
});
$("#refresh-conversations").addEventListener("click", () => loadConversationList().catch((error) => toast(error.message, true)));
$$('[data-new-conversation]').forEach((button) => button.addEventListener("click", () => {
  state.inlineWorkHelp = null;
  createConversation().then(() => {
    switchView("conversation");
    $("#input").focus();
  }).catch((error) => toast(error.message, true));
}));
$("#steering-intake-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const intakeForm = event.currentTarget;
  const form = new FormData(intakeForm);
  const result = $("#steering-intake-result");
  result.innerHTML = "<strong>Classifying and checking the project boundary…</strong>";
  try {
    const value = await request("/api/steering/intakes", {
      method: "POST",
      body: JSON.stringify({ sourceText: form.get("sourceText") })
    });
    const intake = value.intake;
    result.innerHTML = `<strong>${escapeHtml(intake.boundary.recommendation)}</strong><p>${escapeHtml(intake.boundary.rationale)}</p><small>${escapeHtml(intake.classification.candidates.map((item) => item.classification).join(" · "))}</small>`;
    intakeForm.reset();
    await loadSteering();
  } catch (error) {
    result.innerHTML = `<strong>Classification failed.</strong><p>${escapeHtml(error.message)}</p>`;
  }
});
$("#steering-recommendations").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-steering-decision]");
  if (!button) return;
  const card = button.closest("[data-steering-intake-id]");
  const reason = card.querySelector("[data-steering-decision-reason]")?.value.trim() || "";
  try {
    await request(`/api/steering/intakes/${encodeURIComponent(card.dataset.steeringIntakeId)}/decision`, {
      method: "POST",
      body: JSON.stringify({ action: button.dataset.steeringDecision, actor: state.currentUser, reason })
    });
    await loadSteering();
    toast("Project-boundary decision retained. No build or purpose approval was created.");
  } catch (error) { toast(error.message, true); }
});
$$("[data-starter]").forEach((button) => button.addEventListener("click", () => {
  $("#input").value = button.dataset.starter;
  $("#input").focus();
}));
$$("[data-send-challenge]").forEach((button) => button.addEventListener("click", () => {
  sendChallenge(button.dataset.sendChallenge).catch((error) => toast(error.message, true));
}));
$$(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
$$("[data-route-view]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.routeView)));
for (const selector of ["#capture-work", "#capture-work-inline", "#capture-operate-record"]) {
  $(selector).addEventListener("click", openWorkCapture);
}
for (const selector of ["#work-capture-form [name=summary]", "#capture-record-type", "#capture-work-profile"]) {
  $(selector).addEventListener("input", scheduleCaptureSuggestion);
  $(selector).addEventListener("change", scheduleCaptureSuggestion);
}
$("#work-capture-form [name=title]").addEventListener("input", (event) => {
  const suggestedValue = event.currentTarget.dataset.suggestedValue || "";
  event.currentTarget.dataset.userEdited = String(Boolean(event.currentTarget.value.trim()) && event.currentTarget.value !== suggestedValue);
  scheduleCaptureSuggestion();
});
$$("[data-close-work-capture]").forEach((button) => button.addEventListener("click", () => $("#work-capture-dialog").close()));
$("#work-order").addEventListener("change", () => loadMyWork($("#work-order").value).catch((error) => toast(error.message, true)));
for (const [selector, key] of [
  ["#work-view-filter", "view"],
  ["#work-profile-filter", "profile"],
  ["#work-type-filter", "recordType"]
]) {
  $(selector).addEventListener("change", () => {
    state.workFilters[key] = $(selector).value;
    loadMyWork().catch((error) => toast(error.message, true));
  });
}
let workSearchTimer = null;
$("#work-search").addEventListener("input", () => {
  clearTimeout(workSearchTimer);
  workSearchTimer = setTimeout(() => {
    state.workFilters.search = $("#work-search").value.trim();
    loadMyWork().catch((error) => toast(error.message, true));
  }, 180);
});
$("#work-capture-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('[type="submit"]');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  data.blocking = formData.has("blocking");
  for (const key of ["impact", "urgency", "riskExposure", "controlImplication", "strategicValue"]) data[key] = Number(data[key]);
  submit.disabled = true;
  try {
    const value = await request("/api/operate/records", { method: "POST", body: JSON.stringify(data) });
    form.reset();
    form.elements.title.dataset.userEdited = "false";
    form.elements.title.dataset.suggestedValue = "";
    resetCaptureSuggestion();
    form.querySelector(".capture-optional-details").open = false;
    $("#work-capture-dialog").close();
    await Promise.all([loadOperate(), loadMyWork()]);
    switchView("my-work", true, false);
    await openWorkItem(`operate:${value.record.id}`);
    toast(`${value.message}${value.materialQuestion ? ` Next question: ${value.materialQuestion}` : ""} Priority ${value.record.priority.score}/100.`);
  } catch (error) {
    toast(error.message, true);
  } finally {
    submit.disabled = false;
  }
});
for (const selector of ["#do-next-list", "#work-inbox-list"]) {
  $(selector).addEventListener("click", (event) => {
    const item = event.target.closest("[data-work-item-id]");
    if (item) openWorkItem(item.dataset.workItemId).catch((error) => toast(error.message, true));
  });
}
for (const selector of ["#case-register", "#operate-record-list", "#improvement-register", "#change-register"]) {
  $(selector).addEventListener("click", (event) => {
    const item = event.target.closest("[data-open-operate-record]");
    if (item) openOperateRecord(item.dataset.openOperateRecord).catch((error) => toast(error.message, true));
  });
}
$("#work-detail").addEventListener("input", (event) => {
  if (event.target.matches("[data-operate-action-note]")) event.target.dataset.userEdited = "true";
});
$("#work-detail").addEventListener("change", (event) => {
  if (!event.target.matches("[data-operate-action-choice]")) return;
  const choice = event.target.value;
  $("#work-detail").querySelectorAll("[data-choice-required=true]").forEach((button) => {
    button.disabled = button.dataset.actionBlocked === "true" || !choice;
  });
  const noteInput = $("#work-detail").querySelector("[data-operate-action-note]");
  if (choice && noteInput?.dataset.userEdited !== "true") {
    const label = event.target.selectedOptions[0]?.textContent || choice;
    noteInput.value = `Selected “${label}” after reviewing the recorded evidence, options and authority boundary.`;
  }
});
$("#work-detail").addEventListener("click", async (event) => {
  const inlinePrompt = event.target.closest("[data-inline-help-prompt]");
  if (inlinePrompt && state.inlineWorkHelp?.recordId) {
    try {
      await previewAndSend(inlinePrompt.dataset.inlineHelpPrompt, {
        type: "work-item",
        recordId: state.inlineWorkHelp.recordId,
        workItemId: state.currentWorkItem?.id || null
      });
    } catch (error) {
      toast(error.message, true);
    }
    return;
  }
  const openWorkConversation = event.target.closest("[data-open-work-conversation]");
  if (openWorkConversation && state.inlineWorkHelp?.recordId) {
    renderConversation();
    switchView("conversation");
    $("#input").placeholder = `Ask about ${state.conversation?.activeRecord?.title || "the linked work"}...`;
    $("#input").focus();
    return;
  }
  const copyCodexTask = event.target.closest("[data-copy-codex-task]");
  if (copyCodexTask && state.currentOperateRecord?.codexHandoff) {
    try {
      await navigator.clipboard.writeText(state.currentOperateRecord.codexHandoff.prompt);
      toast("Complete Codex task copied.");
    } catch {
      const field = $("#work-detail").querySelector("[data-codex-task-prompt]");
      field?.select();
      document.execCommand("copy");
      toast("Complete Codex task copied.");
    }
    return;
  }
  const markCodexTask = event.target.closest("[data-mark-codex-task-sent]");
  if (markCodexTask && state.currentOperateRecord) {
    markCodexTask.disabled = true;
    try {
      const codexTaskReference = $("#work-detail").querySelector("[data-codex-task-reference]")?.value.trim() || "";
      const value = await request(`/api/operate/records/${encodeURIComponent(state.currentOperateRecord.id)}/codex-handoff`, {
        method: "POST",
        body: JSON.stringify({ codexTaskReference })
      });
      await Promise.all([loadOperate(), loadMyWork()]);
      renderWorkDetail(recordAsWorkItem(value.record), value.record);
      toast(value.message);
    } catch (error) {
      markCodexTask.disabled = false;
      toast(error.message, true);
    }
    return;
  }
  const copyBuildHandoff = event.target.closest("[data-copy-build-handoff]");
  if (copyBuildHandoff && state.selectedImplementationJob?.handoff) {
    try {
      await navigator.clipboard.writeText(state.selectedImplementationJob.handoff.prompt);
      toast("Complete Codex build task copied.");
    } catch {
      const field = $("#work-detail").querySelector("[data-build-handoff-prompt]");
      field?.select();
      document.execCommand("copy");
      toast("Complete Codex build task copied.");
    }
    return;
  }
  const markBuildSent = event.target.closest("[data-mark-build-sent]");
  if (markBuildSent && state.selectedImplementationJob) {
    markBuildSent.disabled = true;
    try {
      const jobId = state.selectedImplementationJob.id;
      const codexTaskReference = $("#work-detail").querySelector("[data-build-task-reference]")?.value.trim() || "";
      const value = await request(`/api/implementation-jobs/${encodeURIComponent(jobId)}/mark-sent`, {
        method: "POST",
        body: JSON.stringify({ codexTaskReference })
      });
      await Promise.all([loadOperate(), loadMyWork()]);
      const retained = state.myWork.items.find((item) => item.id === `implementation-job:${jobId}`);
      if (retained) renderImplementationJobDetail(retained, value.job);
      toast(value.message);
    } catch (error) {
      markBuildSent.disabled = false;
      toast(error.message, true);
    }
    return;
  }
  const copyBrief = event.target.closest("[data-copy-build-brief]");
  if (copyBrief && state.selectedImplementationJob) {
    try {
      await navigator.clipboard.writeText(state.selectedImplementationJob.briefText);
      toast("Complete Codex implementation brief copied.");
    } catch {
      const field = $("#work-detail").querySelector(".implementation-brief textarea");
      field?.select();
      document.execCommand("copy");
      toast("Complete Codex implementation brief copied.");
    }
    return;
  }
  const openImplementationJob = event.target.closest("[data-open-implementation-job]");
  if (openImplementationJob) {
    await loadMyWork();
    await openWorkItem(`implementation-job:${openImplementationJob.dataset.openImplementationJob}`);
    return;
  }
  const dailyChallenge = event.target.closest("[data-start-daily-challenge]");
  if (dailyChallenge && state.currentWorkItem?.sourceType === "daily-challenge") {
    try {
      await startDailyChallenge(state.currentWorkItem);
    } catch (error) {
      toast(error.message, true);
    }
    return;
  }
  const prepareBuild = event.target.closest("[data-prepare-build]");
  if (prepareBuild) {
    prepareBuild.disabled = true;
    try {
      const value = await request("/api/implementation-jobs", {
        method: "POST",
        body: JSON.stringify({ recordId: prepareBuild.dataset.prepareBuild })
      });
      await Promise.all([loadOperate(), loadMyWork()]);
      await openWorkItem(`implementation-job:${value.job.id}`);
      toast("Build task prepared. Copy it into Codex and record that you have started it; release remains separately controlled.");
    } catch (error) {
      prepareBuild.disabled = false;
      toast(error.message, true);
    }
    return;
  }
  const releaseAction = event.target.closest("[data-build-release-action]");
  if (releaseAction && state.selectedImplementationJob) {
    const action = releaseAction.dataset.buildReleaseAction;
    const reason = $("#work-detail").querySelector("[data-release-reason]")?.value.trim() || "";
    const confirmation = $("#work-detail").querySelector("[data-release-confirmation]")?.value.trim() || "";
    if (action === "approve" && confirmation !== "Approve release") {
      toast('Type "Approve release" exactly before authorising the reviewed commit.', true);
      return;
    }
    releaseAction.disabled = true;
    try {
      const value = await request(`/api/implementation-jobs/${encodeURIComponent(state.selectedImplementationJob.id)}/release-decision`, {
        method: "POST",
        body: JSON.stringify({ action, reason, confirmation })
      });
      await Promise.all([loadOperate(), loadMyWork()]);
      const retained = state.myWork.items.find((item) => item.id === `implementation-job:${value.job.id}`);
      if (retained) renderImplementationJobDetail(retained, value.job);
      else renderWorkDetail(null);
      toast(value.message);
    } catch (error) {
      releaseAction.disabled = false;
      toast(error.message, true);
    }
    return;
  }
  const discuss = event.target.closest("[data-discuss-operate-record]");
  if (discuss) {
    try {
      await loadConversationList();
      const recordId = discuss.dataset.discussOperateRecord;
      const recordTitle = state.currentOperateRecord?.title || state.selectedImplementationJob?.title || "Linked work";
      const existing = state.conversations.find((conversation) =>
        conversation.active_record_id === recordId && String(conversation.title).startsWith("Work · "));
      state.conversation = existing
        ? (await request(`/api/conversations/${encodeURIComponent(existing.id)}`)).conversation
        : await createConversation({
            title: `Work · ${recordTitle}`.slice(0, 120),
            workspace: state.currentOperateRecord?.workProfile === "methodology-feedback-change" ? "living-methodology" : "general-project",
            activeRecordId: recordId
          });
      state.inlineWorkHelp = {
        recordId,
        workItemId: state.currentWorkItem?.id || null,
        status: "The linked work, source and authority boundary will stay attached to the question.",
        response: null
      };
      renderConversation();
      if (state.selectedImplementationJob && state.currentWorkItem) {
        renderImplementationJobDetail(state.currentWorkItem, state.selectedImplementationJob);
      } else if (state.currentOperateRecord && state.currentWorkItem) {
        renderWorkDetail(state.currentWorkItem, state.currentOperateRecord);
      }
      $("#work-detail").querySelector("[data-inline-work-help] input")?.focus();
      toast("Oppa Mate has this exact work item and its source context. You are still in My Work.");
    } catch (error) {
      toast(error.message, true);
    }
    return;
  }
  const actionButton = event.target.closest("[data-operate-action]");
  if (actionButton) {
    const record = state.currentOperateRecord;
    const action = record?.actions?.find((item) => item.id === actionButton.dataset.operateAction);
    if (!record || !action || action.disabled) return;
    const noteInput = $("#work-detail").querySelector("[data-operate-action-note]");
    const choiceInput = $("#work-detail").querySelector("[data-operate-action-choice]");
    const choice = action.choices?.length ? choiceInput?.value || "" : "";
    if (action.choices?.length && !action.choices.some((item) => item.value === choice)) {
      toast("Choose the decision outcome first.", true);
      choiceInput?.focus();
      return;
    }
    const choiceLabel = action.choices?.find((item) => item.value === choice)?.label || "";
    let note = noteInput?.dataset.userEdited === "true" ? noteInput.value.trim() : action.suggestedNote || "";
    if (!note && choiceLabel) note = `Selected “${choiceLabel}” after reviewing the recorded evidence, options and authority boundary.`;
    if (action.noteRequired && note.length < 3) {
      toast("Record the evidence, outcome or reason before taking this action.", true);
      noteInput?.focus();
      return;
    }
    let confirmation = "";
    if (action.confirmation) {
      if (action.typedConfirmation) {
        const confirmationInput = $("#work-detail").querySelector("[data-operate-action-confirmation]");
        confirmation = confirmationInput?.value.trim() || "";
        if (confirmation !== action.confirmation) {
          toast(`Type "${action.confirmation}" exactly before taking this action.`, true);
          confirmationInput?.focus();
          return;
        }
      } else {
        confirmation = action.confirmation;
      }
    }
    actionButton.disabled = true;
    try {
      const value = await request(`/api/operate/records/${encodeURIComponent(record.id)}/actions`, {
        method: "POST",
        body: JSON.stringify({
          actionId: action.id,
          actor: state.currentUser,
          note,
          choice,
          confirmation,
          confirmationMethod: action.typedConfirmation ? "typed" : "labelled-action"
        })
      });
      await Promise.all([loadOperate(), loadMyWork()]);
      renderWorkDetail(recordAsWorkItem(value.record), value.record);
      toast(`${action.label} recorded. ${action.outcome}`);
    } catch (error) {
      actionButton.disabled = false;
      toast(error.message, true);
    }
    return;
  }
  const source = event.target.closest("[data-open-work-source]");
  if (source) {
    if (source.dataset.openWorkSource === "decisions") {
      switchView("decisions", true, false);
      await loadDecisionInbox(source.dataset.sourceId);
    } else {
      switchView(source.dataset.openWorkSource);
    }
    return;
  }
  const related = event.target.closest("[data-open-operate-record]");
  if (related) {
    await openOperateRecord(related.dataset.openOperateRecord);
    return;
  }
  const linkRecord = event.target.closest("[data-link-operate-record]");
  if (linkRecord) {
    openLinkCapture(state.currentOperateRecord);
    return;
  }
  const acceptedSuggestion = event.target.closest("[data-accept-link-suggestion]");
  if (acceptedSuggestion) {
    const suggestion = state.currentOperateRecord?.linkSuggestions?.[Number(acceptedSuggestion.dataset.acceptLinkSuggestion)];
    if (!suggestion) return;
    acceptedSuggestion.disabled = true;
    try {
      await request("/api/operate/links", {
        method: "POST",
        body: JSON.stringify({
          ...suggestion,
          actor: state.currentUser,
          proposedVia: "ai",
          confirmation: "Confirm link"
        })
      });
      const currentRecordId = state.currentOperateRecord.id;
      await Promise.all([loadOperate(), loadMyWork()]);
      await openOperateRecord(currentRecordId);
      toast("Oppa Mate's suggestion was confirmed. Both the suggestion and your confirmation are retained.");
    } catch (error) {
      acceptedSuggestion.disabled = false;
      toast(error.message, true);
    }
    return;
  }
  const rejectedLink = event.target.closest("[data-reject-operate-link]");
  if (rejectedLink) {
    const reason = rejectedLink.closest(".link-correction")?.querySelector("[data-link-rejection-reason]")?.value.trim() || "";
    if (reason.length < 3) {
      toast("Record why the relationship is wrong before rejecting it.", true);
      return;
    }
    rejectedLink.disabled = true;
    try {
      const currentRecordId = state.currentOperateRecord.id;
      await request(`/api/operate/links/${encodeURIComponent(rejectedLink.dataset.rejectOperateLink)}`, {
        method: "PATCH",
        body: JSON.stringify({ state: "rejected", actor: state.currentUser, reason })
      });
      await Promise.all([loadOperate(), loadMyWork()]);
      await openOperateRecord(currentRecordId);
      toast("Relationship rejected and retained in activity history.");
    } catch (error) {
      rejectedLink.disabled = false;
      toast(error.message, true);
    }
    return;
  }
});
$("#work-detail").addEventListener("submit", async (event) => {
  const inlineHelpForm = event.target.closest("[data-inline-work-help]");
  if (inlineHelpForm) {
    event.preventDefault();
    const question = new FormData(inlineHelpForm).get("question")?.trim() || "";
    if (!question) return toast("Ask a question about this work first.", true);
    try {
      await previewAndSend(question, {
        type: "work-item",
        recordId: inlineHelpForm.dataset.inlineWorkHelp,
        workItemId: state.currentWorkItem?.id || null
      });
    } catch (error) {
      toast(error.message, true);
    }
    return;
  }
  const codexTaskReviewForm = event.target.closest("[data-codex-task-review]");
  if (codexTaskReviewForm) {
    event.preventDefault();
    const submit = codexTaskReviewForm.querySelector('[type="submit"]');
    const outcomeText = new FormData(codexTaskReviewForm).get("outcomeText")?.trim() || "";
    submit.disabled = true;
    try {
      const value = await request(`/api/operate/records/${encodeURIComponent(codexTaskReviewForm.dataset.codexTaskReview)}/codex-review`, {
        method: "POST",
        body: JSON.stringify({ outcomeText })
      });
      await Promise.all([loadOperate(), loadMyWork()]);
      if (value.review.result === "completed") renderWorkDetail(null);
      else renderWorkDetail(recordAsWorkItem(value.record), value.record);
      toast(value.message, value.review.result === "needs-more-work");
    } catch (error) {
      submit.disabled = false;
      toast(error.message, true);
    }
    return;
  }
  const buildReturnForm = event.target.closest("[data-build-return]");
  if (buildReturnForm) {
    event.preventDefault();
    const submit = buildReturnForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const result = returnedJson(new FormData(buildReturnForm).get("outcomeText"));
      const phase = buildReturnForm.dataset.buildReturnPhase;
      const endpoint = phase === "merge" ? "merge-receipt" : "receipt";
      const value = await request(`/api/implementation-jobs/${encodeURIComponent(buildReturnForm.dataset.buildReturn)}/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(result)
      });
      await Promise.all([loadOperate(), loadMyWork()]);
      const retained = state.myWork.items.find((item) => item.id === `implementation-job:${value.job.id}`);
      if (retained) renderImplementationJobDetail(retained, value.job);
      else renderWorkDetail(null);
      toast(value.message);
    } catch (error) {
      submit.disabled = false;
      toast(error.message, true);
    }
    return;
  }
  const receiptForm = event.target.closest("[data-build-receipt]");
  const mergeForm = event.target.closest("[data-merge-receipt]");
  if (!receiptForm && !mergeForm) return;
  event.preventDefault();
  const form = receiptForm || mergeForm;
  const submit = form.querySelector('[type="submit"]');
  const values = Object.fromEntries(new FormData(form));
  const lines = (value) => String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  submit.disabled = true;
  try {
    const jobId = receiptForm ? receiptForm.dataset.buildReceipt : mergeForm.dataset.mergeReceipt;
    const endpoint = receiptForm ? "receipt" : "merge-receipt";
    const payload = receiptForm ? {
      ...values,
      filesChanged: lines(values.filesChanged),
      tests: lines(values.tests),
      validation: lines(values.validation),
      unresolvedRisks: lines(values.unresolvedRisks)
    } : values;
    const value = await request(`/api/implementation-jobs/${encodeURIComponent(jobId)}/${endpoint}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    await Promise.all([loadOperate(), loadMyWork()]);
    const retained = state.myWork.items.find((item) => item.id === `implementation-job:${value.job.id}`);
    if (retained) renderImplementationJobDetail(retained, value.job);
    else renderWorkDetail(null);
    toast(value.message);
  } catch (error) {
    submit.disabled = false;
    toast(error.message, true);
  }
});
$("#conversation-work-context").addEventListener("click", async (event) => {
  const back = event.target.closest("[data-back-to-work-item]");
  if (!back) return;
  switchView("my-work", true, false);
  const item = state.myWork?.items.find((candidate) => candidate.sourceType === "operate-record" && candidate.sourceId === back.dataset.backToWorkItem);
  if (item) await openWorkItem(item.id);
  else {
    const value = await request(`/api/operate/records/${encodeURIComponent(back.dataset.backToWorkItem)}`);
    renderWorkDetail(recordAsWorkItem(value.record), value.record);
  }
});
$$('[data-close-work-link]').forEach((button) => button.addEventListener("click", () => $("#work-link-dialog").close()));
$("#work-link-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('[type="submit"]');
  const data = Object.fromEntries(new FormData(form));
  submit.disabled = true;
  try {
    await request("/api/operate/links", {
      method: "POST",
      body: JSON.stringify({
        fromRecordId: form.dataset.fromRecordId,
        toRecordId: data.toRecordId,
        relationship: data.relationship,
        rationale: data.rationale,
        actor: state.currentUser,
        proposedVia: "human",
        confidence: 5
      })
    });
    const currentRecordId = form.dataset.fromRecordId;
    $("#work-link-dialog").close();
    await Promise.all([loadOperate(), loadMyWork()]);
    await openOperateRecord(currentRecordId);
    toast("Relationship confirmed and added to the operational graph.");
  } catch (error) {
    toast(error.message, true);
  } finally {
    submit.disabled = false;
  }
});
$("#brand-review-grid").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-brand-review-action]");
  if (!button) return;
  const card = button.closest("[data-brand-review-item]");
  const note = card.querySelector("[data-brand-review-note]").value.trim();
  card.querySelectorAll("button").forEach((item) => { item.disabled = true; });
  try {
    const value = await request("/api/brand-review", {
      method: "POST",
      body: JSON.stringify({
        itemId: card.dataset.brandReviewItem,
        action: button.dataset.brandReviewAction,
        reason: note
      })
    });
    renderBrandReview(value.review);
    toast(value.message);
  } catch (error) {
    card.querySelectorAll("button").forEach((item) => { item.disabled = false; });
    toast(error.message, true);
  }
});
$$("[data-open-guide]").forEach((button) => button.addEventListener("click", () => switchView("guide")));
$("#details-button").addEventListener("click", () => {
  const panel = $("#context-panel");
  panel.hidden = !panel.hidden;
  $("#conversation-view").classList.toggle("show-context", !panel.hidden);
  $("#details-button").setAttribute("aria-expanded", String(!panel.hidden));
  $("#details-button").textContent = panel.hidden ? "Technical details" : "Hide details";
});
window.addEventListener("hashchange", () => {
  const requestedView = location.hash.slice(1);
  switchView(validViews.has(requestedView) ? requestedView : "my-work", false);
});
$("#workspace").addEventListener("change", () => {
  $("#workspace-label").textContent = $("#workspace").selectedOptions[0].textContent;
});
$("#settings-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  for (const key of ["monthlySoftBudget", "monthlyHardBudget", "perRequestWarningThreshold", "perRequestHardCeiling", "maximumRetrievedContext"]) data[key] = Number(data[key]);
  data.advancedReasoningEnabled = event.target.advancedReasoningEnabled.checked;
  try {
    state.settings = (await request("/api/settings", { method: "PATCH", body: JSON.stringify(data) })).settings;
    toast("Local spending and routing controls saved.");
  } catch (error) { toast(error.message, true); }
});
$("#confluence-form").addEventListener("submit", testConfluence);
$("#save-confluence").addEventListener("click", saveConfluence);
$("#verify-confluence").addEventListener("click", verifyConfluence);
$("#sync-confluence").addEventListener("click", synchroniseConfluence);
$("#remove-confluence").addEventListener("click", removeConfluence);
$("#preview-confluence-publication").addEventListener("click", () => previewConfluencePublication("controlled-mirror"));
$("#preview-methodology-lab").addEventListener("click", () => previewConfluencePublication("methodology-lab-pilot"));
$("#confluence-publication-approval").addEventListener("submit", publishConfluenceDocumentation);
$("#confluence-publication-plan").addEventListener("click", (event) => {
  const button = event.target.closest("[data-reapply-conflict]");
  if (button) reapplyGitCopyAfterConflict(button.dataset.reapplyConflict);
});
$("#export-button").addEventListener("click", async () => {
  if (!state.conversation) return toast("There is no conversation to export.", true);
  const value = await request("/api/export", {
    method: "POST",
    body: JSON.stringify({ conversationId: state.conversation.id, format: "markdown" })
  });
  const blob = new Blob([value.markdown], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${state.conversation.title.replace(/\W+/g, "-").toLowerCase() || "conversation"}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
});
$("#attach").addEventListener("click", () => $("#file-input").click());
$("#file-input").addEventListener("change", async () => {
  const file = $("#file-input").files[0];
  if (!file) return;
  try { await attachFile(file); } catch (error) { toast(error.message, true); }
  finally { $("#file-input").value = ""; }
});
$("#attachment-name").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-attachment]");
  if (!button) return;
  state.attachments = state.attachments.filter((item) => item.id !== button.dataset.removeAttachment);
  renderAttachments();
});
function recordingDetail(recording, error) {
  const duration = Math.max(0, Math.round(Number(recording?.durationMs || 0) / 1000));
  const size = window.WorkbenchVoice?.formatRecordingSize(recording?.blob?.size || 0) || `${recording?.blob?.size || 0} bytes`;
  const format = recording?.mimeType || "not reported by the browser";
  const signal = recording?.soundDetected === true
    ? "Sound level detected"
    : recording?.soundDetected === false ? "Little or no sound level detected" : "Sound level unavailable";
  const code = error?.value?.code || error?.code || "TRANSCRIPTION_FAILED";
  return `Length ${duration}s · ${size} · ${format} · ${signal} · reference ${code}`;
}

function showVoiceRecovery(error, recording, { retryable = Boolean(recording?.blob?.size) } = {}) {
  const value = error?.value || {};
  const code = value.code || error?.code || "TRANSCRIPTION_FAILED";
  let title = "Your recording is still available";
  let message = value.error || error?.message || "Transcription did not complete.";
  if (error?.name === "TypeError" || code === "WORKBENCH_UNREACHABLE") {
    title = "The Workbench connection was interrupted";
    message = "The recording stayed on this phone. Check that the computer and Workbench are running, then retry transcription.";
  } else if (code === "NO_AUDIO_RECEIVED") {
    title = "No usable audio was captured";
    message = "Check the phone’s microphone permission and watch the sound-level bar while speaking, then record again.";
  } else if (code === "NO_SPEECH_DETECTED") {
    title = "No clear speech was detected";
    message = "The phone produced an audio file, but no words were detected. Check the sound-level bar, then record again or retry once.";
  } else if (code === "UNSUPPORTED_AUDIO_FORMAT") {
    title = "This recording format was not recognised";
    message = "The audio is still available in this tab. Update or reopen Chrome on the phone, then retry or record again.";
  }
  state.pendingRecording = retryable ? recording : null;
  $("#voice-recovery-title").textContent = title;
  $("#voice-recovery-message").textContent = message;
  $("#voice-recovery-details").textContent = recordingDetail(recording, error);
  $("#retry-transcription").hidden = !retryable;
  $("#retry-transcription").disabled = false;
  $("#voice-recovery").hidden = false;
  $("#record").disabled = true;
  $("#voice-recovery").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearVoiceRecovery({ discardAudio = false } = {}) {
  if (discardAudio) state.pendingRecording = null;
  $("#voice-recovery").hidden = true;
  $("#retry-transcription").disabled = false;
  $("#record").disabled = !state.apiConfigured;
}

function startRecordingMonitor(stream) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    const context = new AudioContextClass();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    const monitor = { analyser, context, source, samples, frameId: null, peakLevel: 0, sampledFrames: 0 };
    const sample = () => {
      analyser.getByteTimeDomainData(samples);
      let squareSum = 0;
      for (const value of samples) {
        const centred = (value - 128) / 128;
        squareSum += centred * centred;
      }
      const level = Math.min(1, Math.sqrt(squareSum / samples.length) * 5);
      monitor.peakLevel = Math.max(monitor.peakLevel, level);
      monitor.sampledFrames += 1;
      $("#recording-level").style.width = `${Math.max(3, Math.round(level * 100))}%`;
      monitor.frameId = requestAnimationFrame(sample);
    };
    Promise.resolve(context.resume?.()).catch(() => {});
    monitor.frameId = requestAnimationFrame(sample);
    return monitor;
  } catch {
    return null;
  }
}

async function stopRecordingMonitor() {
  const monitor = state.recordingMonitor;
  state.recordingMonitor = null;
  if (!monitor) return { soundDetected: null, peakLevel: null };
  cancelAnimationFrame(monitor.frameId);
  try { monitor.source.disconnect(); } catch {}
  try { await monitor.context.close(); } catch {}
  $("#recording-level").style.width = "3%";
  return {
    soundDetected: monitor.sampledFrames ? monitor.peakLevel >= 0.025 : null,
    peakLevel: monitor.sampledFrames ? monitor.peakLevel : null
  };
}

async function transcribeRecording(recording = state.pendingRecording) {
  if (!recording?.blob?.size) {
    showVoiceRecovery(Object.assign(new Error("No audio was received."), { code: "NO_AUDIO_RECEIVED" }), recording, { retryable: false });
    return false;
  }
  state.pendingRecording = recording;
  $("#voice-recovery").hidden = true;
  $("#record").disabled = true;
  $("#record").textContent = "Transcribing...";
  $("#retry-transcription").disabled = true;
  setProcessing(true, "Transcribing your recording", "The recording is safely held in this browser tab while it is converted to editable text...");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  try {
    const response = await fetch("/api/audio/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": recording.mimeType || recording.blob.type || "application/octet-stream",
        "X-Recording-Duration-Ms": String(Math.max(0, Math.round(recording.durationMs || 0))),
        "X-Recording-Sound-Detected": recording.soundDetected === null ? "unknown" : String(Boolean(recording.soundDetected))
      },
      body: recording.blob,
      signal: controller.signal
    });
    const value = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(value.error || "Transcription did not complete."), { status: response.status, value });
    const transcript = String(value.transcript || "").trim();
    if (!transcript) throw Object.assign(new Error("No clear speech was detected."), { value: { code: "NO_SPEECH_DETECTED" } });
    state.capture = { originalText: transcript, workingText: transcript, language: value.language, translated: false };
    state.pendingRecording = null;
    $("#transcript").value = transcript;
    $("#translation").value = "";
    $("#translation-field").hidden = true;
    $("#language-label").textContent = `Detected language: ${value.language}`;
    $("#capture-review").hidden = false;
    clearVoiceRecovery();
    toast("Transcription complete. Review it before using it.");
    return true;
  } catch (error) {
    if (error.name === "AbortError") {
      error = Object.assign(new Error("Transcription took too long to respond. Your recording is still available to retry."), { code: "TRANSCRIPTION_TIMEOUT" });
    }
    showVoiceRecovery(error, recording);
    toast("Transcription did not complete. Your recording has not been lost.", true);
    return false;
  } finally {
    clearTimeout(timeout);
    setProcessing(false);
    $("#record").disabled = !state.apiConfigured || Boolean(state.pendingRecording);
    $("#record").textContent = "Record";
    $("#record").setAttribute("aria-label", "Start voice recording");
  }
}

function stopRecording() {
  if (state.recording?.state === "recording") {
    $("#record").disabled = true;
    $("#record").textContent = "Stopping...";
    try { state.recording.requestData(); } catch {}
    state.recording.stop();
  }
}

function updateRecordingClock() {
  const elapsed = Math.max(0, Math.floor((Date.now() - state.recordingStartedAt) / 1000));
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  $("#recording-time").textContent = `${minutes}:${seconds}`;
}

$("#record").addEventListener("click", async () => {
  if (!state.apiConfigured) return toast("Configure an OpenAI API key to enable voice.", true);
  if (state.recording?.state === "recording") return stopRecording();
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast("This browser does not support microphone recording.", true);
  try {
    clearVoiceRecovery({ discardAudio: true });
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) {
      stream.getTracks().forEach((track) => track.stop());
      throw Object.assign(new Error("The browser did not provide a microphone audio track."), { code: "NO_AUDIO_TRACK" });
    }
    const preferredMimeType = window.WorkbenchVoice?.selectRecorderMimeType(window.MediaRecorder) || "";
    let recorder;
    try {
      recorder = preferredMimeType ? new MediaRecorder(stream, { mimeType: preferredMimeType }) : new MediaRecorder(stream);
    } catch {
      recorder = new MediaRecorder(stream);
    }
    state.recording = recorder;
    state.recordingStream = stream;
    state.recordingChunks = [];
    state.recordingError = null;
    state.recordingMonitor = startRecordingMonitor(stream);
    $("#recording-device").textContent = `${audioTrack.label || "Phone microphone"} connected. Speak now, then select Stop.`;
    audioTrack.onmute = () => { $("#recording-device").textContent = "The microphone stopped sending audio. Check the phone permission or another app using it."; };
    audioTrack.onunmute = () => { $("#recording-device").textContent = `${audioTrack.label || "Phone microphone"} connected. Speak now, then select Stop.`; };
    recorder.ondataavailable = (event) => { if (event.data.size) state.recordingChunks.push(event.data); };
    recorder.onerror = (event) => {
      state.recordingError = Object.assign(new Error(event.error?.message || "The phone stopped recording unexpectedly."), { code: "RECORDER_ERROR" });
    };
    recorder.onstop = async () => {
      clearTimeout(state.recordingTimer);
      clearInterval(state.recordingClock);
      const durationMs = Math.max(0, Date.now() - state.recordingStartedAt);
      const signal = await stopRecordingMonitor();
      audioTrack.onmute = null;
      audioTrack.onunmute = null;
      stream.getTracks().forEach((track) => track.stop());
      $("#recording-status").hidden = true;
      $("#record").classList.remove("recording");
      $("#record").textContent = "Record";
      $("#record").disabled = false;
      $("#record").setAttribute("aria-label", "Start voice recording");
      const mimeType = recorder.mimeType || state.recordingChunks.find((chunk) => chunk.type)?.type || preferredMimeType || "application/octet-stream";
      const blob = new Blob(state.recordingChunks, { type: mimeType });
      const recording = { blob, durationMs, mimeType, soundDetected: signal.soundDetected, peakLevel: signal.peakLevel };
      const recordingError = state.recordingError;
      state.recording = null;
      state.recordingStream = null;
      state.recordingChunks = [];
      state.recordingStartedAt = null;
      state.recordingError = null;
      if (blob.size < 256) {
        showVoiceRecovery(Object.assign(new Error("The phone created an empty recording."), { code: "NO_AUDIO_RECEIVED" }), recording, { retryable: false });
        return;
      }
      state.pendingRecording = recording;
      if (recordingError) {
        showVoiceRecovery(recordingError, recording);
        return;
      }
      await transcribeRecording(recording);
    };
    try { recorder.start(1000); } catch { recorder.start(); }
    state.recordingStartedAt = Date.now();
    $("#recording-time").textContent = "00:00";
    $("#recording-status").hidden = false;
    state.recordingClock = setInterval(updateRecordingClock, 250);
    $("#record").classList.add("recording");
    $("#record").textContent = "Stop recording";
    $("#record").setAttribute("aria-label", "Stop voice recording");
    state.recordingTimer = setTimeout(stopRecording, state.settings.maximumAudioDuration * 1000);
    toast("Recording. Press Stop when you have finished.");
  } catch (error) {
    await stopRecordingMonitor();
    state.recordingStream?.getTracks().forEach((track) => track.stop());
    state.recording = null;
    state.recordingStream = null;
    state.recordingChunks = [];
    state.recordingStartedAt = null;
    $("#recording-status").hidden = true;
    $("#record").classList.remove("recording");
    $("#record").disabled = !state.apiConfigured;
    $("#record").textContent = "Record";
    const message = error.name === "NotAllowedError"
      ? "Microphone access was not granted. Allow it in the phone browser’s site settings, then try again."
      : error.name === "NotReadableError"
        ? "The microphone is being used by another app or is unavailable. Close the other recording app and try again."
        : error.message;
    toast(message, true);
  }
});
$("#retry-transcription").addEventListener("click", () => transcribeRecording());
$("#discard-recording").addEventListener("click", () => {
  clearVoiceRecovery({ discardAudio: true });
  toast("Temporary recording discarded. You can record again.");
});
$("#translate-transcript").addEventListener("click", async () => {
  const originalText = $("#transcript").value.trim();
  if (!originalText) return toast("There is no transcript to translate.", true);
  const button = $("#translate-transcript");
  button.disabled = true;
  button.textContent = "Translating...";
  try {
    const value = await request("/api/text/translate", { method: "POST", body: JSON.stringify({ text: originalText, targetLanguage: "English" }) });
    $("#translation").value = value.translatedText;
    $("#translation-field").hidden = false;
    state.capture = { originalText, workingText: value.translatedText, language: state.capture?.language || "Undetermined", translated: true };
    toast("English working translation created. Review it before use.");
  } catch (error) { toast(error.message, true); }
  finally { button.disabled = false; button.textContent = "Translate to English"; }
});
$("#discard-transcript").addEventListener("click", () => {
  $("#capture-review").hidden = true;
  $("#transcript").value = "";
  $("#translation").value = "";
  $("#translation-field").hidden = true;
  state.capture = null;
});
$("#use-transcript").addEventListener("click", () => {
  const originalText = $("#transcript").value.trim();
  const translatedText = $("#translation-field").hidden ? "" : $("#translation").value.trim();
  if (!originalText) return toast("Review or enter the transcript first.", true);
  state.capture = {
    originalText,
    workingText: translatedText || originalText,
    language: state.capture?.language || "Undetermined",
    translated: Boolean(translatedText)
  };
  $("#input").value = state.capture.workingText;
  $("#capture-review").hidden = true;
  $("#input").focus();
  toast("Reviewed voice text is ready to send.");
});

init().catch((error) => toast(error.message, true));
