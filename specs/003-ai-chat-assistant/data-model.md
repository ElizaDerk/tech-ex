# Data Model: AI Chat Assistant

Nothing is persisted. All entities exist in browser memory (conversation) or are built per request on the server (prompt).

## ChatMessage

| Field | Type | Rules |
|-------|------|-------|
| `role` | `'user' \| 'assistant'` | Required |
| `content` | string | Trimmed. User: 1 to 500 characters. Assistant: 1 to 2000 characters. |

## ChatInput (request body, `src/schemas/chat.ts`)

| Field | Type | Rules |
|-------|------|-------|
| `messages` | `ChatMessage[]` | 1 to 20 items; the last item has role `user` |
| `chat_hp` | string, optional | Honeypot; must be empty for real visitors |

Type derived with `z.infer`; the same schema is used by the client and the route.

## Conversation (client state)

The ordered `ChatMessage[]` shown in the panel, held in `ChatAssistant` state. It survives closing and reopening the panel and is cleared by a page reload. The request sends the whole array including the new visitor message.

Limits: 20 messages in total (FR-012). The client disables sending when the array has 20 items. The server rejects a request with 20 items as `conversation_limit`, since the answer would be the 21st message.

## SiteContent (server, per request)

Read-only data imported from `src/data`: `services`, `workStages`, `projects`, `contact` and the company name from `footer`. `buildSystemPrompt()` turns it into one plain-text system prompt plus the behavior rules. It is never sent to the client.

## RateLimitEntry (server, in memory)

| Field | Type | Notes |
|-------|------|-------|
| key | string | Client IP (first `x-forwarded-for` entry) or `unknown` |
| timestamps | number[] | Request times within the last 60 seconds |

Rule: at most 10 timestamps in the window. Expired timestamps and empty keys are pruned on each call. Per server instance only.

## ChatResult (internal, `src/lib/chat.ts`)

`{ok: true, answer: string}` or `{ok: false, error: ChatErrorCode}`.

`ChatErrorCode` = `validation_failed | invalid_request | rate_limited | conversation_limit | provider_unavailable`.

## ChatContent (`src/data/chat.ts`, type in `src/data/types.ts`)

Static texts: floating button label, panel heading, input label, send and sending labels, close label, honeypot label, AI note, contact link text, loading text, `honeypotAnswer`, `genericError`, and `errorMessages` keyed by `ChatErrorCode` and by schema message keys.

## State transitions (client)

`idle` → (send) → `loading` → `idle` with the answer appended, or `idle` with an error shown and the typed text kept. While `loading`, sending is disabled. At 20 messages the state is `limit-reached`: the log stays readable, the input is disabled, and the friendly message suggests the contact form.
