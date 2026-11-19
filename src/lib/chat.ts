import {chat} from '@/data/chat';
import type {ChatErrorCode} from '@/lib/chat-errors';
import {buildSystemPrompt} from '@/lib/chat-prompt';
import {isRateLimited} from '@/lib/chat-rate-limit';
import {generateAnswer} from '@/lib/gemini';
import {MAX_MESSAGES} from '@/schemas/chat';
import type {ChatInput} from '@/schemas/chat';

export type ChatResult = {ok: true; answer: string} | {ok: false; error: ChatErrorCode};

export async function answerChat(input: ChatInput, ip: string): Promise<ChatResult> {
	if (input.chat_hp) return {ok: true, answer: chat.honeypotAnswer};

	if (isRateLimited(ip)) return {ok: false, error: 'rate_limited'};
	// The answer would be the (MAX_MESSAGES + 1)th message of the conversation.
	if (input.messages.length >= MAX_MESSAGES) return {ok: false, error: 'conversation_limit'};

	try {
		const answer = await generateAnswer(buildSystemPrompt(), input.messages);
		return {ok: true, answer};
	} catch {
		return {ok: false, error: 'provider_unavailable'};
	}
}
