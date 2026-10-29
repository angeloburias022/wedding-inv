import { expect, test } from "./support/test";
import { arrive, content, guests, nameOnEnvelope, openEnvelope, seal, several, skipLink, wedding } from "./support/invitation";

test.describe("the envelope", () => {
  for (const guest of guests) {
    test(`is addressed to ${guest.type} guest ${guest.code}`, async ({ page }) => {
      await arrive(page, `/invite/${guest.code}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(nameOnEnvelope(guest));
      await expect(seal(page)).toBeVisible();
    });
  }

  test("shows nothing else of the invitation until it is opened", async ({ page }) => {
    await arrive(page, `/invite/${several.code}`);
    await expect(page.locator("#story")).toHaveCount(0);
    await expect(page.locator("#rsvp")).toHaveCount(0);
    await expect(skipLink(page)).toHaveCount(0);
  });

  test("opens into the invitation when the seal is tapped", async ({ page }) => {
    await openEnvelope(page, several.code);
    await expect(page.getByRole("heading", { name: content.story.title, exact: true })).toBeVisible();
    await expect(page.locator("#day")).toBeAttached();
    await expect(page.locator("#rsvp")).toBeAttached();
  });

  test("opens onto the couple's portrait, before the story", async ({ page }) => {
    test.skip(!wedding.portrait, "no portrait in wedding.json");
    await openEnvelope(page, several.code);
    const portrait = page.getByRole("region", { name: wedding.couple.displayName, exact: true });
    const photo = portrait.getByRole("img", { name: wedding.couple.displayName, exact: true });
    await expect(photo).toBeInViewport();
    await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    // It comes first: the story starts below it.
    const [photoBox, storyBox] = await Promise.all([photo.boundingBox(), page.locator("#story").boundingBox()]);
    expect(photoBox!.y).toBeLessThan(storyBox!.y);
  });

  test("goes back to the sealed envelope with the browser's Back button", async ({ page }) => {
    await openEnvelope(page, several.code);
    await page.goBack();
    await expect(seal(page)).toBeVisible();
    await expect(page.locator("#story")).toHaveCount(0);
  });

  test("stays open, at the same place, after a reload", async ({ page }) => {
    await openEnvelope(page, several.code);
    await page.locator("#day").scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(200);
    await page.reload();
    await expect(page.locator("#story")).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 150);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("opens straight away", async ({ page }) => {
      await arrive(page, `/invite/${several.code}`);
      await seal(page).click();
      await expect(page.locator("#story")).toBeVisible({ timeout: 4_000 });
    });
  });
});

test.describe("a returning guest", () => {
  test("is offered a way past the envelope, which lands on the wedding day", async ({ page }) => {
    await openEnvelope(page, several.code);
    await arrive(page, `/invite/${several.code}`);
    await expect(skipLink(page)).toBeVisible();
    await skipLink(page).click();
    await expect(page.locator("#day")).toBeInViewport();
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("day")!.getBoundingClientRect().top))).toBeLessThan(60);
  });

  test("can still open the envelope in full", async ({ page }) => {
    await openEnvelope(page, several.code);
    await openEnvelope(page, several.code);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
  });
});
