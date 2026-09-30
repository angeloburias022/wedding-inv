# Angelo & Gichelle --- Digital Wedding Invitation

## Product, UX, Design, Architecture & Development Handoff

**Wedding date:** 10 February 2027\
**Location:** Old Treasury Building (Margaret Craig Room), Melbourne,
Australia\
**Couple:** Angelo & Gichelle\
**Primary digital stack:** Next.js 16 + TypeScript + Tailwind CSS v4 +
Motion (formerly Framer Motion) + Vercel\
**Content/data source:** JSON files in GitHub\
**Primary device:** Mobile-first\
**Design workflow:** Figma-driven, component-driven development

------------------------------------------------------------------------

# 1. Product Vision

The project is a personalized digital wedding invitation for Angelo &
Gichelle.

The goal is **not** to build a generic wedding website.

The goal is:

> **Design one wedding invitation that happens to exist in two mediums:
> physical and digital.**

The physical invitation should feel complete as a keepsake even if the
QR code is never scanned.

The digital invitation should feel like the physical invitation brought
to life:

-   Same visual language
-   Same typography
-   Same monogram
-   Same color system
-   Same photography treatment
-   Same editorial character
-   Expanded storytelling
-   Wedding-day details
-   Personalized guest experience
-   RSVP

The website should feel like a **premium editorial invitation**, not a
SaaS product, portfolio, or social-media clone.

------------------------------------------------------------------------

# 2. Core Product Principles

## 2.1 Invitation first

The first page is the invitation.

Everything after it is the experience.

The first screen should answer:

> **Whose invitation is this, and what am I about to experience?**

It should not immediately overwhelm the guest with:

-   Wedding details
-   RSVP forms
-   Navigation menus
-   Theme selection
-   Music prompts
-   Technical information
-   Developer gimmicks

------------------------------------------------------------------------

## 2.2 One-way narrative

The experience should feel like a continuous invitation rather than a
conventional website.

Primary journey:

``` text
PERSONALIZED OPENING
        ↓
OPEN INVITATION
        ↓
US
        ↓
THE DAY
        ↓
THE PLACE
        ↓
RSVP
        ↓
CLOSING
```

Use vertical scrolling as the primary navigation.

Do not use a traditional:

``` text
← Previous | Next →
```

navigation model.

Normal browser navigation must still work, and a subtle back-to-top
action may be provided where useful.

### The opening is a gate

`/invite/CODE` shows only the opening. Nothing else is rendered or
scrollable until the guest taps **OPEN INVITATION**. The content then fades
in on the same URL, starting at the top, like opening a card.

-   Opening adds a browser history entry, so **Back** returns to the
    opening instead of leaving the site, and **Forward** re-opens it.
-   Refreshing or returning later shows the opening again.
-   A separate route (e.g. `/invite/CODE/invitation`) was considered and
    rejected: it breaks the reveal into a page change and lets people skip
    the opening via a direct link.
-   Trade-off: without JavaScript the invitation cannot be opened.

Guiding principle:

> **The experience moves forward; the interface never traps the guest.**

------------------------------------------------------------------------

# 3. Guest Personalization

Personalization is a major product feature.

The same invitation system should generate different experiences for
different recipients.

Examples:

``` text
WITH LOVE, FOR

MARIA
```

``` text
WITH LOVE, FOR

RHEA & ERWIN
```

``` text
WITH LOVE, FOR

THE SANTOS FAMILY
```

``` text
WITH LOVE, FOR

RHEA & FRIENDS
```

The application should use recipient type and guest data rather than
creating separate invitation templates.

Supported recipient types:

-   Individual
-   Couple
-   Family
-   Group

Example guest record:

``` json
{
  "code": "7XK92M",
  "type": "couple",
  "names": ["Rhea", "Erwin"]
}
```

The URL should use an opaque code:

``` text
/invite/7XK92M
```

Avoid exposing names or personal information in the URL.

Do not use URLs such as:

``` text
/invite/rhea-erwin
```

------------------------------------------------------------------------

# 4. First Screen

The first screen is the most important UX moment.

Recommended composition:

``` text
                         A & G

                  ANGELO & GICHELLE

                   10 FEBRUARY 2027
                       MELBOURNE


                     WITH LOVE, FOR

                     RHEA & ERWIN


                  OPEN INVITATION

              Designed & built by Angelo
```

## Visual hierarchy

### 1. Guest name

The guest/couple name is the emotional focal point.

Use an elegant serif and make it visually prominent.

Example:

``` text
RHEA & ERWIN
```

The name can appear with a subtle fade + slight upward movement.

Suggested entrance:

-   opacity: 0 → 1
-   Y: approximately 12px → 0
-   duration: approximately 600ms
-   restrained easing

The opening entrance is a CSS animation, not Motion, so the guest's name is
already in the server-rendered HTML and visible without waiting for
JavaScript.

### 2. Couple names

``` text
ANGELO & GICHELLE
```

Smaller than the guest name.

### 3. Monogram

``` text
A & G
```

Small and understated.

The monogram should also be usable in the physical invitation.

### 4. Date and location

``` text
10 FEBRUARY 2027 · MELBOURNE
```

Use a restrained sans-serif.

### 5. CTA

``` text
OPEN INVITATION
```

Minimal, elegant, not a giant app-style button.

It is the only way into the rest of the invitation (see §2.2).

### 6. Developer signature

``` text
Designed & built by Angelo
```

Very small and secondary.

------------------------------------------------------------------------

# 5. Developer Identity

The user is a developer and guests already know this.

The developer aspect should be visible but tasteful.

Preferred signature:

> **Designed & built by Angelo**

Avoid turning the invitation into a portfolio.

Do not use:

-   Fake terminal animations
-   Code-loading screens
-   Developer console visuals
-   Technical metadata
-   Invitation IDs on the hero
-   `USER: ANGELO_BURIAS`
-   `INVITATION_ID`
-   Fake "initializing invitation" experiences

The engineering craftsmanship should be apparent through:

-   Personalized URLs
-   Personalized opening
-   Data-driven content
-   Theme switching
-   Responsive behavior
-   Smooth transitions
-   Reusable components
-   Physical/digital connection
-   Overall polish

Guiding principle:

> **Do not show that you are a developer. Make people realize it.**

A small explicit signature is still appropriate because guests already
know.

------------------------------------------------------------------------

# 6. Overall Information Architecture

The intended sections are:

## Opening

Personalized invitation.

## US

Relationship timeline / romantic photo journal.

## THE DAY

Wedding-day schedule including ceremony and KBBQ dinner.

