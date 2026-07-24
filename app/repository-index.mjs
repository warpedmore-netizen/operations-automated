import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { extractFrontMatter } from "./workbench-core.mjs";

export const INDEXED_FOLDERS = Object.freeze(["methodology", "principles", "evolution", "product", "templates"]);

function document(path, content) {
  const metadata = extractFrontMatter(content);
  return {
    path: path.replaceAll("\\", "/"),
    status: metadata.status || "unlabelled",
    version: metadata.version || "unknown",
    hash: createHash("sha256").update(content).digest("hex").slice(0, 12),
    content
  };
}

export function scanWorkingTree(repoRoot) {
  const documents = [];
  for (const folder of INDEXED_FOLDERS) {
    const base = resolve(repoRoot, folder);
    if (!existsSync(base)) continue;
    for (const filename of readdirSync(base)) {
      if (!filename.endsWith(".md")) continue;
      const path = resolve(base, filename);
      if (!statSync(path).isFile()) continue;
      documents.push(document(relative(repoRoot, path), readFileSync(path, "utf8")));
    }
  }
  return documents;
}

export function scanGitRef(repoRoot, ref = "origin/main") {
  const git = process.env.GIT_EXECUTABLE || "git";
  const names = execFileSync(git, ["-c", `safe.directory=${repoRoot.replaceAll("\\", "/")}`, "ls-tree", "-r", "--name-only", ref], {
    cwd: repoRoot,
    encoding: "utf8"
  }).split(/\r?\n/).filter((path) => path.endsWith(".md") && INDEXED_FOLDERS.some((folder) => path.startsWith(`${folder}/`)));
  return names.map((path) => document(path, readGitRefFile(repoRoot, ref, path)));
}

export function readGitRefFile(repoRoot, ref, path) {
  const git = process.env.GIT_EXECUTABLE || "git";
  return execFileSync(git, ["-c", `safe.directory=${repoRoot.replaceAll("\\", "/")}`, "show", `${ref}:${path}`], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 4_000_000
  });
}

export function retrieveIndexedSections(documents, query, maxChars, { approvedOnly = false } = {}) {
  const terms = String(query).toLowerCase().split(/\W+/).filter((term) => term.length > 3);
  const candidates = [];
  for (const item of documents) {
    if (approvedOnly && item.status !== "approved") continue;
    for (const section of item.content.split(/(?=^##?\s)/m)) {
      const termScore = terms.reduce((total, term) => total + (section.toLowerCase().includes(term) ? 2 : 0), 0);
      if (!termScore) continue;
      const score = termScore + (item.status === "approved" ? 1 : 0);
      candidates.push({
        path: item.path,
        status: item.status,
        version: item.version,
        hash: item.hash,
        excerpt: section.slice(0, 1400),
        reason: `Matched ${Math.max(1, Math.floor(score / 2))} request terms${item.status === "approved" ? "; approved source preferred" : ""}`,
        score
      });
    }
  }
  const selected = [];
  let used = 0;
  for (const item of candidates.sort((a, b) => b.score - a.score)) {
    if (used + item.excerpt.length > maxChars) continue;
    selected.push(item);
    used += item.excerpt.length;
    if (selected.length === 5) break;
  }
  return selected;
}

export function changelogVersion(content) {
  return String(content || "").match(/^##\s+([0-9]+(?:\.[0-9]+)*)\b/m)?.[1] || "unknown";
}
