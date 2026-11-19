import {chatErrors} from '@/lib/chat-errors';
import type {ChatErrorCode} from '@/lib/chat-errors';
import type {ChatInput} from '@/schemas/chat';

export type SendChatResult =
	| {status: 'success'; answer: string}
	| {status: 'error'; code: ChatErrorCode | 'unknown'}
	| {status: 'fieldErrors'; fieldErrors: Record<string, string>};

function isStringRecord(value: unknown): value is Record<string, string> {
	return typeof value === 'object' && value !== null && Object.values(value).every(entry => typeof entry === 'string');
}

function isChatErrorCode(value: unknown): value is ChatErrorCode {
	return typeof value === 'string' && value in chatErrors;
}

export async function sendChat(values: ChatInput): Promise<SendChatResult> {
	try {
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(values),
		});
		const body: unknown = await response.json();
		if (typeof body !== 'object' || body === null) return {status: 'error', code: 'unknown'};

		if (response.status === 200 && 'answer' in body && typeof body.answer === 'string') {
			return {status: 'success', answer: body.answer};
		}
		if (response.status === 400 && 'fieldErrors' in body && isStringRecord(body.fieldErrors)) {
			return {status: 'fieldErrors', fieldErrors: body.fieldErrors};
		}
		if ('error' in body && isChatErrorCode(body.error)) {
			return {status: 'error', code: body.error};
		}
		return {status: 'error', code: 'unknown'};
	} catch {
		return {status: 'error', code: 'unknown'};
	}
}
