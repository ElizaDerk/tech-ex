import type {ContactInput} from '@/schemas/contact';

export type HubspotErrorCode = 'hubspot_config_missing' | 'hubspot_non_2xx' | 'hubspot_network' | 'hubspot_timeout';

export class HubspotError extends Error {
	readonly code: HubspotErrorCode;

	constructor(code: HubspotErrorCode) {
		super(code);
		this.name = 'HubspotError';
		this.code = code;
	}
}

const OBJECT_TYPE_CONTACT = '0-1';
const TIMEOUT_MS = 10000;

export async function submitToHubspot(data: ContactInput): Promise<void> {
	const portalId = process.env.HUBSPOT_PORTAL_ID;
	const formId = process.env.HUBSPOT_FORM_ID;
	const apiHost = process.env.HUBSPOT_API_HOST;

	if (!portalId || !formId || !apiHost) {
		throw new HubspotError('hubspot_config_missing');
	}

	const values: [string, string | undefined][] = [
		['firstname', data.firstName],
		['lastname', data.lastName],
		['email', data.email],
		['phone', data.phone],
		['message', data.message],
	];
	const fields = values
		.filter(([name, value]) => value !== undefined && !(name === 'phone' && value === ''))
		.map(([name, value]) => ({objectTypeId: OBJECT_TYPE_CONTACT, name, value}));

	let response: Response;
	try {
		response = await fetch(`https://${apiHost}/submissions/v3/integration/submit/${portalId}/${formId}`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({fields}),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
	} catch (error) {
		if (error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
			throw new HubspotError('hubspot_timeout');
		}
		throw new HubspotError('hubspot_network');
	}

	if (!response.ok) {
		throw new HubspotError('hubspot_non_2xx');
	}
}
