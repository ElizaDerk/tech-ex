'use client';

import {useRef, useState} from 'react';
import {ChatPanel} from '@/components/ChatPanel';
import {chat} from '@/data/chat';
import type {ChatMessage} from '@/schemas/chat';

export function ChatAssistant() {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const buttonRef = useRef<HTMLButtonElement>(null);

	function close(restoreFocus = true) {
		setOpen(false);
		if (restoreFocus) buttonRef.current?.focus();
	}

	return (
		<>
			{open && (
				<ChatPanel
					messages={messages}
					setMessages={setMessages}
					onClose={close}
				/>
			)}
			<button
				ref={buttonRef}
				type="button"
				aria-expanded={open}
				aria-controls="chat-panel"
				onClick={() => setOpen(value => !value)}
				className="fixed right-4 bottom-4 z-50 rounded-full bg-slate-900 px-5 py-3 font-medium text-white shadow-lg hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
			>
				{chat.buttonLabel}
			</button>
		</>
	);
}
