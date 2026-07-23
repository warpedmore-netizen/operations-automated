const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = { conversation: null, preview: null, pending: null, settings: null, apiConfigured: false, attachment: null, recording: null };

async function request(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const value = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(value.error || "Request failed."), { status: response.status, value });
  return value;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function markdown(value) {
  return escapeHtml(value).replace(/^### (.+)$/gm, "<h4>$1</h4>").replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>").replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");
}

function toast(message, error = false) {
  const element = $("#toast"); element.textContent = message; element.classList.toggle("error", error); element.classList.add("visible");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove("visible"), 3000);
}

async function ensureConversation() {
  if (state.conversation) return state.conversation;
  const value = await request("/api/conversations", { method: "POST", body: JSON.stringify({ workspace: $("#workspace").value, title: "New conversation" }) });
  state.conversation = value.conversation; return state.conversation;
}

function renderConversation() {
  const messages = state.conversation?.messages || [];
  $("#welcome").hidden = messages.length > 0;
  $("#conversation-title").textContent = state.conversation?.title || "New conversation";
  $("#messages").innerHTML = messages.map((message) => {
    const sources = message.metadata?.sources || [];
    return `<article class="message ${message.role}">
      <div class="message-role">${message.role === "user" ? "You" : "OA"}</div>
      <div class="message-body">${message.role === "assistant" ? markdown(message.working_text) : `<p>${escapeHtml(message.working_text)}</p>`}
      ${sources.length ? `<details><summary>${sources.length} repository source${sources.length === 1 ? "" : "s"}</summary>${sources.map((s) => `<p><code>${escapeHtml(s.path)}</code> · ${escapeHtml(s.status)}</p>`).join("")}</details>` : ""}
      ${message.role === "assistant" ? feedbackControls(message.id) : ""}</div></article>`;
  }).join("");
  $("#messages").scrollTop = $("#messages").scrollHeight;
}

function feedbackControls(messageId) {
  return `<div class="feedback-controls" data-message="${messageId}">
    ${["Useful", "Correct interpretation", "Challenge conclusion", "Add evidence", "Needs clarification", "Record methodology feedback"].map((label) => `<button data-feedback="${label.toLowerCase().replaceAll(" ", "-")}">${label}</button>`).join("")}
    <button class="packet-button" data-feedback="create-proposal-packet">Create proposal packet</button>
  </div>`;
}

function renderPreview(preview, target = "panel") {
  const sources = preview.sources || [];
  if (target === "panel") {
    $("#context-empty").hidden = true; $("#context-content").hidden = false;
    $("#classification").textContent = preview.classification;
    $("#route-tier").textContent = `Tier ${preview.route.tier}`;
    $("#context-size").textContent = `~${preview.estimatedContextTokens.toLocaleString()} tokens`;
    $("#estimated-cost").textContent = `£${preview.estimatedCost.toFixed(4)}`;
    $("#route-reason").textContent = preview.route.reason;
    $("#source-count").textContent = `${sources.length} selected`;
    $("#sources").innerHTML = sources.map((source) => `<article><div><strong>${escapeHtml(source.path.split("/").at(-1))}</strong><span class="${source.status === "approved" ? "approved" : "proposed"}">${escapeHtml(source.status)}</span></div><code>${escapeHtml(source.path)}</code><p>${escapeHtml(source.reason)}</p></article>`).join("") || "<p>No relevant source selected.</p>";
  } else {
    $("#dialog-preview").innerHTML = `<div class="preview-grid"><div><span>Workspace</span><strong>${escapeHtml(preview.workspace)}</strong></div><div><span>Capability</span><strong>Tier ${preview.route.tier}</strong></div><div><span>Estimated context</span><strong>~${preview.estimatedContextTokens.toLocaleString()} tokens</strong></div><div><span>Estimated cost</span><strong>£${preview.estimatedCost.toFixed(4)}</strong></div></div><p class="warning-note">${preview.route.confirmationRequired ? "Confirmation is required because this route is consequential or exceeds the warning threshold." : "This request is within the configured warning threshold."}</p><h3>Context policy</h3><p>${escapeHtml(preview.contextPolicy)}</p><h3>Selected sources</h3>${sources.map((s) => `<p><code>${escapeHtml(s.path)}</code> · ${escapeHtml(s.status)}</p>`).join("") || "<p>No repository source selected.</p>"}`;
  }
}

async function previewAndSend(text) {
  const conversation = await ensureConversation();
  const payload = { conversationId: conversation.id, text, workspace: $("#workspace").value, outputType: $("#output-type").value };
  state.pending = payload;
  state.preview = await request("/api/context/preview", { method: "POST", body: JSON.stringify(payload) });
  renderPreview(state.preview); renderPreview(state.preview, "dialog");
  $("#preview-dialog").showModal();
}

async function sendPending() {
  const payload = { ...state.pending, confirmed: true };
  $("#preview-dialog").close(); $("#confirm-send").disabled = true;
  try {
    await request(`/api/conversations/${state.conversation.id}/messages`, { method: "POST", body: JSON.stringify({ workingText: payload.text, originalText: payload.text, role: "user", metadata: state.attachment ? { attachment: state.attachment } : {} }) });
    const result = await request("/api/respond", { method: "POST", body: JSON.stringify(payload) });
    state.conversation = (await request(`/api/conversations/${state.conversation.id}`)).conversation;
    renderConversation(); toast(result.usage.status === "offline" ? "Saved and grounded locally; no provider call was made." : "Response completed and usage recorded.");
    $("#input").value = ""; state.attachment = null; $("#attachment-name").textContent = "";
  } catch (error) { toast(error.message, true); }
  finally { $("#confirm-send").disabled = false; }
}

