import { createHash } from "node:crypto";

const ATLASSIAN_API_ORIGIN = "https://api.atlassian.com";
const MAX_PAGES_PER_SPACE = 200;
const MAX_PAGE_CHARACTERS = 100_000;
const MAX_SYNC_CHARACTERS = 2_000_000;

function inputError(message) {
  return Object.assign(new Error(message), { status: 400 });
}

function upstreamError(status, fallback) {
  const messages = {
    401: "Confluence rejected the account email or API token.",
    403: "The Confluence account does not have the permission required for this action.",
    404: "The Confluence site or requested resource could not be found.",
    409: "Confluence reported a version conflict. Refresh the publication preview before trying again.",
    429: "Confluence is temporarily rate limiting the Workbench. Try again shortly."
  };
  return Object.assign(new Error(messages[status] || fallback), { status: status === 409 ? 409 : status === 429 ? 429 : 502 });
}

export function normaliseAtlassianSiteUrl(value) {
  const supplied = String(value || "").trim();
  if (!supplied) throw inputError("Enter the Confluence site URL.");
  let parsed;
  try {
    parsed = new URL(supplied.includes("://") ? supplied : `https://${supplied}`);
  } catch {
    throw inputError("Enter a valid Confluence Cloud URL.");
  }
  const hostname = parsed.hostname.toLowerCase();
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    !(hostname.endsWith(".atlassian.net") && hostname.length > ".atlassian.net".length)
  ) {
    throw inputError("Use the HTTPS address for an Atlassian Cloud site ending in .atlassian.net.");
  }
  const path = parsed.pathname.replace(/\/+$/, "");
  if (path && path !== "/wiki") throw inputError("Use the site address only, for example https://example.atlassian.net.");
  return `https://${hostname}`;
}

export function validateConfluenceCredentials(value) {
  const siteUrl = normaliseAtlassianSiteUrl(value?.siteUrl);
  const accountEmail = String(value?.accountEmail || "").trim().toLowerCase();
  const apiToken = String(value?.apiToken || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail) || accountEmail.length > 254) {
    throw inputError("Enter the email address used by the Atlassian service account.");
  }
  if (apiToken.length < 10 || apiToken.length > 4096 || /[\u0000-\u001f\u007f]/.test(apiToken)) {
    throw inputError("Enter a valid Atlassian API token.");
  }
  return { siteUrl, accountEmail, apiToken };
}

function requestHeaders(credentials) {
  return {
    Accept: "application/json",
    Authorization: `Basic ${Buffer.from(`${credentials.accountEmail}:${credentials.apiToken}`, "utf8").toString("base64")}`
  };
}

function writeHeaders(credentials) {
  return {
    ...requestHeaders(credentials),
    "Content-Type": "application/json"
  };
}

async function readJsonResponse(response, fallback) {
  let payload = {};
  try { payload = await response.json(); } catch { /* An upstream error may not contain JSON. */ }
  if (!response.ok) throw upstreamError(response.status, fallback);
  return payload;
}

async function atlassianFetch(fetchImpl, url, options = {}) {
  try {
    return await fetchImpl(url, { ...options, signal: options.signal || AbortSignal.timeout(15_000) });
  } catch (error) {
    if (error?.status) throw error;
    throw Object.assign(new Error("The Workbench could not reach Confluence. Check the site address and internet connection."), { status: 502 });
  }
}

export async function discoverCloudId(siteUrl, { fetchImpl = fetch } = {}) {
  const normalised = normaliseAtlassianSiteUrl(siteUrl);
  const response = await atlassianFetch(fetchImpl, `${normalised}/_edge/tenant_info`, {
    headers: { Accept: "application/json" }
  });
  const payload = await readJsonResponse(response, "The Workbench could not identify the Confluence Cloud site.");
  const cloudId = String(payload.cloudId || payload.id || "").trim();
  if (!/^[A-Za-z0-9-]{8,100}$/.test(cloudId)) {
    throw Object.assign(new Error("Confluence did not return a valid Cloud ID for this site."), { status: 502 });
  }
  return cloudId;
}

