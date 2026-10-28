# Implementation Plan: Landing Page Layout

**Branch**: `001-layout` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-landing-page-layout/spec.md`

## Summary

A single-route, fully static one-page landing for a fictional bridge construction company: Hero, Services, Projects,
WorkStages, ContactSection (placeholder), Footer. Built as a Next.js App Router app (TypeScript strict, Tailwind CSS,
npm) using server components only. All visible text and image metadata live in typed constants in `src/data`; section
components in `src/components` receive that content and hold no hard-coded text. The hero CTA is a plain
`<a href="#contact">`; scrolling is handled by CSS (`scroll-behavior: smooth` and `scroll-margin-top`), with no scroll
JavaScript. Layout is mobile-first (one column below `md`, multi-column from `md`). The repository has no application
yet, so the first tasks scaffold and configure tooling (Next.js, Tailwind, ESLint flat config, Prettier) before any
feature code.

## Technical Context

**Language/Version**: TypeScript (strict) on Node.js 20.19 (installed locally); Next.js latest stable (App Router),
React 19

**Primary Dependencies**: `next`, `react`, `react-dom`, `tailwindcss` (+ `@tailwindcss/postcss`), `typescript`,
`eslint`, `eslint-config-next`, `typescript-eslint`, `eslint-config-prettier`, `prettier`, `prettier-plugin-tailwindcss`. No other runtime
dependencies (Constitution V).

**Storage**: N/A. Content is static typed constants; images are local files in `public/images`.

**Testing**: None in this feature (no validation logic, per the request). Verification is `npm run lint`,
`npm run format:check`, `npm run build`, and a manual responsive and keyboard check. Vitest is part of the project
stack but is introduced with the first Zod schema (the contact form feature).

**Target Platform**: Modern evergreen browsers, 320 to 1920 px wide; hosted on Vercel.

**Project Type**: Web application (single Next.js project, no separate backend).

**Performance Goals**: Fully statically prerendered page; zero client JavaScript beyond the Next.js runtime; images
served through `next/image` with explicit sizes. No formal budget (Lighthouse tuning is out of scope).

**Constraints**: No horizontal scroll at 320 px; WCAG 2.1 AA; exactly one `h1`; no custom scroll JS; no client
components; no hard-coded visible text in components.

**Scale/Scope**: 1 route, 6 section components, 4 services, 3 projects, 4 work stages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle / Gate | Status | How the plan satisfies it |
|---|---|---|
| I. Separation of concerns (`src/app`, `src/components`, `src/data`) | Pass | Page in `src/app`, sections in `src/components`, content in `src/data`. `src/lib` and `src/schemas` are not created (nothing belongs there yet). |
| I. Server components by default | Pass | All components are server components; no `"use client"`. |
| I. Reuse, single responsibility, no duplication | Pass | One component per section; a shared `Section` heading/wrapper only if two or more sections repeat the same markup (decided during implementation). |
| II. TypeScript strict, no `any` | Pass | `strict: true` kept from the scaffold; entity types in `src/data/types.ts`. |
| II. Zod single-source validation | N/A | No user input and no schema in this feature. |
| III. Security (secrets, `.env`, honeypot) | Pass / N/A | No secrets or forms. `.env*` stays ignored in the merged `.gitignore`. `.env.example` is not needed yet because there are no variables. |
| IV. WCAG 2.1 AA, semantic HTML, visible focus | Pass | Semantic landmarks, heading hierarchy, `focus-visible` styles, contrast check in the manual pass. |
| IV. `next/image` for images | Pass | All images use `next/image`. |
| IV. Next.js Metadata API for page metadata | Pass | Layout exports a minimal `metadata` (title, description) and sets `lang="en"`. Full SEO work remains out of scope. |
| V. Simplicity, no unspecified features or libraries | Pass | No extra dependencies beyond tooling that the request names. No nav, animations, or dark mode. |
| Quality gate: scripts `lint`, `lint:fix`, `format`, `format:check` | Pass | Added in the tooling tasks. |
| Quality gate: root `.prettierrc` used as is | Pass | Not modified; `prettier-plugin-tailwindcss` is enabled through the CLI/config without editing `.prettierrc` (see R3). |
| Quality gate: Vitest tests for every Zod schema | N/A | No Zod schemas. |
| Quality gate: no `console.log` | Pass | None used. |

**Result**: No violations; Complexity Tracking is empty. Post-design re-check: still passing (see end of Phase 1).

## Project Structure

### Documentation (this feature)

```text
specs/001-landing-page-layout/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-contract.md   # Phase 1 output (page and component contract)
└── tasks.md             # Phase 2 output (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
.claude/  .specify/  .prettierrc  .gitignore     # existing, preserved (.gitignore merged, not replaced)
eslint.config.mjs                                 # scaffold flat config + typescript-eslint, eslint-config-prettier
next.config.ts  postcss.config.mjs  tsconfig.json  package.json
public/
└── images/                                       # local stock images for the three project cards
src/
├── app/
│   ├── layout.tsx                                # html lang="en", metadata, global CSS import
│   ├── globals.css                               # Tailwind import, html scroll-behavior, scroll-margin
│   └── page.tsx                                  # <main> composing the sections
├── components/
│   ├── Hero.tsx                                  # <header> with the single h1 and CTA anchor
│   ├── Services.tsx                              # <section>, h2, h3 per service
│   ├── Projects.tsx                              # <section>, h2, cards with next/image and h3
│   ├── WorkStages.tsx                            # <section>, h2, ordered list, h3 per stage
│   ├── ContactSection.tsx                        # <section id="contact">, h2 only (placeholder)
│   └── Footer.tsx                                # <footer>
└── data/
    ├── types.ts                                  # HeroContent, Service, Project, WorkStage, ContactContent, FooterContent
    ├── hero.ts  services.ts  projects.ts  work-stages.ts  contact.ts  footer.ts
