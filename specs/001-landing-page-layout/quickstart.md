# Quickstart: Validate the Landing Page Layout

## Prerequisites

Node.js 20+ and npm. Dependencies installed with `npm install`.

## Automated gates

```bash
npm run lint
npm run format:check
npm run build
```

Expected: all three exit 0, and the build output lists `/` as a static page.

## Run

```bash
npm run dev      # http://localhost:3000
```

## Manual checks

1. **Structure (FR-001, FR-002, FR-005 to FR-009)**: Sections appear in order (hero, services, projects, work stages,
   contact, footer). Four services, three project cards, four stages in the specified order. Contact section has a
   heading and no form fields. Footer shows the fictional notice. In dev tools, `document.querySelectorAll('h1').length`
   is 1.
2. **CTA (FR-004, SC-002)**: Click "Request a quote": the page scrolls smoothly and the contact heading is not
   flush against the top edge. Repeat with the keyboard (Tab to the button, Enter); press Tab once more and confirm
   focus continues after the contact section start. With OS "reduce motion" on, the jump is instant.
3. **Responsive (FR-012, FR-013, SC-003)**: At 320, 375, 767, 768, 1024, 1440, and 1920 px: single column below 768,
   multi-column from 768, no horizontal scrollbar, no clipped or overlapping content. Check one long text value by
   temporarily lengthening a service name in `src/data/services.ts`, then revert.
4. **Keyboard (FR-014, SC-004)**: Tab through the page: every interactive element shows a visible focus indicator,
   order matches visual order, no keyboard trap.
5. **Images (FR-015, SC-005)**: Every project image has non-empty descriptive alt text (inspect the DOM).
6. **Content separation (FR-010, SC-006)**: Change a service name in `src/data/services.ts`; the page updates with no
   component edits. Search `src/components` for visible literal text; there should be none.
7. **Contrast (FR-016)**: Check text and focus indicator colors for 4.5:1 (text) and 3:1 (focus/UI) using browser dev
   tools.

## Tooling checks

- `git status` shows `.specify/`, `.claude/`, and `.prettierrc` unchanged; `.gitignore` still ignores `.env*`.
- `package.json` contains the scripts `lint`, `lint:fix`, `format`, `format:check`.
