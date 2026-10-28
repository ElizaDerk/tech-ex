# Research: Contact Form

## HubSpot submission endpoint

- **Decision**: `POST https://{HUBSPOT_API_HOST}/submissions/v3/integration/submit/{portalId}/{formGuid}`, using the unauthenticated variant, with `HUBSPOT_API_HOST=api-eu1.hsforms.com`.
- **Rationale**: HubSpot's v3 submit reference documents this path and says no authentication is required (`security: []`). The body is `{fields: [{objectTypeId, name, value}], context?, legalConsentOptions?}`. Responses are 200 on success, 400 with an `errors` array for bad fields, and 429 on rate limit.
- **Verification status**: the official reference lists only `api.hsforms.com` and does not mention `api-eu1.hsforms.com`. The EU host was verified with a real test submission (200 OK), so it is confirmed for this account.
- **Alternatives considered**: the authenticated `/secure/submit/` endpoint, which needs a private-app token and gives higher rate limits. Rejected: it adds a secret and the spec asks for only three env vars. The legacy v2 forms endpoint, which is deprecated.

Sources:
- https://developers.hubspot.com/docs/api-reference/legacy/marketing/forms/v3-legacy/submit-data-unauthenticated
- https://community.hubspot.com/t/forms-api-v3-returns-404-form-cant-be-found-despite-correct-portal-id-and-form-guid-in-eu-regio/156916

## Zod and React Hook Form

- **Decision**: `zod` with `react-hook-form` and `@hookform/resolvers/zod`. Install the latest compatible versions at implementation time and check the installed resolver's Zod support.
- **Rationale**: the constitution names RHF and Zod. The resolver is the standard way to share one schema between client and server.
- **Alternatives considered**: hand-written validation (violates single-source validation); server actions (the user asked for a route handler).

## Honeypot

- **Decision**: a visually hidden text input named `website`, with `tabIndex={-1}`, `autoComplete="off"` and `aria-hidden`. The server returns a success-shaped 200 and skips HubSpot.
- **Rationale**: it matches FR-006 and FR-007. `display:none` is skipped because some bots ignore hidden fields.
- **Alternatives considered**: time-based checks and CAPTCHA services (out of scope).

## Error handling

- **Decision**: a single mapping table (see plan). Only validation errors carry field details. Every CRM, network, timeout or config failure maps to one generic message.
- **Rationale**: satisfies FR-015 and SC-005.

## Vitest

- **Decision**: `vitest` as a dev dependency, `"test": "vitest run"`, and a minimal `vitest.config.ts` with the `@` alias and the node environment.
- **Rationale**: schema tests are pure functions and need no DOM or component test tooling.
- **Alternatives considered**: Jest (heavier TypeScript setup); Testing Library and Playwright (the user said no other tooling).
