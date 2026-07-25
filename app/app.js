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
  proposals: [],
  selectedProposalId: null,
  currentUser: "Jamie Peppard",
  repositoryMode: "manual",
  capture: null,
  confluence: null,
  confluenceTest: null,
  confluencePublicationPlan: null,
  brandReview: null,
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

async function ensureConversation() {
  if (state.conversation) return state.conversation;
  const value = await request("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ workspace: $("#workspace").value, title: "New conversation" })
  });
  state.conversation = value.conversation;
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
  ["useful", "Helpful"],
  ["correct-interpretation", "You understood me"],
  ["needs-clarification", "You misunderstood me"],
  ["challenge-conclusion", "I disagree"],
  ["add-evidence", "I have more information"],
  ["record-methodology-feedback", "Suggest a change to the method"]
];

const challengePrompts = {
  balanced: "Send me one useful challenge about the Operations Automated methodology. Choose the unresolved tension with the greatest decision value. Begin with a concrete situation, briefly give the strongest provisional Operations Automated response, say what you question in that response, and ask me one primary plain-language question. Do not give me a questionnaire. Treat my answer as evidence, not approval.",
  principles: "Challenge one Operations Automated principle with a concrete situation where two reasonable principles, values or stakeholder needs conflict. Briefly give the strongest provisional response, identify what remains uncertain, and ask me one primary plain-language question. Do not give me a questionnaire. Treat my answer as evidence, not approval.",
  "ai-suitability": "Challenge whether the Operations Automated methodology is genuinely suitable for AI to interpret and apply. Use a concrete situation where machine-readable guidance, human-readable meaning, evidence, judgement and authority could diverge. Briefly give the strongest provisional response, identify what remains uncertain, and ask me one primary plain-language question. Treat my answer as evidence, not approval.",
  "manual-work": "Challenge how Operations Automated decides that work should remain manual. Use a concrete situation involving human judgement, facilitation, empathy, tacit knowledge or physical work that cannot responsibly be automated yet. Briefly give the strongest provisional response, identify what further thinking is needed, and ask me one primary plain-language question. Treat my answer as evidence, not approval.",
  "delivery-capability": "Challenge how Operations Automated should work with development teams while building lasting internal capability. Use a concrete situation involving product ownership, technical delivery, knowledge transfer and the organisation's ability to operate the result. Briefly give the strongest provisional response, identify what remains uncertain, and ask me one primary plain-language question. Treat my answer as evidence, not approval."
};

function feedbackControls(messageId) {
  return `<details class="feedback-panel" data-message="${messageId}">
    <summary>Was this useful?</summary>
    <p>Save a private reaction so it is not lost. Nothing changes automatically.</p>
    <div class="feedback-controls">
      ${feedbackOptions.map(([value, label]) => `<button data-feedback="${value}">${label}</button>`).join("")}
    </div>
  </details>`;
}

