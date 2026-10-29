import { expect, test, type Page } from "./support/test";
import { streamStatusOf, type StreamStatus } from "../lib/youtube";
import { content, expectSongPlaying, expectSongQuiet, openEnvelope, several, wedding } from "./support/invitation";

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

/** What /api/stream-status answers this page: YouTube's view of the stream. */
const youTubeSays = (page: Page, status: StreamStatus) =>
  page.route("**/api/stream-status", (route) => route.fulfill({ json: { status } }));

test.describe("the livestream", () => {
  const stream = (page: Page) => page.locator("#livestream");
  const player = (page: Page) => stream(page).locator("iframe");
  const streamStart = new Date(wedding.onlineCeremony.startsAt).getTime();
  const videoId = new URL(wedding.onlineCeremony.url).pathname.split("/").pop();

  test.beforeEach(async ({ page }) => {
    test.skip(!wedding.onlineCeremony.enabled || !wedding.onlineCeremony.url, "no livestream link yet");
    // The player itself isn't needed, only where it points: keep YouTube out of the test run.
    await page.route(/youtube(-nocookie)?\.com/, (route) => route.abort());
    // YouTube can't say by default, so the badge follows the clock; tests below give it an answer.
    await youTubeSays(page, "unknown");
  });

  test("weeks before, is a button to the stream on YouTube", async ({ page }) => {
    await openAt(page, streamStart - 7 * 24 * HOUR);
    const button = stream(page).getByRole("link", { name: content.onlineCeremony.cta });
    await expect(button).toHaveAttribute("href", wedding.onlineCeremony.url);
    await expect(button).toHaveAttribute("target", "_blank");
    await expect(player(page)).toHaveCount(0);
  });

  test("an hour before, the player is on the page, starting soon", async ({ page }) => {
    await openAt(page, streamStart - HOUR);
    await expect(stream(page).getByRole("status")).toHaveText(content.onlineCeremony.startingSoon);
    await expect(player(page)).toHaveAttribute("src", `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`);
    await expect(stream(page).getByRole("link", { name: content.onlineCeremony.openInYouTube })).toHaveAttribute(
      "href",
      wedding.onlineCeremony.url,
    );
  });

  test("during the ceremony, is live", async ({ page }) => {
    await openAt(page, streamStart + HOUR);
    await expect(stream(page).getByRole("status")).toHaveText(content.onlineCeremony.liveNow);
    await expect(player(page)).toBeAttached();
  });

  test("from the day after, is the replay", async ({ page }) => {
    await openAt(page, streamStart + 24 * HOUR);
    await expect(stream(page).getByRole("status")).toHaveText(content.onlineCeremony.replay);
    await expect(player(page)).toBeAttached();
  });

  /** What YouTube's player tells the page when it starts (1) or stops (2) playing. */
  const playerSays = (page: Page, state: number) =>
    page.evaluate((state) => {
      const iframe = document.querySelector<HTMLIFrameElement>("#livestream iframe");
      window.dispatchEvent(
        new MessageEvent("message", {
          data: JSON.stringify({ event: "onStateChange", info: state }),
          origin: "https://www.youtube-nocookie.com",
          source: iframe?.contentWindow,
        }),
      );
    }, state);

  test("the song steps aside while the stream plays, and comes back when it stops", async ({ page }) => {
    await openAt(page, streamStart + HOUR);
    await expectSongPlaying(page);

    await playerSays(page, 1);
    await expectSongQuiet(page);

    await playerSays(page, 2);
    await expectSongPlaying(page);
  });

  test("the song stays off after the stream if the guest had turned it off", async ({ page }) => {
    await openAt(page, streamStart + HOUR);
    await page.getByRole("button", { name: content.music.pause }).click();
    await expectSongQuiet(page);

    await playerSays(page, 1);
    await playerSays(page, 2);
    await page.waitForTimeout(500);
    await expectSongQuiet(page);
  });

  test.describe("'Live now' follows YouTube, not just the clock", () => {
    const badge = (page: Page) => stream(page).getByRole("status");

    test("at 2 PM with the stream not started yet, it is starting soon", async ({ page }) => {
      await youTubeSays(page, "upcoming");
      await openAt(page, streamStart + 10 * MINUTE);
      await expect(badge(page)).toHaveText(content.onlineCeremony.startingSoon);
    });

    test("running late past the usual three hours, it is still live", async ({ page }) => {
      await youTubeSays(page, "live");
      await openAt(page, streamStart + 4 * HOUR);
      await expect(badge(page)).toHaveText(content.onlineCeremony.liveNow);
    });

    test("ended early, it is the replay", async ({ page }) => {
      await youTubeSays(page, "ended");
      await openAt(page, streamStart + HOUR);
      await expect(badge(page)).toHaveText(content.onlineCeremony.replay);
    });

    test("turns live on a page left open, once YouTube says so", async ({ page }) => {
      await youTubeSays(page, "upcoming");
      await openAt(page, streamStart - 10 * MINUTE);
      await expect(badge(page)).toHaveText(content.onlineCeremony.startingSoon);

      await youTubeSays(page, "live");
      // The page asks every 30 seconds, and straight away when the guest comes back to the tab.
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await expect(badge(page)).toHaveText(content.onlineCeremony.liveNow);
    });
  });
});

test.describe("the stream status", () => {
  test("comes from YouTube, shared for 30 seconds", async ({ request }) => {
    const response = await request.get("/api/stream-status");
    expect(await response.json()).toEqual({ status: "live" });
    expect(response.headers()["cache-control"]).toContain("s-maxage=30");
  });

  test("reads each of YouTube's answers", () => {
    expect(streamStatusOf({ snippet: { liveBroadcastContent: "upcoming" } })).toBe("upcoming");
    expect(streamStatusOf({ snippet: { liveBroadcastContent: "live" } })).toBe("live");
    expect(
      streamStatusOf({ snippet: { liveBroadcastContent: "none" }, liveStreamingDetails: { actualEndTime: "2027-02-10T05:00:00Z" } }),
    ).toBe("ended");
    expect(streamStatusOf(undefined)).toBe("unknown");
  });
});
