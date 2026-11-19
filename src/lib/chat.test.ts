import {beforeEach, describe, expect, it, vi} from 'vitest';
import {chat} from '@/data/chat';
import {answerChat} from '@/lib/chat';
import {buildSystemPrompt} from '@/lib/chat-prompt';
import {ProviderError, generateAnswer} from '@/lib/gemini';
import type {ChatInput} from '@/schemas/chat';

vi.mock('@/lib/gemini', () => {
	class MockProviderError extends Error {
		code: string;
		constructor(code: string) {
			super(code);
			this.code = code;
		}
	}
	return {ProviderError: MockProviderError, generateAnswer: vi.fn()};
});

const generate = vi.mocked(generateAnswer);

const input: ChatInput = {messages: [{role: 'user', content: 'What services do you offer?'}]};

beforeEach(() => {
	generate.mockReset();
});

describe('answerChat', () => {
	it('returns the provider answer', async () => {
		generate.mockResolvedValue('We build bridges.');
		await expect(answerChat(input, '1.2.3.4')).resolves.toEqual({ok: true, answer: 'We build bridges.'});
	});

	it('passes the system prompt and the messages to the provider', async () => {
		generate.mockResolvedValue('Answer');
		await answerChat(input, '1.2.3.4');
		expect(generate).toHaveBeenCalledWith(buildSystemPrompt(), input.messages);
	});

	it('returns the fixed honeypot answer without calling the provider', async () => {
		const result = await answerChat({...input, chat_hp: 'bot'}, '1.2.3.4');
		expect(result).toEqual({ok: true, answer: chat.honeypotAnswer});
		expect(generate).not.toHaveBeenCalled();
	});

	it('maps a ProviderError to provider_unavailable without provider text', async () => {
		generate.mockRejectedValue(new ProviderError('status_429'));
		const result = await answerChat(input, '1.2.3.4');
		expect(result).toEqual({ok: false, error: 'provider_unavailable'});
		expect(JSON.stringify(result)).not.toContain('status_429');
	});
});
