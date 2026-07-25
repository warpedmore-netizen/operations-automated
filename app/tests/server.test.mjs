import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("local API persists governed conversations and the complete feedback-to-change loop", { timeout: 20_000 }, async () => {
  const port = 43173;
  const dataRoot = await mkdtemp(join(tmpdir(), "oa-workbench-test-"));
  const repositoryRoot = await mkdtemp(join(tmpdir(), "oa-repository-test-"));
  const methodologyRoot = join(repositoryRoot, "methodology");
  await mkdir(methodologyRoot, { recursive: true });
  const approvedPath = join(methodologyRoot, "approved-method.md");
  const initialApprovedContent = "---\nstatus: approved\nversion: 0.4\n---\n# Approved method\n\n## Accountability\n\nAlpha approved baseline requires a named human decision owner.\n";
  await writeFile(approvedPath, initialApprovedContent, "utf8");
  await writeFile(join(repositoryRoot, "CHANGELOG.md"), "# Changelog\n\n## 0.4 - Approved baseline\n", "utf8");

  const child = spawn(process.execPath, ["app/server.mjs"], {
    cwd: new URL("../..", import.meta.url),
    env: {
      ...process.env,
      PORT: String(port),
      OPENAI_API_KEY: "",
      WORKBENCH_DATA_ROOT: dataRoot,
      WORKBENCH_REPOSITORY_ROOT: repositoryRoot,
      WORKBENCH_REPOSITORY_MODE: "simulate"
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
    const raw = await response.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new Error(`${method} ${path} returned ${response.status} with a non-JSON body: ${raw.slice(0, 160)}`);
    }
    return { response, payload };
  };
  const ok = async (path, body, method = "POST") => {
    const result = await call(path, { method, body });
    assert.equal(result.response.ok, true, `${path}: ${JSON.stringify(result.payload)}; ${stderr}`);
    return result.payload;
  };
  try {
    const settings = await call("/api/settings");
    const expectedBuildVersion = (await readFile(new URL("../build-version.txt", import.meta.url), "utf8")).trim();
    assert.equal(settings.response.ok, true);
    assert.equal(settings.payload.buildVersion, expectedBuildVersion);

    const connections = await call("/api/connections");
    assert.equal(connections.response.ok, true);
    assert.equal(connections.payload.confluence.boundary.readOnlyEvidenceSync, true);
    assert.equal(connections.payload.confluence.boundary.writeEnabled, true);
    assert.equal(connections.payload.confluence.boundary.automaticWrites, false);
    assert.equal(connections.payload.confluence.boundary.deleteEnabled, false);
    assert.equal(connections.payload.confluence.boundary.managedPagesOnly, true);
    assert.equal(connections.payload.confluence.boundary.approvalCreated, false);
    assert.equal(connections.payload.confluence.publication.automaticPublication, false);
    assert.doesNotMatch(JSON.stringify(connections.payload), /apiToken|Authorization/i);

    const brandBoard = await fetch(`http://127.0.0.1:${port}/brand-system/index.html`);
    assert.equal(brandBoard.ok, true);
    assert.match(brandBoard.headers.get("content-type"), /text\/html/);
    assert.match(await brandBoard.text(), /Operations Automated brand system/i);
    const brandAsset = await fetch(`http://127.0.0.1:${port}/brand-system/assets/logo/generated/mark-colour-transparent-1024.png`);
    assert.equal(brandAsset.ok, true);
    assert.equal(brandAsset.headers.get("content-type"), "image/png");
    const manifest = await fetch(`http://127.0.0.1:${port}/manifest.webmanifest`);
    assert.equal(manifest.ok, true);
    assert.equal(manifest.headers.get("content-type"), "application/manifest+json; charset=utf-8");
    assert.match((await manifest.json()).name, /Knowledge Workbench/);

    const initialBrandReview = await call("/api/brand-review");
    assert.equal(initialBrandReview.response.ok, true);
    assert.equal(initialBrandReview.payload.status, "draft");
    assert.equal(initialBrandReview.payload.approvalState, "not-approved");
    assert.ok(initialBrandReview.payload.items.some((item) => item.id === "master-mark"));
    assert.ok(initialBrandReview.payload.adoption.surfaces.some((surface) => surface.id === "workbench" && surface.status === "pilot-applied"));

    const unsupportedBrandDecision = await call("/api/brand-review", {
      method: "POST",
      body: { itemId: "master-mark", action: "revise", reason: "" }
    });
    assert.equal(unsupportedBrandDecision.response.status, 400);
    const brandDecision = await ok("/api/brand-review", {
      itemId: "master-mark",
      action: "approve-internal",
      reason: ""
    });
    assert.equal(brandDecision.decision.actor, "Jamie Peppard");
    assert.equal(brandDecision.decision.approvalCreated, false);
    assert.equal(brandDecision.decision.repositoryChanged, false);
    assert.equal(brandDecision.review.approvalState, "not-approved");

    const unsafeConnectionAction = await fetch(`http://127.0.0.1:${port}/api/connections/confluence/publication-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Origin: "https://untrusted.example"
      },
      body: "{}"
    });
    assert.equal(unsafeConnectionAction.status, 415);

    const created = await ok("/api/conversations", { workspace: "living-methodology", title: "Governed loop verification" });
    const conversationId = created.conversation.id;
    const preview = await ok("/api/context/preview", {
      conversationId,
      text: "How does the approved baseline govern accountability?",
      outputType: "answer"
    });
    assert.equal(preview.executionMode, "Local repository synthesis");
    assert.equal(preview.estimatedCost, 0);
    assert.ok(preview.sources.some((source) => source.path === "methodology/approved-method.md" && source.status === "approved"));

    const userMessage = await ok(`/api/conversations/${conversationId}/messages`, {
      workingText: "The method should make the human accountability boundary clearer.",
      role: "user"
    });
    const responseResult = await ok("/api/respond", {
      conversationId,
      text: userMessage.message.working_text,
      outputType: "answer",
      confirmed: true
    });
    assert.equal(responseResult.usage.status, "offline");
    assert.equal(responseResult.message.metadata.approvalState, "not-approved");

    const recorded = await ok("/api/feedback", {
      conversationId,
      messageId: responseResult.message.id,
      disposition: "record-methodology-feedback",
      wording: "Clarify the methodology wording so human accountability is explicit."
    });
    const feedback = recorded.feedback;
    assert.equal(feedback.conversation_id, conversationId);
    assert.equal(feedback.message_id, responseResult.message.id);
    assert.equal(feedback.original_wording, "Clarify the methodology wording so human accountability is explicit.");
    assert.equal(feedback.feedback_type, "record-methodology-feedback");
    assert.equal(feedback.classification, "methodology-change-candidate");
    assert.equal(feedback.status, "awaiting-review");
    assert.equal(feedback.affected_workspace, "living-methodology");
    assert.equal(feedback.submitting_user, "Jamie Peppard");
    assert.equal(feedback.approvalState, "not-approved");
    assert.ok(feedback.created_at);

    const classified = await ok(`/api/feedback/${feedback.id}/classification`, {
      classification: "methodology-change-candidate"
    }, "PATCH");
    assert.equal(classified.approvalCreated, false);
    assert.equal(classified.feedback.status, "awaiting-review");
    assert.equal(classified.feedback.approvalState, "not-approved");

    const proposalResult = await ok(`/api/feedback/${feedback.id}/change-proposal`, {});
    const proposal = proposalResult.proposal;
    assert.equal(proposal.approvalState, "not-approved");
    assert.equal(proposal.repositoryChanged, undefined);
    assert.equal(proposal.change_kind, "methodology");
    assert.equal(proposal.problem_learning, feedback.original_wording);
    assert.ok(proposal.approvedSources.some((source) => source.status === "approved"));
    assert.ok(proposal.affectedFiles.includes("methodology/approved-method.md"));
    assert.ok(proposal.current_wording);
    assert.ok(proposal.proposed_wording);
    assert.ok(proposal.rationale);
    assert.ok(proposal.evidence.length);
    assert.ok(proposal.alternatives.length);
    assert.ok(proposal.risks.length);
    assert.ok(proposal.validationRequirements.length);
    assert.equal(typeof proposal.expected_cost, "number");
    assert.equal(typeof proposal.modelRoute.tier, "number");

    const prematureRelease = await call(`/api/change-proposals/${proposal.id}/decisions`, {
      method: "POST",
      body: {
        phase: "release",
        action: "approve-and-merge",
        actor: "Jamie Peppard",
        confirmation: "Approve and merge"
      }
    });
    assert.equal(prematureRelease.response.status, 409);
    assert.match(prematureRelease.payload.error, /after implementation|preparation approval/i);

    const beforePreparation = await readFile(approvedPath, "utf8");
    const prepared = await ok(`/api/change-proposals/${proposal.id}/decisions`, {
      phase: "preparation",
      action: "prepare-change",
      actor: "Jamie Peppard",
      reason: "Prepare a bounded draft for review."
    });
    assert.equal(prepared.proposal.status, "approved-for-preparation");
    assert.equal(prepared.repositoryChanged, false);
    assert.match(prepared.implementationInstruction, /new branch/i);
    assert.match(prepared.implementationInstruction, /not approved for release/i);
    assert.equal(await readFile(approvedPath, "utf8"), beforePreparation, "preparation must not edit the approved baseline");

    const handoff = await ok(`/api/change-proposals/${proposal.id}/implementation-handoff`, {});
    assert.equal(handoff.proposal.status, "implementation-in-progress");
    assert.equal(handoff.mainChanged, false);
    assert.equal(await readFile(approvedPath, "utf8"), beforePreparation, "implementation handoff must not edit main");

    const mainReference = await call(`/api/change-proposals/${proposal.id}/repository-reference`, {
      method: "POST",
      body: {
        branchName: "main",
        pullRequestUrl: "https://github.com/warpedmore-netizen/operations-automated/pull/99",
        isDraft: true,
        commitSha: "abcdef1234567",
        validationStatus: "passed",
        decisionRecordIncluded: true,
        changelogUpdated: true,
        versionImpact: "Methodology minor"
      }
    });
    assert.equal(mainReference.response.status, 409);
    assert.match(mainReference.payload.error, /non-main branch/i);

    const referenced = await ok(`/api/change-proposals/${proposal.id}/repository-reference`, {
      branchName: "codex/accountability-wording",
      pullRequestUrl: "https://github.com/warpedmore-netizen/operations-automated/pull/99",
      isDraft: true,
      commitSha: "abcdef1234567",
      validationStatus: "passed",
      tests: ["54 tests passed"],
      decisionRecordIncluded: true,
      changelogUpdated: true,
      versionImpact: "Methodology 0.4 to 0.5",
      methodologyVersion: "0.5"
    });
    assert.equal(referenced.proposal.status, "awaiting-release-approval");
    assert.equal(referenced.mainChanged, false);

    const receiptWithoutApproval = await call(`/api/change-proposals/${proposal.id}/implementation-receipt`, {
      method: "POST",
      body: {
        pullRequestUrl: referenced.proposal.pull_request_url,
        commitSha: "fedcba7654321",
        methodologyVersion: "0.5",
        sourceRef: "working-tree"
      }
    });
    assert.equal(receiptWithoutApproval.response.status, 403);
    assert.match(receiptWithoutApproval.payload.error, /founder release approval/i);

    const release = await ok(`/api/change-proposals/${proposal.id}/decisions`, {
      phase: "release",
      action: "approve-and-merge",
      actor: "Jamie Peppard",
      confirmation: "Approve and merge",
      reason: "Validated and ready for the founder-controlled release."
    });
    assert.equal(release.manualMergeRequired, true);
    assert.equal(release.proposal.status, "awaiting-release-approval");
    const phases = release.proposal.decisions.map((decision) => decision.phase);
    assert.ok(phases.includes("preparation"));
    assert.ok(phases.includes("release"));
    assert.notEqual(release.proposal.decisions.find((decision) => decision.phase === "preparation").id, release.proposal.decisions.find((decision) => decision.phase === "release").id);

    const mergedApprovedContent = "---\nstatus: approved\nversion: 0.5\n---\n# Approved method\n\n## Accountability\n\nOmega merged approved context requires a named human decision owner and explicit release record.\n";
    await writeFile(approvedPath, mergedApprovedContent, "utf8");
    await writeFile(join(repositoryRoot, "CHANGELOG.md"), "# Changelog\n\n## 0.5 - Accountability wording\n", "utf8");
    const receipt = await ok(`/api/change-proposals/${proposal.id}/implementation-receipt`, {
      pullRequestUrl: referenced.proposal.pull_request_url,
      commitSha: "fedcba7654321",
      methodologyVersion: "0.5",
      sourceRef: "working-tree"
    });
    assert.equal(receipt.proposal.status, "implemented");
    assert.equal(receipt.proposal.feedback_status, "implemented");
    assert.equal(receipt.proposal.receipt.commit_sha, "fedcba7654321");
    assert.equal(receipt.proposal.receipt.baseline_version, "0.5");

    const approvedContext = await call("/api/repository/context?query=omega%20merged&approvedOnly=true");
    assert.equal(approvedContext.response.ok, true);
    assert.ok(approvedContext.payload.sources.some((source) => source.path === "methodology/approved-method.md" && source.status === "approved" && /Omega merged/.test(source.excerpt)));

    const rejectedRecorded = await ok("/api/feedback", {
      conversationId,
      messageId: responseResult.message.id,
      disposition: "record-methodology-feedback",
      wording: "Rejected zebra wording must never become approved retrieval evidence."
    });
    const rejectedProposal = await ok(`/api/feedback/${rejectedRecorded.feedback.id}/change-proposal`, {});
    const rejected = await ok(`/api/change-proposals/${rejectedProposal.proposal.id}/decisions`, {
      phase: "preparation",
      action: "reject",
      actor: "Jamie Peppard",
      reason: "Context-specific and unsupported."
    });
    assert.equal(rejected.proposal.status, "rejected");
    const rejectedContext = await call("/api/repository/context?query=rejected%20zebra&approvedOnly=true");
    assert.equal(rejectedContext.response.ok, true);
    assert.equal(rejectedContext.payload.sources.some((source) => /Rejected zebra/i.test(source.excerpt)), false);

    const auditResult = await call("/api/audit");
    assert.equal(auditResult.response.ok, true);
    const auditEvents = auditResult.payload.events;
    for (const action of [
      "feedback.recorded",
      "feedback.classified",
      "change-proposal.created",
      "change-decision.recorded",
      "implementation-handoff.created",
      "repository-preparation.recorded",
      "release-merge.authorised",
      "repository.reindexed",
      "change.implemented",
      "brand-review.recorded"
    ]) assert.ok(auditEvents.some((event) => event.action === action), `${action} should remain auditable`);
    const preparationAudit = auditEvents.find((event) => event.action === "repository-preparation.recorded");
    assert.equal(preparationAudit.detail.branchName, "codex/accountability-wording");
    assert.equal(preparationAudit.detail.pullRequestUrl, "https://github.com/warpedmore-netizen/operations-automated/pull/99");
    assert.equal(preparationAudit.detail.mainChanged, false);

    const baseline = await call("/api/repository/baseline");
    assert.equal(baseline.response.ok, true);
    assert.equal(baseline.payload.baseline.baseline_version, "0.5");
    assert.ok(baseline.payload.approved.some((item) => item.path === "methodology/approved-method.md"));

    const voiceWithoutKey = await call("/api/audio/transcribe", {
      method: "POST",
      body: { invalid: "audio" }
    });
    assert.equal(voiceWithoutKey.response.status, 503);
  } finally {
    child.kill();
    await new Promise((resolve) => child.once("exit", resolve));
    await Promise.all([
      rm(dataRoot, { recursive: true, force: true }),
      rm(repositoryRoot, { recursive: true, force: true })
    ]);
  }
});