function nextCursor(payload) {
  const next = payload?._links?.next;
  if (!next) return "";
  try {
    return new URL(next, ATLASSIAN_API_ORIGIN).searchParams.get("cursor") || "";
  } catch {
    return "";
  }
}

async function listPaged({ fetchImpl, baseUrl, path, credentials, maximum = 500, parameters = {} }) {
  const results = [];
  const seenCursors = new Set();
  let cursor = "";
  do {
    const query = new URLSearchParams({ limit: "100", ...parameters });
    if (cursor) query.set("cursor", cursor);
    const response = await atlassianFetch(fetchImpl, `${baseUrl}${path}?${query}`, {
      headers: requestHeaders(credentials)
    });
    const payload = await readJsonResponse(response, "Confluence could not return the requested content.");
    results.push(...(Array.isArray(payload.results) ? payload.results : []));
    cursor = nextCursor(payload);
    if (cursor && seenCursors.has(cursor)) break;
    if (cursor) seenCursors.add(cursor);
  } while (cursor && results.length < maximum);
  return results.slice(0, maximum);
}

export async function testConfluenceConnection(value, { fetchImpl = fetch } = {}) {
  const credentials = validateConfluenceCredentials(value);
  const cloudId = await discoverCloudId(credentials.siteUrl, { fetchImpl });
  const apiBaseUrl = `${ATLASSIAN_API_ORIGIN}/ex/confluence/${encodeURIComponent(cloudId)}`;
  const spaces = await listPaged({
    fetchImpl,
    baseUrl: apiBaseUrl,
    path: "/wiki/api/v2/spaces",
    credentials,
    maximum: 500,
    parameters: { status: "current" }
  });
  return {
    credentials,
    cloudId,
    apiBaseUrl,
    spaces: spaces
      .filter((space) => space?.id && space?.name)
      .map((space) => ({
        id: String(space.id),
        key: String(space.key || ""),
        name: String(space.name),
        type: String(space.type || "global"),
        status: String(space.status || "current")
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "en-GB"))
  };
}

export function selectSpaceRoles(spaces, value) {
  const internalSpaceId = String(value?.internalSpaceId || "");
  const methodologySpaceId = String(value?.methodologySpaceId || "");
  if (!internalSpaceId || !methodologySpaceId) throw inputError("Choose both the Internal and Methodology spaces.");
  if (internalSpaceId === methodologySpaceId) throw inputError("Choose a different space for each role.");
  const internalSpace = spaces.find((space) => space.id === internalSpaceId);
  const methodologySpace = spaces.find((space) => space.id === methodologySpaceId);
  if (!internalSpace || !methodologySpace) throw inputError("One of the selected spaces is not available to this account.");
  return { internalSpace, methodologySpace };
}

function decodeEntities(value) {
  const named = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    ndash: "–", mdash: "—", hellip: "…", lsquo: "‘", rsquo: "’",
    ldquo: "“", rdquo: "”", middot: "·"
  };
  return value
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (match, entity) => {
      if (entity[0] === "#") {
        const point = entity[1].toLowerCase() === "x"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
        return Number.isFinite(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : " ";
      }
      return named[entity.toLowerCase()] ?? match;
    });
}

