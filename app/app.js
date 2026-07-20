(function runApplication(engine, storageApi) {
  "use strict";

  if (!engine || !storageApi) throw new Error("OPERATE application dependencies did not load");

  const byId = (id) => document.getElementById(id);
  const stored = storageApi.load(window.localStorage);
  let workspace;
  try {
    workspace = stored ? engine.normaliseWorkspace(stored) : engine.createWorkspace();
  } catch {
    workspace = engine.createWorkspace();
  }

  let toastTimer;

  function getPath(object, path) {
    return path.split(".").reduce((value, key) => value?.[key], object);
  }

  function setPath(object, path, value) {
    const parts = path.split(".");
    const final = parts.pop();
    const target = parts.reduce((current, key) => current[key], object);
    target[final] = value;
    workspace.updatedAt = new Date().toISOString();
  }

  function persist() {
    const saved = storageApi.save(window.localStorage, workspace);
    if (!saved) showToast("This browser could not save the workspace.", true);
  }

  function showToast(message, error = false) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.toggle("error", error);
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
  }

  function formatDate(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[character]);
  }

  function renderBindings() {
    for (const element of document.querySelectorAll("[data-bind]")) {
      if (document.activeElement !== element) element.value = getPath(workspace, element.dataset.bind) ?? "";
    }
  }

  function renderSidebar(assessment) {
    byId("sidebar-title").textContent = workspace.project.title || "Untitled problem";
    byId("sidebar-owner").textContent = workspace.project.owner ? `Owned by ${workspace.project.owner}` : "Owner not recorded";
    byId("progress-value").textContent = `${assessment.progress}%`;
    byId("progress-bar").style.width = `${assessment.progress}%`;

    byId("stage-list").innerHTML = engine.STAGES.map((stage, index) => {
      const state = index < assessment.stageIndex ? "past" : index === assessment.stageIndex ? "current" : "future";
      const label = state === "past" ? "Done" : state === "current" ? "Now" : "";
      return `<li class="stage-item ${state}" ${state === "current" ? 'aria-current="step"' : ""}>
        <span class="stage-number">${String(index + 1).padStart(2, "0")}</span>
        <span>${stage.name}</span>
        <span class="stage-state">${label}</span>
      </li>`;
    }).join("");
  }

  function renderNextAction(assessment) {
    byId("next-action-title").textContent = assessment.nextAction;
    byId("next-action-detail").textContent = assessment.detail;
    const badge = byId("control-badge");
    badge.textContent = assessment.control;
    badge.classList.toggle("human", assessment.control.includes("Human"));
  }

  function renderStage(assessment) {
    const stage = assessment.stage;
    const record = workspace.stages[stage.id];
    byId("stage-name").textContent = stage.name;
    byId("stage-question").textContent = stage.question;
    byId("stage-purpose").textContent = stage.purpose;
    byId("stage-prompts").innerHTML = assessment.prompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join("");
    byId("stage-evidence").value = record.evidence;
    byId("stage-decision").value = record.decision;
    byId("stage-owner").value = record.owner;

    const approvalPanel = byId("approval-panel");
    if (!assessment.gateLabel) {
      approvalPanel.hidden = true;
      approvalPanel.innerHTML = "";
    } else {
      const approval = workspace.approvals[stage.id];
      approvalPanel.hidden = false;
      approvalPanel.innerHTML = approval?.approved
        ? `<h3>Human approval recorded</h3><p>${escapeHtml(approval.label)} — ${escapeHtml(approval.approvedBy)} on ${escapeHtml(formatDate(approval.approvedAt))}.</p><button class="button button-danger" type="button" data-action="revoke-approval">Remove approval</button>`
        : assessment.recordMissing.length
          ? `<h3>Human control point pending</h3><p>Complete the stage evidence, decision and owner before asking a human to ${escapeHtml(assessment.gateLabel.toLowerCase())}.</p>`
          : `<h3>Human control point</h3><p>${escapeHtml(assessment.gateLabel)}. AI cannot make this decision.</p><div class="approval-controls"><label class="field"><span>Authorised human</span><input id="approval-name" type="text" placeholder="Name of the person approving" autocomplete="off"></label><button class="button button-primary" type="button" data-action="approve-stage">Record approval</button></div>`;
    }

    const advanceButton = byId("advance-button");
    advanceButton.disabled = !assessment.canAdvance;
    advanceButton.textContent = assessment.stageIndex === engine.STAGES.length - 1 ? "Complete cycle" : `Move to ${engine.STAGES[assessment.stageIndex + 1].name}`;
  }

  function renderGovernance() {
    byId("approval-list").innerHTML = Object.entries(engine.APPROVAL_GATES).map(([stageId, label]) => {
      const approval = workspace.approvals[stageId];
      return `<div class="approval-record"><div><strong>${escapeHtml(label)}</strong><span>${approval?.approved ? `${escapeHtml(approval.approvedBy)} · ${escapeHtml(formatDate(approval.approvedAt))}` : "Awaiting the relevant stage"}</span></div><span class="approval-state ${approval?.approved ? "approved" : "pending"}">${approval?.approved ? "Approved" : "Pending"}</span></div>`;
    }).join("");
  }

  function renderActivity() {
    const events = workspace.activity.slice(-6).reverse();
    byId("activity-list").innerHTML = events.map((event) => `<li><strong>${escapeHtml(event.message)}</strong><span>${escapeHtml(formatDate(event.at))}</span></li>`).join("");
  }

  function render() {
    const assessment = engine.assessWorkspace(workspace);
    renderBindings();
    renderSidebar(assessment);
    renderNextAction(assessment);
    renderStage(assessment);
    renderGovernance();
    renderActivity();
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function slug(value) {
    return (value || "operate-workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "operate-workspace";
  }

  async function copyAiBrief() {
    const brief = engine.buildAiBrief(workspace);
    try {
      await navigator.clipboard.writeText(brief);
      showToast("AI brief copied. Paste it into Codex when you want assistance.");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = brief;
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast("AI brief copied.");
    }
  }

  document.addEventListener("input", (event) => {
    const binding = event.target.dataset?.bind;
    if (binding) {
      const before = `${workspace.currentStage}:${Object.keys(workspace.approvals).sort().join(",")}`;
      setPath(workspace, binding, event.target.value);
      const reviewStage = binding.startsWith("project.") ? "observe" : "prioritise";
      workspace = engine.invalidateFromStage(workspace, reviewStage, `${binding.startsWith("project.") ? "Project context" : "Value matrix"} changed; affected approvals require review`);
      persist();
      const assessment = engine.assessWorkspace(workspace);
      const after = `${workspace.currentStage}:${Object.keys(workspace.approvals).sort().join(",")}`;
      if (before !== after) render();
      else {
        renderSidebar(assessment);
        renderNextAction(assessment);
      }
    }
  });

  for (const id of ["stage-evidence", "stage-decision", "stage-owner"]) {
    byId(id).addEventListener("input", () => {
      const stage = workspace.currentStage;
      const field = id.replace("stage-", "");
      const approvalWasRecorded = Boolean(workspace.approvals[stage]);
      workspace = engine.invalidateFromStage(workspace, stage, `${engine.STAGES.find((item) => item.id === stage).name} evidence changed; approval requires review`);
      workspace.stages[stage][field] = byId(id).value;
      workspace.updatedAt = new Date().toISOString();
      persist();
      const assessment = engine.assessWorkspace(workspace);
      if (approvalWasRecorded) render();
      else {
        renderSidebar(assessment);
        renderNextAction(assessment);
        byId("advance-button").disabled = !assessment.canAdvance;
      }
    });
  }

  document.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;

    if (action === "record-stage") {
      workspace = engine.normaliseWorkspace(workspace);
      workspace.activity.push({ at: new Date().toISOString(), type: "stage-recorded", message: `${engine.assessWorkspace(workspace).stage.name} record updated` });
      persist();
      render();
      showToast("Stage evidence retained in this browser.");
    }

    if (action === "approve-stage") {
      try {
        workspace = engine.setApproval(workspace, workspace.currentStage, byId("approval-name")?.value ?? "");
        persist();
        render();
        showToast("Human approval recorded.");
      } catch (error) {
        showToast(error.message, true);
      }
    }

    if (action === "revoke-approval") {
      if (window.confirm("Remove this human approval? The workspace may no longer be able to progress.")) {
        workspace = engine.revokeApproval(workspace, workspace.currentStage);
        persist();
        render();
        showToast("Approval removed.");
      }
    }

    if (action === "advance-stage") {
      const result = engine.advanceStage(workspace);
      if (!result.advanced) return showToast(result.reason, true);
      workspace = result.workspace;
      persist();
      render();
      showToast(workspace.status === "complete" ? "OPERATE cycle completed." : `Moved to ${engine.assessWorkspace(workspace).stage.name}.`);
      document.querySelector(".stage-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (action === "copy-brief") await copyAiBrief();

    if (action === "export-json") {
      download(`${slug(workspace.project.title)}.json`, `${JSON.stringify(workspace, null, 2)}\n`, "application/json");
      showToast("JSON workspace exported.");
    }

    if (action === "export-markdown") {
      download(`${slug(workspace.project.title)}.md`, engine.exportMarkdown(workspace), "text/markdown");
      showToast("Governed record exported as Markdown.");
    }

    if (action === "new-workspace") {
      if (window.confirm("Start a new workspace? Export the current record first if you need to retain it.")) {
        storageApi.clear(window.localStorage);
        workspace = engine.createWorkspace();
        persist();
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
        showToast("New private workspace created.");
      }
    }
  });

  byId("import-file").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      workspace = engine.normaliseWorkspace(JSON.parse(await file.text()));
      persist();
      render();
      showToast("Workspace imported.");
    } catch {
      showToast("That file is not a valid OPERATE workspace.", true);
    } finally {
      event.target.value = "";
    }
  });

  render();
  persist();
})(window.OPERATEEngine, window.OPERATEStorage);
