import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  confluenceStorageToText,
  normaliseAtlassianSiteUrl,
  publicConnectionMetadata,
  selectSpaceRoles,
  synchroniseConfluencePages,
  testConfluenceConnection
} from "../confluence-connector.mjs";
import { createCredentialStore, credentialStorePath } from "../credential-store.mjs";
import { retrieveIndexedSections } from "../repository-index.mjs";

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("Confluence site validation accepts only bounded Atlassian Cloud origins", () => {
  assert.equal(normaliseAtlassianSiteUrl("example.atlassian.net/wiki/"), "https://example.atlassian.net");
  assert.throws(() => normaliseAtlassianSiteUrl("http://example.atlassian.net"), /HTTPS address/);
  assert.throws(() => normaliseAtlassianSiteUrl("https://example.com"), /\.atlassian\.net/);
  assert.throws(() => normaliseAtlassianSiteUrl("https://example.atlassian.net/wiki/display/TEST"), /site address only/);
});

test("connection test discovers the Cloud ID and lists only returned spaces", async () => {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).endsWith("/_edge/tenant_info")) return jsonResponse({ cloudId: "cloud-12345678" });
    return jsonResponse({
      results: [
        { id: "20", key: "METHOD", name: "Methodology", type: "global", status: "current" },
        { id: "10", key: "INT", name: "Internal", type: "global", status: "current" }
      ],
      _links: {}
    });
  };
  const result = await testConfluenceConnection({
    siteUrl: "https://example.atlassian.net",
    accountEmail: "service@example.com",
    apiToken: "scoped-token-123456"
  }, { fetchImpl });

  assert.equal(result.cloudId, "cloud-12345678");
  assert.deepEqual(result.spaces.map((space) => space.name), ["Internal", "Methodology"]);
  assert.match(calls[1].url, /^https:\/\/api\.atlassian\.com\/ex\/confluence\/cloud-12345678\/wiki\/api\/v2\/spaces\?/);
  const decoded = Buffer.from(calls[1].options.headers.Authorization.replace("Basic ", ""), "base64").toString("utf8");
  assert.equal(decoded, "service@example.com:scoped-token-123456");
});

test("space roles must be present, accessible and different", () => {
  const spaces = [{ id: "10", name: "Internal" }, { id: "20", name: "Methodology" }];
  assert.deepEqual(selectSpaceRoles(spaces, { internalSpaceId: "10", methodologySpaceId: "20" }), {
    internalSpace: spaces[0],
    methodologySpace: spaces[1]
  });
  assert.throws(() => selectSpaceRoles(spaces, { internalSpaceId: "10", methodologySpaceId: "10" }), /different space/);
  assert.throws(() => selectSpaceRoles(spaces, { internalSpaceId: "10", methodologySpaceId: "99" }), /not available/);
});

test("read-only synchronisation converts selected-space pages into external evidence", async () => {
  const requested = [];
  const fetchImpl = async (url) => {
    requested.push(String(url));
    const title = String(url).includes("/spaces/10/") ? "Internal control" : "Method principle";
    return jsonResponse({
      results: [{
        id: title === "Internal control" ? "101" : "202",
        title,
        status: "current",
        version: { number: 3 },
        body: { storage: { value: `<h1>${title}</h1><p>Evidence &amp; learning.</p>` } }
      }],
      _links: {}
    });
  };
  const documents = await synchroniseConfluencePages({
    siteUrl: "https://example.atlassian.net",
    accountEmail: "service@example.com",
    apiToken: "scoped-token-123456",
    cloudId: "cloud-12345678",
    internalSpace: { id: "10", key: "INT", name: "Internal" },
    methodologySpace: { id: "20", key: "METHOD", name: "Methodology" }
  }, { fetchImpl });

  assert.equal(documents.length, 2);
  assert.ok(documents.every((document) => document.status === "external-evidence"));
  assert.ok(documents.some((document) => document.path.startsWith("confluence://internal/INT/101/")));
  assert.ok(documents.some((document) => /Evidence & learning\./.test(document.content)));
  assert.ok(requested.every((url) => url.includes("body-format=storage")));
});

test("storage markup becomes readable text without executable tags", () => {
  const text = confluenceStorageToText("<h2>Control</h2><p>Keep &lt;five&gt; checks.</p><script>ignore()</script>");
  assert.match(text, /Control/);
  assert.match(text, /Keep <five> checks/);
  assert.doesNotMatch(text, /<script>/);
});

test("public connection metadata masks the account and never exposes the token", () => {
  const value = publicConnectionMetadata({
    siteUrl: "https://example.atlassian.net",
    cloudId: "cloud-12345678",
    accountEmail: "service@example.com",
    apiToken: "must-not-leak",
    internalSpace: { id: "10", name: "Internal" },
    methodologySpace: { id: "20", name: "Methodology" }
  }, { documentCount: 4, lastSyncedAt: "2026-07-24T12:00:00.000Z" });
  assert.equal(value.accountEmailMasked, "s******@example.com");
  assert.equal(value.syncedDocuments, 4);
  assert.equal(value.writeEnabled, true);
  assert.equal(value.writeCapability, "ai-managed-draft-and-founder-controlled-live");
  assert.equal(value.draftWritesRequireFounderConfirmation, false);
  assert.equal(value.liveWritesRequireFounderConfirmation, true);
  assert.equal(value.automaticWrites, false);
  assert.equal(value.deleteEnabled, false);
  assert.doesNotMatch(JSON.stringify(value), /must-not-leak|service@example\.com/);
});

test("connected evidence can inform ordinary retrieval but never approved-only context", () => {
  const documents = [{
    path: "confluence://methodology/METHOD/202/Method principle",
    status: "external-evidence",
    version: "3",
    hash: "abc123",
    content: "# Method principle\n\nA connected resilience observation."
  }];
  assert.equal(retrieveIndexedSections(documents, "connected resilience", 5000).length, 1);
  assert.equal(retrieveIndexedSections(documents, "connected resilience", 5000, { approvedOnly: true }).length, 0);
});

test("credential store passes secrets through stdin-oriented runner and uses LocalAppData", async () => {
  const calls = [];
  const stored = { apiToken: "private-token", siteUrl: "https://example.atlassian.net" };
  const store = createCredentialStore({
    platform: "win32",
    environment: { LOCALAPPDATA: "C:\\Users\\Jamie\\AppData\\Local" },
    runPowerShell: async (operation, payload) => {
      calls.push({ operation, payload });
      return operation === "Get" ? { configured: true, value: stored } : { stored: true };
    }
  });
  await store.set(stored);
  assert.deepEqual(await store.get(), stored);
  await store.delete();
  assert.deepEqual(calls.map((call) => call.operation), ["Set", "Get", "Delete"]);
  assert.match(credentialStorePath({ LOCALAPPDATA: "C:\\Users\\Jamie\\AppData\\Local" }), /OperationsAutomated[\\/]Workbench[\\/]confluence\.credentials$/);
});

test("Windows credential helper reads and writes JSON as UTF-8", () => {
  const helper = readFileSync(fileURLToPath(new URL("../secure-store.ps1", import.meta.url)), "utf8");
  assert.match(helper, /\[Console\]::InputEncoding = \$utf8/);
  assert.match(helper, /\[Console\]::OutputEncoding = \$utf8/);
});
