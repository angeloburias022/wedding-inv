import { expect, test } from "@playwright/test";
import { content, guests, openEnvelope, several, wedding } from "./support/invitation";

test.describe("the wedding day", () => {
  test("shows the ceremony time in every listed time zone", async ({ page }) => {
    await openEnvelope(page, several.code);
    const zones: { label: string; zone: string }[] = wedding.onlineCeremony.timeZones;
    test.skip(zones.length < 2, "only one time zone is listed");
    const start = new Date(wedding.date.startsAt);
    for (const { label, zone } of zones) {
      const time = start.toLocaleTimeString("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" });
      const cell = page.locator("#day dl div").filter({ hasText: label });
      await expect(cell.locator("dd")).toContainText(time);
    }
  });

  test("offers both ways to add the date to a calendar", async ({ page }) => {
    await openEnvelope(page, several.code);
    const day = page.locator("#day");
    const google = day.getByRole("link", { name: content.calendar.google });
    await expect(google).toBeHidden();

    await day.getByRole("button", { name: content.calendar.cta }).click();
    await expect(google).toBeVisible();
    await expect(google).toHaveAttribute("href", /calendar\.google\.com.*dates=\d{8}T\d{6}Z/);
    await expect(day.getByRole("link", { name: content.calendar.file })).toHaveAttribute(
      "href",
      `/invite/${several.code}/wedding.ics`,
    );

    await page.keyboard.press("Escape");
    await expect(google).toBeHidden();
  });
});

test.describe("the calendar file", () => {
  for (const guest of guests) {
    test(`for ${guest.code} holds the ceremony, its length and the reminders`, async ({ request }) => {
      const response = await request.get(`/invite/${guest.code}/wedding.ics`);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/calendar");

      const file = await response.text();
      const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const start = new Date(wedding.date.startsAt);
      const end = new Date(start.getTime() + wedding.date.ceremonyMinutes * 60_000);

      expect(file).toContain("BEGIN:VCALENDAR");
      expect(file).toContain(`DTSTART:${stamp(start)}`);
      expect(file).toContain(`DTEND:${stamp(end)}`);
      expect(file).toContain(`/invite/${guest.code}`);
      // One month, one week and one day before.
      expect(file.match(/BEGIN:VALARM/g)).toHaveLength(3);
      expect(file).toContain("TRIGGER:-P7D");
      expect(file).toContain("TRIGGER:-P1D");
      // Every line ends CRLF and stays within the format's 75-byte limit.
      for (const line of file.trimEnd().split("\r\n")) {
        expect(Buffer.byteLength(line), line).toBeLessThanOrEqual(75);
      }
    });
  }

  test("does not exist for an unknown code", async ({ request }) => {
    expect((await request.get("/invite/ZZZZZZ/wedding.ics")).status()).toBe(404);
  });
});
