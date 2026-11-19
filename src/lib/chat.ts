import {chat} from '@/data/chat';
import type {ChatErrorCode} from '@/lib/chat-errors';
import {buildSystemPrompt} from '@/lib/chat-prompt';
import {generateAnswer} from '@/lib/gemini';
import type {ChatInput} from '@/schemas/chat';

export type ChatResult = {ok: true; answer: string} | {ok: false; error: ChatErrorCode};

export async function answerChat(input: ChatInput, ip: string): Promise<ChatResult> {
	void ip;
	if (input.chat_hp) return {ok: true, answer: chat.honeypotAnswer};

	try {
		const answer = await generateAnswer(buildSystemPrompt(), input.messages);
		return {ok: true, answer};
	} catch {
		return {ok: false, error: 'provider_unavailable'};
	}
}
