import type {ChatMessage} from '@/schemas/chat';

export class ProviderError extends Error {
	code: string;

	constructor(code: string) {
		super(code);
		this.name = 'ProviderError';
		this.code = code;
	}
}

type GeminiResponse = {
	candidates?: {content?: {parts?: {text?: string}[]}}[];
};

const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function generateAnswer(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
	const apiKey = process.env.GEMINI_API_KEY;
	const model = process.env.GEMINI_MODEL;
	if (!apiKey || !model) throw new ProviderError('missing_env');

	let response: Response;
	try {
		response = await fetch(`${endpoint}/${encodeURIComponent(model)}:generateContent`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json', 'x-goog-api-key': apiKey},
			body: JSON.stringify({
				systemInstruction: {parts: [{text: systemPrompt}]},
				contents: messages.map(message => ({
					role: message.role === 'assistant' ? 'model' : 'user',
					parts: [{text: message.content}],
				})),
				generationConfig: {
					temperature: 0.2,
					maxOutputTokens: 400,
					thinkingConfig: {thinkingLevel: 'LOW'},
				},
			}),
			signal: AbortSignal.timeout(10000),
		});
	} catch {
		throw new ProviderError('network');
	}

	if (!response.ok) throw new ProviderError(`status_${response.status}`);

	let body: GeminiResponse;
	try {
		body = (await response.json()) as GeminiResponse;
	} catch {
		throw new ProviderError('bad_body');
	}

	const parts = body.candidates?.[0]?.content?.parts ?? [];
	const text = parts.map(part => part.text ?? '').join('');
	if (!text.trim()) throw new ProviderError('empty_answer');
	return text.trim();
}
