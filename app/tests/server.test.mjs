import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

test("local API persists a conversation and returns a governed offline response", { timeout: 15_000 }, async () => {
  const port = 43173;
  const child = spawn(process.execPath, ["app/server.mjs"], {
    cwd: new URL("../..", import.meta.url),
    env: { ...process.env, PORT: String(port), OPENAI_API_KEY: "" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  await new Promise((resolve, reject) => {
    child.stdout.on("data", (chunk) => chunk.toString().includes("running at") && resolve());
    child.once("exit", (code) => reject(new Error(`Server exited ${code}: ${stderr}`)));
  });
  try {
    const post = async (path, value) => {
      const response = await fetch(`http://127.0.0.1:${port}${path}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value)
      });
      const payload = await response.json();
      assert.equal(response.ok, true, `${path}: ${JSON.stringify(payload)}; ${stderr}`);
      return payload;
    };
    const created = await post("/api/conversations", { workspace: "living-methodology", title: "Verification" });
    const id = created.conversation.id;
    const preview = await post("/api/context/preview", { conversationId: id, text: "How does human-led automation govern approval?", outputType: "answer" });
    assert.ok(preview.sources.length > 0);
    await post(`/api/conversations/${id}/messages`, { workingText: "How does human-led automation govern approval?", role: "user" });
    const result = await post("/api/respond", { conversationId: id, text: "How does human-led automation govern approval?", outputType: "answer", confirmed: true });
    assert.equal(result.usage.status, "offline");
    assert.equal(result.message.metadata.approvalState, "not-approved");
  } finally {
    child.kill();
    await new Promise((resolve) => child.once("exit", resolve));
  }
});
