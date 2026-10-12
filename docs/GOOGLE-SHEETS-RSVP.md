# RSVP → Google Sheets

How RSVP replies get from the invitation into a Google Sheet, with an email
for each one. This is the full reference: how it works, how to set it up
again from nothing, how to test it, and what went wrong the first time.

Connected and working since 2026-10-13. Last updated: 2026-10-13.

------------------------------------------------------------------------

## What it does

- Every reply a guest sends is added as a new row in a Google Sheet.
- You get a short email for each reply, if you want one.
- The guest only sees "thank you" once the sheet has confirmed the row was
  saved. A failed save shows them an error and asks them to try again.

The sheet is the record; the email is only the alert. Replies never go
into GitHub or the website's own files.

## How a reply travels

```text
Guest presses "Send RSVP"
        ↓
Website (app/actions/rsvp.ts)
  checks the invitation code and that the names belong to it
        ↓  sends the reply + a shared secret
Google Apps Script web app (scripts/rsvp-sheet.gs)
  checks the secret, appends the row, emails a summary
        ↓  answers "ok"
Website shows the thank-you
```

| Piece | Where it lives |
|---|---|
| The form | `components/RSVP/RSVP.tsx` |
| The website's side | `app/actions/rsvp.ts` |
| The script, as pasted into Google | `scripts/rsvp-sheet.gs` |
| The script's address and the secret | `.env.local` on your Mac (never in git); Vercel's environment variables once deployed |
| The sheet, the script and its settings | Angelo's personal Google account |

## What is saved

One row per submission, in these columns. The script writes the header row
itself the first time.

| Column | Example | Notes |
|---|---|---|
| `submittedAt` | `2026-10-12T16:59:03Z` | Universal time (UTC), not local time |
| `code` | `7XK92M` | The invitation code |
| `invitation` | `Rhea, Erwin` | Everyone named on the invitation |
| `attending` | `TRUE` | `FALSE` for a no |
| `attendingGuests` | `Rhea, Erwin` | Only the names that were ticked; empty for a no |
| `attendingCount` | `2` | `0` for a no |
| `dietary` | | Only asked after a yes |
| `message` | | Optional, up to 500 characters |

A guest can change their answer. Each submission is a new row, so the
**latest row for a code is the current answer** and the earlier rows are
its history.

The email's subject reads like
`RSVP: Rhea, Erwin - yes, 2 coming (Rhea, Erwin)`, with the invitation,
answer, dietary note and message in the body.

------------------------------------------------------------------------

## Setting it up from nothing

About ten minutes, all in a browser. Use a **private window signed in to
only the Google account that will own the sheet** (see "Problems" below
for why).

### 1. Create the sheet

1. Go to https://sheets.new.
2. Name it, for example "Wedding RSVPs".
3. Rename the tab at the bottom to exactly `RSVPs` (capital R-S-V-P, small
   s, nothing after it).

### 2. Add the script

1. In the sheet: Extensions → Apps Script.
2. Delete what is in the editor.
3. Put the project's script on the clipboard exactly as written:

   ```bash
   pbcopy < scripts/rsvp-sheet.gs
   ```

4. Paste (Cmd+V) and save (Cmd+S).

Don't copy the code out of a terminal or a rendered page; that is what
caused the syntax error the first time.

### 3. Add the secret and your email

1. Apps Script's left-hand strip of icons → the gear at the bottom
   (**Project Settings**) → scroll to **Script Properties** at the bottom.
2. Add two properties and save:

| Property | Value |
|---|---|
| `SECRET` | A long random string. To make one: `openssl rand -hex 24` |
| `NOTIFY_EMAIL` | Where the emails go. Several addresses can be separated by commas. Leave it out for no emails. |

### 4. Give it permission

1. Back in the editor (the `< >` icon), choose `authorize` in the function
   dropdown above the code and click **Run**.
2. Choose the account. Google says the app isn't verified, which is normal
   for your own script: **Advanced** → **Go to (project name)** →
   **Allow**.

The log should show "Execution started" then "Execution completed".

### 5. Publish it

1. **Deploy** → **New deployment** → gear icon → **Web app**.
2. **Execute as:** Me.
3. **Who has access:** **Anyone**. Not "Anyone with Google account".
4. **Deploy**, then copy the **Web app URL**. It ends in `/exec`.

"Anyone" is safe: the script ignores every request that doesn't carry the
secret.

### 6. Connect the website

Put both values in `.env.local` at the top of the project:

```bash
RSVP_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
RSVP_WEBHOOK_SECRET=the same string as the SECRET property
```

`npm run dev` reloads the file by itself. When the site is deployed, add
the same two values to Vercel's environment variables, or the deployed
site will refuse RSVPs.

