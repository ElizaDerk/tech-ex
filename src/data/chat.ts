import type {ChatContent} from './types';

export const chat: ChatContent = {
	buttonLabel: 'Ask a question',
	heading: 'Ask about Spanwright',
	closeLabel: 'Close chat',
	sendLabel: 'Send',
	loadingText: 'Thinking...',
	aiNote: 'This assistant is AI. Its answers may be inaccurate. For a reliable answer, use the contact form.',
	contactLinkText: 'Request a quote',
	labels: {
		input: 'Your question',
		honeypot: 'Leave this field empty',
	},
	honeypotAnswer: 'Thanks for your question. For details about your project, please use the Request a quote form.',
	genericError: 'Something went wrong. Please try again.',
	errorMessages: {
		validation_failed: 'Please check your message and try again.',
		invalid_request: 'Something went wrong. Please try again.',
		rate_limited: 'You are sending messages too fast. Please wait a moment and try again.',
		conversation_limit:
			'This conversation has reached its length limit. Please use the Request a quote form to continue.',
		provider_unavailable: 'The assistant is not available right now. Please try again later or use the contact form.',
		'message.empty': 'Write a question before sending.',
		'message.tooLong': 'Shorten your question to at most 500 characters.',
		'messages.tooMany': 'This conversation has reached its length limit. Please use the Request a quote form.',
		'messages.empty': 'Write a question before sending.',
		'messages.lastMustBeUser': 'Something went wrong. Please try again.',
	},
};
