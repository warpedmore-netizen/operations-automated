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

    const detail = await call(`/api/operate/records/${caseResult.record.id}`);
    assert.equal(detail.response.ok, true);
    assert.equal(detail.payload.record.children.length, 2);
    assert.ok(detail.payload.record.activity.some((item) => item.action === "record.created"));

    const inbox = await call("/api/my-work?order=recommended");
    assert.equal(inbox.response.ok, true);
    assert.ok(inbox.payload.items.some((item) => item.sourceId === requestResult.record.id));
    assert.ok(inbox.payload.doNext.slice(0, 3).some((item) => item.sourceId === requestResult.record.id));
    assert.match(inbox.payload.prioritisation.explanation, /impact, urgency, risk/i);
    assert.equal(inbox.payload.prioritisation.approvalCreated, false);

    const completed = await call(`/api/operate/records/${taskResult.record.id}`, {
      method: "PATCH",
      body: { status: "done", actor: "Jamie Peppard" }
    });
    assert.equal(completed.response.ok, true);
    assert.equal(completed.payload.record.status, "done");
    const afterCompletion = await call("/api/my-work?order=recommended");
    assert.equal(afterCompletion.payload.items.some((item) => item.sourceId === taskResult.record.id), false);

    const approvalResult = await create({ title: "Authorise a sensitive release", recordType: "approval" });
    const unsafeApproval = await call(`/api/operate/records/${approvalResult.record.id}`, {
      method: "PATCH",
      body: { status: "approved", actor: "Jamie Peppard" }
    });
    assert.equal(unsafeApproval.response.status, 403);
    const explicitApproval = await call(`/api/operate/records/${approvalResult.record.id}`, {
      method: "PATCH",
      body: { status: "approved", actor: "Jamie Peppard", confirmation: "Approve" }
    });
    assert.equal(explicitApproval.response.ok, true);
    assert.equal(explicitApproval.payload.record.approvalState, "human-confirmed");

    const riskResult = await create({ title: "Loss of recovery evidence", recordType: "risk" });
    const unsafeAcceptance = await call(`/api/operate/records/${riskResult.record.id}`, {
      method: "PATCH",
      body: { status: "accepted", actor: "Jamie Peppard" }
    });
    assert.equal(unsafeAcceptance.response.status, 403);
    const explicitAcceptance = await call(`/api/operate/records/${riskResult.record.id}`, {
      method: "PATCH",
      body: { status: "accepted", actor: "Jamie Peppard", confirmation: "Accept risk" }
    });
    assert.equal(explicitAcceptance.response.ok, true);
    const acceptedInbox = await call("/api/my-work?order=recommended");
    assert.equal(acceptedInbox.payload.items.some((item) => item.sourceId === riskResult.record.id), true);

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
