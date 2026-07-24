import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { extractFrontMatter } from "./workbench-core.mjs";

export const PUBLICATION_CONFIRMATION = "Publish reviewed pages to Confluence";
export const CONFLICT_REAPPLY_CONFIRMATION = "Use the reviewed Git copy for this page";

const ROOT_DOCUMENTS = Object.freeze([
  ["CHARTER.md", "internal", "internal:governance"],
  ["GOVERNANCE.md", "internal", "internal:governance"],
  ["ROADMAP.md", "internal", "internal:governance"],
  ["PROJECT-PRIORITIES.md", "internal", "internal:governance"],
  ["CHANGELOG.md", "internal", "internal:assurance"]
]);

const FOLDER_ROUTES = Object.freeze({
  methodology: { role: "methodology", parentKey: "methodology:core" },
  principles: { role: "methodology", parentKey: "methodology:principles" },
  evolution: { role: "methodology", parentKey: "methodology:evolution" },
  templates: { role: "methodology", parentKey: "methodology:tools" },
  proposals: { role: "methodology", parentKey: "methodology:proposals" },
  decisions: { role: "internal", parentKey: "internal:decisions" },
  product: { role: "internal", parentKey: "internal:product" },
  feedback: { role: "internal", parentKey: "internal:evidence" },
  pilots: { role: "internal", parentKey: "internal:evidence" }
});

const NAVIGATION = Object.freeze([
  {
    key: "methodology:hub",
    role: "methodology",
    title: "Operations Automated Methodology",
    parentKey: null,
    description: "The readable methodology library, ordered for people rather than repository navigation."
  },
  {
    key: "methodology:core",
    role: "methodology",
    title: "02 — Core methodology",
    parentKey: "methodology:hub",
    description: "How Operations Automated understands, improves and prepares operations for proportionate automation, AI and agentic operation."
  },
  {
    key: "methodology:principles",
    role: "methodology",
    title: "03 — Principles",
    parentKey: "methodology:hub",
    description: "The working principles that constrain how the methodology defines value, automation, learning and human factors."
  },
  {
    key: "methodology:evolution",
    role: "methodology",
    title: "04 — Evolution and governance",
    parentKey: "methodology:hub",
    description: "How feedback, challenge, evidence and human decisions become controlled methodology change."
  },
  {
    key: "methodology:tools",
    role: "methodology",
    title: "05 — Practical tools",
    parentKey: "methodology:hub",
    description: "Templates and decision aids that help a person apply the methodology without needing to become a methodology specialist."
  },
  {
    key: "methodology:proposals",
    role: "methodology",
    title: "06 — Working proposals and assurance",
    parentKey: "methodology:hub",
    description: "Proposals and assurance records retained with their repository status. Proposed content is not presented as approved guidance."
  },
  {
    key: "internal:hub",
    role: "internal",
    title: "Operations Automated — Internal project memory",
    parentKey: null,
    description: "The readable internal record of governance, decisions, product development, assurance and evidence."
  },
  {
    key: "internal:governance",
    role: "internal",
    title: "01 — Governance and direction",
    parentKey: "internal:hub",
    description: "Authority, project direction, roadmap and current priorities."
  },
  {
    key: "internal:decisions",
    role: "internal",
    title: "02 — Decisions",
    parentKey: "internal:hub",
    description: "Recorded founder decisions and their exact approval boundaries."
  },
  {
    key: "internal:product",
    role: "internal",
    title: "03 — Product and delivery",
    parentKey: "internal:hub",
    description: "How the methodology is delivered and how the private Workbench is being developed."
  },
  {
    key: "internal:assurance",
    role: "internal",
    title: "04 — Change history and assurance",
    parentKey: "internal:hub",
    description: "Release history and records used to assure controlled change."
  },
  {
    key: "internal:evidence",
    role: "internal",
    title: "05 — Feedback and validation evidence",
    parentKey: "internal:hub",
    description: "Founder feedback and pilot evidence. These records inform change but do not approve it."
  }
]);

function hash(value) {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, 12);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stripFrontMatter(content) {
  return String(content || "").replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n)?/, "");
}

