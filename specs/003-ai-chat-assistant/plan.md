# Implementation Plan: AI Chat Assistant

**Branch**: `003-ai-chat-assistant` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-ai-chat-assistant/spec.md`

## Summary

Add a floating chat button and panel to the landing page. A client component keeps the conversation in React state and calls `src/lib/send-chat.ts`, which posts JSON to a thin route handler at `/api/chat`. The handler validates the body with one shared Zod schema and delegates to `src/lib/chat.ts`. That module handles the honeypot, rate limit and conversation limit, builds the system prompt from `src/data`, and calls Google Gemini through one provider module (`src/lib/gemini.ts`) with the built-in `fetch`. The route returns the whole answer as JSON (no streaming). Errors map to codes, and the client shows friendly texts from `src/data`. Nothing is stored. No new runtime dependency.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.3, Next.js 16.4 (App Router)

**Primary Dependencies**: none new. `zod`, Tailwind and Vitest are already installed. No Gemini SDK (REST via `fetch`).

**Storage**: N/A (conversation lives in browser memory only; nothing on the server)

**Testing**: Vitest unit tests: schema (with boundary values), prompt builder, rate limiter, chat orchestration (honeypot, limits, error mapping) with the provider mocked

**Target Platform**: Vercel (Node.js runtime for the route handler)

**Project Type**: Web application, a single Next.js project

**Performance Goals**: Loading state visible within 1 s of sending; answer under 15 s in 95% of normal cases (SC-001). A 10-second server-side timeout on the provider call.

**Constraints**: API key server-only. No `any`, no `console.log`. Free-tier provider limits (5 req/min, 20 req/day) are far below the per-visitor limit, so provider 429 is an expected path. `npm run lint` and `npm run format:check` must pass.

**Scale/Scope**: One endpoint, one provider module, two client components

## Constitution Check

*Gate: passed before Phase 0 and re-checked after Phase 1.*

| Principle | Status | How the plan complies |
|-----------|--------|-----------------------|
| I. Separation of concerns | Pass | Route handler only parses and maps results. Logic (orchestration, prompt, rate limit, provider call, client fetch) lives in `src/lib`. Texts in `src/data`, schema in `src/schemas`. Client components only for the floating button and the panel; everything else stays server-side. |
| II. Type safety & single-source validation | Pass | One schema in `src/schemas/chat.ts`, types via `z.infer`, used by the client and the route. All limits re-checked on the server. Friendly errors; the typed message is kept on failure. |
| III. Security by default | Pass | `GEMINI_API_KEY` and `GEMINI_MODEL` are server-only (no `NEXT_PUBLIC_`), listed in `.env.example`. Honeypot included. Rate limit (10/min/IP), message length (500) and history length (20) enforced on the server. |
| IV. Accessibility & performance | Pass | Labelled input, keyboard operation, visible focus, focus management, polite live regions for answers, loading and errors. |
| V. Simplicity | Pass | No SDK (plain `fetch` is enough, see research.md), no streaming, no RAG, no shared store. No new dependency. |
| VI. Responsible AI | Pass | Provider called only from the server. System prompt carries the grounding, decline and injection rules. Prompt and provider output never reach the client. Nothing stored or sent to the CRM. Provider mocked in tests. |

Complexity Tracking: no violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-chat-assistant/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── chat-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/chat/route.ts          # NEW: request/response only
│   └── page.tsx                   # EDIT: render <ChatAssistant /> after <Footer />
├── components/
│   ├── ChatAssistant.tsx          # NEW: client; floating button, open/close state, focus return
│   └── ChatPanel.tsx              # NEW: client; conversation, input, honeypot, AI note, contact link
├── data/
│   ├── chat.ts                    # NEW: labels, AI note, link text, error texts, honeypot answer
│   └── types.ts                   # EDIT: add ChatContent type
├── lib/
│   ├── chat.ts                    # NEW: answerChat(): honeypot, limits, prompt, provider, result mapping
│   ├── chat-prompt.ts             # NEW: buildSystemPrompt() from src/data
│   ├── chat-rate-limit.ts         # NEW: in-memory sliding-window limiter
│   ├── chat-errors.ts             # NEW: error code -> HTTP status table (codes only)
│   ├── gemini.ts                  # NEW: the only module that knows the provider
│   └── send-chat.ts               # NEW: client-side fetch to /api/chat
└── schemas/
    ├── chat.ts                    # NEW: Zod schema and ChatInput type
    └── chat.test.ts               # NEW: Vitest tests
src/lib/chat.test.ts               # NEW: honeypot, limits, error mapping (provider mocked)
src/lib/chat-prompt.test.ts        # NEW: prompt contains all site content and the rules
src/lib/chat-rate-limit.test.ts    # NEW: window, per-key isolation, pruning
.env.example                       # EDIT: add GEMINI_API_KEY, GEMINI_MODEL (empty)
```

