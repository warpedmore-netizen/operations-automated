import { spawn } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const helperPath = resolve(fileURLToPath(new URL("./secure-store.ps1", import.meta.url)));

export function credentialStorePath(environment = process.env) {
  const base = environment.LOCALAPPDATA;
  if (!base) return "";
  return resolve(join(base, "OperationsAutomated", "Workbench", "confluence.credentials"));
}

export function createCredentialStore({
  platform = process.platform,
  environment = process.env,
  runPowerShell
} = {}) {
  const storePath = credentialStorePath(environment);
  const available = platform === "win32" && Boolean(storePath);

  const invoke = runPowerShell || ((operation, payload) => new Promise((resolvePromise, reject) => {
    if (!available) {
      reject(Object.assign(new Error("Encrypted credential storage is available on Windows only in this private release."), { status: 503 }));
      return;
    }
    const executable = join(environment.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
    const child = spawn(executable, [
      "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
      "-File", helperPath, "-Operation", operation, "-StorePath", storePath
    ], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    const output = [];
    child.stdout.on("data", (chunk) => output.push(chunk));
    child.stderr.on("data", () => { /* Deliberately do not retain helper output that could contain local details. */ });
    child.on("error", () => reject(Object.assign(new Error("The encrypted Windows credential store could not be opened."), { status: 503 })));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(Object.assign(new Error("Windows could not protect or retrieve the saved Confluence connection."), { status: 503 }));
        return;
      }
      try {
        resolvePromise(JSON.parse(Buffer.concat(output).toString("utf8").replace(/^\uFEFF/, "") || "{}"));
      } catch {
        reject(Object.assign(new Error("The encrypted credential store returned an invalid response."), { status: 503 }));
      }
    });
    if (payload !== undefined) child.stdin.end(JSON.stringify(payload), "utf8");
    else child.stdin.end();
  }));

  return {
    available,
    async get() {
      if (!available) return null;
      const result = await invoke("Get");
      return result.configured ? result.value : null;
    },
    async set(value) {
      if (!available) throw Object.assign(new Error("Encrypted credential storage is not available on this computer."), { status: 503 });
      await invoke("Set", value);
      return true;
    },
    async delete() {
      if (!available) throw Object.assign(new Error("Encrypted credential storage is not available on this computer."), { status: 503 });
      await invoke("Delete");
      return true;
    }
  };
}