## THE PLACE

Supporting venue section.

## RSVP

Personalized RSVP.

## Closing

Final message and developer signature.

------------------------------------------------------------------------

# 7. US --- Relationship Timeline

The story is inspired by editorial/Instagram visual language but is
**not an Instagram clone**.

Borrow:

-   Large photographs
-   Dates
-   Captions
-   Photo grids
-   Vertical scrolling
-   Editorial spacing
-   Chronological progression

Do not use:

-   Likes
-   Comments
-   Followers
-   Hashtags
-   Instagram branding
-   Social UI

The story should feel like a curated romantic photo journal.

Example:

``` text
US

06.2020

THE BEGINNING

[large photo]

"Somehow, an ordinary day became
the beginning of everything."

Manila · June 2020
```

Another:

``` text
2025

ACROSS THE DISTANCE

[large photo]

"Distance made the little moments
matter even more."

Philippines ↔ Australia
```

Another:

``` text
2026

THE QUESTION

[engagement photo]

"She said yes."
```

Final milestone:

``` text
2027

AND NOW...

"After all these years,
we get to call this forever."

10 FEBRUARY 2027 · MELBOURNE
```

Layout as built: each milestone pairs a photo with its date, title,
caption and location. On desktop the photo alternates sides; on mobile it
stacks photo → text. A fully Instagram-style feed (post header, small
caption) and a single swipeable post for the whole story were both tried
and rejected on 2026-09-30: the editorial layout keeps the large date and
caption, and a scrolling timeline builds towards "And now...".

Photos are casual phone snaps. A milestone may have several photos; they
become a swipeable carousel (counter, dots, arrows on desktop) inside the
same layout. See §31 for how frames fit each photo.

Recommended number of milestones:

**5--7 meaningful milestones**

Avoid documenting every event in the relationship.

The dates should be a major design element, for example:

``` text
06.2020
2022
2025
2026
2027
```

------------------------------------------------------------------------

# 8. THE DAY

THE DAY is the primary wedding logistics section.

The KBBQ is confirmed as part of the actual wedding-day celebration and
should therefore be included.

Do not create a major standalone "KBBQ" section.

Recommended structure:

``` text
THE DAY

10 FEBRUARY 2027
MELBOURNE


CEREMONY

2:00 PM

Old Treasury Building
MARGARET CRAIG ROOM
20 Spring Street, East Melbourne VIC 3002


↓

DINNER & CELEBRATION

6:00 PM

[KBBQ Venue]

Come celebrate, eat, and stay awhile.
```

The narrative is:

> We get married → we celebrate → we eat together.

Avoid calling it:

-   Food Venue
-   Food section
-   KBBQ section

Preferred labels:

-   AFTER THE CEREMONY
-   DINNER TO FOLLOW
-   AFTERWARDS
-   DINNER & CELEBRATION

For the current editorial direction, **DINNER & CELEBRATION** is a
strong option.

The KBBQ should be visually subordinate to the wedding itself.

------------------------------------------------------------------------

# 9. THE PLACE

The historic Melbourne building is a supporting character, not the main
story.

Venue (confirmed 2026-09-30): **Old Treasury Building, Margaret Craig
Room**, 20 Spring Street, East Melbourne VIC 3002 (address to be confirmed
with the venue). The Margaret Craig Room is a Victorian Marriage Registry
ceremony room (about 55 guests).

Hierarchy:

``` text
1. Angelo & Gichelle
2. Their story
3. The wedding
4. The venue
5. Practical information
```

Use only approximately 2--3 carefully selected architectural images.

Recommended structure:

``` text
THE PLACE

[exterior photo, revealed through an opening arch]

Old Treasury Building
MARGARET CRAIG ROOM
20 Spring Street, East Melbourne VIC 3002
[optional one-line directions to the room]

"A historic place,
now part of our story."

[VIEW MAP]
```

-   Lead with the building (recognisable, findable); the room is a
    small-caps detail beneath it.
-   The map link searches the building and address, never the room.
-   The photo is the building's exterior, revealed through an arch that
    echoes its arched windows (§20). Straight-on and centred works best.
-   Optional **venue film**: a 5--10 s continuous clip (e.g. walking up
    the Spring Street steps) that plays as the guest scrolls, replacing
    the arch. Only with footage we own or have licensed.
-   Do not embed an interactive Google Map: it is off-brand, heavy and
    traps scrolling on mobile.

Do not create a full venue photo essay.

Guiding principle:

> **The wedding is about Angelo & Gichelle. The building is where the
> story happens --- not the story itself.**

------------------------------------------------------------------------

# 10. RSVP

The invitation is already personalized, so avoid asking guests to
redundantly enter their name.

Example:

``` text
RSVP

Rhea & Erwin,

Will you celebrate with us?


○ JOYFULLY, YES

○ WE'RE SORRY, WE CAN'T
```

If attending:

``` text
WHO WILL BE JOINING US?

☑ Rhea
☑ Erwin


DIETARY REQUIREMENTS

No restrictions


A MESSAGE FOR ANGELO & GICHELLE
(optional)
```

Then:

``` text
SEND RSVP
```

## Recommended RSVP data

### Required

-   Attendance
-   Attending guests

### If needed

-   Dietary restrictions
-   Meal preference

### Optional

-   Message to the couple
-   Email for confirmation

### Do not collect unless genuinely needed

-   Phone number
-   Home address
-   Social media
-   Passport information
-   Other unnecessary personal data

Because guest identity is already known through the invitation code, the
RSVP should feel personalized rather than like a generic form.

------------------------------------------------------------------------

# 11. RSVP Storage

Do not write RSVP responses to GitHub or the application's filesystem.

Recommended architecture:

``` text
Personalized Invitation
        ↓
RSVP form (in the invitation)
        ↓
Next.js server action (validates)
        ↓
Google Apps Script web app (shared secret)
        ↓
Google Sheets (one row per submission)
```

The server action:

-   re-checks the invitation code and only accepts names that belong to
    that invitation (anyone can call a server action directly);
-   posts the response to `RSVP_WEBHOOK_URL` with `RSVP_WEBHOOK_SECRET`;
-   reports success only when the Apps Script replies `ok` (Apps Script
    always returns HTTP 200, even on failure);
-   in production without a webhook URL, refuses the RSVP rather than
    silently dropping it. In development it logs it to the terminal.

Guests can change their answer. Each submission is a new row, and the
latest row per code is the current answer. Setup steps and the Apps Script
code are in the project README.