function titleFromContent(path, content, metadata) {
  const heading = stripFrontMatter(content).match(/^#\s+(.+)$/m)?.[1]?.trim();
  return String(metadata.title || heading || basename(path, ".md").replaceAll("-", " "))
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, 240);
}

function statusMeaning(status) {
  const normalised = String(status || "unlabelled").toLowerCase();
  if (normalised === "approved") return "Approved for the scope recorded in the repository; not automatically approved for external publication.";
  if (normalised === "recorded") return "Recorded decision or project memory; read the decision boundary before relying on it.";
  if (normalised === "published") return "Published according to the authority recorded in the repository.";
  if (normalised === "proposed") return "Proposed — complete enough for review but not approved.";
  if (normalised === "draft") return "Draft — still being developed and not approved.";
  if (normalised === "idea") return "Idea — retained as an unassessed signal, not guidance.";
  return "Status is not labelled as approved. Treat this as working material.";
}

function resolveMarkdownHref(href, sourcePath, sourceCommit, repositoryUrl) {
  const value = String(href || "").trim();
  if (!value || value.startsWith("#")) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return /^(?:https?:|mailto:)/i.test(value) ? value : "#unsupported-link";
  }
  const [path, fragment = ""] = value.split("#", 2);
  const segments = `${dirname(sourcePath).replaceAll("\\", "/")}/${path}`.split("/");
  const resolved = [];
  for (const segment of segments) {
    if (!segment || segment === ".") continue;
    if (segment === "..") resolved.pop();
    else resolved.push(segment);
  }
  const suffix = fragment ? `#${encodeURIComponent(fragment)}` : "";
  return `${repositoryUrl}/blob/${encodeURIComponent(sourceCommit)}/${resolved.map(encodeURIComponent).join("/")}${suffix}`;
}

function inlineMarkdown(value, options) {
  const code = [];
  let text = String(value || "").replace(/`([^`\n]+)`/g, (_match, content) => {
    const token = `\u0000CODE${code.length}\u0000`;
    code.push(`<code>${escapeHtml(content)}</code>`);
    return token;
  });
  text = escapeHtml(text);
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_match, label, href) => {
    const resolved = resolveMarkdownHref(href, options.sourcePath, options.sourceCommit, options.repositoryUrl);
    return `<a href="${escapeHtml(resolved)}">${label}</a>`;
  });
  text = text
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_\n]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g, "<em>$1</em>");
  return text.replace(/\u0000CODE(\d+)\u0000/g, (_match, index) => code[Number(index)] || "");
}

function tableToStorage(lines, options) {
  const rows = lines.map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  const header = rows[0] || [];
  const body = rows.slice(2);
  return `<table><tbody><tr>${header.map((cell) => `<th>${inlineMarkdown(cell, options)}</th>`).join("")}</tr>${body.map((row) =>
    `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell, options)}</td>`).join("")}</tr>`
  ).join("")}</tbody></table>`;
}

export function markdownToConfluenceStorage(markdown, options = {}) {
  const settings = {
    sourcePath: options.sourcePath || "",
    sourceCommit: options.sourceCommit || "main",
    repositoryUrl: options.repositoryUrl || "https://github.com/warpedmore-netizen/operations-automated"
  };
  const lines = stripFrontMatter(markdown).replace(/\r\n/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let listType = "";
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${inlineMarkdown(paragraph.join(" ").trim(), settings)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!listItems.length) return;
    output.push(`<${listType}>${listItems.map((item) => `<li>${inlineMarkdown(item, settings)}</li>`).join("")}</${listType}>`);
    listItems = [];
    listType = "";
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^```/.test(line)) {
      flushParagraph();
      flushList();
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      const label = language ? `<p><em>${escapeHtml(language)} source</em></p>` : "";
      output.push(`${label}<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }
    if (
      line.includes("|") &&
      index + 1 < lines.length &&
      /^\s*\|?\s*:?-{3,}/.test(lines[index + 1]) &&
      lines[index + 1].includes("|")
    ) {
      flushParagraph();
      flushList();
      const tableLines = [line, lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      output.push(tableToStorage(tableLines, settings));
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(6, heading[1].length + (options.demoteHeadings ? 1 : 0));
      output.push(`<h${level}>${inlineMarkdown(heading[2], settings)}</h${level}>`);
      continue;
    }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered || ordered)[1]);
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      flushParagraph();
      flushList();
      output.push(`<blockquote><p>${inlineMarkdown(line.replace(/^\s*>\s?/, ""), settings)}</p></blockquote>`);
      continue;
    }
    if (/^\s*(?:---+|\*\*\*+)\s*$/.test(line)) {
      flushParagraph();
      flushList();
      output.push("<hr/>");
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  return output.join("\n");
}

