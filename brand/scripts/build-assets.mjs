import { createRequire } from "node:module";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const brandRoot = resolve(scriptDirectory, "..");
const outputDirectory = join(brandRoot, "assets", "logo", "generated");

const localRequire = createRequire(import.meta.url);
const runtimeModules = process.env.CODEX_NODE_MODULES;
const runtimeRequire = runtimeModules
  ? createRequire(join(runtimeModules, "package.json"))
  : localRequire;

let sharp;
try {
  sharp = runtimeRequire("sharp");
} catch {
  throw new Error("The sharp image package is required. Set CODEX_NODE_MODULES to a runtime node_modules directory.");
}

const exports = [
  { source: "assets/logo/mark-colour.svg", output: "mark-colour-32.png", width: 32 },
  { source: "assets/logo/mark-colour.svg", output: "mark-colour-192.png", width: 192 },
  { source: "assets/logo/mark-colour.svg", output: "mark-colour-512.png", width: 512 },
  { source: "assets/logo/mark-navy.svg", output: "mark-navy-512.png", width: 512 },
  { source: "assets/logo/mark-white.svg", output: "mark-white-512.png", width: 512 },
  { source: "assets/logo/lockup-colour.svg", output: "lockup-colour-1200.png", width: 1200 },
  { source: "assets/logo/lockup-white.svg", output: "lockup-white-1200.png", width: 1200 },
];

await mkdir(outputDirectory, { recursive: true });

for (const asset of exports) {
  const source = await readFile(join(brandRoot, asset.source));
  const target = join(outputDirectory, asset.output);
  await sharp(source, { density: 300 })
    .resize({ width: asset.width, withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(target);
  console.log(`Generated ${asset.output}`);
}
