import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backup, DatabaseSync } from "node:sqlite";

test("local API persists governed conversations and the complete feedback-to-change loop", { timeout: 20_000 }, async () => {
  const port = 43173;
  const dataRoot = await mkdtemp(join(tmpdir(), "oa-workbench-test-"));
  const repositoryRoot = await mkdtemp(join(tmpdir(), "oa-repository-test-"));
  const methodologyRoot = join(repositoryRoot, "methodology");
  await mkdir(methodologyRoot, { recursive: true });
  await mkdir(join(repositoryRoot, "projects"), { recursive: true });
  await mkdir(join(repositoryRoot, "prompts", "approved"), { recursive: true });
  await mkdir(join(repositoryRoot, "decisions"), { recursive: true });
  await mkdir(join(repositoryRoot, "docs", "recovery"), { recursive: true });
  const approvedPath = join(methodologyRoot, "approved-method.md");
  const initialApprovedContent = "---\nstatus: approved\nversion: 0.4\n---\n# Approved method\n\n## Accountability\n\nAlpha approved baseline requires a named human decision owner.\n";
  await writeFile(approvedPath, initialApprovedContent, "utf8");
  await writeFile(join(repositoryRoot, "CHANGELOG.md"), "# Changelog\n\n## 0.4 - Approved baseline\n", "utf8");
  await writeFile(join(repositoryRoot, "STEERING.md"), "---\nid: OA-STEERING-TEST\nstatus: approved\nversion: 0.1\napproving_decision: OA-DECISION-TEST\n---\n# Test steering\n", "utf8");
  await writeFile(join(repositoryRoot, "projects", "project-registry.yml"), JSON.stringify({ version: "0.1", projects: [{ project_id: "ai-workbench", product_name: "Test Workbench", purpose_document: "methodology/approved-method.md", purpose_id: "OA-METHOD-TEST", purpose_version: "0.4", repository: "test", product_owner: "Jamie Peppard", current_status: "test", intended_users: ["Jamie"], core_outcome: "Test governed builds", information_boundary: "test data", authority_boundary: "Jamie decides", connected_products: [], excluded_products: [], release_lifecycle: "test", prompt_registry_location: "prompts/prompt-registry.yml" }] }, null, 2), "utf8");
  await writeFile(join(repositoryRoot, "prompts", "approved", "build.md"), "PROMPT PROVENANCE\nComplete the bounded test build.", "utf8");
  await writeFile(join(repositoryRoot, "prompts", "prompt-registry.yml"), JSON.stringify({ version: "0.1", prompts: [{ prompt_id: "OA-PROMPT-TEST", title: "Test build", target_project: "ai-workbench", target_capability: "product-application-build", exact_version: "1.0", status: "approved", exact_text_path: "prompts/approved/build.md", purpose_version: "OA-METHOD-TEST@0.4", steering_version: "OA-STEERING-TEST@0.1", effective_date: "2026-07-29", superseded_prompt: null, reason_for_change: "Test fixture", approving_decision: "OA-DECISION-TEST", builds_or_pull_requests: [], migration_impact: "None" }] }, null, 2), "utf8");
  await writeFile(join(repositoryRoot, "decisions", "test.md"), "---\nid: OA-DECISION-TEST\nstatus: recorded\n---\n# Test decision\n", "utf8");
  await writeFile(join(repositoryRoot, "docs", "recovery", "recovery-registry.yml"), JSON.stringify({ latest: { restore_status: "succeeded" } }), "utf8");

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
    assert.equal(initialBrandReview.payload.feedbackLoop.awaitingCodexReview, 0);
    assert.equal(initialBrandReview.payload.feedbackLoop.readyForFounderReview, 0);
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

    const typographyRevision = await ok("/api/brand-review", {
      itemId: "typography",
      action: "revise",
      reason: "The supporting line is hard to read."
    });
    const pendingTypography = typographyRevision.review.feedbackLoop.items.find((item) => item.itemId === "typography");
    assert.equal(pendingTypography.state, "awaiting-codex-review");
    assert.equal(typographyRevision.review.feedbackLoop.awaitingCodexReview, 1);
    const typographyResponse = await ok("/api/brand-review/responses", {
      decisionId: typographyRevision.decision.id,
      disposition: "revision-prepared",
      summary: "Increased the supporting line's size, contrast and visual separation.",
      affectedFiles: ["app/app.js", "app/styles.css"],
      sourceRef: "working-tree",
      repositoryChanged: true
    });
    const preparedTypography = typographyResponse.review.feedbackLoop.items.find((item) => item.itemId === "typography");
    assert.equal(preparedTypography.state, "revision-prepared");
    assert.equal(preparedTypography.response.approvalCreated, false);
    assert.equal(preparedTypography.response.automaticRepositoryWrite, false);
    assert.equal(preparedTypography.response.repositoryChanged, true);
    assert.equal(typographyResponse.review.feedbackLoop.awaitingCodexReview, 0);
    assert.equal(typographyResponse.review.feedbackLoop.readyForFounderReview, 1);
    assert.equal(typographyResponse.review.approvalState, "not-approved");

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
    assert.doesNotMatch(responseResult.message.working_text, /methodology\/approved-method\.md|repository status|source hash/i);
    assert.equal(responseResult.message.metadata.activeWorkDetails, null);
    assert.equal(responseResult.methodologyApplication.methodology_version, "0.4");
    assert.equal(responseResult.methodologyApplication.knowledge_snapshot.baseline_version, "0.4");
    assert.equal(responseResult.methodologyApplication.approval_state, "not-approved");

    const answerCorrection = await ok("/api/feedback", {
      conversationId,
      messageId: responseResult.message.id,
      disposition: "needs-clarification",
      wording: "The answer hid the human accountability decision.",
      affectedComponents: ["human-ai-collaboration"],
      sourceReference: "Founder correction in the controlled test conversation",
      permissionBoundary: "Authorised non-confidential test fixture",
      confidentialityBoundary: "No external or confidential data",
      evidence: ["Observed answer in this conversation"],
      evidenceLimitations: "One simulated interaction",
      aiInterpretation: "The immediate answer needs correction before considering methodology meaning."
    });
    assert.equal(answerCorrection.feedback.learning_disposition, "answer-only-correction");
    assert.equal(answerCorrection.feedback.status, "retained");
    assert.equal(answerCorrection.proposal, null);

    const recorded = await ok("/api/feedback", {
      conversationId,
      messageId: responseResult.message.id,
      disposition: "record-methodology-feedback",
      wording: "Clarify the methodology wording so human accountability is explicit.",
      affectedComponents: ["human-ai-collaboration"],
      sourceReference: "Founder methodology feedback in the controlled test conversation",
      permissionBoundary: "Authorised non-confidential test fixture",
      confidentialityBoundary: "No external or confidential data",
      evidence: ["Founder correction", "Related answer-only correction"],
      evidenceLimitations: "Founder evidence only; not independently validated",
      aiInterpretation: "The repeated issue may justify a bounded clarification after a counter-test.",
      outcomeReviewTrigger: "Review after a later conversation uses the released wording."
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
    assert.equal(feedback.learning_disposition, "methodology-change-candidate");
    assert.ok(feedback.relatedFeedback.some((item) => item.id === answerCorrection.feedback.id));
    assert.equal(feedback.source_reference, "Founder methodology feedback in the controlled test conversation");
    assert.equal(feedback.source_type, "workbench-conversation");
    assert.deepEqual(feedback.evidence, ["Founder correction", "Related answer-only correction"]);
    assert.ok(feedback.contextual_meaning);
    assert.ok(feedback.assessment_change);
    assert.ok(feedback.uncertainty);
    assert.ok(feedback.counter_test);
    assert.equal(feedback.affected_product, "Operations Automated Methodology");
    assert.ok(feedback.disposition_reason);
    assert.equal(feedback.visibleDisposition, "Methodology change proposed");
    assert.equal(feedback.approvalState, "not-approved");
    assert.ok(feedback.created_at);

    const classified = await ok(`/api/feedback/${feedback.id}/classification`, {
      classification: "methodology-change-candidate"
    }, "PATCH");
    assert.equal(classified.approvalCreated, false);
    assert.equal(classified.feedback.status, "awaiting-review");
    assert.equal(classified.feedback.approvalState, "not-approved");

    const synthesisResult = await ok("/api/feedback/synthesis", {
      feedbackIds: [answerCorrection.feedback.id, feedback.id]
    });
    assert.deepEqual(synthesisResult.synthesis.signalIds, [answerCorrection.feedback.id, feedback.id]);
    assert.equal(synthesisResult.synthesis.status, "proposed");
    assert.equal(synthesisResult.synthesis.approvalState, "not-approved");

    const learningBeforeChange = await call("/api/methodology-learning");
    assert.equal(learningBeforeChange.response.ok, true);
    assert.equal(learningBeforeChange.payload.approvedChangesQuestion.traces.length, 0);
    assert.ok(learningBeforeChange.payload.unresolvedQuestion.signals.some((item) => item.id === feedback.id));
    assert.ok(learningBeforeChange.payload.buckets.relatedClusters.some((item) =>
      item.signalIds.includes(answerCorrection.feedback.id) && item.signalIds.includes(feedback.id)
    ));

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
    assert.ok(proposal.relatedFeedback.some((item) => item.id === answerCorrection.feedback.id));
    assert.ok(proposal.synthesis.signalIds.includes(answerCorrection.feedback.id));
    assert.match(proposal.evidence_strength, /related retained signals/i);
    assert.ok(proposal.counterTests.length);
    assert.ok(proposal.disagreements.length);
    assert.deepEqual(proposal.affectedComponents, ["human-ai-collaboration"]);
    assert.ok(proposal.affectedProductsAndPrompts.some((item) => /Workbench/i.test(item)));
    assert.ok(proposal.migration);
    assert.ok(proposal.recommendation);
    assert.ok(proposal.exact_decision_required);
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
    const preChangeDatabasePath = join(dataRoot, "pre-change-test-copy.sqlite");
    const liveDatabase = new DatabaseSync(join(dataRoot, "workbench.sqlite"));
    await backup(liveDatabase, preChangeDatabasePath);
    liveDatabase.close();
    const prepared = await ok(`/api/change-proposals/${proposal.id}/decisions`, {
      phase: "preparation",
      action: "prepare-change",
      actor: "Jamie Peppard",
      reason: "Prepare a bounded draft for review."
    });
    assert.equal(prepared.proposal.status, "implementation-in-progress");
    assert.equal(prepared.implementationJob.status, "waiting-on-codex");
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
    assert.ok(receipt.releaseId);
    assert.equal(receipt.proposal.release.approver, "Jamie Peppard");
    assert.equal(receipt.proposal.release.version, "0.5");
    assert.ok(receipt.proposal.release.effectiveContent.includes("methodology/approved-method.md"));
    assert.ok(receipt.proposal.release.distributionDestinations.includes("Workbench repository index"));

    const approvedContext = await call("/api/repository/context?query=omega%20merged&approvedOnly=true");
    assert.equal(approvedContext.response.ok, true);
    assert.ok(approvedContext.payload.sources.some((source) => source.path === "methodology/approved-method.md" && source.status === "approved" && /Omega merged/.test(source.excerpt)));

    const laterConversation = await ok("/api/conversations", { workspace: "living-methodology", title: "Later-version proof" });
    const laterResponse = await ok("/api/respond", {
      conversationId: laterConversation.conversation.id,
      text: "What does the approved accountability wording require?",
      outputType: "answer",
      confirmed: true
    });
    assert.equal(laterResponse.methodologyApplication.methodology_version, "0.5");
    assert.equal(laterResponse.methodologyApplication.knowledge_snapshot.baseline_version, "0.5");
    assert.ok(laterResponse.methodologyApplication.knowledge_snapshot.sources.some((source) =>
      source.path === "methodology/approved-method.md" && source.version === "0.5" && source.status === "approved"
    ));

    const outcomeReview = await ok(`/api/change-proposals/${proposal.id}/outcome-review`, {
      expectedOutcome: "A later answer uses the released accountability meaning and exposes the human decision owner.",
      observedOutcome: "The later conversation used baseline 0.5 and retrieved the approved 0.5 source.",
      evidence: [laterResponse.knowledgeSnapshotId],
      result: "met",
      learning: "The release-to-reindex-to-later-use trace is working in the controlled fixture.",
      nextDisposition: "no-action",
      reviewer: "Jamie Peppard"
    });
    assert.equal(outcomeReview.review.result, "met");
    assert.deepEqual(outcomeReview.trace, {
      feedbackId: feedback.id,
      proposalId: proposal.id,
      releaseId: receipt.proposal.release.id,
      reviewId: outcomeReview.review.id
    });

    const learningAfterOutcome = await call("/api/methodology-learning");
    assert.equal(learningAfterOutcome.response.ok, true);
    assert.equal(learningAfterOutcome.payload.approvedChangesQuestion.traces.length, 1);
    const feedbackTrace = learningAfterOutcome.payload.approvedChangesQuestion.traces[0];
    assert.equal(feedbackTrace.feedback.id, feedback.id);
    assert.equal(feedbackTrace.proposal.id, proposal.id);
    assert.equal(feedbackTrace.release.id, receipt.proposal.release.id);
    assert.equal(feedbackTrace.laterUsage[0].baselineVersion, "0.5");
    assert.equal(feedbackTrace.outcomeReviews[0].result, "met");

    const restoredDatabase = new DatabaseSync(preChangeDatabasePath, { readOnly: true });
    assert.ok(Number(restoredDatabase.prepare("SELECT COUNT(*) AS count FROM conversations").get().count) >= 1);
    assert.ok(Number(restoredDatabase.prepare("SELECT COUNT(*) AS count FROM feedback").get().count) >= 2);
    assert.equal(Number(restoredDatabase.prepare("SELECT COUNT(*) AS count FROM methodology_releases").get().count), 0);
    restoredDatabase.close();
    const restoredRepositoryCopy = join(repositoryRoot, "restored-pre-change-approved-method.md");
    await writeFile(restoredRepositoryCopy, beforePreparation, "utf8");
    assert.equal(await readFile(restoredRepositoryCopy, "utf8"), initialApprovedContent);

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
    assert.equal(rejected.proposal.feedback_wording, "Rejected zebra wording must never become approved retrieval evidence.");
    const rejectedContext = await call("/api/repository/context?query=rejected%20zebra&approvedOnly=true");
    assert.equal(rejectedContext.response.ok, true);
    assert.equal(rejectedContext.payload.sources.some((source) => /Rejected zebra/i.test(source.excerpt)), false);

    const governanceSignal = await ok("/api/feedback", {
      conversationId,
      messageId: responseResult.message.id,
      disposition: "add-evidence",
      wording: "A Dynamic Governance finding may indicate a control-design gap.",
      sourceReference: "dynamic-governance://finding/test-1",
      permissionBoundary: "Authorised non-confidential test finding",
      confidentialityBoundary: "Finding summary only",
      evidence: ["Controlled fixture finding"],
      evidenceLimitations: "A finding is a signal, not automatic methodology evidence."
    });
    assert.equal(governanceSignal.feedback.classification, "evidence-submission");
    assert.equal(governanceSignal.feedback.learning_disposition, "more-evidence");
    assert.equal(governanceSignal.feedback.approvalState, "not-approved");
    assert.equal(governanceSignal.proposal, null);

    const blockedRpgSignal = await call("/api/feedback", {
      method: "POST",
      body: {
        conversationId,
        messageId: responseResult.message.id,
        disposition: "add-evidence",
        wording: "Import this scenario result.",
        sourceReference: "incident-management-rpg://scenario/secret-1"
      }
    });
    assert.equal(blockedRpgSignal.response.status, 403);
    assert.match(blockedRpgSignal.payload.error, /approved signal contract/i);

    const auditResult = await call("/api/audit");
    assert.equal(auditResult.response.ok, true);
    const auditEvents = auditResult.payload.events;
    for (const action of [
      "feedback.recorded",
      "feedback.classified",
      "methodology-signals.synthesised",
      "change-proposal.created",
      "change-decision.recorded",
      "implementation-handoff.created",
      "repository-preparation.recorded",
      "release-merge.authorised",
      "repository.reindexed",
      "change.implemented",
      "methodology-release.recorded",
      "methodology-release.outcome-reviewed",
      "brand-review.recorded",
      "brand-review.response-recorded"
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
