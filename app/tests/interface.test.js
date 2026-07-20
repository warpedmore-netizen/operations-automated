const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const engine = require("../engine.js");

const appRoot = resolve(__dirname, "..");
const html = readFileSync(resolve(appRoot, "index.html"), "utf8");
const appSource = readFileSync(resolve(appRoot, "app.js"), "utf8");

function matches(pattern, source) {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

function getPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

test("all interface IDs are unique", () => {
  const ids = matches(/\sid="([^"]+)"/g, html);
  assert.equal(new Set(ids).size, ids.length);
});

test("every DOM ID referenced by the application exists", () => {
  const htmlIds = new Set(matches(/\sid="([^"]+)"/g, html));
  const dynamicIds = new Set(matches(/\sid="([^"]+)"/g, appSource));
  const referencedIds = new Set(matches(/byId\("([^"]+)"\)/g, appSource));
  const missing = [...referencedIds].filter((id) => !htmlIds.has(id) && !dynamicIds.has(id));
  assert.deepEqual(missing, []);
});

test("every form binding maps to the workspace schema", () => {
  const workspace = engine.createWorkspace();
  const bindings = matches(/data-bind="([^"]+)"/g, html);
  const invalid = bindings.filter((binding) => typeof getPath(workspace, binding) !== "string");
  assert.deepEqual(invalid, []);
});

test("local interface assets exist and no external resources are loaded", () => {
  for (const asset of ["styles.css", "engine.js", "storage.js", "app.js"]) {
    assert.equal(existsSync(resolve(appRoot, asset)), true, `${asset} should exist`);
  }
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//i);
});

test("essential actions and accessibility landmarks are present", () => {
  for (const action of ["copy-brief", "export-json", "export-markdown", "record-stage", "advance-stage", "new-workspace"]) {
    assert.match(html, new RegExp(`data-action="${action}"`));
  }
  assert.match(html, /<main[^>]+id="workspace"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /lang="en-GB"/);
});
