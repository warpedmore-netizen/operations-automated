import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function fixtureRepository() {
  const root = await mkdtemp(join(tmpdir(), "oa-surface-repository-"));
  await mkdir(join(root, "methodology"), { recursive: true });
  await mkdir(join(root, "product"), { recursive: true });
  await writeFile(
    join(root, "methodology", "baseline.md"),
    "---\nid: OA-METHOD-TEST\nstatus: approved\nversion: 0.6\n---\n# Approved baseline\n\n## Human authority\nJamie decides release and risk acceptance. Classification never creates approval.\n",
    "utf8"
  );
  await writeFile(
    join(root, "product", "proposal.md"),
    "---\nid: OA-PRODUCT-TEST\nstatus: proposed\nversion: 0.1\n---\n# Proposed product\n\nImplementation receipts make technical work reviewable. Technical readiness automatically authorises release.\n",
    "utf8"
  );
  await writeFile(join(root, "CHANGELOG.md"), "---\nstatus: proposed\n---\n# Changelog\n\n## 0.6 - Baseline\n", "utf8");
  return root;
}

async function startWorkbench({ port, dataRoot, repositoryRoot }) {
  const child = spawn(process.execPath, ["app/server.mjs"], {
    cwd: new URL("../..", import.meta.url),
    env: {
      ...process.env,
      PORT: String(port),
      OPENAI_API_KEY: "",
      OPENAI_EMBEDDING_MODEL: "",
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
  return { child, call, stderr: () => stderr };
}

async function stopWorkbench(child) {
  if (child.exitCode !== null) return;
  child.kill();
  await new Promise((resolve) => child.once("exit", resolve));
}

test("ten governed Workbench journeys operate as one continuous surface", { timeout: 35_000 }, async () => {
  const dataRoot = await mkdtemp(join(tmpdir(), "oa-surface-data-"));
  const repositoryRoot = await fixtureRepository();
  const port = 45173;
  let running = await startWorkbench({ port, dataRoot, repositoryRoot });
  const call = (...args) => running.call(...args);
  const create = async (body) => {
    const result = await call("/api/operate/records", { method: "POST", body });
    assert.equal(result.response.status, 201, JSON.stringify(result.payload));
    return result.payload;
  };
  const act = async (recordId, actionId, body = {}) => {
    const result = await call(`/api/operate/records/${recordId}/actions`, {
      method: "POST",
      body: { actionId, actor: "Jamie Peppard", ...body }
    });
    assert.equal(result.response.status, 200, JSON.stringify(result.payload));
    return result.payload.record;
  };
  const link = async (fromRecordId, toRecordId, relationship, rationale) => {
    const result = await call("/api/operate/links", {
      method: "POST",
      body: { fromRecordId, toRecordId, relationship, rationale, actor: "Jamie Peppard", proposedVia: "human" }
    });
    assert.equal(result.response.status, 201, JSON.stringify(result.payload));
  };
  try {
    // 1. Governed knowledge: approved meaning is normative; proposed material is evidence only.
    const manifest = await call("/api/knowledge/manifest");
    assert.equal(manifest.response.status, 200);
    const approved = manifest.payload.documents.find((item) => item.path === "methodology/baseline.md");
    const proposed = manifest.payload.documents.find((item) => item.path === "product/proposal.md");
    assert.equal(approved.normative, true);
    assert.equal(proposed.normative, false);
    assert.match(manifest.payload.retrieval.baseline, /FTS5/i);

    // 2. Executable Operations Bible and 3. configurable Work Profiles.
    const bible = await call("/api/operate/bible");
    const profiles = await call("/api/work-profiles");
    assert.equal(bible.payload.entries.length, 12);
    assert.equal(profiles.payload.profiles.length, 7);
    assert.equal(bible.payload.methodologyBaselineChanged, false);
    const buildRequest = await create({
      title: "Add a safer import screen",
      summary: "The user needs a recoverable product journey.",
      recordType: "request",
      workProfile: "product-application-build"
    });
    assert.equal(buildRequest.generatedChange.recordType, "change");
    assert.equal(buildRequest.generatedChange.status, "draft");
    assert.equal(buildRequest.generatedChange.parentId, buildRequest.record.id);

    // 4. Ordinary request capture creates connected Case, Request and Task work that completes.
    const caseWork = await create({
      title: "Restore customer payment completion",
      summary: "Coordinate the related work and retain the customer outcome.",
      recordType: "case",
      workProfile: "general-administration"
    });
    const requestWork = await create({
      title: "Give affected customers a recovery route",
      summary: "Provide a usable alternative while the failure is investigated.",
      recordType: "request",
      caseId: caseWork.record.id
    });
    const requestTask = await create({
      title: "Publish the temporary customer steps",
      recordType: "task",
      caseId: caseWork.record.id,
      parentId: requestWork.record.id
    });
    await act(requestTask.record.id, "complete-task");
    await act(requestWork.record.id, "qualify-request");
    await act(requestWork.record.id, "start-request");
    await act(requestWork.record.id, "fulfil-request", { note: "The recovery route is available and checked." });
    const closedRequest = await act(requestWork.record.id, "close-request");
    assert.equal(closedRequest.status, "closed");

    // 5. Incident evidence connects to a Problem, governed Change, Tasks and verification.
    const incident = await create({
      title: "Payment completion fails after provider cutover",
      summary: "Customers are unable to complete payment.",
      recordType: "incident",
      caseId: caseWork.record.id
    });
    const problem = await create({
      title: "Provider cutover uses an incompatible callback",
      summary: "Repeated failures point to one underlying integration cause.",
      recordType: "problem",
      caseId: caseWork.record.id
    });
    const operationalChange = await create({
      title: "Correct the payment callback",
      summary: "Implement and verify the bounded callback correction.",
      recordType: "change",
      caseId: caseWork.record.id,
      workProfile: "product-application-build"
    });
    const verificationTask = await create({
      title: "Verify normal, failed and recovery payment paths",
      recordType: "task",
      caseId: caseWork.record.id,
      parentId: operationalChange.record.id
    });
    await link(incident.record.id, problem.record.id, "caused-by", "The incident evidence points to this underlying cause.");
    await link(problem.record.id, operationalChange.record.id, "generated", "The supported cause generated a bounded corrective Change.");
    await link(operationalChange.record.id, verificationTask.record.id, "tests", "The Task verifies the intended and recovery outcomes.");
    await act(incident.record.id, "triage-incident");
    await act(incident.record.id, "respond-incident");
    await act(incident.record.id, "monitor-incident", { note: "Payment completion is restored and being observed." });
    await act(incident.record.id, "resolve-incident", { note: "Normal customer completion is stable." });
    await act(problem.record.id, "investigate-problem");
    await act(problem.record.id, "record-cause", { note: "Callback incompatibility reproduced and evidenced." });
    await act(problem.record.id, "plan-problem-treatment", { note: "Apply the bounded callback correction." });
    await act(problem.record.id, "resolve-problem", { note: "Cause and treatment are linked to the Change." });

    // 6. Oppa Mate classification remains correctable and the correction is reusable.
    const corrected = await create({
      title: "Payment provider may fail during cutover",
      summary: "A material operational exposure could affect customers.",
      recordType: "risk",
      workProfile: "research-evidence-review"
    });
    assert.equal(corrected.record.recordType, "risk");
    assert.equal(corrected.record.workProfile, "research-evidence-review");
    assert.equal(corrected.approvalCreated, false);
    const repeated = await create({
      title: "Payment provider may fail during cutover",
      summary: "A material operational exposure could affect customers."
    });
    assert.equal(repeated.record.recordType, "risk");

    // 7. Conversation continuity links the active work and resolves a short follow-up.
    const conversation = await call("/api/conversations", {
      method: "POST",
      body: { title: "Risk discussion", workspace: "general-project" }
    });
    const conversationId = conversation.payload.conversation.id;
    await call(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      body: { activeRecordId: corrected.record.id }
    });
    const firstMessage = await call(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: { workingText: "What should I do about this risk?", role: "user" }
    });
    const firstResponse = await call("/api/respond", {
      method: "POST",
      body: { conversationId, text: "What should I do about this risk?", outputType: "answer" }
    });
    assert.equal(firstResponse.payload.continuity.activeRecordId, corrected.record.id);
    assert.match(firstResponse.payload.message.working_text, /What could go wrong/i);
    assert.doesNotMatch(firstResponse.payload.message.working_text, /(?:methodology|product|evolution)\/[\w./-]+\.md|repository status|does not authorise/i);
    assert.equal(firstResponse.payload.message.metadata.activeWorkDetails.title, corrected.record.title);
    assert.equal(firstResponse.payload.message.metadata.activeWorkDetails.status, corrected.record.status);
    assert.match(firstResponse.payload.message.metadata.activeWorkDetails.boundary, /does not record a decision or approval/i);
    assert.ok(firstResponse.payload.knowledgeSnapshotId);
    await call(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: { workingText: "Yes, do that.", role: "user" }
    });
    const followUp = await call("/api/respond", {
      method: "POST",
      body: { conversationId, text: "Yes, do that.", outputType: "answer" }
    });
    assert.match(followUp.payload.continuity.followUpReference, /previous response/i);

    // 6. Specialist feedback appears in universal My Work without deleting its source history.
    const feedback = await call("/api/feedback", {
      method: "POST",
      body: {
        conversationId,
        messageId: firstMessage.payload.message.id,
        disposition: "record-methodology-feedback",
        wording: "The method should make the release boundary easier to see.",
        interpretation: "Review the visible release-control wording."
      }
    });
    assert.equal(feedback.response.status, 201);
    const allWork = await call("/api/my-work?view=all&search=release%20boundary");
    assert.ok(allWork.payload.items.some((item) => /release boundary/i.test(item.title)));
    const waitingJamie = await call("/api/my-work?view=waiting-jamie");
    assert.ok(waitingJamie.payload.items.every((item) => item.owner === "Jamie Peppard" || item.decisionRequired));

    // A daily challenge answer can be retained with an explicit no-change disposition.
    const noChange = await call("/api/feedback", {
      method: "POST",
      body: {
        conversationId,
        messageId: firstResponse.payload.message.id,
        disposition: "useful",
        wording: "This answer is useful as it stands.",
        interpretation: "Retain the answer; no change is required."
      }
    });
    assert.equal(noChange.payload.feedback.classification, "no-action-required");
    assert.equal(noChange.payload.feedback.status, "no-change");

    // Branding revision remains one shared work item while retaining Codex and founder hand-offs.
    const brand = await call("/api/brand-review");
    const brandItem = brand.payload.items[0];
    const brandRevision = await call("/api/brand-review", {
      method: "POST",
      body: { itemId: brandItem.id, action: "revise", reason: "Show the authority boundary more clearly." }
    });
    let brandWork = await call(`/api/my-work?search=${encodeURIComponent(brandItem.title)}`);
    assert.ok(brandWork.payload.items.some((item) => item.owner === "Codex"));
    await call("/api/brand-review/responses", {
      method: "POST",
      body: {
        decisionId: brandRevision.payload.decision.id,
        disposition: "revision-prepared",
        summary: "Prepared a bounded wording revision for founder re-review.",
        affectedFiles: ["brand/review-items.json"],
        sourceRef: "codex/test-brand-revision",
        repositoryChanged: false
      }
    });
    brandWork = await call(`/api/my-work?search=${encodeURIComponent(brandItem.title)}`);
    assert.ok(brandWork.payload.items.some((item) => item.owner === "Jamie Peppard"));

    // Risk can cross another work type, link to treatment and still requires exact acceptance.
    const linkedRisk = await create({
      title: "Residual payment callback exposure",
      summary: "A provider retry edge case may still affect a small customer group.",
      recordType: "risk",
      caseId: caseWork.record.id
    });
    await link(operationalChange.record.id, linkedRisk.record.id, "treats", "The callback Change treats most of this exposure.");
    await act(linkedRisk.record.id, "assess-risk");
    await act(linkedRisk.record.id, "register-risk", { note: "The residual edge case is credible and bounded." });
    await act(linkedRisk.record.id, "treat-risk", { note: "Add monitoring and a recovery alert." });
    await act(linkedRisk.record.id, "monitor-risk", { note: "Treatment is active; residual exposure remains." });
    const unconfirmedAcceptance = await call(`/api/operate/records/${linkedRisk.record.id}/actions`, {
      method: "POST",
      body: { actionId: "accept-risk", actor: "Jamie Peppard", note: "Residual exposure reviewed.", confirmation: "yes" }
    });
    assert.equal(unconfirmedAcceptance.response.status, 403);
    await act(linkedRisk.record.id, "accept-risk", {
      note: "Residual exposure and review trigger are understood.",
      confirmation: "Accept risk"
    });

    // Approved methodology wins when proposed product wording conflicts with it.
    const authorityCheck = await call("/api/respond", {
      method: "POST",
      body: {
        conversationId,
        text: "Does technical readiness automatically authorise release?",
        outputType: "answer"
      }
    });
    assert.equal(authorityCheck.payload.sources[0].normative, true);
    assert.ok(authorityCheck.payload.sources.some((source) => source.status === "proposed" && !source.normative));

    // 8. Build work is blocked until a Change is explicitly approved for preparation.
    const earlyBuild = await call("/api/implementation-jobs", {
      method: "POST",
      body: { recordId: operationalChange.record.id }
    });
    assert.equal(earlyBuild.response.status, 409);
    await act(operationalChange.record.id, "assess-change");
    await act(operationalChange.record.id, "request-change-approval", { note: "The bounded implementation and acceptance criteria are ready." });
    await act(operationalChange.record.id, "approve-change", { note: "Prepare this bounded product change.", confirmation: "Approve change" });
    await act(operationalChange.record.id, "start-change");
    await act(verificationTask.record.id, "complete-task");
    await act(operationalChange.record.id, "verify-change", { note: "Normal, failed and recovery paths passed." });
    const verifiedChange = await act(operationalChange.record.id, "complete-change", { note: "Outcome and controls verified." });
    assert.equal(verifiedChange.status, "completed");

    // Methodology feedback becomes a separately approved proposal and first-class Codex Build Job.
    const proposal = await call(`/api/feedback/${feedback.payload.feedback.id}/change-proposal`, {
      method: "POST",
      body: {}
    });
    assert.equal(proposal.response.status, 201);
    const preparation = await call(`/api/change-proposals/${proposal.payload.proposal.id}/decisions`, {
      method: "POST",
      body: {
        phase: "preparation",
        action: "prepare-change",
        actor: "Jamie Peppard",
        reason: "Prepare the smallest coherent visibility correction."
      }
    });
    assert.equal(preparation.payload.proposal.status, "approved-for-preparation");
    const methodologyWork = await call(`/api/my-work?search=${encodeURIComponent(proposal.payload.proposal.title)}`);
    const methodologyChangeItem = methodologyWork.payload.items.find((item) => item.recordType === "change");
    assert.ok(methodologyChangeItem);

    // 9. The complete brief is handed to Codex and a full receipt is returned.
    const build = await call("/api/implementation-jobs", {
      method: "POST",
      body: {
        recordId: methodologyChangeItem.sourceId,
        approvedRequirement: "Make release evidence and its authority boundary visible in My Work.",
        acceptanceCriteria: ["The exact release decision is visible.", "No approval is inferred."],
        testExpectations: ["Automated journey test", "Desktop and phone-width browser test"]
      }
    });
    assert.equal(build.response.status, 201, JSON.stringify(build.payload));
    assert.match(build.payload.job.briefText, /Approved-for-preparation requirement/);
    assert.match(build.payload.job.authorityBoundary, /remain unauthorised/i);
    const jobId = build.payload.job.id;
    const receipt = await call(`/api/implementation-jobs/${jobId}/receipt`, {
      method: "POST",
      body: {
        branchName: "codex/release-evidence",
        pullRequestUrl: "https://github.com/example/operations-automated/pull/123",
        commitSha: "abcdef1234567890",
        filesChanged: ["app/app.js", "app/server.mjs"],
        tests: ["node --test: passed"],
        validation: ["Desktop journey: passed", "Phone-width journey: passed"],
        unresolvedRisks: [],
        versionImpact: "Proposed Workbench 0.3; methodology unchanged."
      }
    });
    assert.equal(receipt.response.status, 200, JSON.stringify(receipt.payload));
    assert.equal(receipt.payload.job.status, "waiting-for-review");
    assert.equal(receipt.payload.job.releaseApproval.result, "pending");

    // 10. Universal approval requires exact founder confirmation and performs no merge.
    const refused = await call(`/api/implementation-jobs/${jobId}/release-decision`, {
      method: "POST",
      body: { action: "approve", confirmation: "yes" }
    });
    assert.equal(refused.response.status, 403);
    const release = await call(`/api/implementation-jobs/${jobId}/release-decision`, {
      method: "POST",
      body: { action: "approve", confirmation: "Approve release", reason: "Acceptance evidence reviewed." }
    });
    assert.equal(release.response.status, 200);
    assert.equal(release.payload.job.status, "release-authorised");
    assert.match(release.payload.message, /No merge was performed/i);
    const controls = await call(`/api/governed-controls?sourceType=implementation-job&sourceId=${jobId}`);
    assert.equal(controls.payload.approvals[0].explicit_confirmation, "Approve release");
    assert.ok(controls.payload.approvals[0].remainsUnauthorised.includes("external publication"));

    // 10. Only an authorised external merge receipt completes the Change, and restart preserves it.
    const mergeReceipt = await call(`/api/implementation-jobs/${jobId}/merge-receipt`, {
      method: "POST",
      body: {
        mergedCommitSha: "fedcba9876543210",
        mergeUrl: "https://github.com/example/operations-automated/pull/123"
      }
    });
    assert.equal(mergeReceipt.response.status, 200);
    assert.equal(mergeReceipt.payload.job.status, "merged");
    assert.ok(mergeReceipt.payload.job.receipt.repositoryReindexedAt);
    assert.ok(mergeReceipt.payload.job.receipt.publicationQueueId);
    await stopWorkbench(running.child);
    running = await startWorkbench({ port, dataRoot, repositoryRoot });
    const restarted = await running.call(`/api/implementation-jobs/${jobId}`);
    assert.equal(restarted.payload.job.status, "merged");
    assert.equal(restarted.payload.job.receipt.mergedCommitSha, "fedcba9876543210");
  } finally {
    await stopWorkbench(running.child);
    await rm(dataRoot, { recursive: true, force: true });
    await rm(repositoryRoot, { recursive: true, force: true });
  }
});

