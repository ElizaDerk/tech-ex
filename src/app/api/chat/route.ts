import {chatErrors} from '@/lib/chat-errors';
import type {ChatErrorCode} from '@/lib/chat-errors';
import {answerChat} from '@/lib/chat';
import {chatSchema} from '@/schemas/chat';

function errorResponse(error: ChatErrorCode, extra?: Record<string, unknown>) {
	const headers = error === 'rate_limited' ? {'Retry-After': '60'} : undefined;
	return Response.json({error, ...extra}, {status: chatErrors[error], headers});
}

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorResponse('invalid_request');
	}

	const parsed = chatSchema.safeParse(body);
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const field = String(issue.path[0]);
			if (!(field in fieldErrors)) fieldErrors[field] = issue.message;
		}
		return errorResponse('validation_failed', {fieldErrors});
	}

	const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
	const result = await answerChat(parsed.data, ip);
	if (result.ok) return Response.json({answer: result.answer});

	if (result.error === 'provider_unavailable') console.error('chat_provider_unavailable');
	return errorResponse(result.error);
}
