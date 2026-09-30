# Angelo & Gichelle — Wedding Invitation

Personalised digital wedding invitation. The full product/design spec is
`docs/angelo-gichelle-wedding-invitation-handoff.md` (the "handoff §" references
in the code point here); running project context is in `docs/context.md`.

## Requirements

Node 20.9+ (Next.js 16). The repo pins Node 24 in `.nvmrc`:

```bash
nvm use
npm install
```

## Commands

```bash
npm run dev           # local dev server → http://localhost:3000/invite/7XK92M
npm run build         # production build (prerenders one page per guest)
npm run start         # serve the production build
npm run lint
npm run typecheck
npm run add:guest -- <names>  # add an invitation with a new random code
npm run remove:guest -- <CODE> # remove an invitation
npm run generate:qrs  # QR codes + print sheet → print/ (git-ignored)
```

## How it fits together

| Where | What |
|---|---|
| `data/*.json` | All content: wedding, guests, story, events, copy |
| `app/invite/[code]/page.tsx` | The invitation. One static page per guest code; unknown codes 404 |
| `app/page.tsx` | Generic landing for the bare domain (no guest details) |
| `app/actions/rsvp.ts` | RSVP server action → Google Sheets webhook |
| `proxy.ts` | Redirects lowercase codes to the uppercase URL |
| `app/globals.css` | Theme tokens (Heritage default, Editorial override) |
| `components/` | Sections, grouped as in handoff §34 |
| `components/Decor/FloralCorners.tsx` | Fixed floral corners behind every page |
| `components/Place/VenueArch.tsx` | Venue photo revealed through an opening arch |
| `components/Place/VenueFilm.tsx` | Scroll-driven venue clip (used when `location.video` is set) |
| `components/Story/PhotoCarousel.tsx` | Swipeable photos when a story entry has several |
| `components/WeddingDay/LiveStream.tsx` | Ceremony livestream: YouTube link, then embedded player on the day |
| `lib/youtube.ts` | Video ID from a YouTube link, for the embedded player |
| `lib/photos.ts` | Reads photo dimensions at build time so frames fit each photo |
| `public/images/` | Photos (story, venue) |
| `public/decor/` | Decorative artwork (floral corners) |
| `background-flowers.png` | Source mockup the floral corners are cropped from |
| `docs/` | Product/design spec (handoff) and running project context |
| `scripts/add-guest.mts` | Adds a guest with a new random code |
| `scripts/remove-guest.mts` | Removes a guest by code |
| `scripts/generate-qrs.mts` | QR generator (handoff §18) |

## Adding a guest

```bash
npm run add:guest -- Maria                          # individual
npm run add:guest -- Rhea Erwin                     # couple
npm run add:guest -- --family Santos Jose Carmen    # "The Santos Family"
npm run add:guest -- --group Rhea Kim Joy           # "Rhea & Friends"
npm run add:guest -- --group --name "The Cousins" Ana Ben
npm run generate:qrs
```

`add:guest` picks a random unused 6-character code (no look-alike characters
such as 0/O or 1/I/L) and appends the guest to `data/guests.json`. Each name
becomes an RSVP checkbox. `generate:qrs` rebuilds every QR from scratch, so a
removed guest's QR can't linger. The page works immediately in `npm run dev`;
in production it goes live on the next deploy.

Never change an existing guest's code after their card is printed.

## Removing a guest

```bash
npm run remove:guest -- 7XK92M
npm run generate:qrs
```

Their QR files disappear on the next `generate:qrs`, and their link returns
404 after the next deploy. Any RSVP they already sent stays in the Google
Sheet. Only remove invitations that haven't been sent; a printed card's QR
would stop working.

## QR codes

`npm run generate:qrs` writes, for every guest in `data/guests.json`:

- `print/png/<CODE>.png` — one 1200×1200 PNG per guest
- `print/svg/<CODE>.svg` — the same QR as a vector, for print (sharp at any size)
- `print/qr-sheet.html` — internal sheet listing name, code, link and QR for
  matching QRs to cards (`open print/qr-sheet.html`)

`print/` is git-ignored and never deployed because the sheet has guest names.
QRs encode `PUBLIC_INVITATION_ORIGIN/invite/<CODE>` (default
`https://angeloandgichelle.com`); names are never in the QR.

To test scanning before the site is live, point the QRs at your Mac (phone on
the same Wi-Fi, `npm run dev` running), then regenerate with the real domain
afterwards — don't print test QRs:

```bash
PUBLIC_INVITATION_ORIGIN=http://$(ipconfig getifaddr en0):3000 npm run generate:qrs
npm run generate:qrs   # back to the real domain
```

## Photos

Put photos in `public/images/` and reference them from the data files:

- **Story:** each entry in `data/story.json` has an `images` list. One photo
  shows on its own; several become a swipeable carousel (counter, dots, and
  arrows on desktop). An empty list shows a placeholder frame.
- **Venue:** `location.image` in `data/wedding.json`.

Use JPEG (or WebP) straight from the phone at full quality; don't pre-convert
or shrink. `next/image` resizes each photo per screen and serves WebP.
Browsers can't show HEIC, so export iPhone photos as JPEG.

Frames take each photo's own shape, read at build time by `lib/photos.ts`
(EXIF rotation included), clamped like Instagram: tall portraits are trimmed
to 4:5, wide shots show whole up to 1.91:1. A carousel uses its first photo's
shape for every slide. Restart `npm run dev` after adding or swapping a photo
to pick up its new shape. A venue photo in portrait is capped at 75% of the
screen height.