**Structure Decision**: single Next.js project following the constitution's layout. `chat-*` files in `src/lib` mirror the `contact-*` naming. The provider is isolated in `gemini.ts`; `chat.ts` depends only on its function signature `generateAnswer(systemPrompt, messages)`, so replacing the provider means rewriting that one file.

## Design Decisions

### Schema (`src/schemas/chat.ts`)

- `messages`: array of `{role: 'user' | 'assistant', content: string.trim()}`, 1 to 20 items.
- User messages: 1 to 500 characters after trimming. Assistant messages: 1 to 2000 characters (input size bound for echoed history; consistent with `maxOutputTokens` 400).
- Last message must have role `user`.
- `chat_hp`: optional string (honeypot).
- Error keys follow the contact schema style (for example `message.empty`, `message.tooLong`, `messages.tooMany`).
- The 20-message schema cap is a hard sanity bound. The conversation limit (FR-012) is a separate check in `chat.ts`: a request whose answer would be the 21st message is rejected with `conversation_limit`. Together: a request with 20 items passes the schema but fails the limit check; 21 items fail the schema.

### Orchestration (`src/lib/chat.ts`)

`answerChat(input, ip)` returns `{ok: true, answer}` or `{ok: false, error}`. Order: honeypot (fixed answer from `src/data`, no limiter, no provider) → rate limit → conversation limit → build prompt → provider call → map failures to `provider_unavailable`. The route only turns the result into `Response.json` using the status table.

### Provider (`src/lib/gemini.ts`)

`generateAnswer(systemPrompt, messages)` posts to the Gemini `generateContent` REST endpoint with the key in the `x-goog-api-key` header, `systemInstruction` for the prompt, `assistant` mapped to `model`, a `generationConfig` with a low temperature, `maxOutputTokens` 400 and minimal thinking via `thinkingConfig` (Gemini 3.x Flash models think by default, which adds latency and can consume the output token budget and leave an empty answer), and a 10 s `AbortSignal.timeout`. Any non-OK status, network error, timeout, empty or blocked response (an empty answer included) throws a `ProviderError` with a short code. The route logs only that code (same approach as `hubspot.ts`). Missing env vars also count as `provider_unavailable`.

### Client

- `ChatAssistant` owns open state and the floating button ref. On close (button or Escape) it returns focus to the button. The conversation state lives here so closing and reopening keeps it (spec edge case) and a reload clears it.
- `ChatPanel` renders the log, the status/error region, the input with its label, the hidden honeypot (same markup pattern as `ContactForm`), the always-visible AI note and the static contact link. Answers render as text with `whitespace-pre-line`.
- Contact link: click closes the panel and focuses the first contact form field (`#firstName`) after scrolling to `#contact`.
- Accessibility pattern (non-modal dialog, live regions) is decided in [research.md](./research.md).

### Environment

`.env.example` gets `GEMINI_API_KEY=` and `GEMINI_MODEL=` with empty values. Neither uses the `NEXT_PUBLIC_` prefix.
