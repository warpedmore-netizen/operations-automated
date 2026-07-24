import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  PUBLICATION_CONFIRMATION,
  buildConfluencePublicationPlan,
  markdownToConfluenceStorage
} from "../confluence-publication.mjs";
import {
  inspectConfluencePublication,
  publishConfluencePublication
} from "../confluence-connector.mjs";

function response(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function connection() {
  return {
    siteUrl: "https://example.atlassian.net",
    accountEmail: "service@example.com",
    apiToken: "scoped-token-123456",
    cloudId: "cloud-12345678",
    internalSpace: { id: "10", key: "INT", name: "Internal" },
    methodologySpace: { id: "20", key: "METHOD", name: "Methodology" }
  };
}

test("publication plan creates an ordered human reading structure with source status", async () => {
  const root = await mkdtemp(join(tmpdir(), "oa-publication-plan-"));
  try {
    await mkdir(join(root, "methodology"), { recursive: true });
    await mkdir(join(root, "principles"), { recursive: true });
    await writeFile(
      join(root, "methodology", "current-methodology-synthesis.md"),
      "---\ntitle: Current Methodology\nstatus: approved\nversion: 0.6\napproval_scope: internal validation\n---\n# Current methodology\n\nReadable content.\n",
      "utf8"
    );
    await writeFile(
      join(root, "principles", "learning.md"),
      "---\ntitle: Learn Safely\nstatus: proposed\nversion: 0.1\n---\n# Learn safely\n\nProposed content.\n",
      "utf8"
    );
    await writeFile(join(root, "GOVERNANCE.md"), "# Governance\n\nHuman authority.", "utf8");

    const plan = buildConfluencePublicationPlan({
      repositoryRoot: root,
      sourceBranch: "main",
      sourceCommit: "a".repeat(40),
      generatedAt: "2026-07-25T08:00:00.000Z"
    });

    assert.equal(plan.confirmationPhrase, PUBLICATION_CONFIRMATION);
    assert.equal(plan.automaticPublication, false);
    assert.equal(plan.deletionEnabled, false);
    assert.equal(plan.items[0].key, "methodology:hub");
    assert.ok(plan.items.find((item) => item.title === "01 — Start here: Current methodology"));
    const proposed = plan.items.find((item) => item.sourcePath === "principles/learning.md");
    assert.equal(proposed.parentKey, "methodology:principles");
    assert.match(proposed.bodyStorage, /Proposed — complete enough for review but not approved/);
    assert.match(proposed.bodyStorage, /Source commit/);
    assert.match(proposed.bodyStorage, /Git remains authoritative/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Markdown conversion produces readable storage markup and escapes executable HTML", () => {
  const storage = markdownToConfluenceStorage(
    "# Guide\n\n- **Review** the [decision](../decisions/record.md).\n- Ignore [unsafe](javascript:alert(1)).\n\n<script>danger()</script>\n\n```mermaid\nflowchart LR\nA --> B\n```\n",
    {
      sourcePath: "methodology/guide.md",
      sourceCommit: "abc123",
      repositoryUrl: "https://github.com/example/project"
    }
  );
  assert.match(storage, /<h1>Guide<\/h1>/);
  assert.match(storage, /<ul><li><strong>Review<\/strong>/);
  assert.match(storage, /github\.com\/example\/project\/blob\/abc123\/decisions\/record\.md/);
  assert.match(storage, /href="#unsupported-link"/);
  assert.doesNotMatch(storage, /href="javascript:/);
  assert.doesNotMatch(storage, /<script>/);
  assert.match(storage, /&lt;script&gt;danger\(\)&lt;\/script&gt;/);
  assert.match(storage, /mermaid source/);
});

test("publication inspection distinguishes create, update, unchanged and conflicts", async () => {
  const pages = [
    { id: "100", title: "Unchanged", spaceId: "10", version: { number: 3 } },
    { id: "101", title: "Update", spaceId: "10", version: { number: 2 } },
    { id: "102", title: "Remote edit", spaceId: "10", version: { number: 5 } },
    { id: "103", title: "Existing unmanaged", spaceId: "10", version: { number: 1 } }
  ];
  const fetchImpl = async (url) => response({
    results: String(url).includes("/spaces/10/") ? pages : [],
    _links: {}
  });
  const base = {
    kind: "controlled-document",
    role: "internal",
    parentKey: null,
    sourcePath: "test.md",
    sourceStatus: "approved",
    sourceVersion: "1",
    bodyStorage: "<p>Body</p>"
  };
  const plan = {
    id: "plan-1",
    items: [
      { ...base, key: "unchanged", title: "Unchanged", sourceHash: "same" },
      { ...base, key: "update", title: "Update", sourceHash: "new" },
      { ...base, key: "remote", title: "Remote edit", sourceHash: "newer" },
      { ...base, key: "title", title: "Existing unmanaged", sourceHash: "one" },
      { ...base, key: "create", title: "Create me", sourceHash: "two" }
    ]
  };
  const mappings = [
    { itemKey: "unchanged", confluencePageId: "100", confluenceSpaceId: "10", confluenceVersion: 3, sourceHash: "same", confluenceTitle: "Unchanged" },
    { itemKey: "update", confluencePageId: "101", confluenceSpaceId: "10", confluenceVersion: 2, sourceHash: "old", confluenceTitle: "Update" },
    { itemKey: "remote", confluencePageId: "102", confluenceSpaceId: "10", confluenceVersion: 4, sourceHash: "old", confluenceTitle: "Remote edit" }
  ];
  const inspected = await inspectConfluencePublication(connection(), plan, mappings, { fetchImpl });
  assert.deepEqual(inspected.summary, { create: 1, update: 1, unchanged: 1, conflict: 2 });
  assert.equal(inspected.publishable, false);
  assert.match(inspected.items.find((item) => item.key === "remote").reason, /changed after the last/i);
  assert.equal(inspected.items.find((item) => item.key === "remote").conflictType, "managed-page-version");
  assert.match(inspected.items.find((item) => item.key === "title").reason, /not managed/i);
  assert.equal(inspected.items.find((item) => item.key === "title").conflictType, "unmanaged-title");
});

test("publication writes parents first, uses optimistic page versions and never deletes", async () => {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url: String(url), method: options.method, body: options.body ? JSON.parse(options.body) : null });
    if (options.method === "PUT") {
      return response({
        id: "20",
        parentId: "10",
        version: { number: 4 },
        _links: { webui: "/wiki/spaces/INT/pages/20" }
      });
    }
    return response({
      id: "30",
      parentId: "10",
      version: { number: 1 },
      _links: { webui: "/wiki/spaces/INT/pages/30" }
    });
  };
  const inspected = {
    publishable: true,
    items: [
      {
        key: "parent",
        action: "unchanged",
        role: "internal",
        title: "Parent",
        parentKey: null,
        sourceHash: "parent",
        sourceStatus: "navigation",
        sourcePath: "",
        spaceId: "10",
        confluencePageId: "10",
        confluenceVersion: 2,
        webPath: "/wiki/spaces/INT/pages/10",
        bodyStorage: "<p>Parent</p>"
      },
      {
        key: "update",
        action: "update",
        role: "internal",
        title: "Updated page",
        parentKey: "parent",
        sourceHash: "update",
        sourceStatus: "approved",
        sourcePath: "methodology/update.md",
        spaceId: "10",
        confluencePageId: "20",
        confluenceVersion: 3,
        bodyStorage: "<p>Updated</p>"
      },
      {
        key: "create",
        action: "create",
        role: "internal",
        title: "New page",
        parentKey: "parent",
        sourceHash: "create",
        sourceStatus: "proposed",
        sourcePath: "decisions/new.md",
        spaceId: "10",
        confluencePageId: "",
        confluenceVersion: 0,
        bodyStorage: "<p>New</p>"
      }
    ]
  };
  const retained = [];
  const result = await publishConfluencePublication(connection(), inspected, {
    fetchImpl,
    onPublished: async (item) => retained.push(item)
  });
  assert.deepEqual({ created: result.created, updated: result.updated, unchanged: result.unchanged }, {
    created: 1,
    updated: 1,
    unchanged: 1
  });
  assert.equal(requests[0].method, "PUT");
  assert.equal(requests[0].body.version.number, 4);
  assert.equal(requests[0].body.parentId, "10");
  assert.equal(requests[1].method, "POST");
  assert.equal(requests[1].body.parentId, "10");
  assert.equal(requests.some((request) => request.method === "DELETE"), false);
  assert.deepEqual(retained.map((item) => item.outcome), ["updated", "created"]);
});
