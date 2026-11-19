import {z} from 'zod';

export const MAX_MESSAGES = 20;

const userMessage = z.object({
	role: z.literal('user'),
	content: z
		.string({error: 'message.empty'})
		.trim()
		.min(1, {error: 'message.empty'})
		.max(500, {error: 'message.tooLong'}),
});

const assistantMessage = z.object({
	role: z.literal('assistant'),
	content: z
		.string({error: 'message.empty'})
		.trim()
		.min(1, {error: 'message.empty'})
		.max(2000, {error: 'message.tooLong'}),
});

export const chatSchema = z.object({
	messages: z
		.array(z.discriminatedUnion('role', [userMessage, assistantMessage]), {error: 'messages.empty'})
		.min(1, {error: 'messages.empty'})
		.max(MAX_MESSAGES, {error: 'messages.tooMany'})
		.refine(messages => messages[messages.length - 1]?.role === 'user', {error: 'messages.lastMustBeUser'}),
	chat_hp: z.string().optional(),
});

export type ChatInput = z.infer<typeof chatSchema>;
export type ChatMessage = ChatInput['messages'][number];
