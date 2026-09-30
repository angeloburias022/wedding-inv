/**
 * Removes an invitation from data/guests.json by its code.
 *
 *   npm run remove:guest -- 7XK92M
 *
 * Then run `npm run generate:qrs` and redeploy. The removed link will 404,
 * so only do this for invitations that haven't been sent.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Guest = { code: string; type: string; names: string[]; familyName?: string; displayName?: string };

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "data/guests.json");

const code = process.argv[2]?.trim().toUpperCase();
if (!code) {
  console.error("✗ Give the invitation code.\n\nUsage:\n  npm run remove:guest -- 7XK92M");
  process.exit(1);
}

const guests: Guest[] = JSON.parse(readFileSync(file, "utf8"));
const guest = guests.find((g) => g.code === code);
if (!guest) {
  console.error(`✗ No invitation with code ${code}. Codes are listed in data/guests.json and print/qr-sheet.html.`);
  process.exit(1);
}

const remaining = guests.filter((g) => g.code !== code);

// Keep name arrays on one line, matching add-guest.
const json = JSON.stringify(remaining, null, 2).replace(
  /\[\n\s+("[^\]]*?")\n\s+\]/g,
  (_, inner: string) => `[${inner.split(/,\n\s+/).join(", ")}]`,
);
writeFileSync(file, json + "\n");

console.log(`✓ Removed ${guest.type} invitation ${code} (${guest.names.join(", ")})`);
console.log("\nNext: npm run generate:qrs, then redeploy.");
console.log("Their link will stop working. Any RSVP they already sent stays in the Google Sheet.");