function controlledPageBody(source, context) {
  const metadata = source.metadata || {};
  const status = source.status || "unlabelled";
  const approval = metadata.approval_scope || metadata.decision || statusMeaning(status);
  const contentWithoutRepeatedTitle = stripFrontMatter(source.content).replace(/^#\s+[^\r\n]+(?:\r?\n)+/, "");
  const readable = markdownToConfluenceStorage(contentWithoutRepeatedTitle, {
    sourcePath: source.path,
    sourceCommit: context.sourceCommit,
    repositoryUrl: context.repositoryUrl,
    demoteHeadings: false
  });
  return [
    "<ac:structured-macro ac:name=\"info\"><ac:rich-text-body>",
    `<p><strong>Controlled Operations Automated reading copy</strong></p>`,
    `<p><strong>Repository status:</strong> ${escapeHtml(status)} — ${escapeHtml(statusMeaning(status))}</p>`,
    `<p><strong>Approval or decision scope:</strong> ${escapeHtml(approval)}</p>`,
    "</ac:rich-text-body></ac:structured-macro>",
    readable,
    "<hr/>",
    `<p><small><strong>Controlled source:</strong> ${escapeHtml(source.path)} · <strong>Source version:</strong> ${escapeHtml(source.version)} · <strong>Source commit:</strong> ${escapeHtml(context.sourceCommit)} · <strong>Source hash:</strong> ${escapeHtml(source.hash)}</small></p>`,
    `<p><small>Git remains authoritative. This Confluence page is a readable delivery copy and does not change the repository status or create approval.</small></p>`
  ].join("\n");
}

function navigationBody(item, children, context) {
  const list = children.length
    ? `<ul>${children.map((child) => `<li><strong>${escapeHtml(child.title)}</strong>${child.sourceStatus ? ` — ${escapeHtml(child.sourceStatus)}` : ""}</li>`).join("")}</ul>`
    : "<p>No controlled documents are currently assigned to this section.</p>";
  return [
    "<ac:structured-macro ac:name=\"info\"><ac:rich-text-body>",
    "<p><strong>Controlled internal reading structure</strong></p>",
    "<p>Git remains authoritative. This page organises readable delivery copies and does not create approval.</p>",
    "</ac:rich-text-body></ac:structured-macro>",
    `<p>${escapeHtml(item.description)}</p>`,
    "<h2>Pages in this section</h2>",
    list,
    "<hr/>",
    `<p><small>Generated from source commit ${escapeHtml(context.sourceCommit)}. No Confluence page is deleted automatically.</small></p>`
  ].join("\n");
}

export function scanPublicationSources(repositoryRoot) {
  const sources = [];
  const add = (path, role, parentKey) => {
    const fullPath = resolve(repositoryRoot, path);
    if (!existsSync(fullPath) || !statSync(fullPath).isFile()) return;
    const content = readFileSync(fullPath, "utf8");
    const metadata = extractFrontMatter(content);
    sources.push({
      path: path.replaceAll("\\", "/"),
      role,
      parentKey,
      metadata,
      status: String(metadata.status || (path === "CHANGELOG.md" ? "recorded" : "unlabelled")).toLowerCase(),
      version: String(metadata.version || "unknown"),
      title: titleFromContent(path, content, metadata),
      hash: hash(content),
      content
    });
  };
  for (const [path, role, parentKey] of ROOT_DOCUMENTS) add(path, role, parentKey);
  for (const [folder, route] of Object.entries(FOLDER_ROUTES)) {
    const directory = resolve(repositoryRoot, folder);
    if (!existsSync(directory)) continue;
    for (const file of readdirSync(directory).filter((name) => name.endsWith(".md")).sort((a, b) => a.localeCompare(b, "en-GB"))) {
      const fullPath = resolve(directory, file);
      if (statSync(fullPath).isFile()) add(relative(repositoryRoot, fullPath), route.role, route.parentKey);
    }
  }
  return sources;
}

function publicItem(item) {
  const { bodyStorage: _bodyStorage, ...value } = item;
  return value;
}

export function publicPublicationPlan(plan) {
  return {
    ...plan,
    items: plan.items.map(publicItem)
  };
}

export function buildConfluencePublicationPlan({
  repositoryRoot,
  sourceBranch,
  sourceCommit,
  repositoryUrl = "https://github.com/warpedmore-netizen/operations-automated",
  generatedAt = new Date().toISOString()
}) {
  const sources = scanPublicationSources(repositoryRoot);
  const sourceItems = sources.map((source) => {
    const title = source.path === "methodology/current-methodology-synthesis.md"
      ? "01 — Start here: Current methodology"
      : source.title;
    return {
      key: `source:${source.path}`,
      kind: "controlled-document",
      role: source.role,
      title,
      parentKey: source.path === "methodology/current-methodology-synthesis.md" ? "methodology:hub" : source.parentKey,
      sourcePath: source.path,
      sourceStatus: source.status,
      sourceVersion: source.version,
      sourceHash: source.hash,
      bodyStorage: controlledPageBody(source, { sourceCommit, repositoryUrl })
    };
  });
  const context = { sourceCommit, repositoryUrl };
  const navigationItems = NAVIGATION.map((item) => {
    const children = [
      ...NAVIGATION
        .filter((child) => child.parentKey === item.key)
        .map((child) => ({ ...child, sourceStatus: "navigation", sourceHash: hash(JSON.stringify(child)) })),
      ...sourceItems.filter((child) => child.parentKey === item.key)
    ];
    const navigationHash = hash(JSON.stringify({
      ...item,
      children: children.map((child) => [child.key, child.title, child.sourceStatus, child.sourceHash]),
      sourceCommit
    }));
    return {
      ...item,
      kind: item.parentKey ? "section" : "hub",
      sourcePath: "",
      sourceStatus: "navigation",
      sourceVersion: "generated",
      sourceHash: navigationHash,
      bodyStorage: navigationBody(item, children, context)
    };
  });
  const itemByKey = new Map([...navigationItems, ...sourceItems].map((item) => [item.key, item]));
  const titles = new Set();
  for (const item of itemByKey.values()) {
    const titleKey = `${item.role}:${item.title.toLocaleLowerCase("en-GB")}`;
    if (titles.has(titleKey)) throw new Error(`The publication plan contains a duplicate title in the ${item.role} space: ${item.title}`);
    titles.add(titleKey);
    if (item.parentKey) {
      const parent = itemByKey.get(item.parentKey);
      if (!parent || parent.role !== item.role) throw new Error(`The publication parent for ${item.key} is missing or belongs to another space.`);
    }
  }
  const ordered = [];
  const visit = (key) => {
    const item = itemByKey.get(key);
    if (!item || ordered.some((existing) => existing.key === key)) return;
    if (item.parentKey) visit(item.parentKey);
    ordered.push(item);
  };
  for (const item of navigationItems) visit(item.key);
  for (const item of sourceItems) visit(item.key);
  const id = hash(JSON.stringify({
    sourceBranch,
    sourceCommit,
    items: ordered.map((item) => [item.key, item.role, item.title, item.parentKey, item.sourceHash])
  }));
  return {
    id,
    status: "proposed-publication-plan",
    generatedAt,
    sourceBranch,
    sourceCommit,
    repositoryUrl,
    confirmationPhrase: PUBLICATION_CONFIRMATION,
    deletionEnabled: false,
    automaticPublication: false,
    items: ordered
  };
}
