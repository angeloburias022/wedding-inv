# Parked features — Angelo & Gichelle Wedding Invitation

Features we have talked through and decided to build later, or not yet.
Nothing here is built. Each entry says what it is, what it is waiting for
and what is still to decide, so it can be picked up without redoing the
conversation.

When one is built, move it out of this file and record it in
`context.md`. Unfinished content (story photos, the dinner venue, fonts,
the livestream link) is not a feature; that list is under "Placeholders"
and "Open questions" in `context.md`.

Last updated: 2026-10-07.

------------------------------------------------------------------------

## Decided: will build

### 1. Downloadable PDF invitation

- **What:** one portrait page per guest, 5×7 to match the printed card,
  in the site's ivory, serif and brass. A "Download invitation" link in
  the closing.
- **On the page:** the monogram, "With love, for" and the guest's name,
  the couple's names, the date, both ceremony times (Melbourne and
  Manila), the venue with room and address, the dinner time, and the
  guest's own QR code and link.
- **Left off on purpose:** the story and photos, and anything likely to
  change (dress code, parking, the livestream link, the dinner venue until
  it is confirmed). The QR code points to the live site for those.
- **How:** generated per guest at build time, like the calendar file
  (`/invite/CODE/invitation.pdf`). Needs a PDF library and the Cormorant
  and Jost font files in the project. Not yet verified that a PDF library
  runs during the build on this Next.js version; the fallback is a script
  like `generate:qrs`.
- **Waiting for:** the invitation to be finished (decided 2026-10-07).
  The PDF is a separate drawing, so every design change (fonts, Figma,
  story) would mean redoing it. Facts and wording come from the same data
  files and need no extra work.
- **Still to decide:** the invitation wording (a placeholder line was
  "Together with our families, we invite you to celebrate the wedding
  of"), and 5×7 versus A4.
- **Considered and not chosen:** a multi-page version, one page per
  section. About three to five times the work, mostly the story pages,
  and more to go out of date.

### 2. "Under the paper": hidden specs card

- **What:** a small, hidden card with honest details about how the
  invitation was made. Nothing visible until someone finds the trigger.
- **Where:** at the end of the invitation, opened from the "Designed &
  built by Angelo" signature in the closing (for example, a few taps).
- **Proposed lines:** stack and versions; how the page is delivered and
  how fast it loaded; commit and build date; days in the making; the song
  and its position; the theme; the countdown; and a closing "with love,
  for Gichelle".
- **Rules:** in the invitation's own type, never a terminal look. Nothing
  about the guest (no code, name or device) and no guest or RSVP counts.
  Hidden so it respects handoff §5 (no technical metadata on show).
- **Waiting for:** Angelo to say go (parked 2026-10-04).
- **Still to decide:** the final lines, the title, and the trigger.

------------------------------------------------------------------------

## Left for later: needs something first

### 3. Calendar invitation by email

- **What:** an optional email field in the RSVP, shown after a "yes". The
  site then emails a real calendar invitation, which appears
  automatically in many guests' calendars (Outlook, many Gmail accounts)
  and is one tap to accept in the rest.
- **Why later:** needs guests' email addresses, a sending service (Resend
  or similar) and the domain, which is not registered yet. The "Add to
  calendar" button already covers the same need without any of that.
- **Alternative with no code:** create the event in Google Calendar and
  add guests as attendees, with "guests can see guest list" turned off.

### 4. Reminder emails

- **What:** an email before the day, for news the calendar can't carry: a
  last-minute change, parking details, the livestream link.
- **Why later:** needs the emails from item 3 stored in the Google Sheet,
  the sending service, and a scheduled job. For a one-off, sending by hand
  from the Sheet's list is simpler and safer than automation that runs
  once.

### 5. `/admin` page

- **What:** add, edit or disable guests and update content from a page
  instead of editing JSON (handoff §36).
- **Why later:** deferred from the start; the `add:guest` and
  `remove:guest` scripts cover it for now. When built, it writes to
  GitHub server-side only.

------------------------------------------------------------------------

## Offered: not decided

Small options raised along the way. None is agreed.

- **Swipe up to open the envelope,** as well as tapping the seal.
- **"Next section" cues** at the end of each section.
- **A sticky RSVP shortcut,** or a one-time nudge towards it.
- **A countdown in the livestream card** on the day ("Starting in 1 hr
  23 min").
- **An RSVP deadline** shown on the invitation.
- **Meal preference** in the RSVP.
- **Guest's name on the printed QR card.**
- **A Figma-drawn envelope** to replace the code-drawn one, matching the
  printed envelope.

------------------------------------------------------------------------

## Engineering work suggested

Not guest-facing. Suggested on 2026-10-06 when reviewing the code.

- **Automated tests for the guest journey:** first visit, seal, Back,
  reload, skip, the music choice, RSVP and the calendar file, so
  `npm test` proves the flow still works after a change. Every check so
  far has been a one-off script against headless Chrome.
- **Tidy the music player** (`components/Music/Music.tsx`): it grew one
  rule at a time and now juggles several shared variables and storage
  keys. Rewrite its internals as one small state object with named
  states, once the tests above are in place to make that safe.
