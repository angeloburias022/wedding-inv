import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";

type Guest = { code: string; type: "individual" | "couple" | "family" | "group"; names: string[]; familyName?: string; displayName?: string };

// Read from the same files the site is built from, so the tests follow the real
// wording and guest list instead of repeating them.
const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
export const guests: Guest[] = read("data/guests.json");
export const content = read("data/content.json");
export const wedding = read("data/wedding.json");
export const story: { title: string; location: string; images: string[] }[] = read("data/story.json");

export function guestOfType(type: Guest["type"]): Guest {
  const guest = guests.find((candidate) => candidate.type === type);
  if (!guest) throw new Error(`data/guests.json has no "${type}" guest to test with`);
  return guest;
}

/** A guest with one name, and one with several: the two shapes the RSVP form takes. */
export const single = guests.find((guest) => guest.names.length === 1) ?? guests[0];
export const several = guests.find((guest) => guest.names.length > 1) ?? guests[0];

/** The name written on the envelope (mirrors guestDisplayName in lib/guests.ts). */
export function nameOnEnvelope(guest: Guest): string {
  if (guest.displayName) return guest.displayName;
  if (guest.type === "family") return `The ${guest.familyName} Family`;
  if (guest.type === "group") return `${guest.names[0]} & Friends`;
  if (guest.names.length <= 1) return guest.names[0];
  return `${guest.names.slice(0, -1).join(", ")} & ${guest.names.at(-1)}`;
}

export const seal = (page: Page) => page.getByRole("button", { name: content.opening.cta });
export const skipLink = (page: Page) => page.getByRole("button", { name: content.opening.skip });

/** A fresh arrival, as from a QR scan: a new history entry, so the envelope is sealed again. */
export async function arrive(page: Page, path: string) {
  await page.goto("about:blank");
  await page.goto(path);
}

/** Arrives and taps the seal, then waits for the invitation to be showing. */
export async function openEnvelope(page: Page, code: string) {
  await arrive(page, `/invite/${code}`);
  await seal(page).click();
  await expect(page.locator("#story")).toBeVisible({ timeout: 15_000 });
}

/** The song's state, read from the page's audio element. */
export function song(page: Page) {
  return page.evaluate(() => {
    const audio = document.querySelector("audio");
    if (!audio) throw new Error("no audio element on the page");
    return { playing: !audio.paused, seconds: audio.currentTime };
  });
}

export async function expectSongPlaying(page: Page) {
  await expect.poll(async () => (await song(page)).playing, { message: "the song should be playing" }).toBe(true);
}

export async function expectSongQuiet(page: Page) {
  await expect.poll(async () => (await song(page)).playing, { message: "the song should not be playing" }).toBe(false);
}

/** Every RSVP the stand-in sheet has received (tests/support/sheet-stub.mjs). */
export async function sheetRows(): Promise<Record<string, unknown>[]> {
  return (await fetch("http://127.0.0.1:3199/requests")).json();
}
