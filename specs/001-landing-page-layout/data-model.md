# Data Model: Landing Page Layout

All data is static, typed, and lives in `src/data`. Types are declared in `src/data/types.ts`. There is no persistence,
validation schema, or state transition.

## Entities

### HeroContent (`src/data/hero.ts`, one instance)

| Field | Type | Notes |
|---|---|---|
| `headline` | `string` | Rendered in the only `h1`. |
| `subtitle` | `string` | Short supporting text. |
| `ctaLabel` | `string` | "Request a quote". |
| `ctaTargetId` | `string` | Id of the target section, `"contact"`; the link `href` is `#` + this value. |

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
| `id` | `string` | `"contact"`; used as the section id. |
| `heading` | `string` | `h2`. |
| `intro` | `string` (optional) | Optional intro text. |

### FooterContent (`src/data/footer.ts`, one instance)

| Field | Type | Notes |
|---|---|---|
| `companyName` | `string` | Fictional. |
| `notice` | `string` | States that the company and projects are fictional. |

### Section headings

Services, Projects, and WorkStages each also need an `h2` heading. Each data file exports a `heading` string next to
its list (for example `servicesHeading`), so no heading text is written in a component.

## Relationships

`HeroContent.ctaTargetId` references `ContactContent.id`. There are no other relationships.

## Validation

No runtime validation (no user input, no Zod). TypeScript strict mode checks shape at build time. Counts and ordering
are checked in the manual review against the spec (FR-005 to FR-007).
