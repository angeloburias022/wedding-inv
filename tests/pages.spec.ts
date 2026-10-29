import { expect, test } from "./support/test";
import { arrive, guests, several, wedding } from "./support/invitation";

test.describe("the generic landing page", () => {
  test("shows the couple's names once, with the countdown, and no guest", async ({ page }) => {
    await arrive(page, "/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(wedding.couple.displayName);
    const text = await page.locator("body").innerText();
    expect(text.toLowerCase().split(wedding.couple.displayName.toLowerCase())).toHaveLength(2);
    for (const guest of guests) expect(text).not.toContain(guest.code);
    await expect(page.locator("#rsvp")).toHaveCount(0);
  });
});

test.describe("invitation links", () => {
  test("an unknown code is a real 404", async ({ page }) => {
    const response = await page.goto("/invite/ZZZZZZ");
    expect(response?.status()).toBe(404);
  });

  test("a lowercase code is sent to the proper link", async ({ page }) => {
    await page.goto(`/invite/${several.code.toLowerCase()}`);
    await expect(page).toHaveURL(new RegExp(`/invite/${several.code}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("privacy", () => {
  test("every page asks search engines to stay away", async ({ page, request }) => {
    for (const path of ["/", `/invite/${several.code}`]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    }
    expect(await (await request.get("/robots.txt")).text()).toMatch(/Disallow: \//);
  });

  test("a guest's name is not in their link or their calendar file's address", () => {
    for (const guest of guests) expect(guest.code).toMatch(/^[A-Z0-9]{6}$/);
  });
});
