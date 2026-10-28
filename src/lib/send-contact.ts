import type {ContactInput} from '@/schemas/contact';

export type SendContactResult =
	{status: 'success'} | {status: 'fieldErrors'; fieldErrors: Record<string, string>} | {status: 'error'};

function isStringRecord(value: unknown): value is Record<string, string> {
	return typeof value === 'object' && value !== null && Object.values(value).every(entry => typeof entry === 'string');
}

export async function sendContact(values: ContactInput): Promise<SendContactResult> {
	try {
		const response = await fetch('/api/contact', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(values),
		});
		const body: unknown = await response.json();
		if (typeof body !== 'object' || body === null) return {status: 'error'};

		if (response.status === 200 && 'ok' in body && body.ok === true) {
			return {status: 'success'};
		}
		if (response.status === 400 && 'fieldErrors' in body && isStringRecord(body.fieldErrors)) {
			return {status: 'fieldErrors', fieldErrors: body.fieldErrors};
		}
		return {status: 'error'};
	} catch {
		return {status: 'error'};
	}
}
