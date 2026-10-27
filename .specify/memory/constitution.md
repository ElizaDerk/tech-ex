<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Modified principles: placeholders replaced with
  I. Clear Separation of Concerns, II. Type Safety & Single-Source Validation,
  III. Security by Default, IV. Accessibility & Performance, V. Simplicity
- Added sections: Technology Stack, Quality Gates & Workflow, Governance
- Removed sections: none
- Templates: none modified (templates read the constitution at runtime)
- Deferred TODOs: none
-->

# Bridges Landing Page Constitution

## Core Principles

### I. Clear Separation of Concerns

- Pages and layouts MUST live in `src/app`, reusable UI in `src/components`, static content in
  `src/data`, shared logic in `src/lib`, and Zod schemas in `src/schemas`.
- Components MUST only render UI. Route handlers MUST only handle requests and responses and
  delegate other logic to `src/lib`.
- Third-party services (including the CRM) MUST be called only from the server.
- Server components are the default; a client component is allowed only when interactivity
  requires it.
- Components and functions MUST have a single responsibility. Existing components MUST be reused
  before new ones are created, and code MUST NOT be duplicated.

Rationale: predictable locations and narrow responsibilities keep the codebase easy to navigate
and explain.

### II. Type Safety & Single-Source Validation

- TypeScript MUST run in strict mode. The type `any` MUST NOT be used.
- Each Zod schema MUST be defined once; its TypeScript type MUST be derived from it
  (`z.infer`), and the same schema MUST be used on both client and server.
- All user input MUST be validated on the server, regardless of client-side validation.
- Users MUST see friendly error messages. Internal errors and third-party responses MUST NOT be
  exposed. User input MUST be preserved when a request fails.

Rationale: one source of truth for data shape prevents client/server drift; server validation is
the only trustworthy boundary.

### III. Security by Default

- Secrets MUST live only in server-side environment variables and MUST NOT reach the client
  bundle.
- `.env` files MUST NOT be committed. `.env.example` MUST list every required variable and stay
  up to date.
- Every public form MUST include a honeypot field for spam protection.

Rationale: a public demo is still a public site; leaked keys or spam reach real third-party
accounts.

### IV. Accessibility & Performance

- The site MUST target WCAG 2.1 AA: semantic HTML, a label for every input, full keyboard
  navigation, visible focus states, and aria attributes that announce errors.
- Images MUST use `next/image`. Page metadata MUST use the Next.js Metadata API.

Rationale: accessibility and performance are baseline quality, not optional polish.

### V. Simplicity

- The author MUST be able to explain every line of code. The simplest solution that meets the
  spec MUST be preferred.
- Features, pages, fields, or libraries not present in a spec MUST NOT be added.
- A new dependency MUST be justified by a clear need that the existing stack cannot meet.

Rationale: the project is presented at a technical interview; unexplained or speculative code is
a liability.

## Technology Stack

- Framework: Next.js (App Router) with TypeScript in strict mode.
- Styling: Tailwind CSS.
- Forms and validation: React Hook Form with Zod.
- CRM: HubSpot, reached only through a server-side route handler.
- Package manager: npm. Hosting: Vercel.
- Tooling: ESLint, Prettier, Vitest.

Changes to this stack require a constitution amendment.

## Quality Gates & Workflow

- `package.json` MUST provide the scripts `lint`, `lint:fix`, `format`, and `format:check`.
- Prettier MUST use the root `.prettierrc` as is.
- A task is done only when `npm run lint` and `npm run format:check` pass.
- Every Zod schema MUST have Vitest unit tests.
- Committed code MUST NOT contain `console.log` debugging statements.

## Governance

- This constitution supersedes other practices. Every spec, plan, and task list MUST be checked
  against it, and any deviation MUST be justified in the plan's complexity tracking.
- Amendments are made by editing this file with a stated rationale and a version bump:
  MAJOR for removed or redefined principles, MINOR for new principles or sections, PATCH for
  wording clarifications.
- Compliance is reviewed before a feature is considered complete.

**Version**: 1.0.0 | **Ratified**: 2026-10-27 | **Last Amended**: 2026-10-27
