import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  METHODOLOGY_LAB_CONFIRMATION,
  PUBLICATION_CONFIRMATION,
  buildConfluencePublicationPlan,
  buildMethodologyLabPublicationPlan,
  markdownToConfluenceStorage,
  publicationLifecycle
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

test("publication plan creates a lifecycle-first human reading structure with source status", async () => {
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
    await writeFile(
      join(root, "principles", "old-learning.md"),
      "---\ntitle: Old Learning Rule\nstatus: superseded\nversion: 0.1\n---\n# Old learning rule\n\nHistorical content.\n",
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
    assert.deepEqual(plan.lifecycleOrder, ["live", "draft", "archived"]);
    const approved = plan.items.find((item) => item.sourcePath === "methodology/current-methodology-synthesis.md");
    assert.equal(approved.lifecycle, "live");
    assert.equal(approved.parentKey, "methodology:live:core");
    const proposed = plan.items.find((item) => item.sourcePath === "principles/learning.md");
    assert.equal(proposed.lifecycle, "draft");
    assert.equal(proposed.parentKey, "methodology:draft:principles");
    assert.match(proposed.bodyStorage, /Proposed — complete enough for review but not approved/);
    assert.match(proposed.bodyStorage, /Reading location:<\/strong> Draft/);
    assert.match(proposed.bodyStorage, /Source commit/);
    assert.match(proposed.bodyStorage, /Git remains authoritative/);
    const archived = plan.items.find((item) => item.sourcePath === "principles/old-learning.md");
    assert.equal(archived.lifecycle, "archived");
    assert.equal(archived.parentKey, "methodology:archived:principles");
    assert.match(archived.bodyStorage, /Superseded — retained for history but no longer current/);
    for (const role of ["methodology", "internal"]) {
      for (const lifecycle of ["live", "draft", "archived"]) {
        assert.ok(plan.items.find((item) => item.key === `${role}:${lifecycle}`));
      }
    }
    const titlesByRole = new Set();
    for (const item of plan.items) {
      const key = `${item.role}:${item.title.toLowerCase()}`;
      assert.equal(titlesByRole.has(key), false, `duplicate title ${key}`);
      titlesByRole.add(key);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("methodology lab plan is isolated, source-mapped and confirmation-gated", async () => {
  const root = await mkdtemp(join(tmpdir(), "oa-methodology-lab-plan-"));
  try {
    await mkdir(join(root, "methodology"), { recursive: true });
    await mkdir(join(root, "publication", "methodology-lab-001"), { recursive: true });
    await writeFile(
      join(root, "methodology", "approved-method.md"),
      "---\ntitle: Approved Method\nstatus: approved\nversion: 0.6\n---\n# Approved method\n\nControlled meaning.\n",
      "utf8"
    );
    await writeFile(
      join(root, "publication", "methodology-lab-001", "00-start.md"),
      "---\ntitle: Methodology Lab\nstatus: proposed\nversion: 0.1\n---\n# Methodology Lab\n\nStart with the reader.\n",
      "utf8"
    );
    await writeFile(
      join(root, "publication", "methodology-lab-001", "01-review.md"),
      "---\ntitle: Review the Pilot\nstatus: proposed\nversion: 0.1\n---\n# Review the pilot\n\nRecord what worked.\n",
      "utf8"
    );
    await writeFile(
      join(root, "publication", "methodology-lab-001", "manifest.json"),
      JSON.stringify({
        id: "OA-METHODOLOGY-LAB-001",
        title: "Methodology Lab",
        status: "proposed-pilot",
        version: "0.1",
        pages: [
          {
            key: "hub",
            file: "00-start.md",
            title: "Methodology Lab",
            parentKey: null,
            sources: ["methodology/approved-method.md"]
          },
          {
            key: "review",
            file: "01-review.md",
            title: "Review the Pilot",
            parentKey: "hub",
            sources: ["methodology/approved-method.md"]
          }
        ]
      }),
      "utf8"
    );

    const plan = buildMethodologyLabPublicationPlan({
      repositoryRoot: root,
      sourceBranch: "main",
      sourceCommit: "b".repeat(40),
      generatedAt: "2026-07-25T09:00:00.000Z"
    });

    assert.equal(plan.publicationKind, "methodology-lab-pilot");
    assert.equal(plan.confirmationPhrase, METHODOLOGY_LAB_CONFIRMATION);
    assert.equal(plan.existingControlledPagesChanged, false);
    assert.equal(plan.automaticPublication, false);
    assert.equal(plan.deletionEnabled, false);
    assert.deepEqual(plan.items.map((item) => item.key), [
      "methodology-lab-001:hub",
      "methodology-lab-001:review"
    ]);
    assert.ok(plan.items.every((item) => item.role === "methodology"));
    assert.ok(plan.items.every((item) => item.sourceStatus === "proposed-pilot"));
    assert.match(plan.items[0].bodyStorage, /proposed reading synthesis/i);
    assert.match(plan.items[0].bodyStorage, /methodology\/approved-method\.md/);
    assert.match(plan.items[0].bodyStorage, /Git remains authoritative/);
    assert.equal(plan.items[1].parentKey, "methodology-lab-001:hub");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("repository statuses map conservatively to Live, Draft and Archived", () => {
  assert.equal(publicationLifecycle("approved"), "live");
  assert.equal(publicationLifecycle("published"), "live");
  assert.equal(publicationLifecycle("recorded"), "live");
  assert.equal(publicationLifecycle("idea"), "draft");
  assert.equal(publicationLifecycle("draft"), "draft");
  assert.equal(publicationLifecycle("proposed"), "draft");
  assert.equal(publicationLifecycle("approved for preparation, not approved for release"), "draft");
  assert.equal(publicationLifecycle("superseded"), "archived");
  assert.equal(publicationLifecycle("rejected"), "archived");
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
