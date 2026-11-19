import {describe, expect, it} from 'vitest';
import {chatSchema} from '@/schemas/chat';

type Message = {role: string; content: string};

const user = (content: string): Message => ({role: 'user', content});
const assistant = (content: string): Message => ({role: 'assistant', content});

function issues(input: unknown) {
	const result = chatSchema.safeParse(input);
	if (result.success) return null;
	return result.error.issues.map(issue => issue.message);
}

function conversation(length: number): Message[] {
	return Array.from({length}, (_, index) => ((length - 1 - index) % 2 === 0 ? user('Hi') : assistant('Hello')));
}

describe('chatSchema', () => {
	it('parses a valid single user message', () => {
		expect(chatSchema.safeParse({messages: [user('What do you build?')]}).success).toBe(true);
	});

	it('accepts a user message of exactly 1 character', () => {
		expect(chatSchema.safeParse({messages: [user('a')]}).success).toBe(true);
	});

	it.each(['', '   '])('rejects empty or whitespace-only user content %j', content => {
		expect(issues({messages: [user(content)]})).toContain('message.empty');
	});

	it('accepts exactly 500 characters and rejects 501', () => {
		expect(chatSchema.safeParse({messages: [user('a'.repeat(500))]}).success).toBe(true);
		expect(issues({messages: [user('a'.repeat(501))]})).toContain('message.tooLong');
	});

	it('trims content before measuring', () => {
		const result = chatSchema.safeParse({messages: [user(`  ${'a'.repeat(500)}  `)]});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.messages[0].content).toHaveLength(500);
	});

	it('accepts assistant content of 2000 characters and rejects 2001', () => {
		const messages = (text: string) => [user('Hi'), assistant(text), user('More')];
		expect(chatSchema.safeParse({messages: messages('a'.repeat(2000))}).success).toBe(true);
		expect(issues({messages: messages('a'.repeat(2001))})).toContain('message.tooLong');
	});

	it('accepts 20 messages and rejects 21', () => {
		expect(chatSchema.safeParse({messages: conversation(20)}).success).toBe(true);
		expect(issues({messages: conversation(21)})).toContain('messages.tooMany');
	});

	it('rejects an empty array', () => {
		expect(issues({messages: []})).toContain('messages.empty');
	});

	it('rejects a last message with role assistant', () => {
		expect(issues({messages: [user('Hi'), assistant('Hello')]})).toContain('messages.lastMustBeUser');
	});

	it('rejects an unknown role', () => {
		expect(chatSchema.safeParse({messages: [{role: 'system', content: 'Hi'}]}).success).toBe(false);
	});

	it('treats chat_hp as optional and accepts it when filled', () => {
		expect(chatSchema.safeParse({messages: [user('Hi')]}).success).toBe(true);
		expect(chatSchema.safeParse({messages: [user('Hi')], chat_hp: 'bot'}).success).toBe(true);
	});
});
