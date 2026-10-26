import { expect, test, type Page } from "@playwright/test";
import { expectSongPlaying, expectSongQuiet, openEnvelope, several, story } from "./support/invitation";

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

test.describe("the story photos", () => {
  const withPhotos = story.filter((entry) => entry.images.length > 1);

  for (const entry of withPhotos) {
    test(`"${entry.title}" shows its photos in a carousel the guest can swipe`, async ({ page }) => {
      await openEnvelope(page, several.code);
      const carousel = page.getByRole("group", { name: `${entry.title}, ${entry.location}`, exact: true });
      await carousel.scrollIntoViewIfNeeded();

      const slides = carousel.getByRole("group", { name: / of / });
      await expect(slides).toHaveCount(entry.images.length);
      const first = slides.first().locator("img");
      await expect.poll(() => first.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(page.getByText(`1/${entry.images.length}`, { exact: true })).toBeVisible();

      // What a swipe does.
      await carousel.evaluate((track) => track.scrollTo({ left: track.clientWidth }));
      await expect(page.getByText(`2/${entry.images.length}`, { exact: true })).toBeVisible();
    });
  }
});

test.describe("the story pages", () => {
  /** Scrolls by touch the way a guest stops just short of a milestone (0 = the first), then lets go. */
  async function stopNear(page: Page, index: number) {
    await page.evaluate((i) => {
      window.dispatchEvent(new Event("touchstart"));
      const target = document.querySelectorAll("#story li.story-snap")[i];
      const box = target.getBoundingClientRect();
      const centred = window.scrollY + box.top + box.height / 2 - window.innerHeight / 2;
      window.scrollTo({ top: centred - window.innerHeight * 0.15, behavior: "instant" });
    }, index);
  }

  test("settle on each milestone, whole on the screen, when the guest stops near it", async ({ page }) => {
    await openEnvelope(page, several.code);
    const count = await page.locator("#story li.story-snap").count();
    expect(count).toBe(story.length);

    for (let i = 0; i < count; i++) {
      await stopNear(page, i);
      const milestone = page.locator("#story li.story-snap").nth(i);
      const viewport = page.viewportSize()!;
      await expect
        .poll(async () => {
          const box = (await milestone.boundingBox())!;
          return Math.abs(box.y + box.height / 2 - viewport.height / 2);
        }, { message: `"${story[i].title}" settles in the middle` })
        .toBeLessThan(4);
    }
  });

  test("leave the rest of the page to scroll freely", async ({ page }) => {
    await openEnvelope(page, several.code);
    await page.locator("#rsvp").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy({ top: -120, behavior: "instant" }));
    const stopped = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(1_000);
    expect(await page.evaluate(() => window.scrollY)).toBe(stopped);
  });

  test.describe("with a mouse or trackpad", () => {
    // A browser that says it has a touch screen, as Chrome on a Mac, touchscreen
    // laptops and DevTools' phone preview can: what counts is the wheel.
    test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: true });

    const milestone = (page: Page, index: number) => page.locator("#story li.story-snap").nth(index);
    /** How far a milestone's middle is from the middle of the screen (px). */
    const offCentre = (page: Page, index: number) =>
      milestone(page, index).evaluate((el) => {
        const box = el.getBoundingClientRect();
        return Math.abs(box.top + box.height / 2 - window.innerHeight / 2);
      });

    test("glide a milestone at a time, onwards with each notch and back with a notch up", async ({ page }) => {
      await openEnvelope(page, several.code);
      // Even after a touch earlier on: a laptop with a touchscreen.
      await page.evaluate(() => window.dispatchEvent(new Event("touchstart")));
      await page.mouse.move(700, 450);

      await page.mouse.wheel(0, 100);
      await expect.poll(() => offCentre(page, 0), { message: `on to "${story[0].title}"` }).toBeLessThan(4);
      await page.mouse.wheel(0, 100);
      await expect.poll(() => offCentre(page, 1), { message: `on to "${story[1].title}"` }).toBeLessThan(4);
      await page.mouse.wheel(0, -100);
      await expect.poll(() => offCentre(page, 0), { message: `back to "${story[0].title}"` }).toBeLessThan(4);
      await page.waitForTimeout(800);

      // Changing their mind mid-glide (easy on a trackpad): the latest scroll decides.
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(250);
      await page.mouse.wheel(0, -100);
      await expect.poll(() => offCentre(page, 0), { message: `back again to "${story[0].title}"` }).toBeLessThan(4);
    });

    test("scroll freely past the last milestone", async ({ page }) => {
      await openEnvelope(page, several.code);
      await milestone(page, story.length - 1).evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForTimeout(400);
      await page.mouse.move(700, 450);
      const start = await page.evaluate(() => window.scrollY);

      for (let notch = 1; notch <= 3; notch++) {
        await page.mouse.wheel(0, 100);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(start + notch * 100 - 5);
        await page.waitForTimeout(500);
        // Not pulled back, and not carried anywhere either.
        const y = await page.evaluate(() => window.scrollY);
        expect(y).toBeGreaterThanOrEqual(start + notch * 100 - 5);
        expect(y).toBeLessThanOrEqual(start + notch * 100 + 5);
      }
    });
  });

  test.describe("on a small phone", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("fit each milestone, photo and words, on one screen", async ({ page }) => {
      await openEnvelope(page, several.code);
      const milestones = page.locator("#story li.story-snap");
      for (let i = 0; i < (await milestones.count()); i++) {
        const box = (await milestones.nth(i).boundingBox())!;
        expect(box.height, `"${story[i].title}" fits`).toBeLessThanOrEqual(667 + 1);
      }
    });
  });
});
