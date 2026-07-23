import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile, unlink } from "node:fs/promises";
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { extname, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import {
  DEFAULT_SETTINGS, buildContextPreview, buildLocalSynthesis, buildProposalPacket, chooseRoute,
  estimateCost, extractFrontMatter, safeJson, validateSettings
} from "./workbench-core.mjs";

const appRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const repoRoot = resolve(appRoot, "..");
const dataRoot = resolve(appRoot, "local-data");
const attachmentRoot = resolve(dataRoot, "attachments");
const port = Number.parseInt(process.env.PORT ?? "4173", 10);
await mkdir(attachmentRoot, { recursive: true });

const db = new DatabaseSync(resolve(dataRoot, "workbench.sqlite"));
db.exec(`
  PRAGMA journal_mode=WAL;
  PRAGMA foreign_keys=ON;
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY, workspace TEXT NOT NULL, title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', rolling_summary TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, input_type TEXT NOT NULL DEFAULT 'text', original_text TEXT NOT NULL DEFAULT '',
    working_text TEXT NOT NULL DEFAULT '', language TEXT NOT NULL DEFAULT 'en',
    edited_after_capture INTEGER NOT NULL DEFAULT 0, route_json TEXT, metadata_json TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, message_id TEXT NOT NULL,
    disposition TEXT NOT NULL, wording TEXT NOT NULL DEFAULT '', interpretation TEXT NOT NULL DEFAULT '',
    affected_components TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'recorded',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS usage_records (
    id TEXT PRIMARY KEY, conversation_id TEXT, provider TEXT NOT NULL, model TEXT,
    input_tokens INTEGER NOT NULL DEFAULT 0, output_tokens INTEGER NOT NULL DEFAULT 0,
    estimated_cost REAL NOT NULL DEFAULT 0, latency_ms INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY, action TEXT NOT NULL, entity_type TEXT NOT NULL,
    entity_id TEXT, detail_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), value_json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY, conversation_id TEXT, message_id TEXT, filename TEXT NOT NULL,
    mime_type TEXT NOT NULL, size INTEGER NOT NULL, hash TEXT NOT NULL, local_path TEXT NOT NULL,
    extracted_text TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
  );
`);
if (!db.prepare("SELECT id FROM settings WHERE id=1").get()) {
  db.prepare("INSERT INTO settings(id,value_json) VALUES(1,?)").run(JSON.stringify(DEFAULT_SETTINGS));
}

const now = () => new Date().toISOString();
const rowObject = (row) => row ? { ...row } : null;
const audit = (action, entityType, entityId, detail = {}) =>
  db.prepare("INSERT INTO audit_events VALUES(?,?,?,?,?,?)")
    .run(randomUUID(), action, entityType, entityId ?? null, JSON.stringify(detail), now());
const getSettings = () => ({ ...DEFAULT_SETTINGS, ...safeJson(db.prepare("SELECT value_json FROM settings WHERE id=1").get().value_json, {}) });
const providerConfigured = (tier = 2) => Boolean(process.env.OPENAI_API_KEY && process.env[`OPENAI_TIER_${tier}_MODEL`]);

function json(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}

async function body(request, limit = 12_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("Request is larger than the configured limit."), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function jsonBody(request) {
  const raw = await body(request);
  try { return JSON.parse(raw.toString("utf8") || "{}"); }
  catch { throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 }); }
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname.split("?")[0]);
  const rel = normalize(decoded === "/" ? "index.html" : decoded.replace(/^\/+/, ""));
  const candidate = resolve(join(appRoot, rel));
  return candidate.toLowerCase().startsWith(`${appRoot}${sep}`.toLowerCase()) ? candidate : null;
}

function messagesFor(conversationId) {
  return db.prepare("SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at").all(conversationId)
    .map((row) => ({ ...row, editedAfterCapture: Boolean(row.edited_after_capture), route: safeJson(row.route_json), metadata: safeJson(row.metadata_json) }));
}

function conversation(id) {
  const item = rowObject(db.prepare("SELECT * FROM conversations WHERE id=?").get(id));
  return item ? { ...item, messages: messagesFor(id) } : null;
}

