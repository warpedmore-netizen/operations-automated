import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const brandRoot = resolve(scriptDirectory, "..");
const repositoryRoot = resolve(brandRoot, "..");
const failures = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return readFileSync(join(brandRoot, relativePath), "utf8");
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function relativeLuminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

function pngDimensions(relativePath) {
  const data = readFileSync(join(brandRoot, relativePath));
  check(
    data.length >= 24 && data.subarray(1, 4).toString("ascii") === "PNG",
    `Invalid PNG file: ${relativePath}`,
  );
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  };
}

const expectedFiles = [
  "README.md",
  "foundations.md",
  "identity.md",
  "voice-and-content.md",
  "implementation.md",
  "manifest.json",
  "adoption.json",
  "review-items.json",
  "index.html",
  "site.css",
  "assets/logo/README.md",
  "assets/logo/generated/README.md",
  "assets/logo/generated/mark-colour-transparent-1024.png",
  "assets/logo/generated/mark-navy-transparent-1024.png",
  "assets/logo/generated/mark-white-transparent-1024.png",
  "assets/logo/generated/mark-dark-tile-32.png",
  "assets/logo/generated/mark-dark-tile-192.png",
  "assets/logo/generated/mark-dark-tile-512.png",
  "references/README.md",
  "references/initial-mark-square-400x400.png",
  "references/initial-banner-wide-4200x700.png",
  "references/initial-linkedin-profile-cover-1584x396.png",
  "previews/README.md",
  "previews/brand-review-board-1600x1000.png",
  "tokens/brand.tokens.json",
  "tokens/brand.css",
  "tokens/brand.ts",
  "templates/website/index.html",
  "templates/website/website.css",
  "templates/application/index.html",
  "templates/application/application.css",
  "templates/documentation/document-template.md",
  "templates/documentation/document.css",
  "templates/social/README.md",
  "templates/social/linkedin-profile-cover-1584x396.png",
];

for (const path of expectedFiles) {
  check(existsSync(join(brandRoot, path)), `Missing expected brand file: ${path}`);
}

const expectedPngDimensions = {
  "references/initial-mark-square-400x400.png": [400, 400],
  "references/initial-banner-wide-4200x700.png": [4200, 700],
  "references/initial-linkedin-profile-cover-1584x396.png": [1584, 396],
  "assets/logo/generated/mark-colour-transparent-1024.png": [1024, null],
  "assets/logo/generated/mark-navy-transparent-1024.png": [1024, null],
  "assets/logo/generated/mark-white-transparent-1024.png": [1024, null],
  "assets/logo/generated/mark-dark-tile-32.png": [32, 32],
  "assets/logo/generated/mark-dark-tile-192.png": [192, 192],
  "assets/logo/generated/mark-dark-tile-512.png": [512, 512],
  "templates/social/linkedin-profile-cover-1584x396.png": [1584, 396],
  "previews/brand-review-board-1600x1000.png": [1600, 1000],
};

for (const [path, [expectedWidth, expectedHeight]] of Object.entries(expectedPngDimensions)) {
  const { width, height } = pngDimensions(path);
  check(width === expectedWidth, `${path} is ${width} px wide; expected ${expectedWidth} px.`);
  if (expectedHeight !== null) {
    check(height === expectedHeight, `${path} is ${height} px high; expected ${expectedHeight} px.`);
  }
}

const manifest = JSON.parse(read("manifest.json"));
const adoption = JSON.parse(read("adoption.json"));
const review = JSON.parse(read("review-items.json"));
const tokens = JSON.parse(read("tokens/brand.tokens.json"));
const css = read("tokens/brand.css").toLowerCase();

check(manifest.status === "draft", "Brand manifest must remain draft until Jamie approves it.");
check(tokens.meta.status === manifest.status, "Manifest and token status do not match.");
check(tokens.meta.version === manifest.version, "Manifest and token versions do not match.");
check(adoption.meta.status === manifest.status, "Manifest and adoption-register status do not match.");
check(review.meta.status === manifest.status, "Manifest and visual-review status do not match.");

const allowedAdoptionStatuses = new Set(adoption.statuses);
const surfaceIds = adoption.surfaces.map((surface) => surface.id);
check(new Set(surfaceIds).size === surfaceIds.length, "Brand adoption surface IDs must be unique.");
for (const surface of adoption.surfaces) {
  check(allowedAdoptionStatuses.has(surface.status), `Invalid adoption status for ${surface.id}: ${surface.status}`);
  check(existsSync(join(repositoryRoot, surface.path)), `Adoption surface path does not exist: ${surface.path}`);
  if (surface.reviewRoute.startsWith("/brand-system/")) {
    const reviewPath = surface.reviewRoute.replace("/brand-system/", "").split("#")[0];
    check(existsSync(join(brandRoot, reviewPath)), `Adoption review route does not exist: ${surface.reviewRoute}`);
  } else if (surface.reviewRoute === "/#brand") {
    check(existsSync(join(repositoryRoot, "app", "index.html")), "Workbench brand-review route has no application entry point.");
  }
}
for (const path of Object.values(adoption.sourceOfTruth)) {
  check(existsSync(join(repositoryRoot, path)), `Adoption source-of-truth path does not exist: ${path}`);
}

const reviewIds = review.items.map((item) => item.id);
check(new Set(reviewIds).size === reviewIds.length, "Brand review item IDs must be unique.");
check(new Set(review.actions).size === review.actions.length, "Brand review actions must be unique.");
for (const item of review.items) {
  check(item.status === manifest.status, `Brand review item must remain ${manifest.status}: ${item.id}`);
  check(Boolean(item.question && item.description && item.preview), `Brand review item is incomplete: ${item.id}`);
}

