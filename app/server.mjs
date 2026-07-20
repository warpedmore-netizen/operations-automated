import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? "4173", 10);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname.split("?")[0]);
  const relative = normalize(decoded === "/" ? "index.html" : decoded.replace(/^\/+/, ""));
  const candidate = resolve(join(appRoot, relative));
  const rootWithSeparator = `${appRoot}${sep}`.toLowerCase();
  if (candidate.toLowerCase() !== appRoot.toLowerCase() && !candidate.toLowerCase().startsWith(rootWithSeparator)) return null;
  return candidate;
}

createServer(async (request, response) => {
  try {
    const path = safePath(request.url ?? "/");
    if (!path || !(await stat(path)).isFile()) throw new Error("Not found");
    const body = await readFile(path);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[extname(path)] ?? "application/octet-stream"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`OPERATE Workspace running at http://127.0.0.1:${port}\n`);
});