test("an existing pre-migration database upgrades without losing retained conversation data", { timeout: 20_000 }, async () => {
  const dataRoot = await mkdtemp(join(tmpdir(), "oa-existing-data-"));
  const repositoryRoot = await fixtureRepository();
  const port = 45174;
  const database = new DatabaseSync(join(dataRoot, "workbench.sqlite"));
  database.exec(`
    CREATE TABLE conversations (
      id TEXT PRIMARY KEY, workspace TEXT NOT NULL, title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', rolling_summary TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    INSERT INTO conversations VALUES(
      'retained-conversation','living-methodology','Retained before migration',
      'active','', '2026-07-01T09:00:00.000Z','2026-07-01T09:00:00.000Z'
    );
  `);
  database.close();
  const running = await startWorkbench({ port, dataRoot, repositoryRoot });
  try {
    const retained = await running.call("/api/conversations/retained-conversation");
    assert.equal(retained.response.status, 200);
    assert.equal(retained.payload.conversation.title, "Retained before migration");
    assert.equal(retained.payload.conversation.activeRecord, null);
    const settings = await running.call("/api/settings");
    assert.ok(settings.payload.approvedBaseline.document_count >= 2);
    const profiles = await running.call("/api/work-profiles");
    assert.equal(profiles.payload.profiles.length, 7);
  } finally {
    await stopWorkbench(running.child);
    await rm(dataRoot, { recursive: true, force: true });
    await rm(repositoryRoot, { recursive: true, force: true });
  }
});
