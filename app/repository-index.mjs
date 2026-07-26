import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { extractFrontMatter } from "./workbench-core.mjs";

const DEFAULT_MANIFEST_PATH = new URL("./knowledge-source-manifest.json", import.meta.url);

export function loadKnowledgeManifest(path = DEFAULT_MANIFEST_PATH) {
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(manifest.sources) || !manifest.statusAuthority) {
    throw new Error("The governed knowledge-source manifest is incomplete.");
  }
  return manifest;
}

export const KNOWLEDGE_MANIFEST = Object.freeze(loadKnowledgeManifest());
export const INDEXED_FOLDERS = Object.freeze(
  [...new Set(KNOWLEDGE_MANIFEST.sources.flatMap((source) => source.paths || [])
    .map((path) => path.split("/")[0])
    .filter((path) => path && !path.includes("*") && !path.includes(".")))]
);

function normalisePath(path) {
  return path.replaceAll("\\", "/");
}

function patternMatches(path, pattern) {
  const value = normalisePath(path);
  const source = normalisePath(pattern)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replaceAll("**/", "(?:.*/)?")
    .replaceAll("**", ".*")
    .replaceAll("*", "[^/]*");
  return new RegExp(`^${source}$`, "i").test(value);
}

function sourceForPath(path, manifest = KNOWLEDGE_MANIFEST) {
  return manifest.sources.find((source) =>
    source.kind === "repository" && (source.paths || []).some((pattern) => patternMatches(path, pattern))
  ) || null;
}

function authorityFor(metadata, source, manifest = KNOWLEDGE_MANIFEST) {
  const status = String(metadata.status || "unlabelled").toLowerCase();
  const statusRule = manifest.statusAuthority[status] || manifest.statusAuthority.unlabelled;
  const normative = Boolean(
    statusRule.normative
    && source?.normativeStatuses?.includes(status)
  );
  return {
    authority: normative ? "normative-approved" : source?.authority || "context-only",
    effectiveState: normative ? "approved-normative" : statusRule.effectiveState,
    normative
  };
}

function document(path, content, { indexedCommit = "working-tree", manifest = KNOWLEDGE_MANIFEST } = {}) {
  let metadata = extractFrontMatter(content);
  if (String(path).toLowerCase().endsWith(".json")) {
    try {
      const value = JSON.parse(content);
      metadata = {
        ...metadata,
        id: value.id || metadata.id,
        title: value.title || metadata.title,
        status: value.status || metadata.status,
        version: value.version || metadata.version
      };
    } catch {
      // Malformed JSON remains indexable as unlabelled evidence; its application loader will reject it.
    }
  }
  const source = sourceForPath(path, manifest);
  const authority = authorityFor(metadata, source, manifest);
  return {
    path: normalisePath(path),
    artefactId: metadata.id || "",
    title: metadata.title || content.match(/^#\s+(.+)$/m)?.[1]?.trim() || normalisePath(path).split("/").at(-1),
    status: metadata.status || "unlabelled",
    version: metadata.version || "unknown",
    hash: createHash("sha256").update(content).digest("hex"),
    sourceKind: source?.id || "unmanifested",
    authority: authority.authority,
    effectiveState: authority.effectiveState,
    normative: authority.normative,
    indexedCommit,
    content
  };
}

function candidateWorkingTreeFiles(repoRoot, manifest = KNOWLEDGE_MANIFEST) {
  const names = new Set();
  for (const source of manifest.sources.filter((item) => item.kind === "repository")) {
    for (const pattern of source.paths || []) {
      const firstWildcard = pattern.search(/[*?]/);
      if (firstWildcard < 0) {
        const path = resolve(repoRoot, pattern);
        if (existsSync(path) && statSync(path).isFile()) names.add(normalisePath(relative(repoRoot, path)));
        continue;
      }
      const prefix = pattern.slice(0, firstWildcard);
      const base = resolve(repoRoot, prefix.replace(/\/+$/, "") || ".");
      if (!existsSync(base)) continue;
      const visit = (directory) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
          if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "local-data") continue;
          const path = resolve(directory, entry.name);
          if (entry.isDirectory()) visit(path);
          else {
            const relativePath = normalisePath(relative(repoRoot, path));
            if (patternMatches(relativePath, pattern)) names.add(relativePath);
          }
        }
      };
      visit(base);
    }
  }
  return [...names].sort();
}

export function scanWorkingTree(repoRoot, manifest = KNOWLEDGE_MANIFEST) {
  const documents = [];
  for (const path of candidateWorkingTreeFiles(repoRoot, manifest)) {
    documents.push(document(path, readFileSync(resolve(repoRoot, path), "utf8"), {
      indexedCommit: "working-tree",
      manifest
    }));
  }
  return documents;
}

export function scanGitRef(repoRoot, ref = "origin/main", manifest = KNOWLEDGE_MANIFEST) {
  const git = process.env.GIT_EXECUTABLE || "git";
  const names = execFileSync(git, ["-c", `safe.directory=${repoRoot.replaceAll("\\", "/")}`, "ls-tree", "-r", "--name-only", ref], {
    cwd: repoRoot,
    encoding: "utf8"
  }).split(/\r?\n/).filter((path) => sourceForPath(path, manifest));
  return names.map((path) => document(path, readGitRefFile(repoRoot, ref, path), { indexedCommit: ref, manifest }));
}

