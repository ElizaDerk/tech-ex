'use client';

import {useState} from 'react';
import type {Dispatch, FormEvent, SetStateAction} from 'react';
import {chat} from '@/data/chat';
import {sendChat} from '@/lib/send-chat';
import type {ChatMessage} from '@/schemas/chat';

type ChatPanelProps = {
	messages: ChatMessage[];
	setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
	onClose: () => void;
};

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900';

export function ChatPanel({messages, setMessages, onClose}: ChatPanelProps) {
	const [text, setText] = useState('');
	const [honeypot, setHoneypot] = useState('');
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (loading) return;

		setFailed(false);
		setLoading(true);
		const userMessage: ChatMessage = {role: 'user', content: text};
		const result = await sendChat({messages: [...messages, userMessage], chat_hp: honeypot});
		setLoading(false);

		if (result.status === 'success') {
			setMessages(current => [...current, userMessage, {role: 'assistant', content: result.answer}]);
			setText('');
		} else {
			setFailed(true);
		}
	}

	return (
		<section
			aria-labelledby="chat-heading"
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
					onClick={onClose}
					className={`rounded border border-slate-400 px-3 py-1 text-sm ${focusClass}`}
				>
					{chat.closeLabel}
				</button>
			</div>
			<div className="flex-1 space-y-3 overflow-y-auto p-4">
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
				<p className="mb-3 text-sm text-slate-700">{chat.aiNote}</p>
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
						id="chat-input"
						type="text"
						value={text}
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
						disabled={loading}
						className={`rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60 ${focusClass}`}
					>
						{chat.sendLabel}
					</button>
					<p className="min-h-6 text-sm">
						{loading && <span>{chat.loadingText}</span>}
						{failed && <span className="text-red-700">{chat.genericError}</span>}
					</p>
				</form>
			</div>
		</section>
	);
}