export function confluenceStorageToText(value) {
  return decodeEntities(String(value || "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(?:br|hr)\b[^>]*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|li|tr|blockquote|pre|table)>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function publicationBodyTextHash(value) {
  const normalised = confluenceStorageToText(value)
    .replace(/\bSource commit:\s*[0-9a-f]{40}\b/gi, "Source commit: [retained-commit]")
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update(normalised).digest("hex").slice(0, 16);
}

async function pagesForSpace(connection, space, role, fetchImpl) {
  const pages = await listPaged({
    fetchImpl,
    baseUrl: connection.apiBaseUrl,
    path: `/wiki/api/v2/spaces/${encodeURIComponent(space.id)}/pages`,
    credentials: connection,
    maximum: MAX_PAGES_PER_SPACE,
    parameters: { status: "current", "body-format": "storage" }
  });
  return pages.map((page) => {
    const content = confluenceStorageToText(page.body?.storage?.value).slice(0, MAX_PAGE_CHARACTERS);
    const title = String(page.title || "Untitled Confluence page").replace(/[\r\n/\\]+/g, " ").trim().slice(0, 240);
    const externalId = String(page.id || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 100);
    return {
      path: `confluence://${role}/${space.key || space.id}/${externalId}/${title}`,
      status: "external-evidence",
      version: String(page.version?.number || "unknown"),
      hash: createHash("sha256").update(`${title}\n${content}`).digest("hex").slice(0, 12),
      content: `# ${title}\n\nConnected space role: ${role}\nConfluence space: ${space.name}\n\n${content}`,
      externalId,
      spaceId: space.id,
      spaceKey: space.key,
      spaceName: space.name,
      role
    };
  }).filter((page) => page.content.length > 0);
}

export async function synchroniseConfluencePages(storedConnection, { fetchImpl = fetch } = {}) {
  const credentials = validateConfluenceCredentials(storedConnection);
  const connection = {
    ...credentials,
    cloudId: String(storedConnection.cloudId || ""),
    apiBaseUrl: `${ATLASSIAN_API_ORIGIN}/ex/confluence/${encodeURIComponent(storedConnection.cloudId || "")}`
  };
  if (!connection.cloudId) throw inputError("The saved connection is missing its Cloud ID. Test and save it again.");
  const selected = [
    [storedConnection.internalSpace, "internal"],
    [storedConnection.methodologySpace, "methodology"]
  ];
  if (selected.some(([space]) => !space?.id)) throw inputError("Choose and save both Confluence spaces before synchronising.");
  const documents = (await Promise.all(selected.map(([space, role]) => pagesForSpace(connection, space, role, fetchImpl)))).flat();
  let used = 0;
  return documents.filter((document) => {
    if (used + document.content.length > MAX_SYNC_CHARACTERS) return false;
    used += document.content.length;
    return true;
  });
}

function publicationConnection(storedConnection) {
  const credentials = validateConfluenceCredentials(storedConnection);
  const cloudId = String(storedConnection.cloudId || "");
  if (!cloudId) throw inputError("The saved connection is missing its Cloud ID. Test and save it again.");
  if (!storedConnection.internalSpace?.id || !storedConnection.methodologySpace?.id) {
    throw inputError("Choose and save both Confluence spaces before preparing a publication.");
  }
  return {
    ...credentials,
    cloudId,
    apiBaseUrl: `${ATLASSIAN_API_ORIGIN}/ex/confluence/${encodeURIComponent(cloudId)}`,
    internalSpace: storedConnection.internalSpace,
    methodologySpace: storedConnection.methodologySpace
  };
}

async function publicationPagesForSpace(connection, space, fetchImpl) {
  return (await listPaged({
    fetchImpl,
    baseUrl: connection.apiBaseUrl,
    path: `/wiki/api/v2/spaces/${encodeURIComponent(space.id)}/pages`,
    credentials: connection,
    maximum: 1000,
    parameters: { status: "current", "body-format": "storage" }
  })).map((page) => {
    const storageBody = String(page.body?.storage?.value || "");
    const readableBody = confluenceStorageToText(storageBody);
    const sourceCommit = readableBody.match(/\bSource commit:\s*([0-9a-f]{40})\b/i)?.[1] || "";
    const sourceHash = readableBody.match(/\bCombined source hash:\s*([0-9a-f]{12})\b/i)?.[1] || "";
    return {
      id: String(page.id || ""),
      title: String(page.title || ""),
      spaceId: String(page.spaceId || space.id),
      parentId: page.parentId ? String(page.parentId) : null,
      status: String(page.status || "current"),
      version: Number(page.version?.number || 0),
      webPath: String(page._links?.webui || ""),
      publishedSourceCommit: sourceCommit,
      publishedSourceHash: sourceHash,
      publishedBodyTextHash: publicationBodyTextHash(storageBody)
    };
  }).filter((page) => page.id);
}

function mappingFor(mappings, key) {
  return mappings.find((mapping) => mapping.itemKey === key || mapping.item_key === key) || null;
}

export async function inspectConfluencePublication(storedConnection, plan, mappings = [], { fetchImpl = fetch } = {}) {
  const connection = publicationConnection(storedConnection);
  const spaces = {
    internal: connection.internalSpace,
    methodology: connection.methodologySpace
  };
  const [internalPages, methodologyPages] = await Promise.all([
    publicationPagesForSpace(connection, spaces.internal, fetchImpl),
    publicationPagesForSpace(connection, spaces.methodology, fetchImpl)
  ]);
  const pagesByRole = { internal: internalPages, methodology: methodologyPages };
  const parentReferences = (plan.parentReferences || []).map((reference) => {
    const mapping = mappingFor(mappings, reference.key);
    const pages = pagesByRole[reference.role] || [];
    const remote = mapping
      ? pages.find((page) => page.id === String(mapping.confluencePageId || mapping.confluence_page_id || ""))
      : null;
    const mappedSpace = String(mapping?.confluenceSpaceId || mapping?.confluence_space_id || "");
    let action = "reference";
    let reason = "The existing managed Draft parent is available.";
    if (!mapping || !remote) {
      action = "conflict";
      reason = "The managed Draft parent is missing or is no longer visible.";
    } else if (remote.spaceId !== String(spaces[reference.role].id) || (mappedSpace && mappedSpace !== remote.spaceId)) {
      action = "conflict";
      reason = "The managed Draft parent is no longer in its controlled Confluence space.";
    } else if (remote.title.toLocaleLowerCase("en-GB") !== reference.title.toLocaleLowerCase("en-GB")) {
      action = "conflict";
      reason = "The managed Draft parent has been renamed.";
    }
    return {
      ...reference,
      action,
      reason,
      confluencePageId: remote?.id || "",
      confluenceVersion: remote?.version || 0,
      webPath: remote?.webPath || "",
      webUrl: remote?.webPath ? pageWebUrl(connection, { _links: { webui: remote.webPath } }) : ""
    };
  });
  const inspected = plan.items.map((item) => {
    const mapping = mappingFor(mappings, item.key);
    const pages = pagesByRole[item.role] || [];
    const remote = mapping
      ? pages.find((page) => page.id === String(mapping.confluencePageId || mapping.confluence_page_id || ""))
      : null;
    const titleMatch = pages.find((page) => page.title.toLocaleLowerCase("en-GB") === item.title.toLocaleLowerCase("en-GB"));
    let action = "create";
    let reason = "No managed Confluence page exists for this controlled item.";
    let conflictType = "";
    if (mapping && !remote) {
      action = "conflict";
      conflictType = "managed-page-missing";
      reason = "The previously managed Confluence page is missing or is no longer visible.";
    } else if (mapping && remote) {
      const mappedSpace = String(mapping.confluenceSpaceId || mapping.confluence_space_id || "");
      const mappedVersion = Number(mapping.confluenceVersion || mapping.confluence_version || 0);
      const mappedHash = String(mapping.sourceHash || mapping.source_hash || "");
      const mappedTitle = String(mapping.confluenceTitle || mapping.confluence_title || "");
      if (remote.spaceId !== String(spaces[item.role].id) || (mappedSpace && mappedSpace !== remote.spaceId)) {
        action = "conflict";
        conflictType = "managed-page-moved";
        reason = "The managed page is no longer in its controlled Confluence space.";
      } else if (mappedVersion && remote.version !== mappedVersion) {
        const recoverableSourceCommits = new Set([
          plan.sourceCommit,
          ...(Array.isArray(plan.recoverableSourceCommits) ? plan.recoverableSourceCommits : [])
        ]);
        const exactInterruptedDraftWrite = plan.targetLifecycle === "draft"
          && plan.founderConfirmationRequired === false
          && remote.version === mappedVersion + 1
          && remote.title === item.title
          && recoverableSourceCommits.has(remote.publishedSourceCommit)
          && remote.publishedSourceHash === item.sourceHash
          && remote.publishedBodyTextHash === publicationBodyTextHash(item.bodyStorage);
        if (exactInterruptedDraftWrite) {
          action = "reconcile";
          reason = "Confluence already contains this exact committed Draft after an interrupted publication. Reconcile the tracked receipt without rewriting the page.";
        } else {
          action = "conflict";
          conflictType = "managed-page-version";
          reason = "The Confluence page changed after the last Workbench publication. It will not be overwritten.";
        }
      } else if (mappedHash === item.sourceHash && mappedTitle === item.title) {
        action = "unchanged";
        reason = "The repository source and tracked Confluence version are unchanged.";
      } else {
        action = "update";
        reason = "The controlled repository source changed and the tracked Confluence page has not changed independently.";
      }
    } else if (titleMatch) {
      action = "conflict";
      conflictType = "unmanaged-title";
      reason = "A page with this title already exists but is not managed by this Workbench.";
    }
    return {
      ...item,
      action,
      conflictType,
      reason,
      spaceId: String(spaces[item.role].id),
      spaceName: spaces[item.role].name,
      confluencePageId: remote?.id || "",
      confluenceVersion: remote?.version || 0,
      confluenceParentId: remote?.parentId || null,
      reconciledSourceCommit: action === "reconcile" ? remote?.publishedSourceCommit || "" : "",
      webPath: remote?.webPath || "",
      webUrl: remote?.webPath ? pageWebUrl(connection, { _links: { webui: remote.webPath } }) : ""
    };
  });
  const byKey = new Map(inspected.map((item) => [item.key, item]));
  for (const item of inspected) {
    const parentKey = item.parentKey || item.externalParentKey;
    if (!parentKey) continue;
    const parent = byKey.get(parentKey) || parentReferences.find((reference) => reference.key === parentKey);
    if (parent?.action === "conflict") {
      item.action = "conflict";
      item.conflictType = "parent-conflict";
      item.reason = `The parent page “${parent.title}” has a conflict that must be resolved first.`;
    }
  }
  const summary = Object.fromEntries(["create", "update", "reconcile", "unchanged", "conflict"].map((action) => [
    action,
    inspected.filter((item) => item.action === action).length
  ]));
  return {
    ...plan,
    spaces,
    summary,
    publishable: summary.conflict === 0 && parentReferences.every((reference) => reference.action !== "conflict"),
    parentReferences,
    items: inspected
  };
}

function pageWebUrl(connection, page) {
  const path = String(page?._links?.webui || "");
  if (!path) return "";
  try {
    if (path.startsWith("/wiki/")) return new URL(path, connection.siteUrl).toString();
    const base = String(page?._links?.base || `${connection.siteUrl}/wiki/`).replace(/\/?$/, "/");
    return new URL(path.replace(/^\/+/, ""), base).toString();
  }
  catch { return ""; }
}

async function writePublicationPage(connection, item, parentId, fetchImpl) {
  const versionMessage = `Operations Automated source ${item.sourcePath || item.key}; ${item.sourceStatus}; ${item.sourceHash}`;
  if (item.action === "create") {
    const payload = {
      spaceId: String(item.spaceId),
      status: "current",
      title: item.title,
      body: { representation: "storage", value: item.bodyStorage }
    };
    if (parentId) payload.parentId = String(parentId);
    const response = await atlassianFetch(fetchImpl, `${connection.apiBaseUrl}/wiki/api/v2/pages`, {
      method: "POST",
      headers: writeHeaders(connection),
      body: JSON.stringify(payload)
    });
    return readJsonResponse(response, "Confluence could not create the controlled reading page.");
  }
  const payload = {
    id: String(item.confluencePageId),
    status: "current",
    title: item.title,
    body: { representation: "storage", value: item.bodyStorage },
    version: {
      number: Number(item.confluenceVersion) + 1,
      message: versionMessage.slice(0, 255)
    }
  };
  if (parentId) payload.parentId = String(parentId);
  const response = await atlassianFetch(fetchImpl, `${connection.apiBaseUrl}/wiki/api/v2/pages/${encodeURIComponent(item.confluencePageId)}`, {
    method: "PUT",
    headers: writeHeaders(connection),
    body: JSON.stringify(payload)
  });
  return readJsonResponse(response, "Confluence could not update the controlled reading page.");
}

export async function publishConfluencePublication(
  storedConnection,
  inspectedPlan,
  { fetchImpl = fetch, onPublished = async () => {} } = {}
) {
  if (!inspectedPlan?.publishable || inspectedPlan.items.some((item) => item.action === "conflict")) {
    throw Object.assign(new Error("Resolve every Confluence conflict and refresh the preview before publishing."), { status: 409 });
  }
  const connection = publicationConnection(storedConnection);
  const results = new Map();
  for (const reference of inspectedPlan.parentReferences || []) {
    if (reference.action !== "reference" || !reference.confluencePageId) {
      throw Object.assign(new Error(`The controlled parent page “${reference.title}” was not available.`), { status: 409 });
    }
    results.set(reference.key, reference);
  }
  const published = [];
  for (const item of inspectedPlan.items) {
    const parentKey = item.parentKey || item.externalParentKey;
    const parent = parentKey ? results.get(parentKey) : null;
    const parentId = parent?.confluencePageId || null;
    if (parentKey && !parentId) {
      throw Object.assign(new Error(`The parent page for “${item.title}” was not available.`), { status: 409 });
    }
    if (item.action === "unchanged" || item.action === "reconcile") {
      const unchanged = {
        ...item,
        outcome: item.action === "reconcile" ? "reconciled" : "unchanged",
        confluencePageId: item.confluencePageId,
        confluenceVersion: item.confluenceVersion,
        webUrl: item.webPath ? pageWebUrl(connection, { _links: { webui: item.webPath } }) : ""
      };
      results.set(item.key, unchanged);
      published.push(unchanged);
      if (item.action === "reconcile") await onPublished(unchanged);
      continue;
    }
    const page = await writePublicationPage(connection, item, parentId, fetchImpl);
    const result = {
      ...item,
      outcome: item.action === "create" ? "created" : "updated",
      confluencePageId: String(page.id || item.confluencePageId || ""),
      confluenceVersion: Number(page.version?.number || (item.action === "update" ? item.confluenceVersion + 1 : 1)),
      confluenceParentId: page.parentId ? String(page.parentId) : parentId,
      webUrl: pageWebUrl(connection, page)
    };
    if (!result.confluencePageId) {
      throw Object.assign(new Error("Confluence created or updated a page without returning its identifier."), { status: 502 });
    }
    results.set(item.key, result);
    published.push(result);
    await onPublished(result);
  }
  return {
    publishedAt: new Date().toISOString(),
    created: published.filter((item) => item.outcome === "created").length,
    updated: published.filter((item) => item.outcome === "updated").length,
    reconciled: published.filter((item) => item.outcome === "reconciled").length,
    unchanged: published.filter((item) => ["unchanged", "reconciled"].includes(item.outcome)).length,
    items: published
  };
}

export function maskEmail(value) {
  const [name, domain] = String(value || "").split("@");
  if (!name || !domain) return "";
  return `${name.slice(0, 1)}${"*".repeat(Math.min(6, Math.max(2, name.length - 1)))}@${domain}`;
}

export function publicConnectionMetadata(connection, syncState = {}) {
  if (!connection) return null;
  return {
    provider: "confluence-cloud",
    siteUrl: connection.siteUrl,
    cloudId: connection.cloudId,
    accountEmailMasked: maskEmail(connection.accountEmail),
    internalSpace: connection.internalSpace,
    methodologySpace: connection.methodologySpace,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
    lastVerifiedAt: connection.lastVerifiedAt,
    readOnly: false,
    writeEnabled: true,
    writeCapability: "ai-managed-draft-and-founder-controlled-live",
    draftWritesRequireFounderConfirmation: false,
    liveWritesRequireFounderConfirmation: true,
    automaticWrites: false,
    deleteEnabled: false,
    syncedDocuments: Number(syncState.documentCount || 0),
    lastSyncedAt: syncState.lastSyncedAt || null,
    contentPersistence: "server-memory-only"
  };
}