export function readGitRefFile(repoRoot, ref, path) {
  const git = process.env.GIT_EXECUTABLE || "git";
  return execFileSync(git, ["-c", `safe.directory=${repoRoot.replaceAll("\\", "/")}`, "show", `${ref}:${path}`], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 4_000_000
  });
}

function splitOversizedChunk(chunk, maximumCharacters) {
  if (chunk.content.length <= maximumCharacters) return [chunk];
  const paragraphs = chunk.content.split(/\n\s*\n/);
  const values = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > maximumCharacters) {
      values.push({ ...chunk, content: current });
      current = "";
    }
    if (paragraph.length > maximumCharacters) {
      for (let index = 0; index < paragraph.length; index += maximumCharacters) {
        values.push({ ...chunk, content: paragraph.slice(index, index + maximumCharacters) });
      }
    } else {
      current += `${current ? "\n\n" : ""}${paragraph}`;
    }
  }
  if (current) values.push({ ...chunk, content: current });
  return values;
}

export function chunkDocument(item, manifest = KNOWLEDGE_MANIFEST) {
  const maximumCharacters = Number(manifest.chunking?.maximumCharacters || 2400);
  const minimumCharacters = Number(manifest.chunking?.minimumCharacters || 80);
  const lines = String(item.content || "").split(/\r?\n/);
  const headingPath = [];
  const chunks = [];
  let heading = item.title;
  let level = 0;
  let buffer = [];
  const flush = () => {
    const content = buffer.join("\n").trim();
    if (!content || (content.length < minimumCharacters && chunks.length)) {
      if (content && chunks.length) chunks.at(-1).content += `\n\n${content}`;
      buffer = [];
      return;
    }
    chunks.push({
      heading,
      headingPath: headingPath.join(" > ") || item.title,
      level,
      content
    });
    buffer = [];
  };
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) {
      buffer.push(line);
      continue;
    }
    flush();
    level = match[1].length;
    heading = match[2].trim();
    headingPath.splice(level - 1);
    headingPath[level - 1] = heading;
    buffer.push(line);
  }
  flush();
  return chunks.flatMap((chunk) => splitOversizedChunk(chunk, maximumCharacters))
    .map((chunk, ordinal) => ({
      ...chunk,
      id: createHash("sha256").update(`${item.hash}:${ordinal}:${chunk.headingPath}:${chunk.content}`).digest("hex"),
      ordinal,
      path: item.path,
      artefactId: item.artefactId,
      title: item.title,
      status: item.status,
      version: item.version,
      hash: item.hash,
      sourceKind: item.sourceKind,
      authority: item.authority,
      effectiveState: item.effectiveState,
      normative: item.normative,
      indexedCommit: item.indexedCommit
    }));
}

export function retrieveIndexedSections(documents, query, maxChars, { approvedOnly = false } = {}) {
  const terms = String(query).toLowerCase().split(/[^\p{L}\p{N}-]+/u).filter((term) => term.length > 2);
  const candidates = documents.flatMap((item) =>
    item.content && !item.heading ? chunkDocument(item) : [item]
  ).filter((item) => !approvedOnly || item.normative || item.status === "approved")
    .map((item) => {
      const searchable = `${item.title || ""}\n${item.heading || ""}\n${item.content || item.excerpt || ""}`.toLowerCase();
      const matches = terms.filter((term) => searchable.includes(term));
      const score = matches.length * 2
        + (item.normative ? Number(KNOWLEDGE_MANIFEST.retrieval.approvedNormativeBoost || 4) : 0)
        + (terms.some((term) => String(item.heading || "").toLowerCase().includes(term)) ? 2 : 0);
      return { item, matches, score };
    }).filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.item.path.localeCompare(right.item.path));
  const selected = [];
  let used = 0;
  for (const candidate of candidates) {
    const item = candidate.item;
    const excerpt = String(item.content || item.excerpt || "").slice(0, 1800);
    if (used + excerpt.length > maxChars) continue;
    selected.push({
      chunkId: item.id || "",
      path: item.path,
      artefactId: item.artefactId || "",
      title: item.title || item.path,
      heading: item.heading || "",
      headingPath: item.headingPath || item.heading || "",
      status: item.status,
      version: item.version,
      hash: item.hash,
      sourceKind: item.sourceKind || "repository",
      authority: item.authority || (item.status === "approved" ? "normative-approved" : "evidence-only"),
      effectiveState: item.effectiveState || item.status,
      normative: Boolean(item.normative || item.status === "approved"),
      indexedCommit: item.indexedCommit || "",
      excerpt,
      reason: `Matched ${candidate.matches.length} relevant term${candidate.matches.length === 1 ? "" : "s"}${item.normative ? "; approved normative source prioritised" : `; ${item.status} material kept distinct`}`,
      score: candidate.score,
      retrievalMode: "keyword"
    });
    used += excerpt.length;
    if (selected.length === Number(KNOWLEDGE_MANIFEST.retrieval.maximumResults || 8)) break;
  }
  return selected;
}

export function changelogVersion(content) {
  return String(content || "").match(/^##\s+([0-9]+(?:\.[0-9]+)*)\b/m)?.[1] || "unknown";
}
