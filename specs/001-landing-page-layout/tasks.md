# Tasks: Landing Page Layout

**Input**: Design documents from `/specs/001-landing-page-layout/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contract.md, quickstart.md

**Tests**: Not requested. The plan defines no automated tests for this feature (no Zod schemas, no validation logic). Verification is `npm run lint`, `npm run format:check`, `npm run build`, and the manual checks in quickstart.md. Do not add Vitest in this feature.

**Organization**: The spec has one user story (US1, P1). Setup and Foundational come first, then US1 (data, images, components, page), then Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story the task belongs to (US1)

## Conventions (apply to every task)

- Paths are relative to the repository root `/Users/elizavetaderkachova/Documents/Front-end/bridges`.
- Do NOT modify `.prettierrc`, `.specify/`, or `.claude/`. Code files use tabs (`useTabs: true`) and one attribute per line in JSX (`singleAttributePerLine: true`).
- TypeScript strict, no `any`, no `console.log`, no `"use client"` anywhere.
- No visible text is written in components; every visible string comes from `src/data`.
- Use `next/image` for all images. Use `import type` for type-only imports.

---

## Phase 1: Setup (Tooling and Scaffold)

**Purpose**: Create the Next.js app without overwriting protected files, then configure tooling.

- [ ] T001 Run `npx create-next-app@latest` in a new empty temporary directory inside the scratchpad (not in the repo) with TypeScript, Tailwind, ESLint, App Router, `src/` directory, import alias `@/*`, npm, and no Turbopack-only customizations; accept the latest stable Next.js (React 19, Tailwind v4)
- [ ] T002 Copy the generated files into the repository root, skipping `.git`, `.specify`, `.claude`, `.prettierrc`, `.gitignore`, `node_modules`, and `README.md`: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts` (if present), `public/`, `src/` (depends on T001)
- [ ] T003 Merge missing entries from the generated `.gitignore` into the existing `.gitignore` (append only, do not replace); confirm `.env*` is still ignored with a `!.env.example` exception, and that `.next/`, `node_modules/`, and `next-env.d.ts` are ignored (depends on T001)
- [ ] T004 Remove scaffold demo content: delete all sample SVGs in `public/` (keep the folder for T019), leave the default `src/app/favicon.ico` as is, reduce `src/app/page.tsx` to a minimal `export default function Page() { return <main /> }`, and strip demo fonts and demo styles from `src/app/layout.tsx` and `src/app/globals.css` (leave `@import "tailwindcss";`). Set `"name": "bridges"` in `package.json` (depends on T002)
- [ ] T005 Run `npm install` in the repository root, then install dev dependencies: `npm install -D prettier prettier-plugin-tailwindcss typescript-eslint eslint-config-prettier` (skip any already present) (depends on T004)
- [ ] T006 Edit `eslint.config.mjs` (flat config, keep `.mjs`; do not create `eslint.config.js` and do not add `"type": "module"`): keep the scaffold's `eslint-config-next` entries (including `eslint-config-next/typescript` if the scaffold has it), and add `eslint-config-prettier` as the last entry. Check first whether `eslint-config-next` already registers the `typescript-eslint` plugin: if it does, do NOT register the plugin again or add a second `typescript-eslint` config, and keep a single `typescript-eslint` setup (add the `typescript-eslint` recommended rules only if the scaffold's config does not already provide them; skip installing the separate `typescript-eslint` package in T005 in that case) (depends on T005)
- [ ] T007 [P] Create `.prettierignore` in the repository root listing `.next`, `node_modules`, `.specify`, `.claude`, `specs`, `package-lock.json`, and `next-env.d.ts` (depends on T005)
- [ ] T008 Set `package.json` scripts, keeping the scaffold's `dev`, `build`, `start`: `"lint": "eslint ."`, `"lint:fix": "eslint . --fix"`, `"format": "prettier --write . --plugin prettier-plugin-tailwindcss"`, `"format:check": "prettier --check . --plugin prettier-plugin-tailwindcss"` (depends on T005)
- [ ] T009 Gate: run `npm run format` once to normalize scaffold files, then confirm `npm run lint`, `npm run format:check`, and `npm run build` all exit 0 on the cleaned scaffold, and `git status` shows `.prettierrc`, `.specify/`, `.claude/` unchanged (depends on T006, T007, T008)

**Checkpoint**: Clean, linted, buildable Next.js scaffold with the four required npm scripts.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, global styles, and root layout that every section depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T010 Create `src/data/types.ts` exporting these types exactly as in data-model.md: `HeroContent { headline: string; subtitle: string; ctaLabel: string; ctaTargetId: string }`, `Service { id: string; name: string; description: string }`, `Project { id: string; title: string; description: string; image: string; imageAlt: string }` (`imageAlt` must be non-empty descriptive text), `WorkStage { id: string; position: number; name: string; description: string }` (`position` 1 to 4), `ContactContent { id: string; heading: string; intro?: string }`, `FooterContent { companyName: string; notice: string }`
- [ ] T011 [P] Write `src/app/globals.css`: keep `@import "tailwindcss";`, then add `@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }`. No other global styles beyond a neutral body background and text color that meet 4.5:1 contrast
- [ ] T012 [P] Write `src/app/layout.tsx`: server component importing `./globals.css`, exporting `metadata: Metadata` with a fictional-company `title` and `description` (type imported from `next`), rendering `<html lang="en">` and `<body>` with `{children}`. No fonts from demo code, no `"use client"`

**Checkpoint**: Types, global CSS, and layout ready; section work can begin.

---

## Phase 3: User Story 1 - Understand the company and request a quote (Priority: P1) 🎯 MVP

**Goal**: A visitor sees the complete one-page landing (hero, services, projects, work stages, contact placeholder, footer), can jump to the contact section from "Request a quote", and can use the page responsively with a keyboard.

**Independent Test**: Run `npm run dev`, open `/` at 320, 768, and 1440 px: six sections in order, exactly one `h1`, "Request a quote" scrolls to the contact section (mouse and keyboard), single column below 768 px with no horizontal scroll, visible focus on the CTA, all images have alt text. Full list in quickstart.md.

### Content data (all in `src/data`, fictional copy, English; no real company, person, or project names)

- [ ] T013 [P] [US1] Create `src/data/hero.ts` exporting `export const hero: HeroContent` with a fictional company headline, a short subtitle, `ctaLabel: "Request a quote"`, and `ctaTargetId: "contact"`
- [ ] T014 [P] [US1] Create `src/data/services.ts` exporting `export const servicesHeading: string` and `export const services: Service[]` with exactly four items in this order: pedestrian bridges, road bridges, cable-stayed bridges, reconstruction; each with a stable `id` and a one-line `description`
- [ ] T015 [P] [US1] Create `src/data/projects.ts` exporting `export const projectsHeading: string` and `export const projects: Project[]` with exactly three fictional projects; `image` values are `/images/project-1.svg`, `/images/project-2.svg`, `/images/project-3.svg`; each `imageAlt` is non-empty and describes the picture
- [ ] T016 [P] [US1] Create `src/data/work-stages.ts` exporting `export const workStagesHeading: string` and `export const workStages: WorkStage[]` with exactly four items in this order: design, permits, construction, handover; `position` 1 to 4; one-line `description` each
- [ ] T017 [P] [US1] Create `src/data/contact.ts` exporting `export const contact: ContactContent` with `id: "contact"`, a `heading` (for example about requesting a quote), and an optional short `intro`
- [ ] T018 [P] [US1] Create `src/data/footer.ts` exporting `export const footer: FooterContent` with a fictional `companyName` and a `notice` stating that the company and its projects are fictional

### Images

- [ ] T019 [P] [US1] Create three simple hand-written SVG placeholder illustrations of bridges in `public/images/project-1.svg`, `public/images/project-2.svg`, `public/images/project-3.svg` (each with a `viewBox` of `0 0 800 600`, flat shapes, no external references or text, no downloads)

### Components (server components, props only, no hard-coded visible text)

- [ ] T020 [P] [US1] Create `src/components/Hero.tsx`: props `HeroContent`; renders `<header>` containing the single `<h1>` (headline), a `<p>` (subtitle), and `<a href={`#${ctaTargetId}`}>` showing `ctaLabel` with a `focus-visible:` outline (outline, offset, contrasting color) and sufficient contrast; include `min-w-0 break-words` on text containers and horizontal padding for 320 px
- [ ] T021 [P] [US1] Create `src/components/Services.tsx`: props `heading: string`, `services: Service[]`; renders `<section aria-labelledby="services-heading">` with `<h2 id="services-heading">` and a `<ul>` of items each with `<h3>` name and `<p>` description; one column by default, `md:grid-cols-2` (or `md:grid-cols-4` if it fits) from 768 px; `min-w-0 break-words` on items
- [ ] T022 [P] [US1] Create `src/components/Projects.tsx`: props `heading: string`, `projects: Project[]`; renders `<section aria-labelledby="projects-heading">` with `<h2 id="projects-heading">` and a `<ul>` of cards, each with `next/image` (`src`, `alt` from `imageAlt`, `width`/`height` 800x600 or `fill` in a sized wrapper, `sizes="(min-width: 768px) 33vw, 100vw"`), `<h3>` title, and `<p>` description; one column by default, `md:grid-cols-3` from 768 px
- [ ] T023 [P] [US1] Create `src/components/WorkStages.tsx`: props `heading: string`, `stages: WorkStage[]`; renders `<section aria-labelledby="work-stages-heading">` with `<h2 id="work-stages-heading">` and an `<ol>` of stages sorted by `position`, each with a visible position number, `<h3>` name, and `<p>` description; one column by default, `md:grid-cols-2` or `md:grid-cols-4` from 768 px
- [ ] T024 [P] [US1] Create `src/components/ContactSection.tsx`: props `ContactContent` plus `children?: React.ReactNode` (slot for the later form); renders `<section id={id} aria-labelledby="contact-heading" className="scroll-mt-8 ...">` with `<h2 id="contact-heading">`, optional intro `<p>`, then `{children}`. No form fields, inputs, or buttons
- [ ] T025 [P] [US1] Create `src/components/Footer.tsx`: props `FooterContent`; renders `<footer>` with the company name and the fictional notice

### Page composition

- [ ] T026 [US1] Rewrite `src/app/page.tsx` as a server component that imports the data (T013 to T018) and components (T020 to T025) and renders `<main>` containing, in order, `Hero`, `Services`, `Projects`, `WorkStages`, `ContactSection`, then `<Footer>` outside `<main>` (as a sibling returned in a fragment); pass `servicesHeading`, `projectsHeading`, `workStagesHeading` as the `heading` props (depends on T013 to T018, T020 to T025)
- [ ] T027 [US1] Verify the contract in `specs/001-landing-page-layout/contracts/ui-contract.md` against the rendered page with `npm run dev`: one `h1`; CTA `href` is `#contact` and the contact section `id` is `contact`; `grep -rn "use client" src` finds nothing; no literal visible text in `src/components` (depends on T026)

**Checkpoint**: User Story 1 is fully functional and testable independently (this is the MVP and the whole feature).

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and the manual checks from quickstart.md.

- [ ] T028 If `Services`, `Projects`, and `WorkStages` repeat the same section/heading markup, extract one shared `src/components/Section.tsx` (props: `id` for the heading, `heading: string`, `children`) and reuse it; skip if the duplication is trivial (depends on T026)
- [ ] T029 Run `npm run format`, then `npm run lint` and fix all reported issues; confirm no `console.log` and no `any` in `src` (depends on T028)
- [ ] T030 Run the quickstart.md manual checks 1 to 7 (structure and order, CTA mouse and keyboard with reduced motion, responsive widths 320 / 375 / 767 / 768 / 1024 / 1440 / 1920 with no horizontal scroll, keyboard focus order, image alt text, content separation by temporarily lengthening a service name in `src/data/services.ts` and reverting, contrast 4.5:1 text and 3:1 focus indicator) and fix any failure in the relevant component or data file (depends on T029)
- [ ] T031 Final gates: `npm run lint`, `npm run format:check`, and `npm run build` all exit 0, and the build output lists `/` as a static page; `git status` shows `.prettierrc`, `.specify/`, `.claude/` unchanged and `.gitignore` still ignores `.env*`; `package.json` has the scripts `lint`, `lint:fix`, `format`, `format:check` (depends on T030)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately; T001 → T002/T003 → T004 → T005 → T006/T007/T008 → T009.
- **Foundational (Phase 2)**: depends on T009; T010 first for types, T011 and T012 in parallel with it.
- **User Story 1 (Phase 3)**: depends on Phase 2 (types in T010 are imported by data and components).
- **Polish (Phase 4)**: depends on T026.

### Within User Story 1

- Data files (T013 to T018), images (T019), and components (T020 to T025) touch different files and can all run in parallel after T010.
- Components import only types, not data, so they do not depend on the data tasks; `page.tsx` (T026) needs everything.
- T026 → T027.

### Story Dependencies

- Only one user story; it has no dependency on other stories.

## Parallel Example: User Story 1

```text
# After Phase 2, launch together:
Task: "Create src/data/hero.ts"            (T013)
Task: "Create src/data/services.ts"        (T014)
Task: "Create src/data/projects.ts"        (T015)
Task: "Create src/data/work-stages.ts"     (T016)
Task: "Create src/data/contact.ts"         (T017)
Task: "Create src/data/footer.ts"          (T018)
Task: "Create SVG images in public/images" (T019)
Task: "Create Hero.tsx"                    (T020)
Task: "Create Services.tsx"                (T021)
Task: "Create Projects.tsx"                (T022)
Task: "Create WorkStages.tsx"              (T023)
Task: "Create ContactSection.tsx"          (T024)
Task: "Create Footer.tsx"                  (T025)
```

## Implementation Strategy

### MVP First

1. Phase 1 Setup, ending at the T009 gate.
2. Phase 2 Foundational.
3. Phase 3 User Story 1 (this is the full feature, so MVP equals the feature).
4. STOP and validate with the Independent Test, then run Phase 4.

### Notes

- Commit after each phase or logical group of tasks.
- Avoid same-file conflicts: `page.tsx` is edited only in T004 and T026.
- The contact section must stay a placeholder; the form arrives in a separate feature.
