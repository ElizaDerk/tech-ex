# Implementation Plan: Contact Form

**Branch**: `002-contact-form` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-contact-form/spec.md`

## Summary

Add a contact form to the existing `ContactSection` (through its `children` slot). A client component uses React Hook Form with the Zod resolver. It calls `src/lib/send-contact.ts`, which posts JSON to a thin route handler at `/api/contact`. The handler validates the body with the same Zod schema and silently drops honeypot hits. For valid input it calls `src/lib/hubspot.ts`, which submits to the HubSpot Forms API v3 on the EU host. Errors map to friendly messages through one table. Only the Zod schema gets Vitest unit tests.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.3, Next.js 16.4 (App Router)

**Primary Dependencies**: Tailwind CSS 4 (installed); `react-hook-form`, `zod`, `@hookform/resolvers` (new, required by the constitution's stack); `vitest` (new, dev)

**Storage**: N/A (data goes to HubSpot only)

**Testing**: Vitest unit tests for `src/schemas/contact.ts` only. No other test tooling.

**Target Platform**: Vercel (Node.js runtime for the route handler)

**Project Type**: Web application, a single Next.js project

**Performance Goals**: Confirmation within 5 seconds under normal conditions (SC-001). A 10-second server-side timeout on the HubSpot call is an assumption (see below).

**Constraints**: Secrets are server-side only (no `NEXT_PUBLIC_` prefix). No `any`, no `console.log`. `npm run lint` and `npm run format:check` must pass.

**Scale/Scope**: One form, one endpoint, one integration module

## Constitution Check

*Gate: passed before Phase 0 and re-checked after Phase 1.*

| Principle | Status | How the plan complies |
|-----------|--------|-----------------------|
| I. Separation of concerns | Pass | Schema in `src/schemas`; form in `src/components`; text in `src/data`; HubSpot logic in `src/lib/hubspot.ts`; the client `fetch` in `src/lib/send-contact.ts`, so the component only renders UI and handles interaction; route handler only does request and response. The honeypot check and the `fieldErrors` mapping stay in the route handler as request/response handling. The client component is needed for interactivity. `ContactSection` is reused, not replaced. |
| II. Type safety & single-source validation | Pass | One schema, type derived with `z.infer`, used by the client resolver and the route handler. Server validates all input. Messages are friendly, and values are kept on failure. |
| III. Security by default | Pass | Three env vars read server-side only. `.env.example` added; `.gitignore` already ignores `.env*` and keeps `!.env.example`. Honeypot included. |
| IV. Accessibility & performance | Pass | Labels, `aria-describedby`, `aria-invalid`, an `aria-live` region, and visible focus states. |
| V. Simplicity | Pass | New dependencies are those the constitution's stack names (RHF, Zod, Vitest) plus `@hookform/resolvers`. This is the standard bridge between RHF and Zod and has no simpler alternative. No rate limiting or extras. |

Complexity Tracking: no violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-contact-form/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── contact-api.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/contact/route.ts      # NEW: request/response only
│   └── page.tsx                  # EDIT: pass <ContactForm /> as children of ContactSection
├── components/
│   ├── ContactSection.tsx        # unchanged (id="contact" and heading kept)
│   └── ContactForm.tsx           # NEW: client component
├── data/
│   ├── contact.ts                # EDIT: add form copy (labels, hints, button, messages)
│   └── types.ts                  # EDIT: add ContactFormContent type
├── lib/
│   ├── hubspot.ts                # NEW: HubSpot Forms API call and field mapping
│   ├── send-contact.ts           # NEW: client-side fetch to /api/contact
│   └── contact-errors.ts         # NEW: error-to-message table (codes only; text lives in src/data)
└── schemas/
    ├── contact.ts                # NEW: Zod schema and ContactInput type
    └── contact.test.ts           # NEW: Vitest tests
.env.example                      # NEW: three names, empty values
package.json                      # EDIT: deps and "test" script
vitest.config.ts                  # NEW: minimal config with the "@" alias
```

**Structure Decision**: single Next.js project following the constitution's directory layout. `src/lib` and `src/schemas` are new directories; everything else extends existing files.

## Design Decisions

### Schema (`src/schemas/contact.ts`)

- `firstName`, `lastName`: trimmed, min 1 (whitespace-only counts as empty).
- `email`: trimmed, valid email format.
- `phone`: optional, trimmed first. An empty string is accepted. Otherwise it must match `^[0-9\s+\-()]+$`, contain at least one digit, and be 7 to 20 characters.
- `message`: trimmed, 10 to 1000 characters.
- `contact_hp` (honeypot): optional string. The schema only declares it; the route handler decides what to do when it is filled. The honeypot is not rejected by the schema, so a bot gets no validation signal. The unit test for the "filled honeypot" case asserts the schema parses it and the value is exposed, so the handler can check it.
- `export type ContactInput = z.infer<typeof contactSchema>`.
- Validation messages are not hard-coded in the schema. Schema issues carry stable message keys (for example `firstName.required`). One `errorMessages` object in `src/data/contact.ts` maps each key to its English text. The server returns the keys in `fieldErrors`, and the form resolves them through `errorMessages`.

