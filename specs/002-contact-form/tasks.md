---

description: "Task list for the Contact Form feature"
---

# Tasks: Contact Form

**Input**: Design documents from `/specs/002-contact-form/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/contact-api.md, quickstart.md

**Tests**: The plan requires Vitest unit tests for the Zod schema only (`src/schemas/contact.test.ts`). No other test tooling is added.

**Organization**: The spec has a single user story (US1, P1). Setup and Foundational phases hold the shared pieces; US1 holds the form, route handler and HubSpot integration.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 for user story tasks
- Paths are relative to the repository root. Single Next.js project; source in `src/`.

## Constitution rules that apply to every task

- TypeScript strict, no `any`, no `console.log`.
- Tabs for indentation and single quotes, matching existing files (run `npm run format` before finishing).
- Visible text lives in `src/data`, never inline in components.
- Secrets are read server-side only (no `NEXT_PUBLIC_` prefix).
- Each task is done only when npm run lint and npm run format:check pass.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, test runner and environment template

- [ ] T001 Install runtime dependencies with `npm install react-hook-form zod @hookform/resolvers`, updating `package.json` and `package-lock.json`. Check that the installed `@hookform/resolvers` version supports the installed `zod` major version.
- [ ] T002 Install the dev dependency with `npm install -D vitest`, and add `"test": "vitest run"` to the `scripts` in `package.json`.
- [ ] T003 [P] Create `vitest.config.ts` at the repo root: node environment, and an alias mapping `@` to `./src` (use `path.resolve` or `fileURLToPath`), matching the `@/*` alias in `tsconfig.json`.
- [ ] T004 [P] Create `.env.example` at the repo root with exactly three lines and empty values: `HUBSPOT_PORTAL_ID=`, `HUBSPOT_FORM_ID=`, `HUBSPOT_API_HOST=`. Do not add a `NEXT_PUBLIC_` prefix. (`.gitignore` already ignores `.env*` and keeps `!.env.example`; verify with `git check-ignore -v .env.example` that it is NOT ignored.)

**Checkpoint**: `npm run test` runs (it may report "no test files" until T008).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The single validation schema and the form content types that the client, the server and the tests all depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create `src/schemas/contact.ts` exporting `contactSchema` (Zod) and `export type ContactInput = z.infer<typeof contactSchema>`. Fields, with constraints quoted from data-model.md:
  - `firstName`: "trimmed, at least 1 character" (whitespace-only counts as empty). Issue message key `firstName.required`.
  - `lastName`: "trimmed, at least 1 character". Issue message key `lastName.required`.
  - `email`: "trimmed, valid email format". Empty gives key `email.required`; bad format gives key `email.invalid`.
  - `phone`: optional string; "empty allowed; otherwise only digits, spaces, `+`, `-`, `(`, `)`, length 7 to 20". Use the regex `^[0-9\s+\-()]+$` and length 7 to 20 for non-empty values. Issue message key `phone.invalid` for both the character and the length failure.
  - `message`: "trimmed, 10 to 1000 characters". Under 10 (including empty) gives key `message.tooShort`; over 1000 gives key `message.tooLong`.
  - `website` (honeypot): optional string with no restrictions. The schema must NOT reject a filled honeypot.
  - Validation messages are stable message keys (as above), never English text, and are set as the Zod issue `message`.
  - Every required field (`firstName`, `lastName`, `email`, `message`) MUST return its message key both for an empty or whitespace-only string AND when the field is missing or not a string (`undefined`), so a request body like `{}` produces only keys in `fieldErrors` (set the `required_error` / `invalid_type_error` equivalent for the installed Zod version, e.g. via the `error` param in Zod 4).
- [ ] T006 [P] Add the `ContactFormContent` type to `src/data/types.ts` describing the static form copy: field labels (firstName, lastName, email, phone, message), hints (at least phone and message, e.g. allowed phone characters and message length), placeholders if used, `submitLabel`, `submittingLabel`, `successTitle`, `successText`, `genericError`, and `errorMessages: Record<string, string>` (message key to English text). Do not change the existing `ContactContent` type.

**Checkpoint**: Schema and content type exist; user story work can begin.

---

## Phase 3: User Story 1 - Send a message to the company (Priority: P1) 🎯 MVP

**Goal**: A visitor fills in the form in the contact section, it is validated on client and server, forwarded to HubSpot by the server, and the visitor sees a confirmation or a friendly error with their values kept.

**Independent Test**: Follow `specs/002-contact-form/quickstart.md`: empty submit shows field errors; invalid email, phone and message lengths show their own errors with values kept; a valid submit shows loading then the confirmation and the contact appears in HubSpot; a blank `HUBSPOT_PORTAL_ID` shows the generic error with values kept; `curl` with `{}` returns 400 `fieldErrors`; `curl` with a filled `website` returns 200 and nothing reaches HubSpot.

### Tests for User Story 1

- [ ] T007 [US1] Create `src/schemas/contact.test.ts` (Vitest, `import {describe, it, expect} from 'vitest'`, schema imported via `@/schemas/contact`) with cases: valid data parses; each required field empty (`firstName`, `lastName`, `email`, `message`) fails with the matching key; each required field missing (`undefined`) fails with the same key, and `{}` yields only message keys for those four fields; whitespace-only `firstName`, `lastName`, `email` and `message` fail; invalid email fails with `email.invalid`; empty `phone` is accepted and `phone` omitted is accepted; phone with letters fails with `phone.invalid`; phone lengths 6 (fail), 7 (pass), 20 (pass), 21 (fail), using only allowed characters; message lengths 9 (fail `message.tooShort`), 10 (pass), 1000 (pass), 1001 (fail `message.tooLong`); honeypot filled: parse succeeds and the parsed data exposes `website` with the value. Run `npm run test` and make it pass.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Edit `src/data/contact.ts` to export a `contactForm: ContactFormContent` object (import the type from `./types`) with all English form copy: labels (First name, Last name, Email, Phone (optional), Message), hints, button label ("Send message"), loading label ("Sending..."), success title and text ("Your message was sent..."), the generic error text ("Something went wrong. Please try again."), and `errorMessages` with one entry for EACH key used in T005: `firstName.required`, `lastName.required`, `email.required`, `email.invalid`, `phone.invalid`, `message.tooShort` (mention at least 10 characters), `message.tooLong` (mention at most 1000 characters). Messages must tell the visitor what to fix. Leave the existing `contact` and `contactId` exports unchanged.
- [ ] T009 [P] [US1] Create `src/lib/hubspot.ts` exporting `submitToHubspot(data: ContactInput): Promise<void>` and a typed `HubspotError` class extending `Error`. Behavior from plan.md:
  - Read `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID`, `HUBSPOT_API_HOST` from `process.env` inside the function; if any is missing or empty, throw `HubspotError`.
  - `POST` to `https://{HUBSPOT_API_HOST}/submissions/v3/integration/submit/{HUBSPOT_PORTAL_ID}/{HUBSPOT_FORM_ID}` with `Content-Type: application/json`, no auth header, no `context`, no `legalConsentOptions`.
  - Body: `{fields: [{objectTypeId: '0-1', name, value}]}` with mapping `firstName→firstname`, `lastName→lastname`, `email→email`, `phone→phone`, `message→message`. Omit the `phone` field when it is empty or undefined. Never send `website`.
  - Use `signal: AbortSignal.timeout(10000)`.
  - Throw `HubspotError` for a non-2xx response, a network error, or a timeout. Never include the HubSpot response body in the error message.
  - No `console.log`, no `any`.
- [ ] T010 [P] [US1] Create `src/lib/contact-errors.ts`: the single error-to-response table from plan.md. Export code constants/type for `validation_failed`, `invalid_request` and `submission_failed` with their HTTP statuses (400, 400, 502). Codes only; no user-facing text (text lives in `src/data/contact.ts`).
- [ ] T011 [US1] Create `src/app/api/contact/route.ts` exporting `POST(request: Request)`. Request/response handling only; delegate to `src/lib`. Steps, in order:
  1. Parse `request.json()`; if it throws, return 400 `{error: 'invalid_request'}`.
  2. `contactSchema.safeParse`; on failure return 400 `{error: 'validation_failed', fieldErrors: {<field>: <message key>}}` using the first issue message per field (keys, not text).
  3. If `website` is non-empty, return 200 `{ok: true}` without calling HubSpot.
  4. `await submitToHubspot(data)`; on success return 200 `{ok: true}`; on any thrown error return 502 `{error: 'submission_failed'}`.
  - Never return HubSpot output, stack traces or internal messages. No `console.log`. Use `contact-errors.ts` for codes and statuses. (Depends on T005, T009, T010.)
- [ ] T012 [US1] Create `src/components/ContactForm.tsx` as a `'use client'` component (default export style: match `src/components/*.tsx`, which use named exports). (Depends on T005, T008, T011.)
  - `useForm<ContactInput>({resolver: zodResolver(contactSchema)})`, form has `noValidate`.
  - Fields: firstName, lastName, email (`type="email"`), phone (`type="tel"`), message (`<textarea>`), each with a visible `<label htmlFor>`, optional hint `<p id="{field}-hint">`, and an error `<p id="{field}-error">` rendered when invalid. Set `aria-describedby` to the hint and error ids that exist and `aria-invalid` on each input. Resolve error text via `contactForm.errorMessages[error.message]`.
  - Honeypot: input named `website` wrapped in a visually hidden element (use Tailwind `sr-only`-style absolute positioning, NOT `display:none`), `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden="true"`, with a plain label text from `src/data` or no visible label.
  - Submit: `fetch('/api/contact', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(values)})`. While `isSubmitting` the button is `disabled` and shows `submittingLabel`.
  - On 400 with `fieldErrors`, call `setError(field, {message: key})` for each. On any other non-OK response or a thrown fetch error, show `genericError`. Never reset the form on failure.
  - On `{ok: true}`, replace the form with the success title and text.
  - One `<div role="status" aria-live="polite">` that is always mounted and holds the submit-level result (success or generic error). Do not use `role="alert"` on field errors.
  - Visible focus states on all controls (Tailwind `focus-visible:` ring/outline). Style with Tailwind to match the existing sections; all strings from `contactForm`.
- [ ] T013 [US1] Edit `src/app/page.tsx` to render `<ContactForm />` as the children of `<ContactSection {...contact} />` (add the import `@/components/ContactForm`). Do not change any other section or `ContactSection.tsx`.

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and quickstart validation

- [ ] T014 Run `npm run format` then `npm run lint` and `npm run format:check`; fix all issues in the new and edited files.
- [ ] T015 Run `npm run test` and `npm run build`; fix any type errors (strict mode, no `any`).
- [ ] T016 Run through every check in `specs/002-contact-form/quickstart.md` (items 3 to 8) with a real `.env.local`: empty submit, bad inputs, valid submit, failure path with blank `HUBSPOT_PORTAL_ID`, `curl` validation and honeypot calls, keyboard-only pass (honeypot skipped), and confirm `.env.local` is untracked and no HubSpot values appear in the client bundle (`grep -r HUBSPOT .next/static` returns nothing).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 before T002 (both edit `package.json`/lockfile); T003 and T004 are independent.
- **Foundational (Phase 2)**: Needs T001 (zod installed). T005 and T006 are independent.
- **User Story 1 (Phase 3)**: Needs Phase 2.
- **Polish (Phase 4)**: Needs US1 complete.

### Within User Story 1

- T007 (tests) needs T005 and T002/T003.
- T008, T009, T010 are independent of each other (T009 needs T005 for the `ContactInput` type; T008 needs T006).
- T011 needs T005, T009, T010.
- T012 needs T005, T008, T011 (the API shape).
- T013 needs T012.

### Parallel Opportunities

- T003 and T004 together after T002.
- T005 and T006 together.
- T007, T008, T009, T010 together once Phase 2 is done.

```text
# After Phase 2:
Task: "Schema tests in src/schemas/contact.test.ts"        (T007)
Task: "Form copy in src/data/contact.ts"                    (T008)
Task: "HubSpot client in src/lib/hubspot.ts"                (T009)
Task: "Error table in src/lib/contact-errors.ts"            (T010)
```

---

## Implementation Strategy

### MVP First (User Story 1 is the whole MVP)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1
4. **STOP and VALIDATE** with quickstart.md
5. Phase 4: Polish, then open the PR

### Notes

- Commit after each logical group (setup, schema + tests, integration, UI).
- The honeypot test asserts only that the schema accepts it; the drop happens in the route handler (T011).
- Do not add rate limiting, extra fields, extra libraries or extra test tooling (constitution V).