Columns: `submittedAt`, `code`, `invitation`, `attending`,
`attendingGuests`, `attendingCount`, `dietary`, `message`.

Wedding content and guest definitions remain in GitHub.

RSVP responses live in an external form/response system.

This keeps:

-   Source code clean
-   Guest data separated from RSVP submissions
-   RSVP updates operationally simple
-   Git history free of personal response changes

------------------------------------------------------------------------

# 12. Wedding Data Architecture

Recommended data files:

``` text
data/
├── wedding.json
├── guests.json
├── story.json
├── events.json
└── content.json
```

## wedding.json

Global wedding information.

Example:

``` json
{
  "couple": {
    "groom": "Angelo",
    "bride": "Gichelle",
    "displayName": "Angelo & Gichelle",
    "monogram": "A & G"
  },
  "date": {
    "display": "10 February 2027",
    "iso": "2027-02-10"
  },
  "location": {
    "city": "Melbourne",
    "region": "VIC",
    "country": "Australia",
    "venue": "Old Treasury Building",
    "room": "Margaret Craig Room",
    "address": "20 Spring Street, East Melbourne VIC 3002",
    "directions": null,
    "image": "/images/old-treasury-exterior.webp",
    "video": null
  },
  "onlineCeremony": {
    "enabled": true,
    "platform": "youtube",
    "url": null,
    "startsAt": "2027-02-10T14:00:00+11:00",
    "timeZones": [
      { "label": "Melbourne", "zone": "Australia/Melbourne" },
      { "label": "Manila", "zone": "Asia/Manila" }
    ]
  },
  "settings": {
    "theme": "heritage",
    "sections": {
      "story": true,
      "day": true,
      "place": true,
      "rsvp": true
    }
  }
}
```

`location` fields: `room` (optional small caps under the venue name),
`directions` (optional one-line note on finding the room), `image` (venue
photo, arch reveal) and `video` (optional scroll-driven clip that replaces
the photo; see the README for encoding). `null` hides any of them.

## guests.json

Keep guest data minimal.

Recommended:

``` json
[
  { "code": "7XK92M", "type": "couple", "names": ["Rhea", "Erwin"] },
  { "code": "4Q8N2P", "type": "individual", "names": ["Maria"] },
  {
    "code": "A81K3P",
    "type": "family",
    "familyName": "Santos",
    "names": ["Jose", "Carmen", "Luis", "Ana"]
  },
  {
    "code": "R5F7TW",
    "type": "group",
    "names": ["Rhea", "Kim", "Joy"],
    "displayName": "Rhea & Friends"
  }
]
```

-   `code`: 6 uppercase letters/digits, unique. Generated by
    `npm run add:guest` (see §18). The build fails on invalid or duplicate
    codes.
-   `names`: every person on the invitation; each becomes an RSVP checkbox.
-   How the opening name is built: individual → "Maria"; couple → "Rhea &
    Erwin"; family → "The Santos Family" (needs `familyName`); group →
    "Rhea & Friends" (first name + "& Friends").
-   `displayName`: optional override for any type.

Avoid turning guests.json into a CRM.

Do not store unnecessary:

-   Email
-   Phone
-   Address
-   Social media
-   Private notes

unless the invitation genuinely needs them.

## story.json

Relationship timeline.

Example:

``` json
[
  {
    "date": "06.2020",
    "title": "The Beginning",
    "location": "Manila",
    "images": ["/images/story/2020.jpg"],
    "caption": "Somehow, an ordinary day became the beginning of everything."
  },
  {
    "date": "2025",
    "title": "Across the Distance",
    "location": "Philippines ↔ Australia",
    "images": ["/images/story/2025-1.jpg", "/images/story/2025-2.jpg"],
    "caption": "Distance made the little moments matter even more."
  }
]
```

`images` lists one or more photos under `public/images/`. Several make a
swipeable carousel; an empty list shows a placeholder frame.

## events.json

Wedding-day schedule.

Example:

``` json
{
  "ceremony": {
    "label": "Ceremony",
    "time": "2:00 PM",
    "venue": "Old Treasury Building",
    "room": "Margaret Craig Room",
    "address": "20 Spring Street, East Melbourne VIC 3002",
    "note": null
  },
  "reception": {
    "label": "Dinner & Celebration",
    "time": "6:00 PM",
    "venue": "KBBQ Venue",
    "room": null,
    "address": "Melbourne, Victoria, Australia",
    "note": "Come celebrate, eat, and stay awhile."
  },
  "details": {
    "dressCode": null,
    "parking": null,
    "transportation": null
  }
}
```

The date comes from `wedding.json`. Any `details` field left `null` is
hidden.

## content.json

Editorial copy should be separate from component code. Copy is written in
sentence case; the uppercase look comes from CSS. The real file also holds the
RSVP labels and thank-you messages, the online-ceremony copy (eyebrow,
jump link, messages before and after the link exists, button, and the
"Starting soon" / "Live now" / "Watch the replay" / "Open in YouTube"
labels; see §21) and the closing's "Back to top" label.

Example:

``` json
{
  "opening": {
    "eyebrow": "WITH LOVE, FOR",
    "cta": "OPEN INVITATION"
  },
  "story": {
    "eyebrow": "OUR STORY",
    "title": "US"
  },
  "day": {
    "eyebrow": "THE DAY",
    "title": "A day we have been waiting for."
  },
  "place": {
    "eyebrow": "THE PLACE",
    "title": "Where our next chapter begins."
  },
  "rsvp": {
    "eyebrow": "RSVP",
    "title": "Will you celebrate with us?"
  },
  "closing": {
    "message": "We can't wait to celebrate with you."
  }
}
```

------------------------------------------------------------------------

# 13. Customizability Strategy

The invitation should be customizable without becoming a website
builder.

Separate the system into:

``` text
Content
Appearance
Behavior
```

## Content

-   Couple
-   Date
-   Venue
-   Events
-   Story
-   Guests
-   RSVP copy

## Appearance

-   Colors
-   Fonts
-   Borders
-   Spacing
-   Image treatment
-   Motion intensity

## Behavior

-   Theme switching
-   Music
-   Online ceremony
-   RSVP enabled
-   Countdown
-   Section visibility

------------------------------------------------------------------------

# 14. Semantic Theme System

Do not hardcode styling values into content JSON.

Avoid:

``` json
{
  "guestName": {
    "fontSize": "64px",
    "color": "#6B3038",
    "marginTop": "120px"
  }
}
```

Instead:

``` json
{
  "theme": "heritage"
}
```

Then implement theme definitions in code.