function repositorySections(query, maxChars) {
  const terms = query.toLowerCase().split(/\W+/).filter((term) => term.length > 3);
  const candidates = [];
  for (const folder of ["methodology", "principles", "evolution", "product", "templates"]) {
    const base = resolve(repoRoot, folder);
    if (!existsSync(base)) continue;
    for (const filename of readdirSync(base)) {
      if (!filename.endsWith(".md")) continue;
      const path = resolve(base, filename);
      if (!statSync(path).isFile()) continue;
      const content = readFileSync(path, "utf8");
      const metadata = extractFrontMatter(content);
      const sections = content.split(/(?=^##?\s)/m);
      for (const section of sections) {
        const score = terms.reduce((total, term) => total + (section.toLowerCase().includes(term) ? 2 : 0), 0)
          + (metadata.status === "approved" ? 1 : 0);
        if (score) candidates.push({
          path: relative(repoRoot, path).replaceAll("\\", "/"),
          status: metadata.status || "unlabelled", version: metadata.version || "unknown",
          hash: createHash("sha256").update(content).digest("hex").slice(0, 12),
          excerpt: section.slice(0, 1400), reason: `Matched ${Math.max(1, Math.floor(score / 2))} request terms${metadata.status === "approved" ? "; approved source preferred" : ""}`,
          score
        });
      }
    }
  }
  const selected = [];
  let used = 0;
  for (const item of candidates.sort((a, b) => b.score - a.score)) {
    if (used + item.excerpt.length > maxChars) continue;
    selected.push(item); used += item.excerpt.length;
    if (selected.length === 5) break;
  }
  return selected;
}

async function openAiResponse({ input, instructions, route, sources, outputType }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env[`OPENAI_TIER_${route.tier}_MODEL`];
  if (!apiKey || !model) return null;
  const started = Date.now();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions,
      input: `${input}\n\nRepository context:\n${sources.map((s) => `[${s.status}] ${s.path}\n${s.excerpt}`).join("\n\n")}`,
      max_output_tokens: route.outputLimit,
      metadata: { application: "operations-automated-workbench", output_type: outputType }
    })
  });
  const payload = await response.json();
  if (!response.ok) throw Object.assign(new Error(payload.error?.message || "OpenAI request failed."), { status: 502 });
  const text = payload.output_text || payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text || "";
  return { text, model, usage: payload.usage || {}, latency: Date.now() - started };
}

