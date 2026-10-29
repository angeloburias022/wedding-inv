import { defineConfig, devices } from "@playwright/test";

// The tests run against a production build on its own port, so they never
// depend on (or disturb) `npm run dev`.
const SITE_PORT = 3100;
// Stands in for the Google Sheet (RSVPs sent during tests go here, never to the real one) and YouTube's API.
const SHEET_PORT = 3199;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://127.0.0.1:${SITE_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    // Real Chrome rather than Playwright's Chromium: it can play the song and the proposal clip.
    // Muted at the speakers only: the song still plays (the tests check it), but silently.
    {
      name: "phone-chrome",
      use: { ...devices["Pixel 7"], channel: "chrome", launchOptions: { args: ["--mute-audio"] } },
    },
    // WebKit, the engine behind Safari on iPhones.
    { name: "phone-safari", use: { ...devices["iPhone 14"] } },
  ],
  webServer: [
    {
      command: "node tests/support/sheet-stub.mjs",
      url: `http://127.0.0.1:${SHEET_PORT}/requests`,
      env: { PORT: String(SHEET_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run build && npx next start -p ${SITE_PORT}`,
      url: `http://127.0.0.1:${SITE_PORT}`,
      timeout: 240_000,
      // These win over .env.local, so a test RSVP can never reach the real sheet.
      env: {
        RSVP_WEBHOOK_URL: `http://127.0.0.1:${SHEET_PORT}/hook`,
        RSVP_WEBHOOK_SECRET: "test-secret",
        // The livestream's status comes from the stand-in too, never from YouTube.
        YOUTUBE_API_URL: `http://127.0.0.1:${SHEET_PORT}/youtube`,
        YOUTUBE_API_KEY: "test-key",
      },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