### Form (`src/components/ContactForm.tsx`)

- `'use client'`, `useForm<ContactInput>({resolver: zodResolver(contactSchema)})`, with `noValidate` so Zod owns validation.
- Each field: visible `<label>`, hint (where defined), error `<p id="{field}-error" role="alert">`, with `aria-describedby` pointing to the hint and error ids and `aria-invalid` set.
- Honeypot: a visually hidden wrapper (not `display:none`), `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`.
- Submit: calls `sendContact(values)` from `src/lib/send-contact.ts` (which does `fetch('/api/contact', POST, JSON)` and returns a typed result: success, field errors, or failure). While `isSubmitting`, the button is disabled and shows the loading label.
- Server field errors (400) are applied with `setError`. Other failures show the generic message. The form is never reset on failure, so values are kept.
- Success: the form is replaced by the confirmation text.
- One `aria-live="polite"` region (`role="status"`) is always mounted and holds the submit-level result (success or generic error). Each field error paragraph has `role="alert"`, so it is announced when it appears, and it is also linked to its input by `aria-describedby`.
- All strings come from `src/data/contact.ts`, including validation messages looked up by key in `errorMessages`.

### Route handler (`src/app/api/contact/route.ts`)

1. Parse the JSON body. A malformed body gets 400 `invalid_request`.
2. `contactSchema.safeParse`. Failure gets 400 with `{fieldErrors}`.
3. If the honeypot is non-empty, return `200 {ok: true}` without calling HubSpot.
4. `await submitToHubspot(data)`. Success gets `200 {ok: true}`. Any thrown error gets `502 {error: 'submission_failed'}`.
5. No internal detail is ever returned. On a HubSpot failure the handler calls `console.error` with only a sanitized error code (for example `hubspot_non_2xx`, `hubspot_timeout`, `hubspot_config_missing`), never the HubSpot response body, the error message or any personal data. `console.log` is not used.

The honeypot check and the `fieldErrors` mapping stay in the route handler because they are request/response handling (deciding what to answer), not business or integration logic.

### HubSpot client (`src/lib/hubspot.ts`)

- URL: `https://{HUBSPOT_API_HOST}/submissions/v3/integration/submit/{HUBSPOT_PORTAL_ID}/{HUBSPOT_FORM_ID}`, with `HUBSPOT_API_HOST=api-eu1.hsforms.com`.
- `POST`, JSON, no auth header (the unauthenticated endpoint; see research.md).
- Body: `{fields: [{objectTypeId: '0-1', name, value}]}`. No `context` is sent (no `pageUri` or `pageName`). `phone` is omitted when empty.
- Field mapping: `firstName→firstname`, `lastName→lastname`, `email→email`, `phone→phone`, `message→message`.
- Throws a typed error carrying a sanitized `code` on missing env vars, a non-2xx response, a network error, or a timeout (`AbortSignal.timeout`). The route handler maps every one of these to the generic failure.

### Error mapping table

| Condition | Source | HTTP | Visitor sees |
|-----------|--------|------|--------------|
| Field fails schema (required, email, phone, length) | Zod, client and server | 400 `fieldErrors` | The field-level message next to that field |
| Malformed or non-JSON body | Route handler | 400 | Generic message |
| Honeypot filled | Route handler | 200 | Nothing (looks like success) |
| HubSpot 4xx, 5xx, or 429 | `hubspot.ts` | 502 | Generic "try again" message |
| Network error or timeout | `hubspot.ts` | 502 | Generic "try again" message |
| Missing env vars | `hubspot.ts` | 502 | Generic "try again" message |
| `fetch` to `/api/contact` fails in the browser | Form | n/a | Generic "try again" message; values kept |

### Tests (`src/schemas/contact.test.ts`)

Valid data; each required field missing; whitespace-only required fields; invalid email; phone empty (accepted); invalid phone characters; phone made only of spaces or hyphens (rejected); phone length 6, 7, 20, 21; message length 9, 10, 1000, 1001; honeypot filled. `package.json` gets `"test": "vitest run"`.

## Assumptions

- The HubSpot form uses the Forms API v3 unauthenticated submit endpoint and has the five fields on it (`firstname`, `lastname`, `email`, `phone`, `message`). The field names are confirmed by the user.
- `api-eu1.hsforms.com` is the correct host for this account. HubSpot's official reference documents only `api.hsforms.com`, but the EU host was verified with a real test submission (200 OK), so the form works with the v3 submit endpoint.
- `objectTypeId` `0-1` (contacts) is used for every field.
- Node runtime (the default) and the global `fetch` are sufficient. No HubSpot SDK is added.
- A 10-second timeout on the HubSpot call is acceptable.
- The honeypot field is named `contact_hp`, a name browser autofill does not match. It is visually hidden, not `display:none`, so simple bots still fill it.
- No `legalConsentOptions` are sent. The spec has no consent checkbox.
- Env vars are set in Vercel project settings. `.env.local` is used locally and never committed.
- Visible text is English only.

## Open Questions

None.