async function recordFeedback(button) {
  const container = button.closest("[data-message]");
  const disposition = button.dataset.feedback;
  if (disposition === "create-proposal-packet") {
    const feedback = await request("/api/feedback", { method: "POST", body: JSON.stringify({ conversationId: state.conversation.id, messageId: container.dataset.message, disposition: "proposal-requested", wording: "Create a governed proposal packet" }) });
    const result = await request(`/api/feedback/${feedback.feedback.id}/proposal-packet`, { method: "POST", body: "{}" });
    $("#packet-output").innerHTML = markdown(result.packet); switchView("packets"); toast("Proposal packet created. It remains unapproved.");
    return;
  }
  await request("/api/feedback", { method: "POST", body: JSON.stringify({ conversationId: state.conversation.id, messageId: container.dataset.message, disposition, wording: disposition }) });
  button.classList.add("selected"); toast("Feedback recorded. No approval was created.");
}

function switchView(name) {
  $$(".view").forEach((view) => view.hidden = view.id !== `${name}-view`);
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === name));
  if (name === "usage") loadUsage();
}

async function loadUsage() {
  const value = await request("/api/usage");
  $("#usage-summary").innerHTML = `<div class="usage-total"><span>Total estimated API cost</span><strong>£${value.totalEstimatedCost.toFixed(4)}</strong></div>${value.records.map((record) => `<div class="usage-row"><span>${escapeHtml(record.provider)} · ${escapeHtml(record.status)}</span><span>${record.input_tokens.toLocaleString()} in / ${record.output_tokens.toLocaleString()} out</span><strong>£${Number(record.estimated_cost).toFixed(4)}</strong></div>`).join("") || "<p>No requests recorded yet.</p>"}`;
}

async function init() {
  const config = await request("/api/settings"); state.settings = config.settings; state.apiConfigured = config.apiConfigured;
  $("#api-state").textContent = config.apiConfigured ? "● Provider configured" : "○ Offline-ready";
  for (const [key, value] of Object.entries(config.settings)) {
    const field = $(`[name="${key}"]`); if (field) field.type === "checkbox" ? field.checked = Boolean(value) : field.value = value;
  }
  const list = await request("/api/conversations");
  if (list.conversations[0]) state.conversation = (await request(`/api/conversations/${list.conversations[0].id}`)).conversation;
  renderConversation();
}

$("#composer").addEventListener("submit", async (event) => { event.preventDefault(); const text = $("#input").value.trim(); if (!text) return; try { await previewAndSend(text); } catch (error) { toast(error.message, true); } });
$("#confirm-send").addEventListener("click", (event) => { event.preventDefault(); sendPending(); });
$("#messages").addEventListener("click", (event) => { const button = event.target.closest("[data-feedback]"); if (button) recordFeedback(button).catch((error) => toast(error.message, true)); });
$$("[data-starter]").forEach((button) => button.addEventListener("click", () => { $("#input").value = button.dataset.starter; $("#input").focus(); }));
$$(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
$("#new-conversation").addEventListener("click", async () => { state.conversation = null; await ensureConversation(); renderConversation(); switchView("conversation"); });
$("#workspace").addEventListener("change", () => { $("#workspace-label").textContent = $("#workspace").selectedOptions[0].textContent; });
$("#settings-form").addEventListener("submit", async (event) => {
  event.preventDefault(); const data = Object.fromEntries(new FormData(event.target));
  for (const key of ["monthlySoftBudget", "monthlyHardBudget", "perRequestWarningThreshold", "perRequestHardCeiling", "maximumRetrievedContext"]) data[key] = Number(data[key]);
  data.advancedReasoningEnabled = event.target.advancedReasoningEnabled.checked;
  try { state.settings = (await request("/api/settings", { method: "PATCH", body: JSON.stringify(data) })).settings; toast("Local spending and routing controls saved."); } catch (error) { toast(error.message, true); }
});
$("#export-button").addEventListener("click", async () => {
  if (!state.conversation) return toast("There is no conversation to export.", true);
  const value = await request("/api/export", { method: "POST", body: JSON.stringify({ conversationId: state.conversation.id, format: "markdown" }) });
  const blob = new Blob([value.markdown], { type: "text/markdown" }); const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); link.download = `${state.conversation.title.replace(/\W+/g, "-").toLowerCase() || "conversation"}.md`; link.click(); URL.revokeObjectURL(link.href);
});
$("#attach").addEventListener("click", () => $("#file-input").click());
$("#file-input").addEventListener("change", () => { const file = $("#file-input").files[0]; if (!file) return; state.attachment = { filename: file.name, size: file.size, type: file.type }; $("#attachment-name").textContent = file.name; toast("Attachment metadata staged. Content upload is reserved for the next increment."); });
$("#record").addEventListener("click", async () => {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast("Voice capture is not available in this browser.", true);
  if (state.recording) { state.recording.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const chunks = [];
    const recorder = new MediaRecorder(stream); state.recording = recorder; $("#record").classList.add("recording"); $("#record").textContent = "■";
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = () => { stream.getTracks().forEach((track) => track.stop()); state.recording = null; $("#record").classList.remove("recording"); $("#record").textContent = "●"; $("#capture-review").hidden = false; $("#transcript").value = ""; $("#transcript").placeholder = "Audio captured. Transcription requires an API provider; type or paste the reviewed transcript here."; $("#language-label").textContent = "Detected language: pending transcription"; };
    recorder.start();
  } catch { toast("Microphone access was not granted.", true); }
});
$("#discard-transcript").addEventListener("click", () => { $("#capture-review").hidden = true; $("#transcript").value = ""; });
$("#use-transcript").addEventListener("click", () => { $("#input").value = $("#transcript").value; $("#capture-review").hidden = true; $("#input").focus(); });
init().catch((error) => toast(error.message, true));
