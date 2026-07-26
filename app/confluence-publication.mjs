import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { extractFrontMatter } from "./workbench-core.mjs";

export const PUBLICATION_CONFIRMATION = "Publish reviewed pages to Confluence";
export const CONFLICT_REAPPLY_CONFIRMATION = "Use the reviewed Git copy for this page";

const ROOT_DOCUMENTS = Object.freeze([
  ["CHARTER.md", "internal", "governance"],
  ["GOVERNANCE.md", "internal", "governance"],
  ["ROADMAP.md", "internal", "governance"],
  ["PROJECT-PRIORITIES.md", "internal", "governance"],
  ["CHANGELOG.md", "internal", "assurance"]
]);

const FOLDER_ROUTES = Object.freeze({
  methodology: { role: "methodology", sectionKey: "core" },
  principles: { role: "methodology", sectionKey: "principles" },
  evolution: { role: "methodology", sectionKey: "evolution" },
  templates: { role: "methodology", sectionKey: "tools" },
  proposals: { role: "methodology", sectionKey: "proposals" },
  decisions: { role: "internal", sectionKey: "decisions" },
  product: { role: "internal", sectionKey: "product" },
  feedback: { role: "internal", sectionKey: "evidence" },
  pilots: { role: "internal", sectionKey: "evidence" }
});

const ROLE_DEFINITIONS = Object.freeze({
  methodology: {
    title: "Operations Automated Methodology",
    description: "The readable methodology library, organised first by lifecycle and then by subject.",
    sections: [
      ["core", "01 — Core methodology", "How Operations Automated understands, improves and prepares operations for proportionate automation, AI and agentic operation."],
      ["principles", "02 — Principles", "The working principles that constrain how the methodology defines value, automation, learning and human factors."],
      ["evolution", "03 — Evolution and governance", "How feedback, challenge, evidence and human decisions become controlled methodology change."],
      ["tools", "04 — Practical tools", "Templates and decision aids that help a person apply the methodology without needing to become a methodology specialist."],
      ["proposals", "05 — Proposals and assurance", "Proposals and assurance records retained with their repository status."]
    ]
  },
  internal: {
    title: "Operations Automated — Internal project memory",
    description: "The readable internal record of governance, decisions, product development, assurance and evidence, organised first by lifecycle.",
    sections: [
      ["governance", "01 — Governance and direction", "Authority, project direction, roadmap and current priorities."],
      ["decisions", "02 — Decisions", "Recorded founder decisions and their exact approval boundaries."],
      ["product", "03 — Product and delivery", "How the methodology is delivered and how the private Workbench is being developed."],
      ["assurance", "04 — Change history and assurance", "Release history and records used to assure controlled change."],
      ["evidence", "05 — Feedback and validation evidence", "Founder feedback and pilot evidence. These records inform change but do not approve it."]
    ]
  }
});

const LIFECYCLE_DEFINITIONS = Object.freeze([
  {
    key: "live",
    title: "Live",
    description: "Approved, published and recorded material that is active for its stated scope. Live does not imply approval for external publication."
  },
  {
    key: "draft",
    title: "Draft",
    description: "Ideas, drafts, proposals and unlabelled working material. Nothing in this folder is approved merely because it is readable in Confluence."
  },
  {
    key: "archived",
    title: "Archived",
    description: "Superseded and rejected material retained for history. It is not current guidance."
  }
]);

export function publicationLifecycle(status) {
  const normalised = String(status || "unlabelled").trim().toLowerCase();
  if (["approved", "published", "recorded"].includes(normalised)) return "live";
  if (["superseded", "rejected"].includes(normalised)) return "archived";
  return "draft";
}

function navigationDefinitions() {
  const items = [];
  for (const [role, definition] of Object.entries(ROLE_DEFINITIONS)) {
    items.push({
      key: `${role}:hub`,
      kind: "hub",
      role,
      lifecycle: "",
      title: definition.title,
      parentKey: null,
      description: definition.description
    });
    for (const lifecycle of LIFECYCLE_DEFINITIONS) {
      items.push({
        key: `${role}:${lifecycle.key}`,
        kind: "lifecycle",
        role,
        lifecycle: lifecycle.key,
        title: lifecycle.title,
        parentKey: `${role}:hub`,
        description: lifecycle.description
      });
      for (const [sectionKey, sectionTitle, description] of definition.sections) {
        items.push({
          key: `${role}:${lifecycle.key}:${sectionKey}`,
          kind: "section",
          role,
          lifecycle: lifecycle.key,
          title: `${sectionTitle} (${lifecycle.title})`,
          parentKey: `${role}:${lifecycle.key}`,
          description
        });
      }
    }
  }
  return items;
}

