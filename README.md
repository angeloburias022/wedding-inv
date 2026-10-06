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
| `components/Decor/Monogram.tsx` | The couple's monogram artwork (`public/images/monogram.webp`): opening, envelope card, wax seal, closing |
| `components/Decor/FloralCorners.tsx` | Fixed floral corners behind every page |
| `components/Place/VenueArch.tsx` | Venue photo revealed through an opening arch |
| `components/Place/VenueFilm.tsx` | Scroll-driven venue clip (used when `location.video` is set) |
| `components/Story/PhotoCarousel.tsx` | Swipeable photos when a story entry has several |
| `components/Story/StoryVideo.tsx` | A short clip for a story entry (the proposal): plays silently by itself in view, with a speaker button for its sound |
| `components/Invitation/Envelope.tsx` | The guest's opening: sealed envelope that opens into the invitation; returning guests also get a "Skip to the wedding day" link |
| `components/Music/Music.tsx` | The song: starts on the seal tap, with a pause button bottom-left |
| `components/Invitation/ChapterNav.tsx` | Chapter dots on the right edge: progress and jump to a section |
| `components/RSVP/RsvpReminder.tsx` | Closing reminder until the guest has replied (remembered in `components/RSVP/replied.ts`) |
| `components/Invitation/ScrollHint.tsx` | "Scroll" cue shown after opening, gone on first scroll |
| `components/WeddingDay/AddToCalendar.tsx` | "Add to calendar" menu: beside the ceremony, and after an RSVP "yes" |
| `lib/calendar.ts` | The ceremony as a calendar event: Google link and `.ics` file |
| `app/invite/[code]/wedding.ics/route.ts` | One calendar file per invitation, written at build time |
| `components/WeddingDay/Countdown.tsx` | Days · hours · minutes · seconds to the ceremony (`date.startsAt`) |
| `components/WeddingDay/DaysToGo.tsx` | Quiet "131 days to go" line on the card inside the envelope (`lib/days.ts` helpers) |
| `components/WeddingDay/LiveStream.tsx` | Ceremony livestream: YouTube link, then embedded player on the day |
| `lib/youtube.ts` | Video ID from a YouTube link, for the embedded player |
| `lib/photos.ts` | Reads photo dimensions at build time so frames fit each photo |
| `public/images/` | Photos (story, venue) |
| `public/decor/` | Decorative artwork (floral corners) |
| `scripts/qr-card-template.png`, `scripts/qr-card-monogram.png` | Card design and monogram the per-guest QR cards are built from |
| `background-flowers.png` | Source mockup the floral corners are cropped from |
| `docs/` | Product/design spec (handoff), running project context, and `PARKED-FEATURES.md` (features agreed for later) |
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

- `print/cards/<CODE>.png` — the finished card (2048×3072): the guest's QR set
  into the floral design, with the monogram at its centre
- `print/png/<CODE>.png` — the bare QR, one 1200×1200 PNG per guest
- `print/svg/<CODE>.svg` — the bare QR as a vector, for print (sharp at any size)
- `print/qr-sheet.html` — internal sheet listing name, code, link and QR for
  matching QRs to cards (`open print/qr-sheet.html`)

`print/` is git-ignored and never deployed because the sheet has guest names.

The card design is `scripts/qr-card-template.png` (1024×1536). The QR drawn in
that artwork does not scan, so the script covers it and sets the real one in
its place, with the monogram (`scripts/qr-card-monogram.png`, a transparent
PNG) at its centre. Positions and colours are in `card` at the top of
`scripts/generate-qrs.mts`. To change the design, replace the template and
adjust `card.qr` to the new space.
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

### Story film

A story entry can show a short film in place of its photos (the proposal, in
"The Question"). Add `video` to the entry in `data/story.json`:

```json
"video": { "src": "/videos/proposal-moment.mp4", "poster": "/images/proposal-poster.webp" }
```

It is a short clip in a portrait (9:16) frame that plays silently by itself
while it is on screen and loops, like a photo that comes alive; the
invitation's song carries on over it. Browsers allow that only because it
starts muted. It rests when scrolled away, a tap pauses or plays it, and
reduced motion (or an iPhone in Low Power Mode) shows the poster still.

A speaker button in its corner plays the clip once from the start with its own
sound; the song pauses meanwhile and returns when the clip ends, is muted
again, or is scrolled away. The button's labels are `story.soundOn` and
`story.soundOff` in `data/content.json`.