## The venue

`location` in `data/wedding.json` drives the Place section; the ceremony in
`data/events.json` repeats the venue, room and address for the schedule.

| Field | Shown as |
|---|---|
| `venue` | Heading, and the map search with `address` |
| `room` | Small caps under the heading (optional) |
| `address` | Full street address |
| `directions` | Optional one-line note on finding the room once inside |
| `image` | Photo, revealed through an arch that opens as the guest scrolls |
| `video` | Optional clip that replaces the arch (below) |

The arch opens from the middle of the photo, so a straight-on shot with the
building centred works best. With reduced motion, the photo shows in its
finished arch without moving.

### Venue film

Set `location.video` (e.g. `/videos/venue.mp4`) and the photo becomes a clip
that plays forward as the guest scrolls down and backward as they scroll up,
pinned mid-screen. `location.image` stays as its poster and as the still for
reduced motion; since the poster bypasses `next/image`, keep it around 1600px
wide.

Use one continuous 5–10 s shot with no cuts. Scrubbing is only smooth when
every frame is a keyframe, so re-encode the original first
(`brew install ffmpeg`):

```bash
ffmpeg -i original.mov -an -vf "scale=1280:-2,fps=30" \
  -c:v libx264 -preset slow -crf 26 -g 1 -pix_fmt yuv420p \
  -movflags +faststart public/videos/venue.mp4
```

Aim for under ~8 MB; raise `-crf` (e.g. 30) to shrink it further.

## Ceremony livestream

The ceremony is streamed on YouTube and shown at the end of THE DAY, set by
`onlineCeremony` in `data/wedding.json`:

| Field | Purpose |
|---|---|
| `enabled` | Shows or hides the whole block |
| `url` | The stream link; until set, the message promises one is coming |
| `startsAt` | Start with its UTC offset (`2027-02-10T14:00:00+11:00`) |
| `timeZones` | Start time shown in each (Melbourne and Manila) |

1. In YouTube Studio: Create → Go live → schedule a stream for the ceremony,
   visibility **Unlisted** (only people with the link can find it).
2. Paste its link (any form: `watch?v=`, `youtu.be/`, `/live/`) into `url`
   and redeploy.

The stream sits in a framed "Watch from home" card at the end of THE DAY
(wider on desktop), and once `url` is set a "Watching from home? ↓" link
under the ceremony card jumps to it. Until two hours before `startsAt` the
card shows a solid "▶ Watch the ceremony" button (YouTube's page lets guests
set a reminder). From then on the player is embedded on the invitation
(privacy-enhanced `youtube-nocookie.com`) under a status badge: "Starting
soon", "● Live now" for three hours from the start, then "Watch the replay".
An "Open in YouTube" link stays below for phones that play better in the
app. Guests who keep the page open move through each stage on time. A
channel link (not a specific stream) can't be embedded, so it stays a
button. All wording is in `onlineCeremony` in `data/content.json`.

Before the day: check that embedding is allowed on the stream (on by
default), avoid copyrighted music (YouTube can mute or cut the stream), and
test the room's connection. Ask BDM about filming rules in the Margaret Craig
Room.

## Floral corners

The top-left and bottom-right flowers on every page are
`public/decor/flowers-top-left.png` and `flowers-bottom-right.png`, cropped
from the mockup `background-flowers.png` (949×1657, text baked in, so only
the corners are usable). They keep their ivory backdrop; a radial mask
(`.floral-corner` in `app/globals.css`) fades them into the page, and the
theme's `--photo-filter` greys them in Editorial. They sit behind content, so
sections need a see-through background to show them (RSVP uses
`bg-surface/80`).

To swap in new artwork of the same layout, re-crop with ImageMagick and update
the `width`/`height` in `components/Decor/FloralCorners.tsx` if the sizes
change:

```bash
magick background-flowers.png -crop 720x450+0+0 +repage -strip public/decor/flowers-top-left.png
magick background-flowers.png -crop 349x627+600+1030 +repage -strip public/decor/flowers-bottom-right.png
```

Artwork without text can be cropped larger.

## RSVP → Google Sheets

RSVPs never touch GitHub. The server action posts JSON to a Google Apps Script
web app that appends a row to a Sheet.

1. Create a Google Sheet with a tab named `RSVPs`.
2. Extensions → Apps Script, paste:

   ```js
   const COLUMNS = ["submittedAt", "code", "invitation", "attending",
     "attendingGuests", "attendingCount", "dietary", "message"];

   function doPost(e) {
     const data = JSON.parse(e.postData.contents);
     const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
     if (!secret || data.secret !== secret) {
       return ContentService.createTextOutput("forbidden");
     }
     const sheet = SpreadsheetApp.getActive().getSheetByName("RSVPs");
     if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
     sheet.appendRow(COLUMNS.map((key) => data[key]));
     return ContentService.createTextOutput("ok");
   }
   ```

3. Project Settings → Script Properties → add `SECRET` (any long random string).
4. Deploy → New deployment → Web app, execute as **Me**, access **Anyone**.
5. Put the web app URL and the secret in `.env.local` (see `.env.example`) and in
   Vercel's environment variables.

Guests can change their answer; each submission is a new row, so the latest row
per code is the current answer.

Without `RSVP_WEBHOOK_URL`, `npm run dev` logs RSVPs to the terminal; a
production build refuses to accept them rather than silently dropping them.