for (const paths of Object.values(manifest.assets)) {
  for (const path of paths) {
    check(existsSync(join(brandRoot, path)), `Manifest references a missing brand file: ${path}`);
  }
}

for (const [name, value] of Object.entries(tokens.colour)) {
  check(/^#[0-9a-f]{6}$/i.test(value), `Invalid hexadecimal colour token: ${name} = ${value}`);
  const cssName = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  check(css.includes(`--oa-${cssName}: ${value.toLowerCase()}`), `CSS token is missing or differs: ${name}`);
}

const contrastPairs = [
  ["Ink on Paper", tokens.colour.ink, tokens.colour.paper, 4.5],
  ["Muted text on Paper", tokens.colour.muted, tokens.colour.paper, 4.5],
  ["White on Obsidian", tokens.colour.white, tokens.colour.obsidian, 4.5],
  ["White on Midnight", tokens.colour.white, tokens.colour.midnight, 4.5],
  ["White on Action blue", tokens.colour.white, tokens.colour.blue, 4.5],
  ["Obsidian on Electric cyan", tokens.colour.obsidian, tokens.colour.electric, 4.5],
  ["Decision amber on soft amber", tokens.colour.amber, tokens.colour.amberSoft, 4.5],
  ["Success on success soft", tokens.colour.success, tokens.colour.successSoft, 4.5],
  ["Warning on warning soft", tokens.colour.warning, tokens.colour.warningSoft, 4.5],
  ["Danger on danger soft", tokens.colour.danger, tokens.colour.dangerSoft, 4.5],
];

for (const [name, foreground, background, minimum] of contrastPairs) {
  const ratio = contrast(foreground, background);
  check(ratio >= minimum, `${name} contrast is ${ratio.toFixed(2)}:1; expected at least ${minimum}:1.`);
}

const svgFiles = walk(join(brandRoot, "assets", "logo")).filter((path) => extname(path) === ".svg");
for (const path of svgFiles) {
  const svg = readFileSync(path, "utf8");
  check(/<svg\b/.test(svg), `Invalid SVG root: ${relative(brandRoot, path)}`);
  check(/viewBox="[^"]+"/.test(svg), `SVG has no viewBox: ${relative(brandRoot, path)}`);
  check(/<title\b/.test(svg), `SVG has no accessible title: ${relative(brandRoot, path)}`);
}

const htmlFiles = walk(brandRoot).filter((path) => extname(path) === ".html");
for (const path of htmlFiles) {
  const html = readFileSync(path, "utf8");
  check(/lang="en-GB"/.test(html), `HTML language is missing or incorrect: ${relative(brandRoot, path)}`);
  check(/<meta name="viewport"/.test(html), `Viewport metadata is missing: ${relative(brandRoot, path)}`);
  check(/Skip to/.test(html), `Skip link is missing: ${relative(brandRoot, path)}`);

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (
      target.startsWith("#")
      || target.startsWith("http://")
      || target.startsWith("https://")
      || target.startsWith("mailto:")
    ) continue;
    const targetPath = resolve(dirname(path), target.split("#")[0]);
    check(existsSync(targetPath), `Broken local reference in ${relative(brandRoot, path)}: ${target}`);
  }
}

const markdownFiles = [
  ...walk(brandRoot).filter((path) => extname(path) === ".md"),
  join(repositoryRoot, "proposals", "brand-system-assurance-pack-v0.1.md"),
];

for (const path of markdownFiles) {
  const markdown = readFileSync(path, "utf8");
  for (const match of markdown.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].trim();
    if (
      target.startsWith("#")
      || target.startsWith("http://")
      || target.startsWith("https://")
      || target.startsWith("mailto:")
    ) continue;
    const targetPath = resolve(dirname(path), target.split("#")[0]);
    check(existsSync(targetPath), `Broken Markdown reference in ${relative(repositoryRoot, path)}: ${target}`);
  }
}

const templates = [
  read("templates/website/index.html"),
  read("templates/application/index.html"),
];

for (const template of templates) {
  check(template.includes("../../tokens/brand.css"), "A browser template does not use the shared CSS tokens.");
  check(!/(?:src|href)="https?:\/\//.test(template), "A browser template has an unapproved external runtime dependency.");
}

const brandCss = read("tokens/brand.css");
const websiteCss = read("templates/website/website.css");
check(
  brandCss.includes(".oa-base .oa-button"),
  "Shared buttons must retain their intended text colour inside the OA base scope.",
);
check(
  /\.hero\s+\.oa-button\s*\{[^}]*color:\s*var\(--oa-white\)/s.test(websiteCss),
  "The website hero action must declare readable light text.",
);
check(
  /linear-gradient\(112deg,\s*#061d30[^;]+#0b5875/s.test(websiteCss),
  "The website hero must retain the reviewed lighter deep-blue treatment.",
);

const proposalPath = join(repositoryRoot, "proposals", "brand-system-assurance-pack-v0.1.md");
check(existsSync(proposalPath), "The brand decision pack is missing.");

if (failures.length > 0) {
  console.error(`Brand validation failed: ${failures.length} of ${checks} checks failed.`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Brand validation passed: ${checks} checks.`);
for (const [name, foreground, background] of contrastPairs) {
  console.log(`- ${name}: ${contrast(foreground, background).toFixed(2)}:1`);
}
