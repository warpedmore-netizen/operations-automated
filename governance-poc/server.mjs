import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { GovernanceStore } from "./store.mjs";
const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const types = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8" };
const json = (response, status, value) => { response.writeHead(status, { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" }); response.end(JSON.stringify(value)); };
async function body(request) { const chunks = []; let size = 0; for await (const chunk of request) { size += chunk.length; if (size > 64_000) throw new Error("Request is too large"); chunks.push(chunk); } return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}; }
export function createGovernanceServer({ statePath = join(root, "data", "state.json") } = {}) {
  const store = new GovernanceStore(statePath);
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      if (url.pathname === "/api/state" && request.method === "GET") return json(response, 200, await store.read());
      if (url.pathname === "/api/reset" && request.method === "POST") return json(response, 200, await store.reset());
      if (url.pathname.startsWith("/api/actions/") && request.method === "POST") return json(response, 200, await store.act(url.pathname.slice(13), await body(request)));
      if (url.pathname.startsWith("/api/")) return json(response, 404, { error: "API route not found" });
      const relative = normalize(decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html"); const path = resolve(join(root, relative));
      if (path !== root && !path.toLowerCase().startsWith(`${root}${sep}`.toLowerCase())) throw new Error("Not found");
      if (!(await stat(path)).isFile()) throw new Error("Not found");
      response.writeHead(200, { "Cache-Control": "no-store", "Content-Type": types[extname(path)] ?? "application/octet-stream" }); response.end(await readFile(path));
    } catch (error) { if ((request.url ?? "").startsWith("/api/")) return json(response, 400, { error: error.message }); response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); response.end("Not found"); }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { const port = Number.parseInt(process.env.GOVERNANCE_PORT ?? "4174", 10); createGovernanceServer().listen(port, "127.0.0.1", () => process.stdout.write(`Governance as Code POC running at http://127.0.0.1:${port}\n`)); }
