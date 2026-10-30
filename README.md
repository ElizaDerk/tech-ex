# Bridges Landing Page

A one-page landing site for a fictional bridge construction company (Spanwright Bridge Engineering), with a contact form that sends requests to HubSpot. This is a demo project. The company and all projects are fictional.

**Live site:** https://tech-ex.vercel.app

## What it does

- One-page landing: hero, services, projects, work stages, contact form, footer
- Contact form: first name, last name, email, optional phone, message
- Validation on the client and again on the server, with one shared Zod schema
- The server sends the request to HubSpot, so the browser never calls the CRM and no keys reach the client
- Spam protection with a hidden honeypot field
- Loading state, friendly errors, and entered values are kept when a request fails
- Accessible by design: semantic HTML, labels, visible focus, errors linked to fields

## Tech stack

- Next.js (App Router), React, TypeScript (strict)
- Tailwind CSS
- React Hook Form and Zod
- HubSpot Forms API (called from a server route handler)
- Vitest (unit tests for the validation schema)
- ESLint and Prettier
- Deployed on Vercel

## Lighthouse (desktop)

Performance 100, Accessibility 100, Best Practices 100, SEO 100.

Known issue: on mobile, Lighthouse reports Performance 77 because of a layout shift (CLS 0.698). I have not fixed it yet.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

### Environment variables

Set these in `.env.local` locally and in the Vercel project settings for deployment. They are read on the server only.

| Variable | Description |
|---|---|
| `HUBSPOT_PORTAL_ID` | HubSpot account (portal) ID |
| `HUBSPOT_FORM_ID` | ID of the HubSpot form that receives submissions |
| `HUBSPOT_API_HOST` | HubSpot Forms API host (this account is in the EU region: `api-eu1.hsforms.com`) |

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier write / check |
| `npm test` | Vitest unit tests |

## Project structure

```text
src/
  app/          pages, layout, and the /api/contact route handler
  components/   section components and the contact form
  data/         all visible text and content, typed
  lib/          HubSpot integration and helpers
  schemas/      Zod schema and its tests
specs/          feature specifications, plans and tasks
.specify/       Spec Kit setup and the project constitution
```

Visible text lives in `src/data`, not in components. Services, projects and work stages share one `Section` component.

## How this project was built

I built it with Spec-Driven Development, using GitHub Spec Kit and Claude Code. Each feature went through the same steps, on its own git branch:

1. **Constitution** (`.specify/memory/constitution.md`): permanent rules for the project (stack, separation of concerns, security, accessibility, simplicity).
2. **Specify**: what the feature must do, with acceptance scenarios, no technology.
3. **Plan**: how to build it in this stack.
4. **Tasks**, then **Analyze**: a consistency check between spec, plan and tasks before any code.
5. **Implement**, then manual checks.

Specs are in `specs/`:

- `001-landing-page-layout`: the page and its sections
- `002-contact-form`: the form, the API route and the HubSpot integration

### What the AI did, and what I did

Claude Code wrote the code and the first drafts of plans and tasks. I wrote the requirements and decided the scope, reviewed every spec, plan and task list, and applied the fixes from the analysis reports. For example, I set up the HubSpot form, checked its field names, and tested the EU API host with a real request before it went into the plan. I also set the environment variables in Vercel and tested the deployed form.

I kept the scope small on purpose: no extra libraries, only unit tests for the schema, and placeholder SVG images for the projects.

## Possible next steps

- Fix the mobile layout shift
- Replace the SVG placeholders with real photos
- Rate limiting for the form endpoint
- An end-to-end test for the form
- Move the static content to a headless CMS (for example Sanity). The content is already typed and separated in `src/data`, so this would mostly change where the data comes from.