```

**Structure Decision**: Single Next.js project with the `src/` layout required by the constitution. `src/lib`,
`src/schemas`, and `tests/` are intentionally not created until a feature needs them.

## Implementation Approach

### Tooling (first tasks, before any feature code)

1. **Scaffold safely.** `create-next-app` refuses or prompts when the target folder already contains files and can
   overwrite `.gitignore`. Run it into an empty temporary directory (scratchpad) with flags
   `--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack`-style options as supported
   by the installed version, then copy the generated files into the project root, skipping `.specify`, `.claude`,
   `.prettierrc`, and `.gitignore`. Merge any generated `.gitignore` entries that are missing into the existing file,
   and confirm `.env*` is still ignored (keeping a `!.env.example` exception).
2. **Remove scaffold demo content** (default page markup, sample SVGs in `public/`, demo fonts and styles) so only
   what the spec needs remains. Set the package `name` to `bridges`.
3. **Tailwind**: the scaffold's Tailwind setup (v4: `@import "tailwindcss"` in `globals.css`, `@tailwindcss/postcss`).
4. **ESLint**: keep the scaffold's `eslint.config.mjs` (flat config) with `eslint-config-next`, and extend it with
   `typescript-eslint` recommended rules and `eslint-config-prettier` as the last entry. No `eslint.config.js` is
   created and `package.json` stays without `"type": "module"`.
5. **Prettier**: install `prettier`, `prettier-plugin-tailwindcss`. `.prettierrc` must stay unchanged, so the plugin is
   enabled through a CLI flag in the npm scripts (`--plugin prettier-plugin-tailwindcss`) (see R3).
6. **npm scripts**: `lint` (`eslint .`), `lint:fix` (`eslint . --fix`), `format` (`prettier --write .`),
   `format:check` (`prettier --check .`), alongside the scaffold's `dev`, `build`, `start`. A `.prettierignore`
   excludes `.next`, `node_modules`, `.specify`, `.claude`, `specs`, and lockfiles so format checks cover only project
   source.
7. Gate: `npm run lint`, `npm run format:check`, and `npm run build` pass on the cleaned scaffold.

### Content and types

- `src/data/types.ts` defines one exported type per spec entity (see [data-model.md](./data-model.md)).
- Each data file exports a typed constant (for example `export const services: Service[]`). The exact counts (4 / 3 / 4)
  and order are properties of the data, not enforced in components.
- Components import from `src/data` directly, or accept props from `page.tsx` (default: `page.tsx` imports data and
  passes props, which keeps components reusable and the data flow visible).

### Page and semantics

- `page.tsx` renders `<main>` containing Hero, Services, Projects, WorkStages, ContactSection in order, then Footer
  outside `<main>`. Hero is a `<header>` as the first child of `<main>` and holds the only `h1`.
- Headings: `h1` (hero) → `h2` per section → `h3` for each service, project card, and stage. Each `<section>` is named
  with `aria-labelledby` pointing at its `h2`.
- Work stages use an ordered list (`<ol>`) so sequence is conveyed; services and projects use lists too.

### Scrolling and focus

- `html { scroll-behavior: smooth; }` in `globals.css`, wrapped in
  `@media (prefers-reduced-motion: no-preference)` so reduced-motion users get an instant jump.
- The contact section has `id="contact"` and a `scroll-margin-top` utility so the heading is not flush with the
  viewport edge. There is no fixed header, so the offset is a small visual gap.
- The CTA is `<a href="#contact">`. Native fragment navigation moves the sequential focus starting point to the
  target, so the next Tab continues from the contact section, with no `tabindex` and no JavaScript (satisfies the
  spec edge case for keyboard activation; links activate with Enter only, which is standard browser behavior).
- A shared `focus-visible:` utility set (outline, offset, contrasting color) is applied to the CTA and any other
  interactive element.

### Images

- Three simple local SVG placeholder illustrations in `public/images` (no downloads; to be replaced with photos
  later), rendered with `next/image` (explicit `width`/`height` or `fill` with a sized
  wrapper, plus `sizes` such as `(min-width: 768px) 33vw, 100vw`). Alt text comes from each `Project.imageAlt`.
- Hero has no required image. If one is added later it must come from the data too.

### Responsive layout

- Mobile-first classes: single column by default; `md:grid-cols-2` / `md:grid-cols-3` / `md:grid-cols-4` as suited per
  section. Containers use `max-w-*`, horizontal padding, `min-w-0`, and `break-words` to prevent overflow at 320 px.
- Verify at 320, 375, 768, 1024, 1440, 1920 px.

## Verification (no automated tests in this feature)

`npm run lint`, `npm run format:check`, `npm run build`, plus the manual checks in [quickstart.md](./quickstart.md).

## Assumptions

1. Node 20.19 and npm 10 are used; the latest stable Next.js supports this Node version.
2. The scaffold is generated in a temporary directory and copied in, because running `create-next-app` directly in a
   non-empty folder can overwrite or reject existing files. The result is equivalent to running it in the project
   folder.
3. Tailwind CSS v4 (the version the scaffold ships) is used; there is no `tailwind.config.js`.
4. `.prettierrc` is left exactly as is; the Tailwind plugin is supplied via CLI flags in the scripts. The existing
   `useTabs: true` and `singleAttributePerLine: true` apply to all files.
5. The Hero is the first element in `<main>` and has no background image. Colors are a neutral palette chosen to meet
   4.5:1 contrast.
6. Project images are simple hand-written SVG placeholders stored locally; the author will replace them with photos
   later (the `image` and `imageAlt` data fields make this a data-only change).
7. Company name, headline, and project texts are invented placeholder copy written into `src/data` (fictional, no real
   names).
8. A minimal `metadata` export (title, description) is included because the constitution requires the Metadata API for
   page metadata; richer SEO stays out of scope.
9. The CTA target is stored in hero data (`ctaTargetId: "contact"`) and rendered as `#${id}`, matching the spec's
   "target section" field.

## Open Questions

None.

## Complexity Tracking

No constitution violations; nothing to justify.
