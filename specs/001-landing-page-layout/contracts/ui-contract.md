# UI Contract: Landing Page

The feature exposes no API. Its external interface is the rendered page, specified here.

## Route

| Path | Rendering | Notes |
|---|---|---|
| `/` | Static, server components only | Only route of the feature. |

## Document structure

```text
<html lang="en">
  <body>
    <main>
      <header>            Hero: h1, subtitle, <a href="#contact">
      <section>           Services: h2, 4 x h3
      <section>           Projects: h2, 3 x (img + h3 + text)
      <section>           WorkStages: h2, <ol> of 4 x h3
      <section id="contact">  ContactSection: h2 only (no form elements)
    </main>
    <footer>              company name + fictional notice
```

## Rules

- Exactly one `h1` on the page, inside the hero.
- Section order is fixed as above.
- The CTA is an `<a>` whose `href` equals `#contact`; the contact section's `id` is `contact`.
- Every `<img>` rendered by `next/image` has a non-empty `alt` taken from data.
- Every interactive element has a `focus-visible:` style; tab order equals DOM order equals visual order.
- No element is horizontally scrollable at 320 px viewport width.
- No `"use client"` directive in the feature.

## Component props (summary)

| Component | Props |
|---|---|
| `Hero` | `HeroContent` |
| `Services` | `heading: string`, `services: Service[]` |
| `Projects` | `heading: string`, `projects: Project[]` |
| `WorkStages` | `heading: string`, `stages: WorkStage[]` |
| `ContactSection` | `ContactContent`; must leave room (children slot) for the later form |
| `Footer` | `FooterContent` |