const NAVIGATION = Object.freeze(navigationDefinitions());

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
  if (normalised === "superseded") return "Superseded — retained for history but no longer current.";
  if (normalised === "rejected") return "Rejected — considered and deliberately not adopted.";
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
  const lifecycle = publicationLifecycle(status);
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
    `<p><strong>Reading location:</strong> ${escapeHtml(lifecycle[0].toUpperCase() + lifecycle.slice(1))}. Placement is derived from the repository status.</p>`,
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
  const add = (path, role, sectionKey) => {
    const fullPath = resolve(repositoryRoot, path);
    if (!existsSync(fullPath) || !statSync(fullPath).isFile()) return;
    const content = readFileSync(fullPath, "utf8");
    const metadata = extractFrontMatter(content);
    const status = String(metadata.status || (path === "CHANGELOG.md" ? "recorded" : "unlabelled")).toLowerCase();
    sources.push({
      path: path.replaceAll("\\", "/"),
      role,
      sectionKey,
      metadata,
      status,
      lifecycle: publicationLifecycle(status),
      version: String(metadata.version || "unknown"),
      title: titleFromContent(path, content, metadata),
      hash: hash(content),
      content
    });
  };
  for (const [path, role, sectionKey] of ROOT_DOCUMENTS) add(path, role, sectionKey);
  for (const [folder, route] of Object.entries(FOLDER_ROUTES)) {
    const directory = resolve(repositoryRoot, folder);
    if (!existsSync(directory)) continue;
    for (const file of readdirSync(directory).filter((name) => name.endsWith(".md")).sort((a, b) => a.localeCompare(b, "en-GB"))) {
      const fullPath = resolve(directory, file);
      if (statSync(fullPath).isFile()) add(relative(repositoryRoot, fullPath), route.role, route.sectionKey);
    }
  }
  return sources;
}