Never put a phone's original recording in `public/`: the proposal was 2.3 GB of
4K HDR, far past GitHub's 100 MB limit. Keep originals in `originals/`
(git-ignored) and cut a short web clip. iPhone video is HDR, and ffmpeg alone
leaves the colours washed out, so cut and convert to standard range with
macOS's `avconvert` first, then shrink, bringing the quiet phone audio up to a
normal level:

```bash
# 0:20 to 1:40 of the original (start in seconds, then length)
avconvert -s "originals/PROPOSAL YERN.mov" -p Preset3840x2160 -o /tmp/clip.mov \
  --start 20 --duration 80 --replace
ffmpeg -i /tmp/clip.mov -map 0:v:0 -map 0:a:0 -vf "scale=720:1280:flags=lanczos" \
  -af "loudnorm=I=-18:TP=-2:LRA=11" -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart public/videos/proposal-moment.mp4
ffmpeg -ss 72 -i /tmp/clip.mov -frames:v 1 -vf "scale=720:1280" /tmp/poster.png
```

That gave 5 MB for 80 seconds. Convert the poster PNG to WebP (any image
tool) and save it as `public/images/proposal-poster.webp`; `-ss 72` picks the
moment within the clip, in seconds, used as the still.

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

## Music

The song is set by `music` in `data/wedding.json` and starts, fading in, when
the guest taps the seal (browsers only allow sound from a tap). It loops, and a
small button in the bottom-left corner pauses and resumes it. It also pauses
when the guest leaves the tab or taps into the livestream player. Going Back
to the envelope keeps it playing, with the button still there, and opening the
envelope again carries on; if the guest had paused it, opening starts it from
the beginning.

`music.startAt` and `music.skipStartAt` (seconds, `0` = the beginning) choose
where in the song it starts: `startAt` when the envelope is opened, and
`skipStartAt` for a returning guest who taps "Skip to the wedding day". It is
set to `48`, so a skip starts the song at 0:48 every time.

The generic landing page (the bare domain, no envelope) plays the song too,
from `music.landingStartAt` (`64`, so 1:04). With no seal to tap, most browsers
won't start it on arrival; it begins on the visitor's first tap or key press
anywhere on the page, and the music button is always shown there. A visitor
who paused it last time is left in peace.

A returning guest who skips gets the song only if they left it playing on
their last visit; if they had paused it, the invitation stays quiet. That
choice is remembered on their device.

A reload can't keep the sound going without a gap (the page is rebuilt, and
browsers block sound until the guest taps). The song's position is remembered
for the tab, and it carries on from there: at once where the browser allows
it, otherwise on the guest's first tap or key press anywhere on the page. If
the guest had paused it, it stays paused at the same place.

In development the Next.js badge is moved to the top-right (`next.config.ts`)
because its default corner covers the music button. Test sound in Chrome or
Safari, not VS Code's built-in preview.

Put the file at the `src` path (`public/audio/risk-it-all.mp3`). Until it is
there the invitation simply opens in silence, with no button. Set `music` to
`null` to turn it off.

Keep the file small, since every guest downloads it (`brew install ffmpeg`):

```bash
ffmpeg -i original.mp3 -vn -c:a libmp3lame -b:a 128k \
  -af "afade=t=in:d=2" public/audio/risk-it-all.mp3
```

The `afade` bakes in the fade-in for iPhones, which ignore a website's volume
changes. The recording is copyrighted: keep the site unlisted (it is already
`noindex`) and the repository private.

## Add to calendar

Guests can save the ceremony to their own calendar from two places: a link
under the ceremony in THE DAY, and a button in the RSVP thank-you after a
"yes". Both open a small menu:

- **Google Calendar** opens Google's new-event screen, pre-filled.
- **Apple · Outlook · other** opens `/invite/<CODE>/wedding.ics`, a calendar
  file written at build time for each invitation.

The event starts at `date.startsAt` and lasts `date.ceremonyMinutes` (30) in
`data/wedding.json`. It is stored in UTC, so each guest sees their own local
time. Its notes list the ceremony and dinner times and link back to the guest's
own invitation (`PUBLIC_INVITATION_ORIGIN`). The file carries three reminders:
one month, one week and one day before. Google's pre-filled screen can't set
reminders, so those guests get their own calendar's defaults. The title and
menu labels are under `calendar` in `data/content.json`.

Nothing can be added to a guest's calendar without their tap, and no email
address is collected.

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
