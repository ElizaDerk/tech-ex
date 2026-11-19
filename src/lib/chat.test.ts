import {beforeEach, describe, expect, it, vi} from 'vitest';
import {chat} from '@/data/chat';
import {answerChat} from '@/lib/chat';
import {buildSystemPrompt} from '@/lib/chat-prompt';
import {isRateLimited} from '@/lib/chat-rate-limit';
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

vi.mock('@/lib/chat-rate-limit', () => ({isRateLimited: vi.fn(() => false)}));

const generate = vi.mocked(generateAnswer);
const limited = vi.mocked(isRateLimited);

const input: ChatInput = {messages: [{role: 'user', content: 'What services do you offer?'}]};

beforeEach(() => {
	generate.mockReset();
	limited.mockReset();
	limited.mockReturnValue(false);
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

	it('passes a multi-turn conversation to the provider unchanged and in order', async () => {
		generate.mockResolvedValue('Answer');
		const conversation: ChatInput = {
			messages: [
				{role: 'user', content: 'What are the stages of a project?'},
				{role: 'assistant', content: 'There are four stages.'},
				{role: 'user', content: 'What happens at the second one?'},
			],
		};
		await answerChat(conversation, '1.2.3.4');
		expect(generate).toHaveBeenCalledTimes(1);
		const [systemPrompt, messages] = generate.mock.calls[0];
		expect(messages).toEqual(conversation.messages);
		expect(systemPrompt).toBe(buildSystemPrompt());
		for (const message of conversation.messages) expect(systemPrompt).not.toContain(message.content);
	});

	it('returns rate_limited without calling the provider when the limiter blocks', async () => {
		limited.mockReturnValue(true);
		await expect(answerChat(input, '1.2.3.4')).resolves.toEqual({ok: false, error: 'rate_limited'});
		expect(generate).not.toHaveBeenCalled();
	});

	it('returns conversation_limit for 20 messages without calling the provider', async () => {
		const messages = Array.from({length: 20}, (_, index) => ({
			role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
			content: 'text',
		}));
		const result = await answerChat({messages: [...messages.slice(0, 19), {role: 'user', content: 'text'}]}, '1.2.3.4');
		expect(result).toEqual({ok: false, error: 'conversation_limit'});
		expect(generate).not.toHaveBeenCalled();
	});

	it('allows a conversation of 19 messages', async () => {
		generate.mockResolvedValue('Answer');
		const messages = Array.from({length: 19}, (_, index) => ({
			role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
			content: 'text',
		}));
		await expect(answerChat({messages}, '1.2.3.4')).resolves.toEqual({ok: true, answer: 'Answer'});
	});

	it('answers a filled honeypot even when the limiter blocks, without consuming the limit', async () => {
		limited.mockReturnValue(true);
		const result = await answerChat({...input, chat_hp: 'bot'}, '1.2.3.4');
		expect(result).toEqual({ok: true, answer: chat.honeypotAnswer});
		expect(limited).not.toHaveBeenCalled();
	});
});
