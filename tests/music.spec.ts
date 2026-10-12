import { expect, test } from "@playwright/test";
import { arrive, content, expectSongPlaying, expectSongQuiet, openEnvelope, seal, several, skipLink, song, wedding } from "./support/invitation";

test.skip(!wedding.music, "no song is set in data/wedding.json");

const pause = (page: import("@playwright/test").Page) => page.getByRole("button", { name: content.music.pause });
const play = (page: import("@playwright/test").Page) => page.getByRole("button", { name: content.music.play });

test.describe("the song", () => {
  test("is silent until the seal is tapped, then plays from its opening cue", async ({ page }) => {
    await arrive(page, `/invite/${several.code}`);
    await expectSongQuiet(page);
    await seal(page).click();
    await expectSongPlaying(page);
    const { seconds } = await song(page);
    expect(seconds).toBeGreaterThanOrEqual(wedding.music.startAt);
    expect(seconds).toBeLessThan(wedding.music.startAt + 15);
  });

  test("pauses and resumes with its button", async ({ page }) => {
    await openEnvelope(page, several.code);
    await pause(page).click();
    await expectSongQuiet(page);
    await play(page).click();
    await expectSongPlaying(page);
  });

  test("keeps playing when the guest goes Back to the envelope", async ({ page }) => {
    await openEnvelope(page, several.code);
    await expectSongPlaying(page);
    await page.goBack();
    await expect(seal(page)).toBeVisible();
    await expectSongPlaying(page);
    await expect(pause(page)).toBeVisible();
  });

  test("picks up where it was after a reload, on the guest's next tap", async ({ page }) => {
    await openEnvelope(page, several.code);
    await expect.poll(async () => (await song(page)).seconds).toBeGreaterThan(wedding.music.startAt + 2);
    const before = (await song(page)).seconds;
    await page.reload();
    await expect(page.locator("#story")).toBeVisible();
    // Browsers that allow it resume at once; the rest wait for a tap.
    await page.getByRole("heading", { name: content.story.title, exact: true }).click();
    await expectSongPlaying(page);
    expect((await song(page)).seconds).toBeGreaterThanOrEqual(before - 1);
  });

  test("starts at its skip cue for a returning guest", async ({ page }) => {
    await openEnvelope(page, several.code);
    await arrive(page, `/invite/${several.code}`);
    await skipLink(page).click();
    await expectSongPlaying(page);
    const { seconds } = await song(page);
    expect(seconds).toBeGreaterThanOrEqual(wedding.music.skipStartAt);
    expect(seconds).toBeLessThan(wedding.music.skipStartAt + 15);
  });

  test("stays off on skip for a guest who paused it last time", async ({ page }) => {
    await openEnvelope(page, several.code);
    await pause(page).click();
    await expectSongQuiet(page);
    await arrive(page, `/invite/${several.code}`);
    await skipLink(page).click();
    await expect(page.locator("#day")).toBeInViewport();
    await expect(play(page)).toBeVisible();
    await expectSongQuiet(page);
  });

  test("starts at its landing cue on the generic page, on the first tap", async ({ page }) => {
    await arrive(page, "/");
    await page.getByRole("heading", { level: 1 }).click();
    await expectSongPlaying(page);
    expect((await song(page)).seconds).toBeGreaterThanOrEqual(wedding.music.landingStartAt);
  });
});
