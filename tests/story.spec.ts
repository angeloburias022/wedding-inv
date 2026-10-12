import { expect, test, type Page } from "@playwright/test";
import { content, expectSongPlaying, expectSongQuiet, openEnvelope, several } from "./support/invitation";

const clip = (page: Page) => page.locator("#story video");
const clipState = (page: Page) =>
  clip(page).evaluate((video: HTMLVideoElement) => ({ playing: !video.paused, muted: video.muted }));

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

  test("plays with its own sound from the speaker button, and the song steps aside", async ({ page }) => {
    await openEnvelope(page, several.code);
    await clip(page).scrollIntoViewIfNeeded();
    await expectSongPlaying(page);

    await page.getByRole("button", { name: content.story.soundOn }).click();
    await expect.poll(() => clipState(page)).toEqual({ playing: true, muted: false });
    await expectSongQuiet(page);

    await page.getByRole("button", { name: content.story.soundOff }).click();
    await expect.poll(async () => (await clipState(page)).muted).toBe(true);
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
