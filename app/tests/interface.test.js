const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");

const appRoot = resolve(__dirname, "..");
const html = readFileSync(resolve(appRoot, "index.html"), "utf8");
const appSource = readFileSync(resolve(appRoot, "app.js"), "utf8");

const matches = (pattern, source) => [...source.matchAll(pattern)].map((match) => match[1]);

test("all static interface IDs are unique", () => {
  const ids = matches(/\sid="([^"]+)"/g, html);
  assert.equal(new Set(ids).size, ids.length);
});

test("every static DOM ID referenced by the application exists", () => {
  const htmlIds = new Set(matches(/\sid="([^"]+)"/g, html));
  const referencedIds = new Set(matches(/\$\("#([^"]+)"\)/g, appSource));
  assert.deepEqual([...referencedIds].filter((id) => !htmlIds.has(id)), []);
});

test("local interface assets exist and no external resources are loaded", () => {
  for (const asset of ["styles.css", "workbench-core.mjs", "app.js", "server.mjs"]) {
    assert.equal(existsSync(resolve(appRoot, asset)), true, `${asset} should exist`);
  }
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//i);
});

test("essential controls and accessibility landmarks are present", () => {
  for (const id of ["new-conversation", "composer", "record", "attach", "workspace", "output-type", "preview-dialog"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const label of ["Feedback inbox", "Proposal packets", "Cost and usage", "Settings"]) assert.match(html, new RegExp(label));
  assert.match(html, /<main[^>]+id="main"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /lang="en-GB"/);
});

test("the interface states the governance and data boundaries", () => {
  assert.match(html, /Feedback is not approval/i);
  assert.match(html, /No automatic repository writes/i);
  assert.match(html, /Non-confidential project material only/i);
  assert.match(html, /Not approved/i);
});
