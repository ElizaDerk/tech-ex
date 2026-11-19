# Contract: `POST /api/chat`

## Request

`Content-Type: application/json`

```json
{
	"messages": [
		{"role": "user", "content": "string, 1-500 characters after trim"},
		{"role": "assistant", "content": "string, 1-2000 characters after trim"},
		{"role": "user", "content": "string, the new question"}
	],
	"chat_hp": "string (honeypot, must be empty for real visitors)"
}
```

Rules: 1 to 20 messages; the last one has role `user`. Roles are `user` or `assistant`.

## Responses

| Status | Body | When |
|--------|------|------|
| 200 | `{"answer": "string"}` | Answer from the provider, or the fixed honeypot answer (same shape, provider not called) |
| 400 | `{"error": "validation_failed", "fieldErrors": {"<field>": "<message key>"}}` | Body fails the shared Zod schema |
| 400 | `{"error": "invalid_request"}` | Body is not valid JSON |
| 422 | `{"error": "conversation_limit"}` | The conversation already holds 20 messages |
| 429 | `{"error": "rate_limited"}` with a `Retry-After` header | More than 10 requests per minute from the same IP |
| 502 | `{"error": "provider_unavailable"}` | Provider failed, timed out, returned 429 or an empty/blocked answer, or env vars are missing |

`fieldErrors` values are stable message keys, not text. The client resolves them through `src/data/chat.ts`.

`answer` is plain text. The client renders it as text only (`whitespace-pre-line`), never as HTML.

No response contains provider output, the system prompt, stack traces or internal messages. On a 502 the server logs only a sanitized code with `console.error`, never the provider body or any message content.

## Check order

1. Parse JSON (`invalid_request`)
2. Validate with the schema (`validation_failed`)
3. Honeypot filled → 200 with the fixed answer
4. Rate limit (`rate_limited`)
5. Conversation limit (`conversation_limit`)
6. Provider call (`provider_unavailable` on failure)

## Outbound (server to Gemini)

`POST https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent`

Headers: `Content-Type: application/json`, `x-goog-api-key: {GEMINI_API_KEY}`

```json
{
	"systemInstruction": {"parts": [{"text": "<system prompt>"}]},
	"contents": [{"role": "user | model", "parts": [{"text": "..."}]}],
	"generationConfig": {"temperature": 0.2, "maxOutputTokens": 400, "thinkingConfig": {"<minimal thinking setting, see research.md>": "..."}}
}
```

The answer is read from `candidates[0].content.parts[*].text`. Any non-2xx status, network error, 10-second timeout, or missing text maps to `provider_unavailable`. Field names and the endpoint are to be re-checked against the current Gemini documentation during implementation. This is the only place that knows the provider format (`src/lib/gemini.ts`).
