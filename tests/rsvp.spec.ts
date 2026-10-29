import { expect, test, type Page } from "./support/test";
import { content, openEnvelope, several, sheetRows, single } from "./support/invitation";

const rsvp = (page: Page) => page.locator("#rsvp");
const send = (page: Page) => rsvp(page).getByRole("button", { name: content.rsvp.submit }).click();

/** A message no other test or run will have sent, to find this reply in the stand-in sheet. */
const marker = (title: string) => `e2e ${title} ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const rowWith = async (message: string) => (await sheetRows()).find((row) => row.message === message);

test.describe("the RSVP", () => {
  test("saves a yes for everyone on the invitation, then offers the calendar", async ({ page }, testInfo) => {
    const message = marker(testInfo.project.name);
    await openEnvelope(page, several.code);
    await rsvp(page).getByText(content.rsvp.yes).click();
    await rsvp(page).locator('textarea[name="message"]').fill(message);
    await send(page);

    await expect(rsvp(page).getByRole("status")).toContainText(content.rsvp.thanksYes);
    await expect(rsvp(page).getByRole("button", { name: content.calendar.cta })).toBeVisible();

    const row = await rowWith(message);
    expect(row).toMatchObject({
      code: several.code,
      invitation: several.names.join(", "),
      attending: true,
      attendingGuests: several.names.join(", "),
      attendingCount: several.names.length,
    });
  });

  test("saves only the guests who are ticked", async ({ page }, testInfo) => {
    const message = marker(testInfo.project.name);
    await openEnvelope(page, several.code);
    await rsvp(page).getByText(content.rsvp.yes).click();
    await rsvp(page).getByRole("checkbox", { name: several.names[0] }).uncheck();
    await rsvp(page).locator('textarea[name="message"]').fill(message);
    await send(page);

    await expect(rsvp(page).getByRole("status")).toContainText(content.rsvp.thanksYes);
    const row = await rowWith(message);
    expect(row).toMatchObject({
      attendingGuests: several.names.slice(1).join(", "),
      attendingCount: several.names.length - 1,
    });
  });

  test("asks who is coming when a yes has nobody ticked", async ({ page }) => {
    await openEnvelope(page, several.code);
    await rsvp(page).getByText(content.rsvp.yes).click();
    for (const name of several.names) await rsvp(page).getByRole("checkbox", { name }).uncheck();
    await send(page);

    await expect(rsvp(page).getByRole("alert")).toBeVisible();
    await expect(rsvp(page).getByRole("status")).toHaveCount(0);
  });

  test("saves a no, without asking who or offering the calendar", async ({ page }, testInfo) => {
    const message = marker(testInfo.project.name);
    await openEnvelope(page, single.code);
    await rsvp(page).getByText(content.rsvp.noSingular).click();
    await expect(rsvp(page).getByText(content.rsvp.dietaryLabel)).toHaveCount(0);
    await rsvp(page).locator('textarea[name="message"]').fill(message);
    await send(page);

    await expect(rsvp(page).getByRole("status")).toContainText(content.rsvp.thanksNo);
    await expect(rsvp(page).getByRole("button", { name: content.calendar.cta })).toHaveCount(0);
    expect(await rowWith(message)).toMatchObject({ code: single.code, attending: false, attendingCount: 0 });
  });

  test("never thanks the guest when the sheet did not save the reply", async ({ page }) => {
    await openEnvelope(page, single.code);
    await rsvp(page).getByText(content.rsvp.yes).click();
    // The stand-in sheet refuses any reply carrying this marker.
    await rsvp(page).locator('textarea[name="message"]').fill("[sheet-refuses]");
    await send(page);

    await expect(rsvp(page).getByRole("alert")).toBeVisible();
    await expect(rsvp(page).getByRole("status")).toHaveCount(0);
  });

  test("stops reminding the guest in the closing once they have replied", async ({ page }) => {
    await openEnvelope(page, single.code);
    const reminder = page.getByText(content.closing.rsvpReminder);
    await expect(reminder).toBeAttached();
    await rsvp(page).getByText(content.rsvp.yes).click();
    await send(page);
    await expect(rsvp(page).getByRole("status")).toBeVisible();
    await expect(reminder).toHaveCount(0);
  });
});
