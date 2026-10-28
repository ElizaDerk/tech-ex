# Data Model: Contact Form

## ContactInput

Defined once in `src/schemas/contact.ts`. The TypeScript type is `z.infer<typeof contactSchema>`.

| Field | Type | Required | Rules | HubSpot field |
|-------|------|----------|-------|---------------|
| `firstName` | string | yes | trimmed, at least 1 character | `firstname` |
| `lastName` | string | yes | trimmed, at least 1 character | `lastname` |
| `email` | string | yes | trimmed, valid email format | `email` |
| `phone` | string | no | empty allowed; otherwise only digits, spaces, `+`, `-`, `(`, `)`, length 7 to 20 | `phone` (omitted when empty) |
| `message` | string | yes | trimmed, 10 to 1000 characters | `message` |
| `website` | string | no | honeypot; real visitors leave it empty; never sent to HubSpot | none |

## Form content (`src/data/contact.ts`)

Static text only: field labels, hints, placeholders, button and loading labels, success text, generic error text, and one `errorMessages` object that maps each stable schema message key to its English text.

## States

`idle → submitting → success` (the form is replaced by the confirmation)

`submitting → idle` (validation error or CRM failure: values kept, errors shown)

There is no persistence; the data goes to HubSpot and is not stored here.
