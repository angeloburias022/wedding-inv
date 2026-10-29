import { expect, test, type Page } from "./support/test";
import { content, openEnvelope, several, wedding } from "./support/invitation";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const ceremony = new Date(wedding.date.startsAt).getTime();

/** Sets the guest's clock (only the date and time; the page's timers run as usual), then opens the invitation. */
async function openAt(page: Page, ms: number) {
  await page.clock.setFixedTime(ms);
  await openEnvelope(page, several.code);
}

const calendarButton = (page: Page) => page.getByRole("button", { name: content.calendar.cta });
const rsvpDot = (page: Page) =>
  page.getByRole("navigation", { name: "Chapters" }).getByRole("link", { name: content.rsvp.eyebrow });
const reminder = (page: Page) => page.getByText(content.closing.rsvpReminder);

test.describe("as the wedding comes and goes", () => {
  test("a minute before the ceremony, the date can still be saved and the RSVP is open", async ({ page }) => {
    await openAt(page, ceremony - MINUTE);
    await expect(page.locator("#day").getByRole("button", { name: content.calendar.cta })).toBeVisible();
    await expect(page.locator("#rsvp")).toBeAttached();
    await expect(rsvpDot(page)).toHaveCount(1);
    await expect(reminder(page)).toBeAttached();
  });

  test("once the ceremony starts, the calendar buttons go but the RSVP stays for the day", async ({ page }) => {
    await openAt(page, ceremony + HOUR);
    await expect(page.locator("#day").getByText(content.day.countdown.today)).toBeVisible();
    await expect(page.locator("#rsvp")).toBeAttached();
    await expect(rsvpDot(page)).toHaveCount(1);
    await expect(reminder(page)).toBeAttached();
    await expect(calendarButton(page)).toHaveCount(0);

    // Nor is the calendar offered after a late yes.
    await page.locator("#rsvp").getByText(content.rsvp.yes).click();
    await page.locator("#rsvp").getByRole("button", { name: content.rsvp.submit }).click();
    await expect(page.locator("#rsvp").getByRole("status")).toContainText(content.rsvp.thanksYes);
    await expect(calendarButton(page)).toHaveCount(0);
  });

  test("late on the wedding day, the RSVP is still open", async ({ page }) => {
    // 11:30 PM in the wedding's time zone, ceremony at 2 PM.
    await openAt(page, ceremony + 9.5 * HOUR);
    await expect(page.locator("#rsvp")).toBeAttached();
  });

  test("from the day after, the invitation is a keepsake: no RSVP, no reminder, no calendar", async ({ page }) => {
    await openAt(page, ceremony + 24 * HOUR);
    await expect(page.locator("#day").getByText(content.day.countdown.married)).toBeVisible();
    await expect(page.locator("#story")).toBeVisible();
    await expect(page.locator("#rsvp")).toHaveCount(0);
    await expect(rsvpDot(page)).toHaveCount(0);
    await expect(reminder(page)).toHaveCount(0);
    await expect(calendarButton(page)).toHaveCount(0);
  });
});
