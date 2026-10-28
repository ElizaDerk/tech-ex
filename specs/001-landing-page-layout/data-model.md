# Data Model: Landing Page Layout

All data is static, typed, and lives in `src/data`. Types are declared in `src/data/types.ts`. There is no persistence,
validation schema, or state transition.

## Entities

### SiteMetadata (`src/data/metadata.ts`, one instance)

| Field | Type | Notes |
|---|---|---|
| `title` | `string` | Fictional-company page title. |
| `description` | `string` | Short page description. |

`layout.tsx` builds the Next.js `metadata` export from these values; no literal title or description is written there.

### HeroContent (`src/data/hero.ts`, one instance)

| Field | Type | Notes |
|---|---|---|
| `headline` | `string` | Rendered in the only `h1`. |
| `subtitle` | `string` | Short supporting text. |
| `ctaLabel` | `string` | "Request a quote". |
| `ctaTargetId` | `string` | Id of the target section; set from the exported `contactId` constant (no second literal); the link `href` is `#` + this value. |

### Service (`src/data/services.ts`, `Service[]`, 4 items)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable key. |
| `name` | `string` | `h3`. Order: pedestrian bridges, road bridges, cable-stayed bridges, reconstruction. |
| `description` | `string` | One line. |

### Project (`src/data/projects.ts`, `Project[]`, 3 items)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable key. |
| `title` | `string` | `h3`. Fictional. |
| `description` | `string` | Short text. |
| `image` | `string` | Path under `/images/`. |
| `imageAlt` | `string` | Non-empty descriptive alt text. |

### WorkStage (`src/data/work-stages.ts`, `WorkStage[]`, 4 items)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable key. |
| `position` | `number` | 1 to 4, sequence order. |
| `name` | `string` | `h3`. Order: design, permits, construction, handover. |
| `description` | `string` | One line. |

### ContactContent (`src/data/contact.ts`, one instance)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Set from `contactId` (`'contact'`), the single source of the id, exported from `src/data/contact.ts`; used as the section id. |
| `heading` | `string` | `h2`. |
| `intro` | `string` (optional) | Optional intro text. |

### FooterContent (`src/data/footer.ts`, one instance)

| Field | Type | Notes |
|---|---|---|
| `companyName` | `string` | Fictional. |
| `notice` | `string` | States that the company and projects are fictional. |

### Section headings

Services, Projects, and WorkStages each also need an `h2` heading. Each data file exports a `heading` string next to
its list (for example `servicesHeading`), so no heading text is written in a component. The shared `Section` component
renders the `h2` from the `heading` it receives.

## Relationships

`HeroContent.ctaTargetId` references `ContactContent.id`. Both come from the single `contactId` constant exported by `src/data/contact.ts` (`hero.ts` imports it), so they cannot drift apart. There are no other relationships.

## Validation

No runtime validation (no user input, no Zod). TypeScript strict mode checks shape at build time. Counts and ordering
are checked in the manual review against the spec (FR-005 to FR-007).
