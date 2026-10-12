import { expect, test, type Page } from "@playwright/test";
import { expectSongPlaying, expectSongQuiet, openEnvelope, several } from "./support/invitation";

const clip = (page: Page) => page.locator("#story video");
const clipState = (page: Page) =>
  clip(page).evaluate((video: HTMLVideoElement) => ({ playing: !video.paused, muted: video.muted }));
const clipSeconds = (page: Page) => clip(page).evaluate((video: HTMLVideoElement) => video.currentTime);
/** What the mute control in the browser's own player does when the guest turns the sound on. */
const unmute = (page: Page) => clip(page).evaluate((video: HTMLVideoElement) => (video.muted = false));

test.describe("the proposal clip", () => {
  test("plays silently by itself once it is on screen, with the song still on", async ({ page }) => {
    await openEnvelope(page, several.code);
    await clip(page).scrollIntoViewIfNeeded();
    await expect.poll(() => clipState(page)).toEqual({ playing: true, muted: true });
    await expectSongPlaying(page);
  });

  test("rests when scrolled away", async ({ page }) => {
    await openEnvelope(page, several.code);
    await clip(page).scrollIntoViewIfNeeded();
    await expect.poll(async () => (await clipState(page)).playing).toBe(true);
    await page.locator("#rsvp").scrollIntoViewIfNeeded();
    await expect.poll(async () => (await clipState(page)).playing).toBe(false);
  });

  test("gives the guest the player's own controls, without a download option", async ({ page }) => {
    await openEnvelope(page, several.code);
    await expect(clip(page)).toHaveJSProperty("controls", true);
    await expect(clip(page)).toHaveAttribute("controlslist", "nodownload");
  });

  test("lets the guest skip ahead and keeps playing from there", async ({ page }) => {
    await openEnvelope(page, several.code);
    await clip(page).scrollIntoViewIfNeeded();
    await expect.poll(async () => (await clipState(page)).playing).toBe(true);

    // What dragging the player's scrubber does.
    await clip(page).evaluate((video: HTMLVideoElement) => (video.currentTime = 30));
    await expect.poll(() => clipSeconds(page)).toBeGreaterThanOrEqual(30);
    await expect.poll(async () => (await clipState(page)).playing).toBe(true);
  });

  test("turns its sound on from where it is, and the song steps aside", async ({ page }) => {
    await openEnvelope(page, several.code);
    await clip(page).scrollIntoViewIfNeeded();
    await expect.poll(() => clipState(page)).toEqual({ playing: true, muted: true });
    await expectSongPlaying(page);
    await expect.poll(() => clipSeconds(page)).toBeGreaterThan(2);
    const before = await clipSeconds(page);

    await unmute(page);
    await expectSongQuiet(page);
    // It carries on; it does not go back to the start.
    expect(await clipSeconds(page)).toBeGreaterThanOrEqual(before);
    expect((await clipState(page)).playing).toBe(true);

    await clip(page).evaluate((video: HTMLVideoElement) => (video.muted = true));
    await expectSongPlaying(page);
  });

  test("goes quiet again when scrolled away with the sound on", async ({ page }) => {
    await openEnvelope(page, several.code);
    await clip(page).scrollIntoViewIfNeeded();
    await expect.poll(async () => (await clipState(page)).playing).toBe(true);
    await unmute(page);
    await expectSongQuiet(page);

    await page.locator("#rsvp").scrollIntoViewIfNeeded();
    await expect.poll(() => clipState(page)).toEqual({ playing: false, muted: true });
    await expectSongPlaying(page);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("stays a still", async ({ page }) => {
      await openEnvelope(page, several.code);
      await clip(page).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1_500);
      expect((await clipState(page)).playing).toBe(false);
    });
  });
});
