import { createRequire } from "node:module";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const brandRoot = resolve(scriptDirectory, "..");
const outputDirectory = join(brandRoot, "assets", "logo", "generated");
const socialDirectory = join(brandRoot, "templates", "social");
const previewsDirectory = join(brandRoot, "previews");

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
await mkdir(previewsDirectory, { recursive: true });

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

const reviewBoardSvg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
    <defs>
      <radialGradient id="signal" cx="88%" cy="8%" r="62%">
        <stop offset="0" stop-color="#0E5B92" stop-opacity=".72"/>
        <stop offset=".55" stop-color="#03111E" stop-opacity=".2"/>
        <stop offset="1" stop-color="#01070F" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="action" x1="0" x2="1">
        <stop stop-color="#0B77D2"/>
        <stop offset="1" stop-color="#32B6FE"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="1000" fill="#EAF0F5"/>
    <rect width="1600" height="455" fill="#01070F"/>
    <rect width="1600" height="455" fill="url(#signal)"/>
    <g fill="none" stroke="#32B6FE" stroke-opacity=".10">
      <circle cx="1510" cy="80" r="120"/><circle cx="1510" cy="80" r="165"/><circle cx="1510" cy="80" r="210"/>
      <path d="M1070 440 C1190 330 1300 470 1410 315 S1560 220 1660 300"/>
      <path d="M1010 410 C1160 270 1270 420 1390 270 S1540 185 1650 245"/>
    </g>
    <g font-family="sans-serif" fill="#FFFFFF">
      <text x="555" y="122" font-size="42" font-weight="650" letter-spacing="18">OPERATIONS</text>
      <text x="550" y="220" font-size="82" font-weight="800" letter-spacing="2">AUTOMATED</text>
      <rect x="552" y="252" width="720" height="3" fill="url(#action)"/>
      <text x="554" y="309" font-size="28" font-weight="500">Connected operations. Human outcomes.</text>
      <text x="554" y="350" fill="#BED0DF" font-size="20">See the whole operation. Improve what matters.</text>
      <text x="554" y="380" fill="#BED0DF" font-size="20">Automate only when it earns its place.</text>
    </g>
    <g font-family="sans-serif">
      <rect x="80" y="48" width="214" height="34" rx="17" fill="#102F4D" stroke="#34516B"/>
      <circle cx="103" cy="65" r="5" fill="#32B6FE"/>
      <text x="119" y="71" fill="#FFFFFF" font-size="14" font-weight="700" letter-spacing="1">DRAFT · REVIEW</text>
      <text x="80" y="505" fill="#52677C" font-size="15" font-weight="800" letter-spacing="2">SHARED PALETTE</text>
      <g transform="translate(80 530)">
        <rect width="175" height="64" rx="8" fill="#01070F"/><text x="14" y="88" fill="#102A43" font-size="15" font-weight="700">Obsidian</text><text x="14" y="108" fill="#52677C" font-size="13">#01070F</text>
        <rect x="195" width="175" height="64" rx="8" fill="#063F72"/><text x="209" y="88" fill="#102A43" font-size="15" font-weight="700">Deep blue</text><text x="209" y="108" fill="#52677C" font-size="13">#063F72</text>
        <rect x="390" width="175" height="64" rx="8" fill="#0B77D2"/><text x="404" y="88" fill="#102A43" font-size="15" font-weight="700">Action blue</text><text x="404" y="108" fill="#52677C" font-size="13">#0B77D2</text>
        <rect x="585" width="175" height="64" rx="8" fill="#32B6FE"/><text x="599" y="88" fill="#102A43" font-size="15" font-weight="700">Electric cyan</text><text x="599" y="108" fill="#52677C" font-size="13">#32B6FE</text>
        <rect x="780" width="175" height="64" rx="8" fill="#F5F7FA" stroke="#CDD9E3"/><text x="794" y="88" fill="#102A43" font-size="15" font-weight="700">Paper</text><text x="794" y="108" fill="#52677C" font-size="13">#F5F7FA</text>
      </g>
      <text x="80" y="690" fill="#52677C" font-size="15" font-weight="800" letter-spacing="2">APPLICATION PILOT</text>
      <rect x="80" y="712" width="700" height="230" rx="14" fill="#FFFFFF" stroke="#CDD9E3"/>
      <rect x="80" y="712" width="125" height="230" rx="14" fill="#01070F"/>
      <rect x="194" y="712" width="11" height="230" fill="#01070F"/>
      <rect x="105" y="804" width="70" height="8" rx="4" fill="#34516B"/>
      <rect x="105" y="830" width="70" height="8" rx="4" fill="#34516B"/>
      <rect x="105" y="856" width="48" height="8" rx="4" fill="#34516B"/>
      <text x="245" y="760" fill="#0B77D2" font-size="13" font-weight="800" letter-spacing="2">DECISION WORKSPACE</text>
      <text x="245" y="810" fill="#102A43" font-size="31" font-weight="800">See the whole operation.</text>
      <rect x="245" y="845" width="145" height="61" rx="8" fill="#F5F7FA" stroke="#CDD9E3"/>
      <rect x="410" y="845" width="145" height="61" rx="8" fill="#F5F7FA" stroke="#CDD9E3"/>
      <rect x="575" y="845" width="145" height="61" rx="8" fill="#E6F4FD" stroke="#9ED7F4"/>
      <text x="260" y="878" fill="#063F72" font-size="14" font-weight="700">Evidence</text>
      <text x="425" y="878" fill="#063F72" font-size="14" font-weight="700">Human decision</text>
      <text x="590" y="878" fill="#063F72" font-size="14" font-weight="700">Next action</text>
      <text x="850" y="690" fill="#52677C" font-size="15" font-weight="800" letter-spacing="2">CONTROLLED DOCUMENT</text>
      <rect x="850" y="712" width="670" height="230" rx="14" fill="#FFFFFF" stroke="#CDD9E3"/>
      <rect x="900" y="758" width="570" height="2" fill="#063F72"/>
      <text x="900" y="804" fill="#102A43" font-size="29" font-weight="800">Operational decision brief</text>
      <text x="900" y="844" fill="#52677C" font-size="16">Conclusion first. Evidence and judgement remain separate.</text>
      <rect x="900" y="875" width="475" height="7" rx="3" fill="#CDD9E3"/>
      <rect x="900" y="897" width="400" height="7" rx="3" fill="#CDD9E3"/>
      <rect x="1430" y="742" width="42" height="22" rx="11" fill="#FFF1D6"/>
      <text x="1437" y="757" fill="#A45A00" font-size="10" font-weight="800">DRAFT</text>
    </g>
  </svg>
`);

const boardMark = await sharp(colourMark).resize({ width: 390 }).png().toBuffer();
const boardAppMark = await sharp(colourMark).resize({ width: 82 }).png().toBuffer();
const boardDocumentMark = await sharp(navyMark).resize({ width: 74 }).png().toBuffer();

await sharp(reviewBoardSvg)
  .composite([
    { input: boardMark, left: 105, top: 105 },
    { input: boardAppMark, left: 102, top: 735 },
    { input: boardDocumentMark, left: 900, top: 720 }
  ])
  .png({ compressionLevel: 9 })
  .toFile(join(previewsDirectory, "brand-review-board-1600x1000.png"));
console.log("Generated brand-review-board-1600x1000.png");
