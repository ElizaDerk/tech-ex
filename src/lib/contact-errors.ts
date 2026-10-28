export const contactErrors = {
	validation_failed: 400,
	invalid_request: 400,
	submission_failed: 502,
} as const;

export type ContactErrorCode = keyof typeof contactErrors;
