'use client';

import {useEffect, useRef, useState} from 'react';
import type {Dispatch, FormEvent, KeyboardEvent, MouseEvent, SetStateAction} from 'react';
import {chat} from '@/data/chat';
import {contactId} from '@/data/contact';
import {sendChat} from '@/lib/send-chat';
import {MAX_MESSAGES, chatSchema} from '@/schemas/chat';
import type {ChatMessage} from '@/schemas/chat';

type ChatPanelProps = {
	messages: ChatMessage[];
	setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
	onClose: (restoreFocus?: boolean) => void;
};

// The visitor's message plus the answer must fit in the conversation limit.
const CONVERSATION_FULL = MAX_MESSAGES - 1;

function errorText(key: string): string {
	return chat.errorMessages[key] ?? chat.genericError;
}

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900';

export function ChatPanel({messages, setMessages, onClose}: ChatPanelProps) {
	const [text, setText] = useState('');
	const [honeypot, setHoneypot] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const conversationFull = messages.length >= CONVERSATION_FULL;

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	function onKeyDown(event: KeyboardEvent<HTMLElement>) {
		if (event.key === 'Escape') onClose();
	}

	function onContactClick(event: MouseEvent<HTMLAnchorElement>) {
		event.preventDefault();
		onClose(false);
		requestAnimationFrame(() => {
			document.getElementById(contactId)?.scrollIntoView();
			document.getElementById('firstName')?.focus();
		});
	}

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (loading || conversationFull) return;

		const userMessage: ChatMessage = {role: 'user', content: text};
		const validation = chatSchema.safeParse({messages: [...messages, userMessage]});
		if (!validation.success) {
			const issue = validation.error.issues.find(item => item.path[0] === 'messages' && item.path[2] === 'content');
			setError(errorText(issue?.message ?? 'message.empty'));
			return;
		}

		setError('');
		setLoading(true);
		const result = await sendChat({messages: [...messages, userMessage], chat_hp: honeypot});
		setLoading(false);

		if (result.status === 'success') {
			setMessages(current => [...current, userMessage, {role: 'assistant', content: result.answer}]);
			setText('');
		} else if (result.status === 'error') {
			setError(errorText(result.code));
		} else {
			const key = Object.values(result.fieldErrors)[0] ?? '';
			setError(errorText(key));
		}
	}

	return (
		<section
			id="chat-panel"
			role="dialog"
			aria-labelledby="chat-heading"
			onKeyDown={onKeyDown}
			className="fixed right-4 bottom-20 left-4 z-50 flex max-h-[70vh] flex-col rounded border border-slate-400 bg-white shadow-lg sm:left-auto sm:w-96"
		>
			<div className="flex items-center justify-between gap-2 border-b border-slate-300 p-4">
				<h2
					id="chat-heading"
					className="text-lg font-bold"
				>
					{chat.heading}
				</h2>
				<button
					type="button"
					onClick={() => onClose()}
					className={`rounded border border-slate-400 px-3 py-1 text-sm ${focusClass}`}
				>
					{chat.closeLabel}
				</button>
			</div>
			<div
				role="log"
				className="flex-1 space-y-3 overflow-y-auto p-4"
			>
				{messages.map((message, index) => (
					<p
						key={index}
						className={`rounded px-3 py-2 whitespace-pre-line ${message.role === 'user' ? 'ml-8 bg-slate-900 text-white' : 'mr-8 bg-slate-100'}`}
					>
						{message.content}
					</p>
				))}
			</div>
			<div className="border-t border-slate-300 p-4">
				<p className="text-sm text-slate-700">{chat.aiNote}</p>
				<a
					href={`#${contactId}`}
					onClick={onContactClick}
					className={`mt-1 mb-3 inline-block text-sm font-medium underline ${focusClass}`}
				>
					{chat.contactLinkText}
				</a>
				<form
					onSubmit={onSubmit}
					className="relative grid gap-2"
				>
					<label
						htmlFor="chat-input"
						className="font-medium"
					>
						{chat.labels.input}
					</label>
					<input
						ref={inputRef}
						id="chat-input"
						type="text"
						value={text}
						disabled={conversationFull}
						onChange={event => setText(event.target.value)}
						className={`block w-full rounded border border-slate-400 bg-white px-3 py-2 ${focusClass}`}
					/>
					<div className="absolute -left-[9999px] h-px w-px overflow-hidden">
						<label htmlFor="chat_hp">{chat.labels.honeypot}</label>
						<input
							id="chat_hp"
							type="text"
							tabIndex={-1}
							autoComplete="off"
							aria-hidden="true"
							value={honeypot}
							onChange={event => setHoneypot(event.target.value)}
						/>
					</div>
					<button
						type="submit"
						disabled={loading || conversationFull}
						className={`rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60 ${focusClass}`}
					>
						{chat.sendLabel}
					</button>
					<p
						role="status"
						aria-live="polite"
						className="min-h-6 text-sm"
					>
						{loading && <span>{chat.loadingText}</span>}
						{conversationFull ? (
							<span className="text-red-700">{chat.errorMessages.conversation_limit}</span>
						) : (
							error && <span className="text-red-700">{error}</span>
						)}
					</p>
				</form>
			</div>
		</section>
	);
}