------------------------------------------------------------------------

## Testing it

### Straight at the script

This proves the Google side without the website. Run it from the project
folder; it reads the address and secret from `.env.local`.

```bash
set -a; source .env.local; set +a
curl -sL -H "Content-Type: application/json" \
  -d "{\"secret\":\"$RSVP_WEBHOOK_SECRET\",\"submittedAt\":\"$(date -u +%FT%TZ)\",\"code\":\"TEST01\",\"invitation\":\"TEST (safe to delete)\",\"attending\":true,\"attendingGuests\":\"Test Guest\",\"attendingCount\":1,\"dietary\":\"\",\"message\":\"setup check\"}" \
  "$RSVP_WEBHOOK_URL"
```

| Answer | Meaning |
|---|---|
| `ok` | Working. A row was added and an email sent. |
| `forbidden` | The address is right but the secret doesn't match the `SECRET` property. |
| A web page, with status 401 | The deployment needs a sign-in. "Who has access" is not the plain **Anyone**. |

### Through the website

Open an invitation, send an RSVP, and check for the thank-you, the new row
and the email. Delete test rows afterwards.

### Automatically

`npm test` covers the form's behaviour (yes, no, who is coming, validation,
a failed save) without touching the real sheet: the tests point the site
at a stand-in, `tests/support/sheet-stub.mjs`, which answers the way the
real script does. See "Tests" in the README.

------------------------------------------------------------------------

## Problems we hit, and their fixes

| What you see | Cause | Fix |
|---|---|---|
| `SyntaxError: Invalid or unexpected token` when saving the script | The code was copied from the terminal, which altered a long dash and backtick quotes | Use `pbcopy < scripts/rsvp-sheet.gs`. The file is plain ASCII on purpose. |
| "An unknown error has occurred, please try again later" when running a function | The browser is signed in to several Google accounts | Use a private window with only the sheet's account |
| "Sorry, the file can't be opened at this time" when opening the `/exec` address | Same account mix-up, or the deployment isn't public | You don't need to open the address in a browser; test it with the command above |
| The website shows "Something went wrong sending your RSVP", and the address answers 401 | "Who has access" is "Anyone with Google account" | Edit the deployment and choose the plain **Anyone** |
| The script was changed but nothing is different | The published version is still the old one | Deploy → Manage deployments → pencil → Version: **New version** → Deploy |
| A new address after every fix | "New deployment" was used instead of editing | Edit the existing deployment to keep its address; otherwise update `.env.local` (and Vercel) with the new one |
| Rows arrive but no email | `NOTIFY_EMAIL` isn't saved, or the mail went to spam | Check Script Properties, then the spam folder |

------------------------------------------------------------------------

## Looking after it

- **Changing the script:** edit `scripts/rsvp-sheet.gs` in the project
  first, paste it into Apps Script, then publish a new version of the
  existing deployment so the address stays the same.
- **Changing who gets the emails:** edit `NOTIFY_EMAIL` in Script
  Properties. No redeploy needed.
- **Turning emails off:** delete `NOTIFY_EMAIL`. Rows keep being saved.
- **Closing RSVPs:** archive the deployment under Manage deployments. The
  website then shows guests an error instead of a thank-you.
- **Old deployments:** the first two, made while setting up, required a
  sign-in and are unused. They can be archived.
- **Changing the secret:** change it in Script Properties, in `.env.local`
  and in Vercel together, or replies will be answered "forbidden".

## Limits and safety

- **Email limit:** a personal Gmail account can send about 100 emails a day
  from a script. If that were ever passed, the email is skipped but the
  row is still saved; a failed email never loses a reply.
- **No expiry:** it keeps working until the sheet, script or deployment is
  removed, or the script's permission is withdrawn in the Google account.
- **What the script can do:** append to this sheet and send email from the
  owner's account. It doesn't read mail.
- **The secret and the address are private.** They live in `.env.local`
  and Vercel only. Don't put them in git, in this file, or in a chat.
- **The website re-checks every reply** before sending it: the code must
  exist and the names must belong to that invitation, so the sheet can't
  be filled with made-up guests even by someone calling the site directly.
- **Without an address set:** `npm run dev` only logs replies to the
  terminal, and a production build refuses them rather than dropping them
  silently.

## Still to do

- Add `RSVP_WEBHOOK_URL` and `RSVP_WEBHOOK_SECRET` to Vercel when the site
  is deployed, then send one real test RSVP from the live site.
- Delete the test rows (`TEST01`, and the sample guest's test reply).
- Optional: show `submittedAt` in Melbourne or Manila time, either in the
  script or with a formula column in the sheet.