Conceptual theme:

``` ts
type WeddingTheme = {
  colors: {
    background: string
    surface: string
    text: string
    muted: string
    accent: string
    border: string
  }

  typography: {
    display: string
    body: string
    label: string
  }

  motion: {
    duration: number
    intensity: "subtle" | "normal"
  }
}
```

------------------------------------------------------------------------

# 15. Visual Themes

## Soft Heritage

Palette:

``` text
Warm Ivory      #F5F1E8
Surface Ivory   #FCFAF5
Soft Black     #242220
Deep Burgundy  #6B3038
Muted Olive    #626653
Stone          #D8D1C5
Muted Brass    #9A8158
```

Character:

-   Warm paper
-   Historic Melbourne
-   Printed invitation
-   Romantic editorial
-   Vintage influence
-   Soft photography
-   Delicate borders
-   Restrained decorative elements

**Floral corners** (added 2026-09-30): ivory blossoms with soft leaf
shadows sit fixed in the top-left and bottom-right of every screen, in a
diagonal balance, behind the content. They stay decorative and
subordinate: clear of the top typography and the guest's name, cropped
by the viewport edge, and faded into the paper with no visible edges.
Source artwork: `background-flowers.png` (a mockup with text baked in, so
only the corners are cropped out). In Editorial they turn greyscale via
the theme's photo filter. A refined version of the artwork can be
generated later and dropped in with the same layout.

## Monochrome Editorial

Palette:

``` text
Off-white      #F8F8F6
White          #FFFFFF
Near-black     #1C1C1C
Gray           #6F6F6F   (darkened from #777777 for readable contrast)
Light gray     #D9D9D9
```

Character:

-   Modern
-   Architectural
-   Minimal
-   Dramatic
-   Black-and-white photography
-   Strong editorial typography

Both themes share the same content and components.

Theme preference should be stored in localStorage, because it is a
visitor preference, not wedding data.

------------------------------------------------------------------------

# 16. Customization Limits

## Good customization

-   Content
-   Photos
-   Guest personalization
-   Theme
-   Section visibility
-   Section order
-   Event information
-   RSVP configuration
-   Online ceremony
-   Animation intensity

## Avoid

-   Arbitrary per-component font sizes
-   Arbitrary per-component colors
-   Pixel-level positioning controls
-   Per-section custom margins
-   Unlimited visual configuration
-   Turning the system into a website builder

Guiding principle:

> **Content should be highly customizable. The design system should be
> intentionally constrained.**

------------------------------------------------------------------------

# 17. Section Configuration

Optional section visibility:

``` json
{
  "sections": {
    "story": true,
    "place": true,
    "onlineCeremony": false,
    "gallery": true,
    "rsvp": true
  }
}
```

Optional section order:

``` json
{
  "sectionOrder": [
    "hero",
    "story",
    "day",
    "place",
    "rsvp",
    "closing"
  ]
}
```

The implementation can map section identifiers to React components.

Do not over-engineer this until there is a real need.

Implemented: visibility only, as `settings.sections` in `wedding.json`
(`story`, `day`, `place`, `rsvp`). The opening and closing always show.
Section order is fixed in code for now. The online ceremony is not a
section: it lives inside THE DAY and is switched by
`onlineCeremony.enabled` (§21). There is no gallery section.

------------------------------------------------------------------------

# 18. Physical Invitation

Current physical format:

**5 × 7 inch portrait folded card**

Rationale:

-   Feels like a mini editorial photo journal
-   Natural vertical relationship with mobile web
-   Gives enough room for story + details
-   More timeless than an accordion/trifold
-   More expressive than a flat single card

Potential physical structure:

``` text
FRONT
-----
Monogram
Angelo & Gichelle
10 February 2027
Melbourne


INSIDE
------
Our story
Wedding details
Dinner & celebration


BACK
----
SCAN TO OPEN YOUR INVITATION

[ QR CODE ]

angeloandgichelle.com
```

## QR Code as the Primary Physical → Digital Bridge

The physical invitation should use a QR code as the primary way for a
guest to open their personalized digital invitation. A printed full
personalized URL should not be the primary call to action because it
introduces unnecessary technical-looking text into the physical design.

Each physical invitation receives a QR code that points to that guest's
opaque invitation route. For example:

``` text
Rhea & Erwin
→ https://angeloandgichelle.com/invite/7XK92M

Maria
→ https://angeloandgichelle.com/invite/4Q8N2P
```

The QR target should therefore be generated from the same guest code used
by the web application's personalization system. The QR code is a bridge
into the digital experience, not a separate guest-management mechanism.

Recommended back-of-card treatment:

``` text
SCAN TO OPEN YOUR INVITATION

        [ QR ]

angeloandgichelle.com
```

The small generic domain is a fallback/discovery aid. The QR itself should
resolve directly to the recipient-specific invitation. The full personalized
URL does not need to be printed on the card.

Important implementation notes:

- Generate one QR code per invitation/guest code.
- QR destinations should use opaque codes, never guest names or other PII.
- Keep the QR visually quiet and consistent with the physical invitation.
- Maintain sufficient contrast, whitespace, and print size for reliable
  scanning.
- Test every generated QR from the final printed artwork before production.
- The QR code is not a security boundary; the invitation code is primarily
  a personalization mechanism.
- Do not display the QR code again inside the digital invitation after the
  guest has entered the experience.
- The physical invitation must still feel complete and intentional if the
  QR is never scanned.

The physical invitation is therefore:

``` text
KEEP & TREASURE
      +
SCAN TO CONTINUE
      ↓
PERSONALIZED DIGITAL INVITATION
```

Physical invitation should remain beautiful without the QR code.

The QR code is an entry point, not the reason the physical invitation
exists.

## QR Generation & Print Asset Workflow

QR generation should be an internal build/production utility, not part of the public invitation experience. The system should generate one QR asset for every guest invitation code from the same `guests.json` source used by the application.

Recommended flow:

``` text
npm run add:guest (new guest + random code)
    ↓
guests.json
    ↓
Validate unique invitation codes
    ↓
Build recipient URL
    ↓
Generate QR PNG/SVG
    ↓
Generate print assets / QR sheet
    ↓
Print and attach to the matching physical invitation
```

### Canonical URL construction

The QR generator should never manually maintain guest URLs. It should construct them from a single configured production origin and the guest's opaque code:

```ts
const url = `${PUBLIC_INVITATION_ORIGIN}/invite/${guest.code}`;
```

Example:

