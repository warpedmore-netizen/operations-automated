import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("the external governance lab compiles to a deployable worker", () => {
  assert.equal(existsSync(new URL("dist/server/index.js", root)), true);
  assert.equal(existsSync(new URL("dist/client", root)), true);
});

test("the main shell exposes the complete external testing journey", () => {
  const layout = read("app/layout.tsx");
  const page = read("app/page.tsx");
  const lab = read("app/GovernanceLab.tsx");

  assert.match(layout, /Northstar Governance Lab/);
  assert.match(page, /GovernanceLab/);
  for (const label of [
    "Organisation",
    "Inventory",
    "Recommendations",
    "Governance package",
    "Connectors",
    "Audit",
    "Confluence",
    "Notion",
    "Google Docs",
    "Word",
  ]) {
    assert.match(lab, new RegExp(label));
  }
});

test("workspace persistence remains server-side and size bounded", () => {
  const route = read("app/api/workspace/route.ts");
  assert.match(route, /getDb\(\)/);
  assert.match(route, /500_000/);
  assert.match(route, /onConflictDoUpdate/);
});
