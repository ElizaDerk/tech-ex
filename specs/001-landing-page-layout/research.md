# Research: Landing Page Layout

No `NEEDS CLARIFICATION` markers remain in the Technical Context. The items below record decisions for the technology
choices that carry some risk. Open product questions are listed in [plan.md](./plan.md).

## R1. Scaffolding into a non-empty folder

- **Decision**: Run `create-next-app` in an empty temporary directory, then copy the output into the project root,
  skipping `.specify`, `.claude`, `.prettierrc`, and `.gitignore`; merge missing `.gitignore` entries by hand.
- **Rationale**: `create-next-app` aborts or prompts on conflicting files and writes its own `.gitignore`. Copying
  keeps protected files untouched and is easy to verify with `git status`.
- **Alternatives considered**: Running directly in the folder (risk of overwriting `.gitignore`); manual
  installation of every package (more error-prone, drifts from the official template).

## R2. Smooth scroll, offset, and focus without JavaScript

- **Decision**: `scroll-behavior: smooth` on `html` inside `@media (prefers-reduced-motion: no-preference)`;
  `scroll-margin-top` on `#contact`; plain `<a href="#contact">`.
- **Rationale**: Native fragment navigation scrolls and moves the focus navigation starting point to the target, so
  the next Tab continues from the contact section. This meets FR-004 and SC-002 with no scripts, and respects
  reduced-motion preferences (WCAG 2.3.3 spirit).
- **Alternatives considered**: `scrollIntoView` handler (needs a client component, contradicts the request); adding
  `tabindex="-1"` and calling `focus()` (JavaScript, unnecessary).

## R3. Prettier with the Tailwind plugin and an unmodifiable `.prettierrc`

- **Decision**: Keep `.prettierrc` unchanged and pass `--plugin prettier-plugin-tailwindcss` in the `format` and
  `format:check` scripts. Add a `.prettierignore`.
- **Rationale**: The constitution says Prettier uses the root `.prettierrc` as is. The CLI flag adds the plugin
  without editing that file. The editor's Prettier integration will not pick up the flag, which is acceptable and
  noted as a trade-off.
- **Alternatives considered**: Adding `plugins` to `.prettierrc` (modifies a protected file); a second config file
  (Prettier would use only one, causing confusion).

## R4. ESLint flat config

- **Decision**: Keep the scaffold's `eslint.config.mjs` with `eslint-config-next`, and add `typescript-eslint`
  recommended rules and `eslint-config-prettier` as the last entry. No `eslint.config.js` is created.
- **Rationale**: Works with the scaffold's package type (no `"type": "module"` change) and keeps Next.js rules.
- **Alternatives considered**: A separate CommonJS `eslint.config.js` (two configs, extra friction).

## R5. Image handling

- **Decision**: Local files in `public/images`, rendered with `next/image` and a `sizes` hint; alt text from data.
- **Rationale**: Constitution IV and the request. Local files avoid remote host configuration in `next.config.ts`.
- **Alternatives considered**: Remote URLs (requires `images.remotePatterns`, network dependency); CSS background
  images (cannot carry alt text, not `next/image`).

## R6. Responsive strategy

- **Decision**: Tailwind mobile-first utilities, single column by default and multi-column from `md` (768 px).
  Containers use padding, `max-w-*`, `min-w-0`, and `break-words`.
- **Rationale**: Directly matches FR-012 and FR-013 and the edge case about long text.
- **Alternatives considered**: Container queries (more complex than needed); custom CSS grid (Tailwind covers it).

## R7. Semantics

- **Decision**: `<main>` contains the hero `<header>` and sections; `<footer>` outside `<main>`; `h1` → `h2` → `h3`;
  `<ol>` for work stages; sections labelled by their `h2` through `aria-labelledby`.
- **Rationale**: FR-002 and FR-016; lists convey sequence and counts to assistive technology.
- **Alternatives considered**: Generic `div` wrappers (loses landmarks).
