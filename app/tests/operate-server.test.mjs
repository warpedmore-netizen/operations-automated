import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("Operate persists linked work and returns one governed priority inbox", { timeout: 20_000 }, async () => {
  const port = 44173;
  const dataRoot = await mkdtemp(join(tmpdir(), "oa-operate-data-"));
  const repositoryRoot = await mkdtemp(join(tmpdir(), "oa-operate-repository-"));
  await mkdir(join(repositoryRoot, "methodology"), { recursive: true });
  await writeFile(join(repositoryRoot, "methodology", "baseline.md"), "---\nstatus: approved\nversion: 0.6\n---\n# Baseline\n", "utf8");
  await writeFile(join(repositoryRoot, "CHANGELOG.md"), "# Changelog\n\n## 0.6 - Baseline\n", "utf8");
  const child = spawn(process.execPath, ["app/server.mjs"], {
    cwd: new URL("../..", import.meta.url),
    env: {
      ...process.env,
      PORT: String(port),
      OPENAI_API_KEY: "",
      WORKBENCH_DATA_ROOT: dataRoot,
      WORKBENCH_REPOSITORY_ROOT: repositoryRoot
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  await new Promise((resolve, reject) => {
    child.stdout.on("data", (chunk) => chunk.toString().includes("running at") && resolve());
    child.once("exit", (code) => reject(new Error(`Server exited ${code}: ${stderr}`)));
  });
  const call = async (path, { method = "GET", body } = {}) => {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { response, payload: await response.json() };
  };
  const create = async (body) => {
    const result = await call("/api/operate/records", { method: "POST", body });
    assert.equal(result.response.status, 201, JSON.stringify(result.payload));
    return result.payload;
  };
  try {
    const bible = await call("/api/operate/bible");
    assert.equal(bible.response.ok, true);
    assert.equal(bible.payload.methodologyBaselineChanged, false);
    assert.match(bible.payload.authority, /cannot create approval/i);

    const recommendation = await call("/api/operate/recommendation", {
      method: "POST",
      body: { summary: "approve a bounded private pilot of the governed action loop" }
    });
    assert.equal(recommendation.response.ok, true);
    assert.equal(recommendation.payload.recordType.selected, "approval");
    assert.equal(recommendation.payload.suggestedTitle, "Approve a bounded private pilot of the governed action loop");
    assert.equal(recommendation.payload.defaults.owner, "Jamie Peppard");

    const autoNamedApproval = await create({
      summary: "a bounded private pilot of the governed action loop",
      recordType: "approval"
    });
    assert.equal(autoNamedApproval.record.title, "Approve a bounded private pilot of the governed action loop");

    const caseResult = await create({
      title: "Restore customer identity verification",
      summary: "Several related actions contribute to restoring the customer outcome.",
      recordType: "case",
      impact: 5,
      urgency: 5,
      riskExposure: 4
    });
    const requestResult = await create({
      title: "Assist affected customers",
      summary: "Provide a recoverable route while the incident is investigated.",
      recordType: "request",
      caseId: caseResult.record.id,
      impact: 4,
      urgency: 5,
      blocking: true
    });
    const taskResult = await create({
      title: "Check the verification failure logs",
      recordType: "task",
      caseId: caseResult.record.id
    });
    assert.equal(requestResult.record.caseId, caseResult.record.id);
    assert.equal(requestResult.approvalCreated, false);
    assert.equal(taskResult.record.recordType, "task");

    const pullRequestWork = await create({
      title: "Review PR #22 before the private pilot",
      summary: "Review the proposed operating graph and decide whether its record meanings, links, signals and authority boundary are suitable for a bounded private pilot.",
      recordType: "decision"
    });
    assert.equal(pullRequestWork.record.sourceContext.url, "https://github.com/warpedmore-netizen/operations-automated/pull/22");
    assert.equal(pullRequestWork.record.sourceContext.label, "Open PR #22");
    assert.match(pullRequestWork.record.sourceContext.summary, /operating graph/i);
    assert.match(pullRequestWork.record.sourceContext.exactDecision, /Review PR #22/i);
    const untrustedPullRequest = await create({
      title: "Review an unrelated repository link",
      summary: "Review https://github.com/example/unrelated/pull/22 before continuing.",
      recordType: "task"
    });
    assert.equal(untrustedPullRequest.record.sourceContext, null);

    const linked = await call("/api/operate/links", {
      method: "POST",
      body: {
        fromRecordId: requestResult.record.id,
        toRecordId: taskResult.record.id,
        relationship: "generated"
      }
    });
    assert.equal(linked.response.status, 201);
    assert.equal(linked.payload.approvalCreated, false);
    assert.equal(linked.payload.link.proposedVia, "human");
    assert.equal(linked.payload.link.confirmedBy, "Jamie Peppard");

    const detail = await call(`/api/operate/records/${caseResult.record.id}`);
    assert.equal(detail.response.ok, true);
    assert.equal(detail.payload.record.children.length, 2);
    assert.ok(detail.payload.record.activity.some((item) => item.action === "record.created"));

    const childTask = await create({
      title: "Check the provider response code",
      recordType: "task",
      parentId: taskResult.record.id
    });
    assert.equal(childTask.record.parentId, taskResult.record.id);
    assert.equal(childTask.record.caseId, caseResult.record.id);

    const incidentResult = await create({
      title: "Identity verification failed unexpectedly",
      recordType: "incident",
      caseId: caseResult.record.id
    });
    const problemResult = await create({
      title: "Investigate the recurring provider timeout",
      recordType: "problem",
      caseId: caseResult.record.id
    });
    const incidentDetail = await call(`/api/operate/records/${incidentResult.record.id}`);
    const aiSuggestion = incidentDetail.payload.record.linkSuggestions.find((item) => item.toRecordId === problemResult.record.id);
    assert.equal(aiSuggestion.relationship, "evidences");

    const unconfirmedAiLink = await call("/api/operate/links", {
      method: "POST",
      body: { ...aiSuggestion, proposedVia: "ai", actor: "Oppa Mate" }
    });
    assert.equal(unconfirmedAiLink.response.status, 403);
    const confirmedAiLink = await call("/api/operate/links", {
      method: "POST",
      body: {
        ...aiSuggestion,
        proposedVia: "ai",
        actor: "Jamie Peppard",
        confirmation: "Confirm link"
      }
    });
    assert.equal(confirmedAiLink.response.status, 201);
    assert.equal(confirmedAiLink.payload.link.proposedBy, "Oppa Mate");
    assert.equal(confirmedAiLink.payload.link.confirmedBy, "Jamie Peppard");

    const network = await call("/api/operate/network");
    assert.equal(network.response.ok, true);
    assert.equal(network.payload.network.totals.explicitLinks, 2);
    assert.equal(network.payload.network.totals.aiConfirmedLinks, 1);
    assert.ok(network.payload.network.totals.maxDepth >= 3);
    assert.match(network.payload.network.boundary, /not facts, approvals or risk acceptance/i);

    const rejectedAiLink = await call(`/api/operate/links/${confirmedAiLink.payload.link.id}`, {
      method: "PATCH",
      body: { state: "rejected", actor: "Jamie Peppard", reason: "The incident does not evidence this cause." }
    });
    assert.equal(rejectedAiLink.response.ok, true);
    const afterRejection = await call("/api/operate/network");
    assert.equal(afterRejection.payload.network.totals.explicitLinks, 1);
    const problemAfterRejection = await call(`/api/operate/records/${problemResult.record.id}`);
    assert.ok(problemAfterRejection.payload.record.activity.some((item) => item.action === "relationship.rejected"));

    const circularParent = await call(`/api/operate/records/${taskResult.record.id}`, {
      method: "PATCH",
      body: { parentId: childTask.record.id }
    });
    assert.equal(circularParent.response.status, 400);
    assert.match(circularParent.payload.error, /circular/i);

    const inbox = await call("/api/my-work?order=recommended");
    assert.equal(inbox.response.ok, true);
    assert.ok(inbox.payload.items.some((item) => item.sourceId === requestResult.record.id));
    assert.equal(inbox.payload.items.find((item) => item.sourceId === pullRequestWork.record.id).sourceContext.number, 22);
    assert.ok(inbox.payload.doNext.slice(0, 3).some((item) => item.sourceId === requestResult.record.id));
    assert.equal(inbox.payload.items.every((item) => item.nextAction?.label), true);
    assert.match(inbox.payload.prioritisation.explanation, /impact, urgency, risk/i);
    assert.equal(inbox.payload.prioritisation.approvalCreated, false);

    const bypassedTaskStatus = await call(`/api/operate/records/${taskResult.record.id}`, {
      method: "PATCH", body: { status: "done", actor: "Jamie Peppard" }
    });
    assert.equal(bypassedTaskStatus.response.status, 409);
    assert.match(bypassedTaskStatus.payload.error, /governed work action/i);

    const completed = await call(`/api/operate/records/${taskResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "complete-task", actor: "Jamie Peppard" }
    });
    assert.equal(completed.response.ok, true);
    assert.equal(completed.payload.record.status, "done");
    assert.ok(completed.payload.record.activity.some((item) =>
      item.action === "workflow.action-completed" && item.detail.actionId === "complete-task"));
    const afterCompletion = await call("/api/my-work?order=recommended");
    assert.equal(afterCompletion.payload.items.some((item) => item.sourceId === taskResult.record.id), false);

    const jumpedApproval = await call("/api/operate/records", {
      method: "POST",
      body: { title: "Bypass approval lifecycle", recordType: "approval", status: "approved" }
    });
    assert.equal(jumpedApproval.response.status, 409);
    assert.match(jumpedApproval.payload.error, /starts at its initial/i);

    const approvalResult = await create({ title: "Authorise a sensitive release", recordType: "approval" });
    const readyApproval = await call(`/api/operate/records/${approvalResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "ready-approval", actor: "Jamie Peppard", note: "Scope and evidence prepared." }
    });
    assert.equal(readyApproval.response.ok, true);
    const unsafeApproval = await call(`/api/operate/records/${approvalResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "approve", actor: "Jamie Peppard", note: "Evidence reviewed." }
    });
    assert.equal(unsafeApproval.response.status, 403);
    const approvalWithoutReason = await call(`/api/operate/records/${approvalResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "approve", actor: "Jamie Peppard", confirmation: "Approve" }
    });
    assert.equal(approvalWithoutReason.response.status, 400);
    const explicitApproval = await call(`/api/operate/records/${approvalResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "approve", actor: "Jamie Peppard", confirmation: "Approve", note: "Evidence and scope reviewed." }
    });
    assert.equal(explicitApproval.response.ok, true);
    assert.equal(explicitApproval.payload.record.approvalState, "human-confirmed");
    assert.equal(explicitApproval.payload.decisionRecorded, true);

    const decisionResult = await create({ title: "Decide the bounded pilot route", recordType: "decision" });
    await call(`/api/operate/records/${decisionResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "prepare-decision", actor: "Jamie Peppard", note: "Options and boundary prepared." }
    });
    const decisionWithoutChoice = await call(`/api/operate/records/${decisionResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "record-decision", actor: "Jamie Peppard", confirmation: "Record decision", note: "Evidence reviewed." }
    });
    assert.equal(decisionWithoutChoice.response.status, 400);
    const decisionWithChoice = await call(`/api/operate/records/${decisionResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "record-decision", actor: "Jamie Peppard", confirmation: "Record decision", choice: "revise", note: "Revise the proposed scope before proceeding." }
    });
    assert.equal(decisionWithChoice.response.ok, true);
    assert.ok(decisionWithChoice.payload.record.activity.some((item) => item.detail.choice === "revise"));

    const riskResult = await create({ title: "Loss of recovery evidence", recordType: "risk" });
    const assessingRisk = await call(`/api/operate/records/${riskResult.record.id}/actions`, {
      method: "POST", body: { actionId: "assess-risk", actor: "Jamie Peppard" }
    });
    assert.equal(assessingRisk.response.ok, true);
    const openRisk = await call(`/api/operate/records/${riskResult.record.id}/actions`, {
      method: "POST", body: { actionId: "register-risk", actor: "Jamie Peppard", note: "Credible exposure with named ownership." }
    });
    assert.equal(openRisk.response.ok, true);
    const unsafeAcceptance = await call(`/api/operate/records/${riskResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "accept-risk", actor: "Jamie Peppard", note: "Residual exposure understood." }
    });
    assert.equal(unsafeAcceptance.response.status, 403);
    const explicitAcceptance = await call(`/api/operate/records/${riskResult.record.id}/actions`, {
      method: "POST",
      body: { actionId: "accept-risk", actor: "Jamie Peppard", confirmation: "Accept risk", note: "Residual exposure and review trigger understood." }
    });
    assert.equal(explicitAcceptance.response.ok, true);
    const acceptedInbox = await call("/api/my-work?order=recommended");
    assert.equal(acceptedInbox.payload.items.some((item) => item.sourceId === riskResult.record.id), true);

    await call(`/api/operate/records/${caseResult.record.id}/actions`, {
      method: "POST", body: { actionId: "start-case", actor: "Jamie Peppard" }
    });
    await call(`/api/operate/records/${caseResult.record.id}/actions`, {
      method: "POST", body: { actionId: "resolve-case", actor: "Jamie Peppard", note: "Primary outcome restored." }
    });
    const blockedCaseClosure = await call(`/api/operate/records/${caseResult.record.id}/actions`, {
      method: "POST", body: { actionId: "close-case", actor: "Jamie Peppard", note: "Attempt closure." }
    });
    assert.equal(blockedCaseClosure.response.status, 409);
    assert.match(blockedCaseClosure.payload.error, /contained records remain open/i);

    const invalidCaseLink = await call(`/api/operate/records/${requestResult.record.id}`, {
      method: "PATCH",
      body: { caseId: taskResult.record.id }
    });
    assert.equal(invalidCaseLink.response.status, 400);
  } finally {
    child.kill();
    await new Promise((resolve) => child.once("exit", resolve));
    await Promise.all([
      rm(dataRoot, { recursive: true, force: true }),
      rm(repositoryRoot, { recursive: true, force: true })
    ]);
  }
});
