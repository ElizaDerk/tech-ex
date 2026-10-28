# Contract: `POST /api/contact`

## Request

`Content-Type: application/json`

```json
{
	"firstName": "string",
	"lastName": "string",
	"email": "string",
	"phone": "string (optional)",
	"message": "string",
	"website": "string (honeypot, must be empty for real visitors)"
}
```

## Responses

| Status | Body | When |
|--------|------|------|
| 200 | `{"ok": true}` | Submitted to HubSpot, or honeypot filled (silently dropped; indistinguishable) |
| 400 | `{"error": "validation_failed", "fieldErrors": {"<field>": "<message key>"}}` | Body fails the shared Zod schema |
| 400 | `{"error": "invalid_request"}` | Body is not valid JSON |
| 502 | `{"error": "submission_failed"}` | HubSpot rejected the request, was unreachable or timed out, or env vars are missing |

`fieldErrors` values are stable message keys, not text. The client resolves them through `errorMessages` in `src/data/contact.ts`.

No response contains HubSpot output, stack traces or internal messages.

## Outbound (server to HubSpot)

`POST https://{HUBSPOT_API_HOST}/submissions/v3/integration/submit/{HUBSPOT_PORTAL_ID}/{HUBSPOT_FORM_ID}`

```json
{
	"fields": [
		{"objectTypeId": "0-1", "name": "firstname", "value": "..."},
		{"objectTypeId": "0-1", "name": "lastname", "value": "..."},
		{"objectTypeId": "0-1", "name": "email", "value": "..."},
		{"objectTypeId": "0-1", "name": "phone", "value": "..."},
		{"objectTypeId": "0-1", "name": "message", "value": "..."}
	]
}
```

Environment variables (server-side only, listed in `.env.example` with empty values): `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID`, `HUBSPOT_API_HOST`.
