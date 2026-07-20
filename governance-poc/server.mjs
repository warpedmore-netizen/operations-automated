import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number.parseInt(process.env.GOVERNANCE_PORT ?? "4174", 10);
const types = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8" };
createServer(async (request, response) => {
  try {
    const relative = normalize(decodeURIComponent((request.url ?? "/").split("?")[0]).replace(/^\/+/, "") || "index.html");
    const path = resolve(join(root, relative));
    if (path !== root && !path.toLowerCase().startsWith(`${root}${sep}`.toLowerCase())) throw new Error("Not found");
    if (!(await stat(path)).isFile()) throw new Error("Not found");
    response.writeHead(200, { "Cache-Control": "no-store", "Content-Type": types[extname(path)] ?? "application/octet-stream" }); response.end(await readFile(path));
  } catch { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); response.end("Not found"); }
}).listen(port, "127.0.0.1", () => process.stdout.write(`Governance as Code POC running at http://127.0.0.1:${port}\n`));