function userFacingAnswer(value) {
  let text = String(value || "");
  for (const heading of ["Current understanding", "What the controlled material supports", "Sources used", "Uncertainty and control"]) {
    text = text.replace(new RegExp(`\\n?### ${heading}\\s*[\\s\\S]*?(?=\\n### |\\n## |$)`, "gi"), "");
  }
  return text
    .replace(/^## (?:Repository-grounded answer|Detailed grounded analysis|Concise grounded summary)\s*/i, "")
    .replace(/_\[[^\]]+\.(?:md|markdown|txt|json|csv)\]_/gi, "")
    .replace(/`[^`\n]*\.(?:md|markdown|txt|json|csv)`/gi, "the internal guidance")
    .replace(/### Recommended next action/gi, "## What to do next")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function technicalDetails(message, sources) {
  const uniqueSources = [...new Map(sources.map((source) => [`${source.path}:${source.hash}`, source])).values()];
  const execution = message.metadata?.localSynthesis ? "Local fallback" : "Connected AI";
  if (!uniqueSources.length && !message.metadata) return "";
  return `<details class="answer-details">
    <summary>Behind this answer</summary>
    <div class="answer-detail-grid">
      <div><span>Answer method</span><strong>${execution}</strong></div>
      <div><span>Internal references</span><strong>${uniqueSources.length}</strong></div>
    </div>
    ${uniqueSources.length ? `<ul>${uniqueSources.map((source) => `<li><span>${escapeHtml(source.path)}</span><em class="${source.status === "approved" ? "approved" : "proposed"}">${escapeHtml(source.status)}</em></li>`).join("")}</ul>` : "<p>No internal reference was attached to this answer.</p>"}
  </details>`;
}

function renderConversation() {
  const messages = state.conversation?.messages || [];
  $("#welcome").hidden = messages.length > 0;
  $("#conversation-title").textContent = state.conversation?.title || "New conversation";
  $("#messages").innerHTML = messages.map((message) => {
    const sources = message.metadata?.sources || [];
    return `<article class="message ${message.role}">
      <div class="message-role">${message.role === "user" ? "You" : "OA"}</div>
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

async function previewAndSend(text) {
  setProcessing(true, "Preparing your request", "Selecting repository evidence and checking cost controls...");
  $(".send-button").disabled = true;
  try {
    const conversation = await ensureConversation();
    const payload = {
      conversationId: conversation.id,
      text,
      workspace: $("#workspace").value,
      outputType: $("#output-type").value,
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

async function sendChallenge(focus = "balanced") {
  const prompt = challengePrompts[focus] || challengePrompts.balanced;
  switchView("conversation");
  $("#workspace").value = "living-methodology";
  $("#workspace-label").textContent = "Living methodology";
  $("#output-type").value = "analysis";
  $("#input").value = prompt;
  await previewAndSend(prompt);
}

async function sendPending() {
  const payload = { ...state.pending, confirmed: true };
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
    setProcessing(true, "AI response in progress", "The model is reasoning over the selected evidence. This can take a little while...");
    const result = await request("/api/respond", { method: "POST", body: JSON.stringify(payload) });
    setProcessing(true, "Response received", "Saving the result and updating usage records...");
    state.conversation = (await request(`/api/conversations/${state.conversation.id}`)).conversation;
    renderConversation();
    toast(result.usage.status === "offline"
      ? "Grounded local response completed. No API call or cost."
      : "Provider response completed and usage recorded.");
    state.capture = null;
    state.attachments = [];
    renderAttachments();
  } catch (error) {
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
  await request("/api/feedback", {
    method: "POST",
    body: JSON.stringify({
      conversationId: state.conversation.id,
      messageId: container.dataset.message,
      disposition,
      wording
    })
  });
  button.classList.add("selected");
  toast("Saved under Saved feedback. Nothing else changes automatically.");
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
      return `<article class="record-card">
        <div><strong>${escapeHtml(title)}</strong><span class="status-pill status-${escapeHtml(item.status)}">${escapeHtml(statusLabel(item.status))}</span></div>
        <small>${escapeHtml(explanation)}</small>
        <blockquote>${escapeHtml(item.original_wording || item.wording || "No additional wording")}</blockquote>
        <dl class="feedback-meta">
          <div><dt>Submitted by</dt><dd>${escapeHtml(item.submitting_user || "Jamie Peppard")}</dd></div>
          <div><dt>Workspace</dt><dd>${escapeHtml(item.affected_workspace || "General project")}</dd></div>
          <div><dt>Created</dt><dd>${escapeHtml(formatDate(item.created_at))}</dd></div>
          <div><dt>Conversation</dt><dd>${escapeHtml(item.conversation_title || "Conversation")}</dd></div>
        </dl>
        <label class="classification-field">How should this feedback be used?
          <select data-feedback-classification="${item.id}">
            ${classificationOptions(item.classification)}
          </select>
        </label>
        <p class="classification-note">Classification organises the feedback. It does not approve anything.</p>
        <div class="record-actions">
          <button data-open-conversation="${item.conversation_id}" class="ghost">Open conversation</button>
          <button data-save-classification="${item.id}" class="ghost">Save classification</button>
          ${canPropose ? `<button data-create-proposal="${item.id}" class="primary">Create change proposal</button>` : ""}
        </div>
      </article>`;
    }).join("")
    : '<div class="empty-records"><strong>You have not saved any feedback yet.</strong><p>Open “Was this useful?” beneath an answer if you want to keep a reaction or correction.</p></div>';
}

const classifications = [
  ["answer-only-correction", "Answer-only correction"],
  ["conversation-context", "Conversation context"],
  ["reusable-project-memory", "Reusable project memory"],
  ["evidence-submission", "Evidence submission"],
  ["methodology-change-candidate", "Methodology change candidate"],
  ["product-change-candidate", "Product change candidate"],
  ["no-action-required", "No action required"]
];

const statusLabels = {
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
  if (proposal.status === "approved-for-preparation") return "Preparation is authorised. Start the bounded implementation handoff when you are ready.";
  if (proposal.status === "implementation-in-progress") return "Review the implementation evidence and record its draft pull request before release review.";
  if (proposal.status === "awaiting-release-approval") return "This is the separate release decision. Review the draft and choose whether it may merge.";
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
  if (!proposal.pull_request_url) {
    return `<div class="github-link-pending"><strong>GitHub review link</strong><span>The exact draft link will appear here as soon as implementation preparation is recorded.</span></div>`;
  }
  return `<a class="github-review-link" href="${escapeHtml(proposal.pull_request_url)}" target="_blank" rel="noreferrer">
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
      <strong>Preparation is authorised. Release is not.</strong>
      <p>The bounded instruction is ready for Codex or the repository integration.</p>
      <button class="primary" data-start-handoff>Start implementation handoff</button>
    </div>`;
  }
  if (proposal.status === "implementation-in-progress") {
    return `<form class="repository-form" id="repository-reference-form">
      <h3>Record the draft pull request</h3>
      <p>The branch must not be main. The pull request must remain a draft.</p>
      <label>Branch name<input name="branchName" required placeholder="codex/bounded-change"></label>
      <label>Draft pull request URL<input name="pullRequestUrl" type="url" required placeholder="https://github.com/.../pull/123"></label>
      <label>Implementation commit<input name="commitSha" required placeholder="7–40 character commit SHA"></label>
      <label>Version impact<input name="versionImpact" required placeholder="Workbench minor version; methodology unchanged"></label>
      <label>Methodology version, if affected<input name="methodologyVersion" placeholder="0.5"></label>
      <label>Validation summary<textarea name="tests" rows="3" required placeholder="Tests run and results"></textarea></label>
      <label class="check-label"><input name="decisionRecordIncluded" type="checkbox" required> Decision record included</label>
      <label class="check-label"><input name="changelogUpdated" type="checkbox" required> Changelog updated</label>
      <button class="primary" type="submit">Record preparation for release review</button>
    </form>`;
  }
  if (proposal.status === "awaiting-release-approval") {
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
    ${proposal.pull_request_url ? `<div class="repository-references"><strong>Draft pull request prepared</strong><a href="${escapeHtml(proposal.pull_request_url)}" target="_blank" rel="noreferrer">${escapeHtml(proposal.pull_request_url)}</a><span>Branch: ${escapeHtml(proposal.branch_name)}</span><span>Commit: ${escapeHtml(proposal.implementation_commit_sha)}</span></div>` : ""}
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

function brandPreviewMarkup(item) {
  if (item.preview === "mark") return `
    <div class="brand-preview brand-preview-mark" data-oa-theme="dark">
      <img src="/brand-system/assets/logo/generated/mark-colour-transparent-1024.png" alt="Continuous Operations Automated OA loop">
      <span class="oa-wordmark"><small>Operations</small><strong>Automated</strong></span>
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
      <p>Clear operational thinking, expressed in useful language.</p>
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
  $("#brand-review-progress").textContent = `${latest.size} of ${value.items.length} reviewed`;
  $("#brand-adoption-list").innerHTML = value.adoption.surfaces.map((surface) => `
    <article>
      <div><strong>${escapeHtml(surface.name)}</strong><small>${escapeHtml(surface.path)}</small></div>
      <span class="adoption-status adoption-${escapeHtml(surface.status)}">${escapeHtml(surface.status.replaceAll("-", " "))}</span>
      <p>${escapeHtml(surface.nextGate)}</p>
    </article>
  `).join("");
  $("#brand-review-grid").innerHTML = value.items.map((item) => {
    const decision = latest.get(item.id);
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

const validViews = new Set(["conversation", "challenges", "feedback", "decisions", "brand", "usage", "settings", "connections", "guide"]);

function switchView(name, updateHash = true) {
  if (!validViews.has(name)) return;
  $$(".view").forEach((view) => { view.hidden = view.id !== `${name}-view`; });
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === name));
  $("#details-button").hidden = name !== "conversation";
  if (updateHash) history.replaceState(null, "", name === "conversation" ? `${location.pathname}${location.search}` : `#${name}`);
  if (name === "usage") loadUsage().catch((error) => toast(error.message, true));
  if (name === "feedback") loadFeedback().catch((error) => toast(error.message, true));
  if (name === "decisions") loadDecisionInbox().catch((error) => toast(error.message, true));
  if (name === "brand") loadBrandReview().catch((error) => toast(error.message, true));
  if (name === "connections") loadConnections().catch((error) => toast(error.message, true));
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
    <strong>${plan.items.length} controlled pages reviewed against Confluence.</strong>
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
    ${groups.map(([role, label]) => {
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
          ${lifecycleGroups.map(([lifecycle, lifecycleLabel]) => {
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
    <p class="confirmation-phrase">Required confirmation: <strong>${escapeHtml(plan.confirmationPhrase)}</strong></p>`;
  form.hidden = !plan.publishable;
  form.reset();
  form.actor.value = "Jamie Peppard";
  form.confirmation.placeholder = plan.confirmationPhrase;
}

async function previewConfluencePublication() {
  const button = $("#preview-confluence-publication");
  button.disabled = true;
  button.textContent = "Comparing repository and Confluence…";
  try {
    const result = await request("/api/connections/confluence/publication-plan", {
      method: "POST",
      body: "{}"
    });
    renderConfluencePublicationPlan(result.plan);
    toast("Publication preview ready. No Confluence page was changed.");
  } catch (error) {
    $("#confluence-publication-status").className = "publication-status error";
    $("#confluence-publication-status").innerHTML = `<strong>The documentation preview could not be prepared.</strong><p>${escapeHtml(error.message)}</p>`;
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Preview documentation update";
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
    toast("Reviewed methodology documentation published to Confluence.");
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
  await loadConversationList();
  if (state.conversations[0]) state.conversation = (await request(`/api/conversations/${state.conversations[0].id}`)).conversation;
  renderConversation();
  const requestedView = location.hash.slice(1);
  switchView(validViews.has(requestedView) ? requestedView : "conversation", false);
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
      await request(`/api/feedback/${id}/classification`, {
        method: "PATCH",
        body: JSON.stringify({ classification: select.value })
      });
      await loadFeedback();
      toast("Classification saved. No approval was created.");
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
      toast("Change proposal created for human review. Nothing was approved or changed.");
    } catch (error) { toast(error.message, true); }
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
      toast(result.manualMergeRequired
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
$$("[data-starter]").forEach((button) => button.addEventListener("click", () => {
  $("#input").value = button.dataset.starter;
  $("#input").focus();
}));
$$("[data-send-challenge]").forEach((button) => button.addEventListener("click", () => {
  sendChallenge(button.dataset.sendChallenge).catch((error) => toast(error.message, true));
}));
$$(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
$$("[data-route-view]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.routeView)));
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
  switchView(validViews.has(requestedView) ? requestedView : "conversation", false);
});
$("#new-conversation").addEventListener("click", async () => {
  state.conversation = null;
  state.attachments = [];
  await ensureConversation();
  renderAttachments();
  renderConversation();
  switchView("conversation");
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
$("#preview-confluence-publication").addEventListener("click", previewConfluencePublication);
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
async function transcribeRecording(blob) {
  $("#record").disabled = true;
  $("#record").textContent = "Transcribing...";
  setProcessing(true, "Transcribing your recording", "Audio is being converted to editable text. It is not being reasoned over yet...");
  try {
    const response = await fetch("/api/audio/transcribe", {
      method: "POST",
      headers: { "Content-Type": blob.type || "audio/webm" },
      body: blob
    });
    const value = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(value.error || "Transcription failed.");
    state.capture = { originalText: value.transcript, workingText: value.transcript, language: value.language, translated: false };
    $("#transcript").value = value.transcript;
    $("#translation").value = "";
    $("#translation-field").hidden = true;
    $("#language-label").textContent = `Detected language: ${value.language}`;
    $("#capture-review").hidden = false;
    toast("Transcription complete. Review it before using it.");
  } finally {
    setProcessing(false);
    $("#record").disabled = !state.apiConfigured;
    $("#record").textContent = "Record";
    $("#record").setAttribute("aria-label", "Start voice recording");
  }
}

function stopRecording() {
  if (state.recording?.state === "recording") {
    $("#record").disabled = true;
    $("#record").textContent = "Stopping...";
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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    state.recording = recorder;
    state.recordingStream = stream;
    state.recordingChunks = [];
    recorder.ondataavailable = (event) => { if (event.data.size) state.recordingChunks.push(event.data); };
    recorder.onstop = async () => {
      clearTimeout(state.recordingTimer);
      clearInterval(state.recordingClock);
      stream.getTracks().forEach((track) => track.stop());
      $("#recording-status").hidden = true;
      $("#record").classList.remove("recording");
      $("#record").textContent = "Record";
      $("#record").disabled = false;
      $("#record").setAttribute("aria-label", "Start voice recording");
      const blob = new Blob(state.recordingChunks, { type: recorder.mimeType || "audio/webm" });
      state.recording = null;
      state.recordingStream = null;
      state.recordingChunks = [];
      state.recordingStartedAt = null;
      try { await transcribeRecording(blob); } catch (error) { toast(error.message, true); }
    };
    recorder.start();
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
    toast(error.name === "NotAllowedError" ? "Microphone access was not granted." : error.message, true);
  }
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
