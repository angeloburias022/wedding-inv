# Development Context — Angelo & Gichelle Wedding Invitation

This file holds the running context of the project's development: the current
state, decisions made, open questions and a log of changes. Update it whenever
something changes.

The full product/design/architecture spec lives next to this file in
`docs/angelo-gichelle-wedding-invitation-handoff.md` (the "handoff"). This file
summarises it and records what has happened since.

------------------------------------------------------------------------

## Project snapshot

- **What:** Personalised digital wedding invitation, paired with a 5×7
  folded physical card. "One invitation, two mediums."
- **Wedding:** 10 February 2027, Melbourne, Australia
- **Couple:** Angelo & Gichelle (monogram: the G·A artwork with a floral
  sprig, `public/images/monogram.webp`)
- **Signature:** "Designed & built by Angelo"
- **Stack:** Next.js 16.3 (App Router) + TypeScript + Tailwind CSS v4 +
  Motion (the renamed Framer Motion, `motion` package), on Vercel
- **Code:** `wedding-invitation/` (Node 24 via `.nvmrc`; your default Node 18
  is too old — run `nvm use` in that folder). Both docs live in its `docs/`
  folder (moved in from the parent folder on 2026-10-01).
- **Content:** JSON in GitHub (`wedding`, `guests`, `story`, `events`,
  `content`)
- **RSVP storage:** Google Sheet via an Apps Script web app (never GitHub or
  the filesystem). Setup steps are in the project `README.md`.
- **Design source of truth:** Figma
- **Primary target:** Mobile (390×844); desktop 1440×900
- **Planned domain:** angeloandgichelle.com
- **Venue:** Old Treasury Building, Margaret Craig Room, 20 Spring Street,
  East Melbourne VIC 3002 (a Victorian Marriage Registry ceremony room)

## Page flow

Personalised opening → US (5–7 milestone timeline) → THE DAY (ceremony
2:00 PM at the Old Treasury Building, then "Dinner & Celebration" KBBQ at 6:00 PM) → THE PLACE (venue kept
secondary) → RSVP → Closing. One continuous vertical scroll.

## Key decisions

- **Framework: Next.js** (confirmed 2026-09-29, over plain React).
  Guest name is in the first page load, bad codes get a real 404, and
  RSVP/admin run server-side without a separate backend.
- Guest URLs use opaque codes (`/invite/7XK92M`). No names or PII in URLs or
  QR codes. The code personalises the page; it is not a security measure.
- Recipient types: individual, couple, family, group. Driven by data, not
  separate templates.
- Guest records stay minimal: `code`, `type`, `names`.
- Themes are defined in code: **Soft Heritage** (default) and **Monochrome
  Editorial**. The visitor's choice goes in localStorage. No styling values
  in content JSON.
- Heritage muted text colour: `#626653` (Muted Olive).
- The KBBQ is part of THE DAY, visually below the ceremony. Never its own
  section.
- New guests are added with `npm run add:guest` (random unused code from an
  alphabet without look-alike characters) and removed with
  `npm run remove:guest -- CODE`, then `npm run generate:qrs`. Only remove
  invitations that haven't been sent.
- One QR code per guest, built by `npm run generate:qrs`
  (`scripts/generate-qrs.mts`) from `guests.json`. Error correction level H,
  SVG + PNG output, a finished floral card per guest (since 2026-10-03),
  plus a print reference sheet. Output goes to `print/`
  (git-ignored, never deployed) rather than `public/` as the handoff
  suggested, because the sheet contains guest names. Printed QR links must
  keep working permanently.
- `/admin` is deferred. When built, it writes to GitHub server-side only.
- Motion is restrained (fades, ~12–20px moves, 600–1200ms) and respects
  reduced-motion settings.
- Invite pages are prerendered at build time from `guests.json`; unknown
  codes 404, lowercase codes redirect to uppercase. The whole site is
  `noindex` and `robots.txt` blocks all crawlers.