async function api(request, response, url) {
  const method = request.method || "GET";
  if (method === "GET" && url.pathname === "/api/settings") return json(response, 200, {
    settings: getSettings(),
    apiConfigured: providerConfigured(2),
    mode: providerConfigured(2) ? "provider" : "local-grounded"
  });
  if (method === "PATCH" && url.pathname === "/api/settings") {
    const value = validateSettings({ ...getSettings(), ...(await jsonBody(request)) });
    db.prepare("UPDATE settings SET value_json=? WHERE id=1").run(JSON.stringify(value));
    audit("settings.updated", "settings", "1", { keys: Object.keys(value) });
    return json(response, 200, { settings: value });
  }
  if (method === "GET" && url.pathname === "/api/conversations") {
    return json(response, 200, {
      conversations: db.prepare("SELECT c.*, COUNT(m.id) AS message_count FROM conversations c LEFT JOIN messages m ON m.conversation_id=c.id GROUP BY c.id ORDER BY c.updated_at DESC").all()
    });
  }
  if (method === "POST" && url.pathname === "/api/conversations") {
    const value = await jsonBody(request);
    const id = randomUUID(); const timestamp = now();
    db.prepare("INSERT INTO conversations(id,workspace,title,created_at,updated_at) VALUES(?,?,?,?,?)")
      .run(id, String(value.workspace || "living-methodology"), String(value.title || "New conversation").slice(0, 120), timestamp, timestamp);
    audit("conversation.created", "conversation", id);
    return json(response, 201, { conversation: conversation(id) });
  }
  const conversationMatch = url.pathname.match(/^\/api\/conversations\/([^/]+)$/);
  if (method === "GET" && conversationMatch) {
    const item = conversation(conversationMatch[1]);
    return item ? json(response, 200, { conversation: item }) : json(response, 404, { error: "Conversation not found." });
  }
  const messageMatch = url.pathname.match(/^\/api\/conversations\/([^/]+)\/messages$/);
  if (method === "POST" && messageMatch) {
    const value = await jsonBody(request); const id = randomUUID();
    if (!conversation(messageMatch[1])) return json(response, 404, { error: "Conversation not found." });
    if (!String(value.workingText || "").trim()) return json(response, 400, { error: "Working text is required." });
    db.prepare("INSERT INTO messages(id,conversation_id,role,input_type,original_text,working_text,language,edited_after_capture,metadata_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)")
      .run(id, messageMatch[1], value.role || "user", value.inputType || "text", value.originalText || value.workingText, value.workingText, value.language || "en", value.editedAfterCapture ? 1 : 0, JSON.stringify(value.metadata || {}), now());
    db.prepare("UPDATE conversations SET updated_at=?, title=CASE WHEN title='New conversation' THEN ? ELSE title END WHERE id=?")
      .run(now(), String(value.workingText).slice(0, 70), messageMatch[1]);
    audit("message.created", "message", id, { conversationId: messageMatch[1], role: value.role || "user" });
    return json(response, 201, { message: messagesFor(messageMatch[1]).at(-1) });
  }
  const patchMessage = url.pathname.match(/^\/api\/messages\/([^/]+)$/);
  if (method === "PATCH" && patchMessage) {
    const value = await jsonBody(request);
    db.prepare("UPDATE messages SET working_text=?, edited_after_capture=1 WHERE id=?").run(String(value.workingText || ""), patchMessage[1]);
    audit("message.edited", "message", patchMessage[1]);
    return json(response, 200, { ok: true });
  }
  if (method === "POST" && url.pathname === "/api/context/preview") {
    const value = await jsonBody(request); const settings = getSettings();
    const route = chooseRoute(value, settings);
    const attachmentText = String(value.attachmentText || "");
    const sources = repositorySections(`${String(value.text || "")}\n${attachmentText.slice(0, 5000)}`, settings.maximumRetrievedContext);
    const preview = buildContextPreview(value, route, sources, settings);
    const available = providerConfigured(route.tier);
    preview.providerAvailable = available;
    preview.executionMode = available ? "OpenAI provider" : "Local repository synthesis";
    if (!available) {
      preview.estimatedCost = 0;
      preview.route.confirmationRequired = false;
    }
    return json(response, 200, preview);
  }
  if (method === "POST" && url.pathname === "/api/respond") {
    const value = await jsonBody(request); const settings = getSettings();
    const route = chooseRoute(value, settings);
    const attachmentText = String(value.attachmentText || "");
    const sources = repositorySections(`${String(value.text || "")}\n${attachmentText.slice(0, 5000)}`, settings.maximumRetrievedContext);
    const estimated = providerConfigured(route.tier) ? estimateCost(route.inputEstimate, route.outputLimit, settings) : 0;
    if (estimated > settings.perRequestHardCeiling) return json(response, 402, { error: "Estimated request exceeds the per-request hard ceiling.", estimated });
    if (route.confirmationRequired && !value.confirmed) return json(response, 409, { confirmationRequired: true, route, estimated, lowerCostAlternative: "Use standard analysis with a shorter response." });
    let result; let status = "offline"; let provider = "local"; let model = null; let usage = {};
    try {
      result = await openAiResponse({
        input: String(value.text || ""), outputType: value.outputType || "answer", route, sources,
        instructions: "Answer only from supplied context where methodology authority matters. Cite repository paths. Label uncertainty. Feedback is not approval. Never claim to approve, publish, merge, or edit controlled content."
      });
      if (result) { status = "completed"; provider = "openai"; model = result.model; usage = result.usage; }
    } catch (error) {
      audit("provider.failed", "conversation", value.conversationId, { message: error.message });
      throw error;
    }
    const text = result?.text || buildLocalSynthesis({
      input: String(value.text || ""),
      sources,
      outputType: value.outputType || "answer",
      attachmentText
    });
    const id = randomUUID();
    db.prepare("INSERT INTO messages(id,conversation_id,role,working_text,route_json,metadata_json,created_at) VALUES(?,?,?,?,?,?,?)")
      .run(id, value.conversationId, "assistant", text, JSON.stringify(route), JSON.stringify({
        sources,
        generated: Boolean(result),
        localSynthesis: !result,
        approvalState: "not-approved",
        attachments: value.attachmentIds || []
      }), now());
    const inputTokens = usage.input_tokens || Math.ceil((String(value.text || "").length + sources.reduce((n, s) => n + s.excerpt.length, 0)) / 4);
    const outputTokens = usage.output_tokens || Math.ceil(text.length / 4);
    const cost = estimateCost(inputTokens, outputTokens, settings);
    db.prepare("INSERT INTO usage_records VALUES(?,?,?,?,?,?,?,?,?,?)")
      .run(randomUUID(), value.conversationId, provider, model, inputTokens, outputTokens, cost, result?.latency || 0, status, now());
    audit("response.created", "message", id, { provider, tier: route.tier, approvalState: "not-approved" });
    return json(response, 200, { message: messagesFor(value.conversationId).at(-1), route, sources, usage: { provider, model, inputTokens, outputTokens, estimatedCost: cost, status } });
  }
  if (method === "POST" && url.pathname === "/api/feedback") {
    const value = await jsonBody(request); const id = randomUUID();
    db.prepare("INSERT INTO feedback VALUES(?,?,?,?,?,?,?,?,?)").run(id, value.conversationId, value.messageId, value.disposition, value.wording || "", value.interpretation || "", JSON.stringify(value.affectedComponents || []), "recorded", now());
    audit("feedback.recorded", "feedback", id, { disposition: value.disposition, explicitlyNotApproval: true });
    return json(response, 201, { feedback: { id, status: "recorded", approvalState: "not-approved" } });
  }
  if (method === "GET" && url.pathname === "/api/feedback") {
    return json(response, 200, {
      feedback: db.prepare("SELECT f.*, c.title AS conversation_title FROM feedback f LEFT JOIN conversations c ON c.id=f.conversation_id ORDER BY f.created_at DESC").all()
        .map((item) => ({ ...item, affectedComponents: safeJson(item.affected_components, []) }))
    });
  }
  if (method === "POST" && url.pathname === "/api/attachments") {
    const value = await jsonBody(request);
    const settings = getSettings();
    const filename = String(value.filename || "attachment").slice(0, 180);
    const content = String(value.content || "");
    const size = Buffer.byteLength(content, "utf8");
    if (size > settings.maximumFileSize) return json(response, 413, { error: "Attachment exceeds the configured file-size limit." });
    if (!/\.(txt|md|markdown|csv|json)$/i.test(filename)) return json(response, 415, { error: "Local mode supports text, Markdown, CSV and JSON attachments." });
    const hash = createHash("sha256").update(content).digest("hex");
    const duplicate = rowObject(db.prepare("SELECT * FROM attachments WHERE hash=? LIMIT 1").get(hash));
    if (duplicate) return json(response, 200, { attachment: { ...duplicate, duplicate: true } });
    const id = randomUUID();
    const localPath = resolve(attachmentRoot, `${id}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`);
    await writeFile(localPath, content, "utf8");
    db.prepare("INSERT INTO attachments(id,conversation_id,filename,mime_type,size,hash,local_path,extracted_text,created_at) VALUES(?,?,?,?,?,?,?,?,?)")
      .run(id, value.conversationId || null, filename, value.mimeType || "text/plain", size, hash, localPath, content, now());
    audit("attachment.stored", "attachment", id, { filename, hash, extractedOnce: true });
    return json(response, 201, {
      attachment: { id, filename, mimeType: value.mimeType || "text/plain", size, hash, extractedText: content, duplicate: false }
    });
  }
  const packetMatch = url.pathname.match(/^\/api\/feedback\/([^/]+)\/proposal-packet$/);
  if (method === "POST" && packetMatch) {
    const feedback = rowObject(db.prepare("SELECT * FROM feedback WHERE id=?").get(packetMatch[1]));
    if (!feedback) return json(response, 404, { error: "Feedback not found." });
    const convo = conversation(feedback.conversation_id);
    const packet = buildProposalPacket(feedback, convo);
    audit("proposal.generated", "feedback", feedback.id, { repositoryChanged: false, approvalState: "not-approved" });
    return json(response, 200, { packet, approvalState: "not-approved", repositoryChanged: false });
  }
  if (method === "GET" && url.pathname === "/api/usage") {
    const records = db.prepare("SELECT * FROM usage_records ORDER BY created_at DESC").all();
    return json(response, 200, { records, totalEstimatedCost: records.reduce((sum, item) => sum + item.estimated_cost, 0) });
  }
  if (method === "POST" && url.pathname === "/api/export") {
    const value = await jsonBody(request); const convo = conversation(value.conversationId);
    if (!convo) return json(response, 404, { error: "Conversation not found." });
    audit("conversation.exported", "conversation", convo.id, { format: value.format || "markdown" });
    const markdown = `# ${convo.title}\n\nStatus: ${convo.status}\nWorkspace: ${convo.workspace}\nApproval: not approved\n\n${convo.messages.map((m) => `## ${m.role}\n\n${m.working_text}`).join("\n\n")}`;
    return json(response, 200, value.format === "json" ? convo : { markdown });
  }
  return json(response, 404, { error: "API endpoint not found." });
}

const contentTypes = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);
    if (url.pathname.startsWith("/api/")) return await api(request, response, url);
    const path = safeStaticPath(url.pathname);
    if (!path || !(await stat(path)).isFile()) throw Object.assign(new Error("Not found"), { status: 404 });
    response.writeHead(200, { "Cache-Control": "no-store", "Content-Type": contentTypes[extname(path)] || "application/octet-stream" });
    createReadStream(path).pipe(response);
  } catch (error) {
    process.stderr.write(`[workbench] ${error?.stack || error}\n`);
    if (!response.headersSent) json(response, error.status || 500, { error: error.status ? error.message : "The local service could not complete the request." });
  }
}).listen(port, "127.0.0.1", () => process.stdout.write(`Operations Automated Workbench running at http://127.0.0.1:${port}\n`));
