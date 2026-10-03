/**
 * Generates one QR code per invitation from data/guests.json (handoff §18).
 *
 *   npm run generate:qrs
 *
 * Output goes to print/ (git-ignored, never deployed):
 *   print/cards/<CODE>.png the finished card per guest: the QR set into the floral design
 *   print/png/<CODE>.png   the bare QR, one PNG per guest (1200×1200)
 *   print/svg/<CODE>.svg   the bare QR as a print-quality vector
 *   print/qr-sheet.html    internal reference sheet for matching QRs to cards
 *
 * The QR only ever encodes <origin>/invite/<CODE> — never names or other PII.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import sharp from "sharp";

type Guest = { code: string; type: string; names: string[]; familyName?: string; displayName?: string };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Pick up PUBLIC_INVITATION_ORIGIN from .env.local when present.
try {
  process.loadEnvFile(join(root, ".env.local"));
} catch {
  // No .env.local — use the environment / default.
}
const origin = (process.env.PUBLIC_INVITATION_ORIGIN ?? "https://angeloandgichelle.com").replace(/\/+$/, "");
const outDir = join(root, "print");
const pngDir = join(outDir, "png");
const svgDir = join(outDir, "svg");
const cardDir = join(outDir, "cards");

/**
 * The card design (scripts/qr-card-template.png, 1024×1536). Its artwork has a
 * drawn, unscannable QR; each guest's real one is set over it. Positions are in
 * template pixels; cards are written at `scale` times that for print.
 */
const card = {
  template: join(root, "scripts/qr-card-template.png"),
  /** The couple's monogram artwork (transparent PNG), set at the QR's centre. */
  monogram: join(root, "scripts/qr-card-monogram.png"),
  width: 1024,
  height: 1536,
  scale: 2,
  /** Centre and width of the space between the two brass rules. */
  qr: { x: 512, y: 840, size: 584 },
  /** How much of the QR's width the monogram's clearing takes; level H tolerates it. */
  monogramClearing: 0.32,
  paper: "#f8f3ea",
  ink: "#242220",
};

const qrOptions = {
  errorCorrectionLevel: "H" as const,
  margin: 4, // quiet zone, in modules
  color: { dark: "#000000", light: "#ffffff" },
};

function label(guest: Guest): string {
  if (guest.displayName) return guest.displayName;
  if (guest.type === "family") return `The ${guest.familyName} Family`;
  return guest.names.join(" & ");
}

/**
 * The layer set over the template: a soft patch of paper hiding the drawn QR,
 * and the guest's QR on whole-pixel modules, with a clearing at its centre for
 * the monogram (modules there are left out; error correction covers them).
 */
function cardOverlay(url: string): string {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: qrOptions.errorCorrectionLevel });
  const count = modules.size;
  const cell = Math.floor(card.qr.size / count);
  const size = cell * count;
  const left = Math.round(card.qr.x - size / 2);
  const top = Math.round(card.qr.y - size / 2);
  const clearing = (size * card.monogramClearing) / 2;

  let path = "";
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!modules.data[row * count + col]) continue;
      const x = left + col * cell;
      const y = top + row * cell;
      if (Math.hypot(x + cell / 2 - card.qr.x, y + cell / 2 - card.qr.y) < clearing + cell / 2) continue;
      path += `M${x} ${y}h${cell}v${cell}h-${cell}z`;
    }
  }

  const patch = card.qr.size + 36;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${card.width * card.scale}" height="${card.height * card.scale}" viewBox="0 0 ${card.width} ${card.height}">
  <defs><filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter></defs>
  <rect x="${card.qr.x - patch / 2}" y="${card.qr.y - patch / 2}" width="${patch}" height="${patch}" fill="${card.paper}" filter="url(#soft)"/>
  <path d="${path}" fill="${card.ink}" shape-rendering="crispEdges"/>
</svg>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function main() {
  const guests: Guest[] = JSON.parse(readFileSync(join(root, "data/guests.json"), "utf8"));

  const errors: string[] = [];
  const seen = new Set<string>();
  for (const guest of guests) {
    if (!/^[A-Z0-9]{6}$/.test(guest.code ?? "")) errors.push(`Invalid code: ${JSON.stringify(guest.code)}`);
    else if (seen.has(guest.code)) errors.push(`Duplicate code: ${guest.code}`);
    seen.add(guest.code);
  }
  if (errors.length) {
    console.error(`✗ guests.json has problems:\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }

  // Start clean so a removed guest's old QR can never end up printed.
  for (const dir of [pngDir, svgDir, cardDir, join(outDir, "qrs") /* old combined folder */]) {
    rmSync(dir, { recursive: true, force: true });
  }
  mkdirSync(pngDir, { recursive: true });
  mkdirSync(svgDir, { recursive: true });
  mkdirSync(cardDir, { recursive: true });

  const cardBase = await sharp(card.template)
    .resize(card.width * card.scale, card.height * card.scale)
    .toBuffer();
  // Trimmed to its artwork and sized to sit inside the clearing.
  const monogramSize = Math.round(card.qr.size * card.monogramClearing * 0.86 * card.scale);
  const monogram = await sharp(card.monogram)
    .trim()
    .resize(monogramSize, monogramSize, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });
  const monogramAt = {
    left: Math.round(card.qr.x * card.scale - monogram.info.width / 2),
    top: Math.round(card.qr.y * card.scale - monogram.info.height / 2),
  };

  const rows: string[] = [];
  for (const guest of guests) {
    const url = `${origin}/invite/${guest.code}`;
    const svg = await QRCode.toString(url, { ...qrOptions, type: "svg" });
    writeFileSync(join(svgDir, `${guest.code}.svg`), svg);
    await QRCode.toFile(join(pngDir, `${guest.code}.png`), url, { ...qrOptions, width: 1200 });
    await sharp(cardBase)
      .composite([{ input: Buffer.from(cardOverlay(url)) }, { input: monogram.data, ...monogramAt }])
      .png()
      .toFile(join(cardDir, `${guest.code}.png`));

    rows.push(`<tr>
      <td>${escapeHtml(label(guest))}</td>
      <td><code>${guest.code}</code></td>
      <td class="url">${escapeHtml(url)}</td>
      <td class="qr">${svg}</td>
    </tr>`);
    console.log(`✓ ${guest.code}  ${url}`);
  }

  writeFileSync(
    join(outDir, "qr-sheet.html"),
    `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>QR reference sheet — INTERNAL</title>
<style>
  body { font: 14px/1.4 system-ui, sans-serif; margin: 2rem; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border-bottom: 1px solid #ddd; padding: .75rem; text-align: left; vertical-align: middle; }
  td.qr svg { width: 1.2in; height: 1.2in; display: block; }
  td.url { color: #666; font-size: 12px; }
  tr { break-inside: avoid; }
</style></head><body>
<h1>QR reference sheet</h1>
<p>Internal production sheet — contains guest names. Origin: <code>${escapeHtml(origin)}</code>. Generated ${new Date().toISOString()}.</p>
<table><thead><tr><th>Guest</th><th>Code</th><th>Target</th><th>QR</th></tr></thead>
<tbody>${rows.join("\n")}</tbody></table>
</body></html>`,
  );

  console.log(`\n${guests.length} cards written to print/cards/; bare QRs to print/png/ and print/svg/; sheet at print/qr-sheet.html`);
  console.log("Reminder: scan every QR from the final printed proof before production.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