function methodologyLabBody(page, sources, context) {
  const contentWithoutRepeatedTitle = stripFrontMatter(page.content).replace(/^#\s+[^\r\n]+(?:\r?\n)+/, "");
  const readable = markdownToConfluenceStorage(contentWithoutRepeatedTitle, {
    sourcePath: page.path,
    sourceCommit: context.sourceCommit,
    repositoryUrl: context.repositoryUrl,
    demoteHeadings: false
  });
  const sourceMap = sources.map((source) =>
    `<li><strong>${escapeHtml(source.path)}</strong> — ${escapeHtml(source.status)}, version ${escapeHtml(source.version)}, hash ${escapeHtml(source.hash)}</li>`
  ).join("");
  return [
    "<ac:structured-macro ac:name=\"warning\"><ac:rich-text-body>",
    "<p><strong>Operations Automated — proposed Draft reading synthesis for the end-to-end methodology</strong></p>",
    "<p>This page is published to the controlled Confluence Draft area from Operations Automated sources for private internal review. Draft publication does not change approved methodology meaning, replace the controlled record, promote content to Live or authorise external publication.</p>",
    "</ac:rich-text-body></ac:structured-macro>",
    readable,
    "<hr/>",
    "<h2>Controlled source map</h2>",
    `<ul>${sourceMap}</ul>`,
    `<p><small><strong>Pilot source:</strong> ${escapeHtml(page.path)} · <strong>Pilot version:</strong> ${escapeHtml(context.pilotVersion)} · <strong>Source commit:</strong> ${escapeHtml(context.sourceCommit)} · <strong>Combined source hash:</strong> ${escapeHtml(page.sourceHash)}</small></p>`,
    "<p><small>Git remains authoritative. Proposed wording remains Draft until it survives review and a later governed decision. Publication here does not promote it to Live.</small></p>"
  ].join("\n");
}

export function buildMethodologyLabPublicationPlan({
  repositoryRoot,
  sourceBranch,
  sourceCommit,
  repositoryUrl = "https://github.com/warpedmore-netizen/operations-automated",
  generatedAt = new Date().toISOString()
}) {
  const labDirectory = resolve(repositoryRoot, "publication", "methodology-lab-001");
  const manifestPath = resolve(labDirectory, "manifest.json");
  if (!existsSync(manifestPath)) throw new Error("The controlled Methodology Lab manifest is missing.");
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    throw new Error("The controlled Methodology Lab manifest is not valid JSON.");
  }
  if (
    manifest?.id !== "OA-METHODOLOGY-LAB-001" ||
    manifest?.status !== "proposed-pilot" ||
    !Array.isArray(manifest?.pages) ||
    manifest.pages.length === 0
  ) {
    throw new Error("The Methodology Lab manifest does not declare the bounded proposed pilot.");
  }

  const controlledSources = new Map(scanPublicationSources(repositoryRoot).map((source) => [source.path, source]));
  const keys = new Set();
  const titles = new Set();
  const items = manifest.pages.map((page) => {
    const key = String(page?.key || "").trim();
    const filename = String(page?.file || "").trim();
    const title = String(page?.title || "").replace(/[\r\n]+/g, " ").trim().slice(0, 240);
    const parentKey = page?.parentKey === null ? null : String(page?.parentKey || "").trim();
    if (!/^[a-z0-9-]{2,80}$/.test(key) || keys.has(key)) throw new Error("The Methodology Lab contains a missing or duplicate page key.");
    if (!/^[A-Za-z0-9._-]+\.md$/.test(filename)) throw new Error(`The Methodology Lab page file for ${key || "unknown"} is not allowed.`);
    if (!title || titles.has(title.toLocaleLowerCase("en-GB"))) throw new Error("The Methodology Lab contains a missing or duplicate page title.");
    if (!Array.isArray(page.sources) || page.sources.length === 0) throw new Error(`The Methodology Lab page “${title}” has no controlled source map.`);
    const sources = page.sources.map((path) => {
      const normalised = String(path || "").replaceAll("\\", "/");
      const source = controlledSources.get(normalised);
      if (!source) throw new Error(`The Methodology Lab source “${normalised}” is not part of the controlled publication source.`);
      if (!["approved", "published", "recorded"].includes(source.status)) {
        throw new Error(`The Methodology Lab source “${normalised}” is not approved for the pilot source set.`);
      }
      return source;
    });
    const path = `publication/methodology-lab-001/${filename}`;
    const content = readFileSync(resolve(labDirectory, filename), "utf8");
    const metadata = extractFrontMatter(content);
    if (String(metadata.status || "").toLowerCase() !== "proposed") {
      throw new Error(`The Methodology Lab page “${title}” must remain proposed during the pilot.`);
    }
    keys.add(key);
    titles.add(title.toLocaleLowerCase("en-GB"));
    const sourceHash = hash(JSON.stringify({
      content,
      sources: sources.map((source) => [source.path, source.status, source.version, source.hash])
    }));
    const item = {
      key: `methodology-lab-001:${key}`,
      kind: key === "hub" ? "pilot-hub" : "pilot-page",
      role: "methodology",
      lifecycle: "draft",
      title,
      parentKey: parentKey ? `methodology-lab-001:${parentKey}` : null,
      externalParentKey: parentKey ? null : "methodology:draft",
      sourcePath: path,
      sourceStatus: "proposed-pilot",
      sourceVersion: String(manifest.version || "0.1"),
      sourceHash
    };
    item.bodyStorage = methodologyLabBody(
      { path, content, sourceHash },
      sources,
      {
        sourceCommit,
        repositoryUrl,
        pilotVersion: item.sourceVersion
      }
    );
    return item;
  });

  const itemByKey = new Map(items.map((item) => [item.key, item]));
  if (!itemByKey.has("methodology-lab-001:hub")) throw new Error("The Methodology Lab requires one controlled hub page.");
  for (const item of items) {
    if (item.parentKey && !itemByKey.has(item.parentKey)) {
      throw new Error(`The Methodology Lab parent for “${item.title}” is missing.`);
    }
  }
  const ordered = [];
  const visiting = new Set();
  const visit = (item) => {
    if (ordered.includes(item)) return;
    if (visiting.has(item.key)) throw new Error("The Methodology Lab page hierarchy contains a cycle.");
    visiting.add(item.key);
    if (item.parentKey) visit(itemByKey.get(item.parentKey));
    visiting.delete(item.key);
    ordered.push(item);
  };
  items.forEach(visit);
  const id = hash(JSON.stringify({
    publicationKind: "methodology-lab-pilot",
    targetLifecycle: "draft",
    sourceBranch,
    sourceCommit,
    parentReference: "methodology:draft",
    items: ordered.map((item) => [item.key, item.title, item.parentKey, item.externalParentKey, item.sourceHash])
  }));
  return {
    id,
    publicationKind: "methodology-lab-pilot",
    status: "proposed-publication-plan",
    title: String(manifest.title || "Operations Automated Methodology – Consolidated Draft"),
    generatedAt,
    sourceBranch,
    sourceCommit,
    repositoryUrl,
    confirmationPhrase: "",
    lifecycleOrder: ["draft"],
    targetLifecycle: "draft",
    founderConfirmationRequired: false,
    publicationAuthority: "ai-managed-draft",
    parentReferences: [{
      key: "methodology:draft",
      role: "methodology",
      title: "Draft"
    }],
    deletionEnabled: false,
    automaticPublication: false,
    existingControlledPagesChanged: false,
    reviewPageKey: "methodology-lab-001:review",
    items: ordered
  };
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
      lifecycle: source.lifecycle,
      title,
      parentKey: `${source.role}:${source.lifecycle}:${source.sectionKey}`,
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
    publicationKind: "controlled-mirror",
    status: "proposed-publication-plan",
    generatedAt,
    sourceBranch,
    sourceCommit,
    repositoryUrl,
    confirmationPhrase: PUBLICATION_CONFIRMATION,
    lifecycleOrder: LIFECYCLE_DEFINITIONS.map((item) => item.key),
    deletionEnabled: false,
    automaticPublication: false,
    items: ordered
  };
}
