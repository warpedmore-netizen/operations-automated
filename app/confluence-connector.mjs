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
    403: "The Confluence account does not have the required read permission.",
    404: "The Confluence site or requested resource could not be found.",
    429: "Confluence is temporarily rate limiting the Workbench. Try again shortly."
  };
  return Object.assign(new Error(messages[status] || fallback), { status: status === 429 ? 429 : 502 });
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
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return value
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity) => {
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
    readOnly: true,
    writeEnabled: false,
    syncedDocuments: Number(syncState.documentCount || 0),
    lastSyncedAt: syncState.lastSyncedAt || null,
    contentPersistence: "server-memory-only"
  };
}