- The opening entrance uses CSS animation, not Motion, so the guest's name
  is visible in the server HTML without waiting for JavaScript. Motion is
  used for the scroll reveals below the fold.
- RSVP is a server action. It re-checks the code and only accepts names that
  belong to that invitation. It only reports success once the Sheet webhook
  replies `ok`. In production without a webhook URL it refuses rather than
  silently dropping responses.
- Guest types: `family` needs `familyName` ("The Santos Family"), `group`
  shows "<first name> & Friends", and any guest can set `displayName` to
  override.
- Editorial muted grey is `#6F6F6F`, not the spec's `#777777`, for
  readable contrast on small text.
- **Opening is a gate** (decided 2026-09-30): `/invite/CODE` shows only the
  opening. Nothing else is rendered or scrollable until the guest opens it
  (since 2026-10-01: taps the envelope's wax seal); then the invitation is
  revealed on the same URL. Opening adds a history
  entry, so Back returns to the opening. Reloading an opened invitation
  stays on it at the same scroll position (changed 2026-10-01); a fresh
  visit shows the opening again. Chosen over a separate `/invitation` route so the reveal
  stays one continuous animation and nobody can skip the opening.
- Build in vertical slices: Figma → Next.js → test, one section at a time,
  starting with the Opening.
- **Floral corners on every screen** (2026-09-30): fixed top-left and
  bottom-right blossoms cropped from `background-flowers.png`, behind the
  content, faded into the page. The mockup has text baked in, so only the
  corners are usable; a refined, text-free version can be generated later.
- **US stays an editorial timeline** (2026-09-30), not an Instagram feed or
  a single swipeable post. The photos are casual phone snaps; a milestone
  may have several, shown as a swipeable carousel. Tried the Instagram feed,
  then reverted at Angelo's request.
- **Photo frames fit each photo** (2026-09-30): shape read at build time,
  clamped between 4:5 and 1.91:1 (like Instagram). JPEG or WebP at full
  quality; not HEIC; no manual conversion since `next/image` serves WebP.
- **Venue presentation** (2026-09-30): lead with "Old Treasury Building",
  the room in small caps beneath, full street address, map link to the
  building. No embedded Google Map.
- **Venue arch reveal** (2026-09-30): the exterior photo opens through an
  arch as the guest scrolls. Chosen over a slow zoom, a line drawing, a
  crossfade or a drawn map. A scroll-driven venue film is built and takes
  over when `location.video` is set, but needs footage we own or license;
  a 3D scan and Google Maps 3D/Street View were rejected.
- **Envelope opening** (2026-10-01): the guest's opening screen is a sealed
  envelope addressed to them; one tap on the wax seal opens it (flap folds
  back, card slides out) into the invitation. Drawn in code from the theme
  tokens so it follows Heritage/Editorial; a Figma envelope matching the
  printed one can replace it later. The seal replaces the "Open
  invitation" button rather than adding a step.
- **Cinematic landing = one continuous shot** (2026-10-01): the card that
  slides out grows to fill the screen and dissolves into the story, rather
  than adding a second scene (title sequence, letterboxing, music) after
  the envelope. Music was added after all on 2026-10-03 (next point), but
  as part of the same shot, not a second scene.
- **Music** (2026-10-03, at Angelo's request; reverses the "no music"
  part of the decision above): "Risk It All" (Bruno Mars) starts with the
  tap on the wax seal, fading in, and loops. No autoplay and no music
  prompt: browsers only allow sound from a tap, and the seal is that tap.
  A small button bottom-left pauses and resumes. Self-hosted file chosen
  over a YouTube embed (visible player required, possible ads, unreliable
  start on iPhones) and Spotify/Apple Music embeds (30-second previews for
  guests who aren't signed in). Opening the envelope again restarts the
  song from the beginning (2026-10-04).
- **Monogram artwork** (2026-10-03): Angelo's G·A logo replaces the plain
  "A & G" text everywhere: opening, envelope card, wax seal, closing, the
  404 page, and the centre of the printed QR codes.
- **Printed QR card** (2026-10-03): Angelo's floral "You're invited · Scan
  to open your invitation" design is the card. The QR drawn in that artwork
  does not scan (image generators draw the pattern, they don't encode it),
  so `generate:qrs` sets each guest's real code over it.
- **Interactive guidance** (2026-10-01): the seal glows when idle and
  presses down on tap (vibration on Android), chapter dots show progress
  and jump between sections, and the closing reminds guests to RSVP until
  they have. Swipe-to-open and end-of-section "next" cues were offered and
  left for later; tooltip walkthroughs and tilt effects were rejected.
- **Countdown clock** (2026-10-02): days · hours · minutes · seconds under
  the date in THE DAY, counting to the ceremony start (`date.startsAt`).
  Seconds at Angelo's request (earlier advice was days only). The envelope
  screen gets a quiet, non-ticking "131 days to go" line under the date
  instead of the clock; the generic landing page shows the full clock.
  Not sticky.
- **No auto-scroll after opening** (2026-10-01): it takes control from
  guests, rushes past the story and RSVP, and hurts accessibility. Instead
  a gentle "Scroll" hint shows until the first scroll. A sticky RSVP
  shortcut and a one-time nudge were offered as later options.
- **Ceremony livestream on YouTube** (2026-10-01), unlisted, shown at the
  end of THE DAY with the start in Melbourne and Manila time. A link until
  two hours before, then the player embedded on the invitation. Chosen over
  Facebook Live, Google Meet/Zoom and Discord (see handoff §21).

## Current status

| Area | Status |
|---|---|
| Concept, personalisation, story | ~90% |
| Physical ↔ digital | ~85% |
| Visual direction, IA, tech architecture, motion | ~80% |
| Data architecture | ~75% |
| UI design (Figma) | ~40% |
| Implementation | Basic end-to-end version working (unpolished) |

**Working now:** all sections (Opening → US → THE DAY → THE PLACE → RSVP →
Closing), four sample guests (one per type), both themes with a switcher in
the closing, RSVP with validation, QR generation and print sheet, 404 page,
generic landing page at `/`. Also (2026-09-30 → 10-01): floral corners on
every page, story carousels for milestones with several photos, frames that
fit each photo's shape, the real venue (Old Treasury Building, Margaret
Craig Room) with its exterior photo and arch reveal, a ready-to-use venue
film, and the YouTube ceremony livestream (link now, player on the day).
Since 2026-10-01: the envelope opening (wax seal → flap → card that
becomes the screen), larger couple names, reload keeping the guest's place,
a "Scroll" hint, chapter dots, the RSVP reminder in the closing, and a more
visible livestream card. Since 2026-10-03: the song with its pause button,
the monogram artwork across the site, and a finished QR card per guest.

**Placeholders still in use:** story photos (empty frames), KBBQ name and
address, the livestream link, venue directions,
story text beyond the handoff examples, fonts (Cormorant + Jost),
sample guests.

**Next milestone:** Polish section by section alongside the Figma work,
then connect the real Google Sheet and deploy to Vercel.

## Open questions / still to decide

- Confirm the venue address and get one line of directions to the
  Margaret Craig Room (entrance, floor)
- Rights to the Old Treasury exterior photo (looks professionally shot;
  check its source or credit it)
- Venue film: ask a videographer (e.g. Twenty One Studio) to license a
  5–10 s continuous clip, or film one; ask BDM whether filming inside is
  allowed
- Whether to warm or mute the venue photo's vivid blue sky to suit the
  palette
- Whether to hide the photo block when there's no photo, and to change
  "View map" to "Get directions"
- Refined floral artwork (text-free, higher resolution than 949px)
- Envelope artwork: optionally replace the code-drawn envelope with a
  Figma design matching the printed envelope (the flow stays the same)
- Guidance options left for later: swipe up to open the envelope, and
  small "next section" cues at the end of each section
- Countdown in the livestream card on the day ("Starting in 1 hr 23 min"),
  still an option; the main countdown is built (2026-10-02)
- KBBQ restaurant name and address
- Display, body and label fonts
- Song rights: the file is an instrumental recording of "Risk It All"
  supplied by Angelo. It is a copyrighted recording and not licensed for
  use on a website; the site is unlisted and `noindex`, and the repository
  should stay private. A bought track or the YouTube embed are the
  alternatives.
- Song file: bake a 2 s fade-in into the mp3 and shrink it to 128 kbps
  (ffmpeg command in the README; ffmpeg isn't installed yet), and test on
  a real iPhone
- QR card: a higher-resolution version of the card artwork for print (the
  current one is 1024×1536, upscaled ×2), whether the guest's name goes on
  the card, and a scan test from a printed proof with a phone
- Final US milestones: dates, titles, captions, photos
- Dress code, parking, transport details
- Create the unlisted YouTube stream and paste its link into
  `onlineCeremony.url`; confirm the start time; pick who runs the camera
- RSVP: whether meal preference and a confirmation email are needed
- Domain registration
- Guest list and invitation codes
- Where the theme switcher lives (currently only in the closing)
- Whether to show an RSVP deadline

------------------------------------------------------------------------

## Change log

### 2026-09-29

- Reviewed the handoff document.
- Wedding date changed from 12 to 10 February 2027 (made by Angelo in the
  handoff). Fixed the one leftover: `wedding.json` example `display` field.
- §25: `--color-text-muted` changed from `#777777` (Monochrome grey) to
  `#626653` (Heritage Muted Olive).
- §42: removed duplicated QR steps and fixed numbering (now 1–28).
- Created this context file.
- Angelo asked whether to use React or Next.js. Recommended Next.js:
  the guest's name is in the first page load (no blank screen or flash),
  bad invite codes can return a proper 404, and RSVP and admin can run
  server-side with credentials kept secret, all without a separate backend.
  It also deploys to Vercel with no setup. Plain React would suit only a
  fully static site with an embedded Google Form.
- Angelo confirmed Next.js. Moved from open questions to key decisions.
- Set up the Next.js project in `wedding-invitation/` and built a basic
  end-to-end version of the whole handoff (details under Current status).
- Verified: lint, typecheck and production build pass. A headless Chrome
  test covered the full guest journey on mobile and desktop: all four guest
  types, theme switch and persistence, RSVP yes/no/validation, a wrong
  webhook secret, 404 and lowercase-code redirect, and reduced motion.
  17/17 real checks passed; the webhook received the right data.
- Fixes found during testing: the guest name was invisible until JavaScript
  loaded (moved the opening animation to CSS); lowercase codes showed a
  broken page (added redirect); a wrong Sheet secret would have shown the
  guest a false "thank you" (now requires an `ok` reply).
- Not committed to git yet.

### 2026-09-30

- `npm run dev` returned a 500 on every page. Cause: a Turbopack dev-mode bug
  loading the static Cormorant Garamond italic files from Google Fonts. The
  production build was unaffected, which is why the earlier tests (run
  against `build` + `start`) missed it. Fixed by switching to the variable
  `Cormorant` font (same typeface family). Dev, lint and build all pass.
- Lesson: test `npm run dev` as well as the production build.
- Angelo noticed guests could scroll past the opening without tapping "Open
  invitation" (this happened on every device). Added `InvitationGate`, per
  the decision above. Checks now cover: no scrolling before opening, content
  at the top after opening, Back/Forward, and all the previous flows.
  24/24 checks pass on both the dev server and the production build.
- Added `npm run add:guest` so codes are never invented by hand; see the
  README for the options. `generate:qrs` now clears old QR files first, so a
  removed guest's QR can't be printed by mistake. Both scripts read
  `.env.local` quietly. Tested every guest type plus the error cases; the
  test guests were then removed.
- README: added a "QR codes" section (output files, why `print/` is private,
  testing scans on a phone before launch) and `add-guest.mts` in the file
  table.
- Handoff §18 updated to match the implementation: `add:guest`, `.mts`
  scripts, output in `print/` (and why), clearing old QRs, dev-scan testing,
  and sample data matching `guests.json`.
- Brought the rest of the handoff up to date with what's built: stack
  (Next 16, Tailwind v4, Motion), opening gate (§2.2, §4), CSS opening
  entrance, RSVP → Apps Script → Sheet (§11), data file examples and guest
  fields (§12), section settings (§17), Editorial grey (§15), and the real
  folder structure and routing (§35). The handoff is once again the
  single up-to-date spec; `context.md` keeps the history.
- Added `npm run remove:guest -- CODE` (accepts lowercase, and errors on an
  unknown or missing code). Tested add → QR → remove → QR; `guests.json`
  ended identical to before. Documented in the README, handoff §18 and here.
- QR output split into folders: `print/png/<CODE>.png` (one 1200×1200 PNG
  per guest, as Angelo asked) and `print/svg/<CODE>.svg`; the old combined
  `print/qrs/` is removed on the next run. Every PNG was decoded with macOS's
  QR reader and resolves to the right `/invite/<CODE>` link. README and
  handoff §18 updated.
- Floral corners added to every page (`components/Decor/FloralCorners.tsx`),
  cropped from `background-flowers.png` into `public/decor/`. Then refined
  from Angelo's art-direction brief: smaller on phones so they clear the
  heading, bleeding off the edges, with a softer shadow fade. The brief's
  artwork changes (petal realism, leaf veins) need an image generator, not
  code. RSVP background made slightly see-through so the flowers show.
- US: tried an Instagram-style feed (post header, small caption), then
  reverted to the alternating editorial layout. Kept from the experiment:
  several photos per milestone as a carousel (`story.json` `image` →
  `images` list).
- Photo frames now take each photo's shape (`lib/photos.ts`, new
  dependency `image-size`), for the story and the venue. Verified on test
  images; EXIF rotation couldn't be tested without a real phone photo.
- Venue set to the Old Treasury Building, Margaret Craig Room: new `room`
  and `directions` fields, full address, shown in THE PLACE and the
  ceremony card.
- Built the scroll-driven venue film (`VenueFilm`, ffmpeg steps in the
  README) and the arch reveal (`VenueArch`), which is what shows now.
  Arch checked in headless Chrome at four scroll positions.
- Added the Old Treasury exterior photo as
  `public/images/old-treasury-exterior.webp` (2500×1665).
- Typecheck and lint pass throughout. Not yet checked end to end in a
  browser; not committed.

### 2026-10-01

- Moved this file and the handoff into `wedding-invitation/docs/`.
- Documentation brought up to date: README (file table, Photos, The venue,
  Venue film, Floral corners), handoff §7, §8, §9, §12, §15, §20, §31, §34,
  §35, and this file.
- Ceremony livestream: YouTube, enabled (`onlineCeremony` gained
  `startsAt` and `timeZones`; new `liveMessage` copy). New
  `components/WeddingDay/LiveStream.tsx` and `lib/youtube.ts`. Link parsing
  and the time line tested in Node; the day-of switch to the player not yet
  checked in a browser. Documented in the README, handoff §12, §21, §35.
- Livestream made easier to find: framed "Watch from home" card (wider on
  desktop), solid burgundy play button, "Watching from home? ↓" jump link
  under the ceremony card, and day-of badges (Starting soon → Live now →
  Watch the replay) with "Open in YouTube". Checked in headless Chrome at
  phone and desktop widths, before the day and live, via a temporary
  preview page (since removed).
- Countdown discussed and parked (see open questions).
- Documentation audit: handoff intro (venue), §12 content copy, §17 (online
  ceremony isn't a section; no gallery), §23/§24 PhotoGrid → PhotoCarousel,
  §43 maturity (implementation no longer 0%); README file table (docs/,
  `lib/youtube.ts`, the flower mockup); this file's status and
  placeholders.
- Couple's names made more visible on the opening and closing: from the
  12px sans label to the display serif in spaced capitals (24px mobile,
  30px desktop), still well below the guest's name. Checked in headless
  Chrome at phone and desktop widths. Handoff §4 updated.
- Scroll hint added after opening (`components/Invitation/ScrollHint.tsx`,
  `animate-scroll-cue` in `globals.css`, `opening.scrollHint` copy). Its
  fade-in uses the CSS entrance like the opening. Headless Chrome showed it
  in place at the bottom centre once but was unreliable with the fade-ins,
  so it still needs a look in a real browser. Handoff §20 and README
  updated.
- Reload no longer sends guests back to the opening: the gate reads the
  open flag from the history entry (survives a reload, not a new tab) and
  restores the scroll position from `sessionStorage`, instantly with no
  transition. Forward also returns to the last position; a tap on "Open
  invitation" still animates and starts at the top. Tested by driving
  Chrome over its DevTools protocol: first visit, tap, scroll, reload ×2,
  Back, Forward, Back + tap again, and a new tab. All behaved as intended.
- Envelope opening built (`components/Invitation/Envelope.tsx`, `paper`
  grain utility, `opening.envelopeHint` copy; `OpenInvitationButton`
  replaced by a `useOpenInvitation` hook). The guest's name sits in its own
  band under the seal, sized to the envelope, so all guest types fit on one
  line at 390px. Checked by driving Chrome: closed envelope at 390×844 and
  1280×800, all four guest types, Editorial, the opening sequence frame by
  frame, the full reload/Back/Forward/new-tab run, and reduced motion.
  Handoff §4, §20, §34, §35 and README updated.
- "The card becomes the screen": after sliding out, a copy of the card is
  lifted onto the page, grows to fill the viewport and fades into the page
  colour, the invitation swaps in beneath without a fade (new `seamless`
  option on the gate's open), and the sheet dissolves into the story.
  Frames captured at 390×844 confirm the continuous transition; the
  navigation run (reload, Back, Forward, new tab) and reduced motion still
  pass. Handoff §20 updated.
- Interactive guidance built: seal idle glow (`animate-seal-glow`), press
  and haptic tick, `ChapterNav`, and `RsvpReminder` with a per-device
  "replied" memory set when the RSVP succeeds. While testing, found that
  any in-page link (#top, #rsvp, the livestream jump) closed the
  invitation: a hash change adds a history entry without the open flag.
  Fixed in the gate: in-page links now scroll without touching history.
  Driven in Chrome at 390×844: glow appears after ~3s, dots hidden until
  scrolling then track the section, tapping the RSVP dot scrolls there,
  reminder shows before a reply and is gone after replying (also after a
  reload), and "Back to top" keeps the invitation open. Handoff §2.2, §4,
  §10, §20 and README updated.
- Documentation audit: handoff §2.2 (opening via the wax seal), §12
  (new copy keys), §19 (digital flow mentions the envelope), §34/§35
  (ScrollHint, ChapterNav, LiveStream, RsvpReminder); this file's opening
  decision, "Working now" and open questions. README paths all verified.

### 2026-10-02

- Countdown clock built (`components/WeddingDay/Countdown.tsx`): new
  `date.startsAt` and `date.timeZone` in `wedding.json`, labels and end
  states in `content.day.countdown`. Server renders dashes in the same
  layout (pages are prerendered) and the browser ticks once a second.
  Tested in Chrome at 390×844: ticking live, and with a faked clock: the
  hour before the ceremony (00 · 00 · 59 · 44), "Today is the day" after
  2:00 PM, "Happily married" two days later. Lining numerals so digits sit
  level. Handoff §8 and §12, README updated.
- Countdown refined at Angelo's request: the clock stays visible on the
  wedding day, with "Today is the day" above it, counting down to 2:00 PM;
  after the ceremony starts, the message alone, then "Happily married" from
  the next day. (A version showing only "Today" from midnight was tried
  briefly and dropped.) Tested with a faked clock: today, 11 PM the night
  before, 8 AM and 1:59 PM on the day, 3 PM on the day, and the next day.
- First-page countdown: `DaysToGo` line under the date on the envelope
  screen ("131 days to go" → "Tomorrow" → "Today is the day" → "Happily
  married", calendar days in Melbourne time, no ticking), and the full
  `Countdown` on the generic landing page. Shared date helpers in
  `lib/days.ts`. Checked at 390×844 and iPhone SE size 375×667 (envelope,
  hint and signature all still on screen) and each state with a faked
  clock. Handoff §4 and §8, README updated.

### 2026-10-03

- Music added (`components/Music/Music.tsx`): new `music` block in
  `wedding.json` (`src`, `title`, `artist`; `null` turns it off) and
  `music.play` / `music.pause` labels in `content.json`. The envelope's tap
  handler starts the song before anything is awaited, which is what lets
  browsers allow it. `InvitationGate` gained a `useInvitationOpen` hook so
  the player, which lives outside the gate, knows when the invitation is
  open. New `animate-equalizer` utility in `globals.css`.
- Options weighed for the song: self-hosted file, YouTube embed, Spotify
  and Apple Music embeds, licensing, royalty-free tracks. Angelo supplied
  an instrumental mp3 (3:24, 6.3 MB), now `public/audio/risk-it-all.mp3`.
  See the open question on rights.
- "Not playing" turned out to be two things. In development the Next.js
  dev badge sat on top of the music button, so clicks never reached it:
  moved the badge to the top-right in `next.config.ts` (development only;
  guests were never affected). And the song can't start without a tap on
  the seal or the button. Verified by driving headless Chrome over its
  DevTools protocol with real clicks: seal tap starts and fades in, the
  button pauses and resumes, a reload stays quiet until the button is
  pressed, and Back to the envelope pauses. That run was muted, so it
  confirms playback state, not sound; Angelo then confirmed it plays.
- Lesson: VS Code's built-in preview is not a reliable test for sound; use
  Chrome or Safari.
- QR cards: Angelo's floral card design had a drawn QR that macOS's reader
  could not detect. `generate:qrs` now writes `print/cards/<CODE>.png`
  (2048×3072) with the real code set into the design
  (`scripts/qr-card-template.png`) and the monogram at its centre
  (`scripts/qr-card-monogram.png`). New dev dependency `sharp`. All four
  cards decode to the right `/invite/<CODE>` link with macOS's QR reader;
  not yet scanned with a phone or from print.
- Monogram artwork replaces the "A & G" text across the site (new
  `components/Decor/Monogram.tsx`, `public/images/monogram.webp`, 640px
  wide, 87 KB). The `couple.monogram` text field was removed from
  `wedding.json` and its type. Checked in headless Chrome at phone size:
  the closed envelope, the card sliding out, and the closing. The 404 page
  and the Editorial theme were not looked at.
- README updated (Music, QR codes, file table). Handoff §4, §12, §18, §20,
  §34, §35 and this file updated on 2026-10-04.
- Typecheck, lint and the production build pass. Not committed.

### 2026-10-04

- Angelo noticed that going Back to the envelope and opening it again
  resumed the song where it had stopped. The seal tap now always starts it
  from the beginning; the corner button still resumes from where it was
  paused. Verified in headless Chrome: open, Back (pauses at 6 s), tap the
  seal again, playback restarts from 0:00.
