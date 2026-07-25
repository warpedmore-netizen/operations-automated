import { createRequire } from "node:module";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const brandRoot = resolve(scriptDirectory, "..");
const outputDirectory = join(brandRoot, "assets", "logo", "generated");
const socialDirectory = join(brandRoot, "templates", "social");

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

await mkdir(outputDirectory, { recursive: true });
await mkdir(socialDirectory, { recursive: true });

const sourceBanner = join(brandRoot, "references", "initial-banner-wide-4200x700.png");
const sourceCover = join(brandRoot, "references", "initial-linkedin-profile-cover-1584x396.png");

async function extractColourMark() {
  const crop = { left: 920, top: 10, width: 950, height: 515 };
  const { data, info } = await sharp(sourceBanner)
    .extract(crop)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const output = Buffer.alloc(info.width * info.height * 4);

  for (let sourceIndex = 0, outputIndex = 0; sourceIndex < data.length; sourceIndex += 3, outputIndex += 4) {
    const red = data[sourceIndex];
    const green = data[sourceIndex + 1];
    const blue = data[sourceIndex + 2];
    const score = (blue - 35) + 0.45 * (green - 20) - 0.08 * red;
    let alpha = Math.max(0, Math.min(255, Math.round(((score - 22) / 38) * 255)));
    if (alpha < 24) alpha = 0;

    output[outputIndex] = red;
    output[outputIndex + 1] = green;
    output[outputIndex + 2] = blue;
    output[outputIndex + 3] = alpha;
  }

  return sharp(output, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

async function recolourMark(mark, colour) {
  const { data, info } = await sharp(mark)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const red = Number.parseInt(colour.slice(1, 3), 16);
  const green = Number.parseInt(colour.slice(3, 5), 16);
  const blue = Number.parseInt(colour.slice(5, 7), 16);

  for (let index = 0; index < data.length; index += 4) {
    data[index] = red;
    data[index + 1] = green;
    data[index + 2] = blue;
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

const colourMark = await extractColourMark();
const navyMark = await recolourMark(colourMark, "#063F72");
const whiteMark = await recolourMark(colourMark, "#FFFFFF");

const transparentExports = [
  { buffer: colourMark, output: "mark-colour-transparent-1024.png" },
  { buffer: navyMark, output: "mark-navy-transparent-1024.png" },
  { buffer: whiteMark, output: "mark-white-transparent-1024.png" },
];

for (const asset of transparentExports) {
  await sharp(asset.buffer)
    .resize({ width: 1024, withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(join(outputDirectory, asset.output));
  console.log(`Generated ${asset.output}`);
}

const tileMark = await sharp(colourMark)
  .resize({ width: 850, withoutEnlargement: false })
  .png()
  .toBuffer();

const darkTile = await sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 1, g: 7, b: 15, alpha: 1 },
  },
})
  .composite([{ input: tileMark, gravity: "centre" }])
  .png()
  .toBuffer();

for (const width of [32, 192, 512]) {
  const output = `mark-dark-tile-${width}.png`;
  await sharp(darkTile)
    .resize({ width, height: width })
    .png({ compressionLevel: 9 })
    .toFile(join(outputDirectory, output));
  console.log(`Generated ${output}`);
}

await sharp(await readFile(sourceCover))
  .png({ compressionLevel: 9 })
  .toFile(join(socialDirectory, "linkedin-profile-cover-1584x396.png"));
console.log("Generated linkedin-profile-cover-1584x396.png");
