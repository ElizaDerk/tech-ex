import {contactErrors} from '@/lib/contact-errors';
import type {ContactErrorCode} from '@/lib/contact-errors';
import {HubspotError, submitToHubspot} from '@/lib/hubspot';
import {contactSchema} from '@/schemas/contact';

function errorResponse(error: ContactErrorCode, extra?: Record<string, unknown>) {
	return Response.json({error, ...extra}, {status: contactErrors[error]});
}

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorResponse('invalid_request');
	}

	const parsed = contactSchema.safeParse(body);
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const field = String(issue.path[0]);
			if (!(field in fieldErrors)) fieldErrors[field] = issue.message;
		}
		return errorResponse('validation_failed', {fieldErrors});
	}

	if (parsed.data.contact_hp) {
		return Response.json({ok: true});
	}

	try {
		await submitToHubspot(parsed.data);
		return Response.json({ok: true});
	} catch (error) {
		console.error(error instanceof HubspotError ? error.code : 'hubspot_unknown');
		return errorResponse('submission_failed');
	}
}
