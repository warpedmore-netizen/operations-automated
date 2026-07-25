import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("failed phone audio is explained and retained as a metadata-only audit event", { timeout: 20_000 }, async () => {
  const port = 43175;
  const dataRoot = await mkdtemp(join(tmpdir(), "oa-voice-data-test-"));
  const repositoryRoot = await mkdtemp(join(tmpdir(), "oa-voice-repository-test-"));
  await mkdir(join(repositoryRoot, "methodology"), { recursive: true });
  await writeFile(join(repositoryRoot, "methodology", "baseline.md"), "---\nstatus: approved\nversion: 0.6\n---\n# Baseline\n", "utf8");
  await writeFile(join(repositoryRoot, "CHANGELOG.md"), "# Changelog\n", "utf8");
  const child = spawn(process.execPath, ["app/server.mjs"], {
    cwd: new URL("../..", import.meta.url),
    env: {
      ...process.env,
      PORT: String(port),
      OPENAI_API_KEY: "test-only",
      OPENAI_TIER_2_MODEL: "test-only",
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
  try {
    const unsupported = await fetch(`http://127.0.0.1:${port}/api/audio/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Recording-Duration-Ms": "2400",
        "X-Recording-Sound-Detected": "true"
      },
      body: Uint8Array.from([1, 2, 3, 4, 5, 6])
    });
    assert.equal(unsupported.status, 415);
    const error = await unsupported.json();
    assert.equal(error.code, "UNSUPPORTED_AUDIO_FORMAT");
    assert.equal(error.retryable, true);

    const empty = await fetch(`http://127.0.0.1:${port}/api/audio/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "audio/webm" },
      body: new Uint8Array()
    });
    assert.equal(empty.status, 400);
    assert.equal((await empty.json()).code, "NO_AUDIO_RECEIVED");

    const auditResponse = await fetch(`http://127.0.0.1:${port}/api/audit`);
    assert.equal(auditResponse.ok, true);
    const audit = await auditResponse.json();
    const failures = audit.events.filter((event) => event.action === "audio.transcription.failed");
    assert.ok(failures.some((event) => event.detail.code === "UNSUPPORTED_AUDIO_FORMAT"));
    assert.ok(failures.some((event) => event.detail.code === "NO_AUDIO_RECEIVED"));
    for (const failure of failures) assert.equal(failure.detail.audioRetained, false);
  } finally {
    child.kill();
    await new Promise((resolve) => child.once("exit", resolve));
    await Promise.all([
      rm(dataRoot, { recursive: true, force: true }),
      rm(repositoryRoot, { recursive: true, force: true })
    ]);
  }
});
