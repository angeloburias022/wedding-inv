/**
 * Adds an invitation to data/guests.json with a new random code.
 *
 *   npm run add:guest -- Maria                          individual
 *   npm run add:guest -- Rhea Erwin                     couple (2 names)
 *   npm run add:guest -- --family Santos Jose Carmen    family
 *   npm run add:guest -- --group Rhea Kim Joy           group ("Rhea & Friends")
 *   npm run add:guest -- --group --name "The Cousins" Ana Ben
 *
 * Then run `npm run generate:qrs` and redeploy so the new page exists.
 */
import { randomInt } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

type Guest = { code: string; type: string; names: string[]; familyName?: string; displayName?: string };

// No 0/O, 1/I/L — codes stay unambiguous if someone types one by hand.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "data/guests.json");

// Pick up PUBLIC_INVITATION_ORIGIN from .env.local when present.
try {
  process.loadEnvFile(join(root, ".env.local"));
} catch {
  // No .env.local — use the environment / default.
}

function fail(message: string): never {
  console.error(`✗ ${message}\n\nUsage:\n  npm run add:guest -- Maria\n  npm run add:guest -- Rhea Erwin\n  npm run add:guest -- --family Santos Jose Carmen\n  npm run add:guest -- --group Rhea Kim Joy`);
  process.exit(1);
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    family: { type: "string" },
    group: { type: "boolean" },
    name: { type: "string" },
  },
});

const names = positionals.map((name) => name.trim()).filter(Boolean);
if (names.length === 0) fail("Give at least one name.");
if (values.family && values.group) fail("Choose either --family or --group, not both.");
if (new Set(names).size !== names.length) fail("Each name must be different (they become the RSVP checkboxes).");

const guests: Guest[] = JSON.parse(readFileSync(file, "utf8"));
const taken = new Set(guests.map((guest) => guest.code));

let code: string;
do {
  code = Array.from({ length: CODE_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
} while (taken.has(code));

const type = values.family ? "family" : values.group ? "group" : names.length === 1 ? "individual" : "couple";
if (type === "couple" && names.length > 2) {
  fail("More than two names: use --family <Surname> or --group.");
}

const guest: Guest = { code, type, names };
if (values.family) guest.familyName = values.family;
if (values.name) guest.displayName = values.name;

guests.push(guest);

// Keep name arrays on one line, matching the hand-written file.
const json = JSON.stringify(guests, null, 2).replace(
  /\[\n\s+("[^\]]*?")\n\s+\]/g,
  (_, inner: string) => `[${inner.split(/,\n\s+/).join(", ")}]`,
);
writeFileSync(file, json + "\n");

const origin = (process.env.PUBLIC_INVITATION_ORIGIN ?? "https://angeloandgichelle.com").replace(/\/+$/, "");
console.log(`✓ Added ${type} invitation for ${names.join(", ")}`);
console.log(`  Code: ${code}`);
console.log(`  Link: ${origin}/invite/${code}`);
console.log("\nNext: npm run generate:qrs, then redeploy so the page goes live.");
