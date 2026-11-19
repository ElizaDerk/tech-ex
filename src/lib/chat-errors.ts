export const chatErrors = {
	validation_failed: 400,
	invalid_request: 400,
	rate_limited: 429,
	conversation_limit: 422,
	provider_unavailable: 502,
} as const;

export type ChatErrorCode = keyof typeof chatErrors;
