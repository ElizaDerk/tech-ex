import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ProviderError, generateAnswer} from '@/lib/gemini';
import type {ChatMessage} from '@/schemas/chat';

const messages: ChatMessage[] = [
	{role: 'user', content: 'Hi'},
	{role: 'assistant', content: 'Hello'},
	{role: 'user', content: 'What do you build?'},
];

const secretBody = 'SECRET_PROVIDER_BODY';

function okResponse(text: string) {
	return new Response(JSON.stringify({candidates: [{content: {parts: [{text}]}}]}));
}

const fetchMock = vi.fn();

beforeEach(() => {
	vi.stubEnv('GEMINI_API_KEY', 'test-key');
	vi.stubEnv('GEMINI_MODEL', 'test-model');
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	fetchMock.mockReset();
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

async function failure(promise: Promise<string>) {
	try {
		await promise;
	} catch (error) {
		return error;
	}
	return null;
}

describe('generateAnswer', () => {
	it('sends the request in the provider format and returns the answer', async () => {
		fetchMock.mockResolvedValue(okResponse('We build bridges.'));
		await expect(generateAnswer('SYSTEM', messages)).resolves.toBe('We build bridges.');

		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toContain('/models/test-model:generateContent');
		expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('test-key');

		const body = JSON.parse(init.body as string);
		expect(body.systemInstruction.parts[0].text).toBe('SYSTEM');
		expect(body.contents.map((content: {role: string}) => content.role)).toEqual(['user', 'model', 'user']);
		expect(body.generationConfig.maxOutputTokens).toBe(400);
		expect(body.generationConfig.thinkingConfig).toEqual({thinkingLevel: 'LOW'});
	});

	it('joins several text parts', async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({candidates: [{content: {parts: [{text: 'One '}, {text: 'two'}]}}]})),
		);
		await expect(generateAnswer('SYSTEM', messages)).resolves.toBe('One two');
	});

	it('throws ProviderError on a 429 response without leaking the body', async () => {
		fetchMock.mockResolvedValue(new Response(secretBody, {status: 429}));
		const error = await failure(generateAnswer('SYSTEM', messages));
		expect(error).toBeInstanceOf(ProviderError);
		expect(String(error)).not.toContain(secretBody);
	});

	it('throws ProviderError on a network error', async () => {
		fetchMock.mockRejectedValue(new TypeError('network down'));
		expect(await failure(generateAnswer('SYSTEM', messages))).toBeInstanceOf(ProviderError);
	});

	it('throws ProviderError on a timeout', async () => {
		fetchMock.mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
		expect(await failure(generateAnswer('SYSTEM', messages))).toBeInstanceOf(ProviderError);
	});

	it.each([[''], ['   ']])('throws ProviderError on empty text %j', async text => {
		fetchMock.mockResolvedValue(okResponse(text));
		expect(await failure(generateAnswer('SYSTEM', messages))).toBeInstanceOf(ProviderError);
	});

	it('throws ProviderError when the environment variables are missing', async () => {
		vi.stubEnv('GEMINI_API_KEY', '');
		expect(await failure(generateAnswer('SYSTEM', messages))).toBeInstanceOf(ProviderError);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