```text
PUBLIC_INVITATION_ORIGIN = https://angeloandgichelle.com
Guest code               = 7XK92M
Generated QR target      = https://angeloandgichelle.com/invite/7XK92M
```

The production origin should be centralized so a future domain change does not require manually editing every guest record.

### Adding guests

Invitation codes are never invented by hand. A script adds the guest and
picks the code:

```bash
npm run add:guest -- Maria                          # individual
npm run add:guest -- Rhea Erwin                     # couple
npm run add:guest -- --family Santos Jose Carmen    # "The Santos Family"
npm run add:guest -- --group Rhea Kim Joy           # "Rhea & Friends"
npm run add:guest -- --group --name "The Cousins" Ana Ben
```

It generates a random 6-character code that isn't already used, from an
alphabet without look-alike characters (no 0/O or 1/I/L), so a code is safe
to read out or type by hand. It appends the guest to `data/guests.json` and
prints the code and link. Each name becomes an RSVP checkbox.

To remove an invitation (only one that hasn't been sent):

```bash
npm run remove:guest -- 7XK92M
```

After `generate:qrs` and a deploy, that guest's QR files are gone and their
link returns 404. RSVPs they already sent stay in the Sheet.

### Implementation

The generator is a Node/TypeScript script using the `qrcode` package. Node 24
runs it directly, with no build step, so it works locally and in CI.

Project structure:

```text
scripts/
├── add-guest.mts
├── remove-guest.mts
└── generate-qrs.mts

print/                  ← git-ignored, never deployed
├── qr-sheet.html
├── png/                ← one PNG per guest (1200×1200)
│   ├── 7XK92M.png
│   ├── 4Q8N2P.png
│   └── ...
└── svg/                ← same QRs as vectors, for print
    ├── 7XK92M.svg
    └── ...
```

Output goes to `print/` rather than `public/`: the reference sheet contains
guest names, and QR files have no reason to be publicly served.

The generator:

1. Reads `data/guests.json`.
2. Validates that every guest has a unique, well-formed code (6 uppercase
   letters/digits), and stops with an error otherwise.
3. Clears `print/png/` and `print/svg/` so a removed guest's old QR can
   never be printed.
4. Constructs the canonical personalized URL.
5. Generates one 1200×1200 PNG per guest in `print/png/` and a matching SVG
   in `print/svg/`.
6. Names each file by the opaque code, never the guest's name.
7. Writes the internal reference sheet.
8. Prints a success/failure summary.

Commands:

```bash
npm run generate:qrs
```

`PUBLIC_INVITATION_ORIGIN` is read from the environment or `.env.local`
(default `https://angeloandgichelle.com`). To test scanning before launch,
temporarily point it at the dev machine, then regenerate with the real
domain. Never print test QRs:

```bash
PUBLIC_INVITATION_ORIGIN=http://$(ipconfig getifaddr en0):3000 npm run generate:qrs
npm run generate:qrs
```

### QR output requirements

For physical printing, the generated QR should:

- use high error correction (recommended level H);
- include a quiet zone around the code;
- use strong foreground/background contrast;
- avoid decorative overlays that reduce scan reliability;
- be generated at high enough resolution for the final print size;
- preserve the QR's square aspect ratio;
- be tested from the actual final print proof, not only from the source PNG/SVG.

SVG is useful for print production because it remains sharp at different sizes. PNG can be retained as a convenient preview/export format.

### Print package

The generator creates both individual QR assets and a printable reference
sheet (`print/qr-sheet.html`), one row per guest:

```text
Rhea & Erwin        7XK92M        https://angeloandgichelle.com/invite/7XK92M   [QR]
Maria               4Q8N2P        https://angeloandgichelle.com/invite/4Q8N2P   [QR]
The Santos Family   A81K3P        https://angeloandgichelle.com/invite/A81K3P   [QR]
```

The guest names may appear on the internal production sheet for matching purposes, but guest names should not be encoded in the QR or included in the public URL.

The final physical invitation should only receive the QR artwork intended for that recipient. Before mass printing, perform a production QA pass that scans every QR and verifies that it opens the correct personalized invitation.

### Admin integration

A future `/admin` page may provide production actions such as:

```text
Guests
────────────────────────────────
Rhea & Erwin       7XK92M       [QR]
Maria              4Q8N2P       [QR]
The Santos Family  A81K3P       [QR]

[ Generate All QR Codes ]
[ Generate Print Sheet ]
[ Download QR Package ]
```

The first implementation does not need this UI. The local `add:guest` and `generate:qrs` scripts are sufficient. The admin functionality can be added later if the number of invitations makes manual production inconvenient.

### Stability rule

Once invitations have been printed, the QR target must remain valid. The visual design, story, RSVP flow, and other content can change without changing the recipient URL. Do not reprint QR codes merely because the website content changes. Re-running `generate:qrs` is safe: the same code always produces the same QR target. Never change an existing guest's code after their card is printed.

If the production domain ever changes, preserve redirects from the old origin or otherwise maintain the old QR targets. A printed QR code should be treated as a durable physical asset.

### Security / privacy rule

Invitation codes are opaque identifiers, not authentication credentials. The QR should reveal only the invitation route. Do not put names, email addresses, phone numbers, or other PII inside the QR payload. If the invitation later contains sensitive information, the architecture should be reassessed rather than treating the QR as a security boundary.

------------------------------------------------------------------------

# 19. Physical ↔ Digital Design Relationship

Physical:

``` text
Open
↓
Reveal
↓
Turn page
↓
Discover story
↓
Details
↓
RSVP
```

Digital:

``` text
Open
↓
Reveal
↓
Scroll
↓
Discover story
↓
Details
↓
RSVP
```

This creates the same rhythm in two mediums.

Core philosophy:

> **One invitation, two mediums.**

------------------------------------------------------------------------

# 20. Animation / Motion System

Overall feeling:

> Elegant, restrained, slow, expensive.

Use:

-   Fade-in
-   Small vertical translation
-   Image clip/reveal
-   Subtle parallax
-   Scroll reveal
-   Section fade transitions
-   Theme transition

Suggested values:

-   Hero entrance: approximately 800--1200ms
-   Text entrance: approximately 600--800ms
-   Theme transition: approximately 500--700ms
-   Parallax: approximately 5--10%
-   Typical section movement: approximately 20px
-   Venue arch reveal: scroll-linked, from a narrow round arch (30% inset
    each side) to the full frame with a soft arched top, while the photo
    settles from 115% to 100%. Finished by the time the photo reaches the
    middle of the screen; reverses on scroll up.
-   Venue film (optional): scroll-scrubbed over about two screens of
    scrolling, pinned mid-screen, eased so seeking feels continuous.
-   Reduced motion: the arch shows finished and still; the film is
    replaced by the photo.

Avoid:

-   Bouncing
-   Spinning
-   Particles
-   Huge zooms
-   Typewriter effects
-   Excessive movement

Respect reduced-motion preferences.

------------------------------------------------------------------------

# 21. Optional Online Ceremony

Online ceremony is secondary.

Most guests are expected to be in the Philippines and likely will not
attend online.

Platform (decided 2026-10-01): **YouTube Live, unlisted.** No account or
app needed, works on phones and TVs, any number of viewers, and a replay
afterwards. Facebook Live (fiddly privacy, login nudges), Google Meet/Zoom
(time limits, chaotic past ~20 people) and Discord (accounts and an app)
were considered. The same link can also be shared in family Facebook or
Messenger groups; a separate small Meet for close family is optional.

Configuration (`wedding.json`, see §12): `enabled`, `url` (the stream
link), `startsAt` (with UTC offset) and `timeZones` (the start is shown in
each: "2:00 PM Melbourne · 11:00 AM Manila").

Before the link exists:

> "Can't join us in Melbourne? We'll share a link here for anyone who
> would like to watch the ceremony from home."

Once it exists:

> "Can't join us in Melbourne? Watch the ceremony live, wherever you are."

Display: a framed "Watch from home" card at the end of THE DAY (wider on
desktop), plus a "Watching from home? ↓" link under the ceremony card that
jumps to it. The stream must be easy to find without competing with the
ceremony itself.

Until two hours before the start the card shows a solid burgundy "▶ Watch
the ceremony" button linking to YouTube (guests can set a reminder). From
then on the player is embedded on the invitation (`youtube-nocookie.com`)
under a status badge: "Starting soon", "● Live now" (three hours from the
start), then "Watch the replay", with "Open in YouTube" beneath. The switch
happens in the browser because pages are prerendered.

Practicalities: a friend runs a phone on a tripod with a clip-on mic;
avoid copyrighted music; test the connection; check BDM's filming rules.

The online ceremony should appear within THE DAY rather than dominating
the invitation.

------------------------------------------------------------------------

# 22. Figma-Driven Development

Figma should be the **visual source of truth**.

Next.js/React is the **implementation source of truth**.

JSON is the **content source of truth**.

Framer Motion is the **motion/interaction source of truth**.

The process:

``` text
Figma foundation
      ↓
Figma component
      ↓
React component
      ↓
Real JSON data
      ↓
Browser implementation
      ↓
Visual comparison
      ↓
Refinement
```

Do not treat Figma as a picture that is translated manually into code.

Design Figma so that it naturally maps to the implementation.

------------------------------------------------------------------------

# 23. Figma File Structure

Recommended structure:

``` text
WEDDING INVITATION
│
├── 00 — Foundations
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Grid
│   └── Motion
│
├── 01 — Components
│   ├── Monogram
│   ├── GuestGreeting
│   ├── SectionHeader
│   ├── TimelineEntry
│   ├── PhotoCarousel
│   ├── EventCard
│   ├── VenueCard
│   ├── RSVP
│   └── Footer
│
├── 02 — Mobile
│   └── Complete invitation flow
│
├── 03 — Desktop
│   └── Complete invitation flow
│
├── 04 — Physical
│   └── 5×7 invitation
│
└── 05 — Developer Handoff
    ├── Component mapping
    ├── Token mapping
    ├── Responsive rules
    ├── Animation specs
    └── Implementation notes
```

------------------------------------------------------------------------

# 24. Figma ↔ Next.js Naming Contract

Important components should have matching conceptual names.

  Figma           Next.js
  --------------- -----------------
  GuestGreeting   `GuestGreeting`
  SectionHeader   `SectionHeader`
  TimelineEntry   `TimelineEntry`
  PhotoCarousel   `PhotoCarousel`
  EventCard       `EventCard`
  VenueCard       `VenueCard`
  RSVP            `RSVP`
  Footer          `Footer`

Avoid Figma names such as:

-   Frame 124
-   Rectangle 82
-   Group 31
-   Final Final 2

The Figma structure should communicate implementation intent.

------------------------------------------------------------------------

# 25. Design Tokens

Use semantic variables rather than one-off values.

Recommended token categories:

``` text
Colors
├── background
├── surface
├── text
├── text-muted
├── accent
└── border

Typography
├── display
├── heading
├── body
└── label

Spacing
├── xs
├── sm
├── md
├── lg
├── xl
└── 2xl

Layout
├── content-max
├── mobile-padding
└── desktop-padding
```

Example CSS mapping:

``` css
:root {
  --color-background: #f5f1e8;
  --color-surface: #fcfaf5;
  --color-text: #242220;
  --color-text-muted: #626653;
  --color-accent: #6b3038;
  --color-border: #d8d1c5;
}
```

Figma variables should correspond conceptually to these semantic
variables.

------------------------------------------------------------------------

# 26. Typography Specification

Every important text style should define:

-   Font family
-   Font size
-   Weight
-   Line height
-   Letter spacing
-   Case
-   Responsive behavior

Example:

``` text
Guest Name / Display

Desktop
72px
Regular
1.0 line-height
-0.02em letter spacing

Mobile
48px
Regular
1.0 line-height
-0.02em letter spacing
```

Do not design typography as arbitrary values scattered across screens.

Typography should be a system.

------------------------------------------------------------------------

# 27. Spacing System

Use a consistent spacing scale.

Suggested starting scale:

``` text
4
8
12
16
24
32
48
64
96
128
```

Avoid arbitrary values such as:

``` text
37px
53px
91px
```

unless there is a specific visual reason.

Figma spacing should translate cleanly to CSS/Tailwind.

------------------------------------------------------------------------

# 28. Auto Layout / CSS Translation

Figma should use Auto Layout heavily.

Example:

``` text
GuestGreeting
└── Vertical Auto Layout
    ├── WITH LOVE, FOR
    ├── RHEA & ERWIN
    ├── ANGELO & GICHELLE
    ├── DATE
    └── CTA
```

This should map naturally to:

``` css
display: flex;
flex-direction: column;
gap: ...;
align-items: center;
```

Do not rely on manual absolute positioning for normal layout.

Think:

> Figma Auto Layout ≈ CSS Flexbox/Grid.

------------------------------------------------------------------------

# 29. Responsive Design Specification

Primary design frames:

``` text
Mobile: 390 × 844
Desktop: 1440 × 900
```

Mobile is the primary design target.

The invitation will commonly be opened through:

-   QR code from the physical invitation (primary physical → digital path)
-   Messenger
-   Phone browser
-   Shared link

Each major component must specify how it adapts.

Example:

``` text
Guest Name

Mobile
48px
centered
24px horizontal padding

Desktop
72px
centered
max-width 900px
```

Timeline:

``` text
Mobile
single column

Desktop
editorial two-column/alternating layout
```

Images:

``` text
Mobile
single/stacked

Desktop
large image + supporting image where appropriate
```

Do not simply shrink the desktop design.

------------------------------------------------------------------------

# 30. Real Content Requirement

Figma must use realistic/actual content.

Avoid:

``` text
Lorem ipsum
John Doe
Sample Venue
Sample Image
```

Use:

``` text
RHEA & ERWIN
ANGELO & GICHELLE
10 FEBRUARY 2027
MELBOURNE
```

Also test long content such as:

``` text
THE SANTOS FAMILY
```

This catches layout issues before development.

------------------------------------------------------------------------

# 31. Image Specification

Every important image component should define:

-   Aspect ratio
-   Crop behavior
-   Object position
-   Radius
-   Maximum width
-   Mobile behavior
-   Desktop behavior

Example:

``` text
StoryHeroImage

Ratio: 4:5
Fit: cover
Position: center
Mobile: full width
Desktop: max 720px
```

Next.js should use the corresponding image behavior rather than
embedding arbitrary dimensions into each screen.

As built (2026-09-30), story and venue frames take each photo's own shape,
read at build time (`lib/photos.ts`, EXIF rotation included), clamped like
Instagram:

``` text
Tall portrait (9:16, 3:4)   trimmed to 4:5, cover, centre
Square → 1.91:1             shown whole
Wider than 1.91:1           trimmed to 1.91:1
Carousel                    every slide uses the first photo's shape
No photo                    placeholder: story 4:5, venue 3:2
Venue in portrait           height capped at 75% of the screen
```

Supply JPEG or WebP at full quality (no pre-conversion; `next/image`
resizes and serves WebP). Not HEIC. Frames never shift on load.

------------------------------------------------------------------------

# 32. Animation Specification in Figma

Figma should communicate animation intent, while Framer Motion
implements it.

Example:

``` text
Guest Name entrance

opacity:
0 → 1

Y:
12px → 0

duration:
600ms

easing:
ease-out

delay:
300ms
```

Implementation:

``` tsx
<motion.h1
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {guest.displayName}
</motion.h1>
```

The Figma design does not need to become the animation engine.

------------------------------------------------------------------------

# 33. Accessibility Requirements

Design and implementation should account for:

-   Readable text sizes
-   Adequate contrast
-   Keyboard focus states
-   Touch target sizes
-   Meaningful image alt text
-   Reduced-motion behavior
-   Visible focus states
-   Semantic HTML

Buttons and interactive controls should have states:

``` text
Default
Hover
Focus
Active
Disabled
```

------------------------------------------------------------------------

# 34. Component Architecture

Conceptual structure:

``` text
components/
├── Invitation/
│   ├── Opening/
│   ├── SectionHeader/
│   └── Closing/
│
├── Story/
│   ├── Timeline/
│   ├── TimelineEntry/
│   └── PhotoCarousel/
│
├── WeddingDay/
│   ├── EventCard/
│   └── Schedule/
│
├── Place/
│   ├── VenueCard/
│   ├── VenueArch/
│   └── VenueFilm/
│
├── Decor/
│   └── FloralCorners/
│
├── RSVP/
│   ├── Attendance/
│   ├── GuestSelection/
│   └── DietaryRequirements/
│
└── Theme/
```

Actual naming can be adjusted during implementation, but the conceptual
boundaries should remain.

------------------------------------------------------------------------

# 35. Application Architecture

Current structure:

``` text
wedding-invitation/
├── app/
│   ├── layout.tsx            fonts, theme script, metadata (noindex)
│   ├── page.tsx              generic landing (no guest details)
│   ├── not-found.tsx         "We couldn't find this invitation"
│   ├── robots.ts             disallow all crawlers
│   ├── globals.css           theme tokens + Tailwind
│   ├── actions/
│   │   └── rsvp.ts           RSVP server action → Google Sheets
│   └── invite/
│       └── [code]/
│           └── page.tsx      one prerendered page per guest
│
├── components/
│   ├── Invitation/           Opening, InvitationGate, SectionHeader,
│   │                         Photo, Closing
│   ├── Story/                Timeline, TimelineEntry, PhotoCarousel
│   ├── WeddingDay/           Schedule, EventCard, LiveStream
│   ├── Place/                VenueCard, VenueArch, VenueFilm
│   ├── Decor/                FloralCorners
│   ├── RSVP/                 RSVP
│   ├── Motion/               MotionProvider, Reveal
│   └── Theme/                theme, ThemeSwitcher
│
├── data/
│   ├── wedding.json
│   ├── guests.json
│   ├── story.json
│   ├── events.json
│   └── content.json
│
├── lib/
│   ├── wedding.ts            typed content + helpers
│   ├── guests.ts             guest lookup, validation, display names
│   ├── photos.ts             photo dimensions at build time → frame shape
│   └── youtube.ts            video ID from a YouTube link
│
├── scripts/
│   ├── add-guest.mts
│   ├── remove-guest.mts
│   └── generate-qrs.mts
│
├── docs/                     this handoff + context.md
├── proxy.ts                  lowercase codes → uppercase URL
├── public/images/            photos (story, venue)
├── public/decor/             floral corner artwork
├── background-flowers.png    source mockup for the floral corners
└── print/                    generated QRs (git-ignored)
```

Routing:

-   Every `/invite/CODE` page is prerendered at build time from
    `guests.json` (`generateStaticParams` + `dynamicParams = false`).
    Unknown codes return 404.
-   Lowercase codes redirect (308) to the uppercase URL.
-   `/admin` and `lib/github.ts` are not built yet (see §36).

------------------------------------------------------------------------

# 36. Admin

Optional admin page:

``` text
/admin
```

Potential functions:

-   Add guest
-   Edit guest
-   Disable invitation
-   Update wedding content
-   Update story entries
-   Update events
-   Update section configuration

Admin can server-side call the GitHub API to update JSON.

Do not expose GitHub credentials to the client.

Use server-side operations for repository writes.

------------------------------------------------------------------------

# 37. Security / Privacy

Important considerations:

-   Use opaque invitation codes
-   Do not put names in URLs
-   Avoid unnecessary guest PII
-   Keep GitHub credentials server-side
-   Validate invitation codes
-   Do not expose private repository credentials
-   Consider whether guest data should be publicly indexed
-   Add appropriate robots/indexing controls if needed
-   Do not expose RSVP responses publicly
-   Keep RSVP data outside GitHub where practical

The invitation code is a personalization mechanism, not a security
boundary.

If highly sensitive information is ever added, the architecture should
be reassessed.

------------------------------------------------------------------------

# 38. After-Wedding Evolution

Do not necessarily delete the site after the wedding.

It can evolve from an invitation into a wedding archive:

``` text
OUR STORY
     ↓
OUR WEDDING
     ↓
OUR PHOTOS
     ↓
THANK YOU
```

Potential future experience:

-   Wedding photos
-   Guest memories
-   Thank-you message
-   Ceremony archive
-   Selected reception moments

The original invitation should remain part of that history.

------------------------------------------------------------------------

# 39. Implementation Strategy

Do not design the entire Figma file and then disappear into development.

Use vertical slices.

## Slice 1

``` text
Figma:
Opening

↓

Next.js:
Opening

↓

Mobile test

↓

Desktop test
```

## Slice 2

``` text
Figma:
US

↓

Next.js:
US

↓

Test
```

## Slice 3

``` text
Figma:
THE DAY

↓

Next.js:
THE DAY

↓

Test
```

Continue through:

-   THE PLACE
-   RSVP
-   Closing

This allows design and implementation issues to be discovered early.

------------------------------------------------------------------------

# 40. Design-to-Code Contract

The most important development rule:

> **No important design element should exist in Figma without a clear
> implementation strategy.**

And:

> **No major React component should exist without a corresponding design
> definition.**

The intended chain is:

``` text
Figma Variables
      ↓
CSS Variables
      ↓
Tailwind
      ↓
React Components
      ↓
JSON Data
      ↓
Framer Motion
      ↓
Vercel
```

------------------------------------------------------------------------

# 41. Figma Component Contract

For each component, define:

``` text
Component name
Purpose
Variants
Properties
Typography
Colors
Spacing
Responsive behavior
Image behavior
States
Animation intent
Accessibility notes
```

Example:

``` text
GuestGreeting

Purpose:
Personalized invitation opening

Variants:
Individual
Couple
Family
Group

Themes:
Heritage
Editorial

Responsive:
Mobile
Desktop

Data:
Guest object

Motion:
Fade + 12px upward reveal

Accessibility:
Semantic heading structure
```

------------------------------------------------------------------------

# 42. Recommended Development Order

1.  Finalize visual foundations
2.  Create Figma variables
3.  Finalize typography
4.  Create monogram
5.  Create reusable Figma components
6.  Design mobile opening
7.  Design desktop opening
8.  Implement opening
9.  Design and implement US
10. Design and implement THE DAY
11. Design and implement THE PLACE
12. Design and implement RSVP
13. Design and implement closing
14. Add theme system
15. Add motion
16. Add guest routing
17. Add RSVP integration
18. Add admin
19. Security/privacy review
20. Accessibility review
21. Performance review
22. Vercel deployment
23. Physical invitation finalization
24. Generate recipient-specific QR codes from `guests.json`
25. Generate a print-ready QR reference sheet / package
26. Validate every QR target against its guest invitation route
27. Test QR scanning from final print artwork and verify every printed
    QR resolves to the correct guest invitation
28. Final end-to-end testing

------------------------------------------------------------------------

# 43. Current Product Maturity

Current conceptual status:

``` text
Core product concept       ~90%
Personalization            ~90%
Visual direction           ~80%
Story concept              ~90%
Animation direction        ~80%
Physical ↔ digital         ~85%
Information architecture   ~80%
Data architecture          ~75%
Technical architecture    ~80%
UI design                  ~40%
Implementation             basic end-to-end version working (unpolished)
```

Updated 2026-10-01. Every section is built and working with sample data;
real content (story photos, KBBQ venue, fonts, monogram, guest list) is
still being added. The next milestone is polishing section by section
alongside the Figma work, then connecting the real Google Sheet and
deploying to Vercel. Running status lives in `docs/context.md`.

------------------------------------------------------------------------

# 44. Final Design Audit Checklist

Before implementation is considered complete, review:

1.  First 10 seconds
2.  Emotional progression
3.  Guest personalization
4.  US timeline
5.  Photography system
6.  Typography
7.  Theme system
8.  Physical invitation
9.  Guest edge cases
10. RSVP
11. Performance
12. Accessibility
13. Security/privacy
14. Admin workflow
15. Developer signature
16. After-wedding archive

------------------------------------------------------------------------

# 45. Final Product Definition

The final invitation should feel like:

> A beautifully printed invitation that has learned how to move.

The guest should not feel like they are navigating a web application.

They should feel like they are:

**opening an invitation → discovering your story → seeing the day →
learning where it happens → deciding whether they can be there.**

The technical sophistication should support that feeling rather than
compete with it.

------------------------------------------------------------------------

# 46. Non-Negotiable Principles

1.  **The couple is the story.**
2.  **The guest is personally welcomed.**
3.  **The invitation comes before the website.**
4.  **The venue supports the story; it does not become the story.**
5.  **The KBBQ is part of THE DAY, not a competing centerpiece.**
6.  **The experience is primarily one-way and scroll-driven.**
7.  **Personalization comes from data, not duplicated templates.**
8.  **Content, theme, and behavior remain separate.**
9.  **Figma and Next.js share the same design vocabulary.**
10. **Mobile is the primary experience.**
11. **Animation is restrained.**
12. **RSVP collects only useful information.**
13. **The physical and digital invitations share one design language.**
14. **The developer identity is a signature, not the subject.**
15. **The system should remain maintainable after the wedding.**

------------------------------------------------------------------------

## Final Architecture Summary

``` text
                    WEDDING CONTENT
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
        JSON            THEME           GUEST
          │               │                │
          └───────────────┼────────────────┘
                          ↓
                    NEXT.JS APP
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
          Opening         US        THE DAY
                                        │
                                   Ceremony
                                      +
                                     KBBQ
                          │
                          ↓
                      THE PLACE
                          │
                          ↓
                         RSVP
                          │
                          ↓
                       CLOSING
                          │
                          ↓
                     VERCEL

                    DESIGN SYSTEM
                          ↑
                          │
                       FIGMA
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
     Foundations      Components       Screens
```

**Project north star:**

> **One invitation. Two mediums. One coherent experience.**
