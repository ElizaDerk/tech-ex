# Quickstart: Validating the Contact Form

## Prerequisites

- `npm install`
- Copy `.env.example` to `.env.local` (never commit it) and fill in `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID`, `HUBSPOT_API_HOST` (`api-eu1.hsforms.com`).

## Checks

1. `npm run test`: all schema tests pass.
2. `npm run lint` and `npm run format:check`: both pass.
3. `npm run dev`, open `/#contact`:
   - Submit empty: field errors appear next to each required field and are announced by a screen reader. Values stay.
   - Enter a bad email, a bad phone (6 or 21 characters, letters) and a message of 9 or 1001 characters: each shows its own error.
   - Submit valid data (phone empty): the button disables with a loading state, then the confirmation replaces the form, and the contact appears in HubSpot.
4. Failure path: blank `HUBSPOT_PORTAL_ID` and restart. A valid submit shows the generic error, values remain, and no internal text appears.
5. Server validation: `curl -X POST localhost:3000/api/contact -H 'Content-Type: application/json' -d '{}'` returns 400 with `fieldErrors`.
6. Honeypot: `curl` with a valid body plus `"contact_hp":"x"` returns 200 and nothing appears in HubSpot.
7. Keyboard: tab through every field and the button with visible focus. Confirm the honeypot is skipped.
8. Accessibility: run a Lighthouse accessibility audit on `/#contact` (Chrome DevTools, no new tooling) and fix any issue in the form area. Then do one VoiceOver pass over the form: submit empty and confirm each field error is announced as it appears, and that labels, hints and the loading and success messages are read.
9. Confirm `.env.local` is untracked (`git status`) and the secrets do not appear in the browser bundle.
