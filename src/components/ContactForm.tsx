'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {contactForm} from '@/data/contact';
import {sendContact} from '@/lib/send-contact';
import {contactSchema} from '@/schemas/contact';
import type {ContactInput} from '@/schemas/contact';

type TextField = 'firstName' | 'lastName' | 'email' | 'phone' | 'message';

const controlClass =
	'mt-1 block w-full rounded border border-slate-400 bg-white px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 aria-invalid:border-red-700';

export function ContactForm() {
	const {
		register,
		handleSubmit,
		setError,
		formState: {errors, isSubmitting},
	} = useForm<ContactInput>({resolver: zodResolver(contactSchema)});
	const [sent, setSent] = useState(false);
	const [failed, setFailed] = useState(false);

	async function onSubmit(values: ContactInput) {
		setFailed(false);
		const result = await sendContact(values);
		if (result.status === 'success') {
			setSent(true);
		} else if (result.status === 'fieldErrors') {
			for (const [field, key] of Object.entries(result.fieldErrors)) {
				if (field in contactForm.labels) setError(field as TextField, {message: key});
			}
		} else {
			setFailed(true);
		}
	}

	function describedBy(field: TextField, hasHint: boolean) {
		const ids = [hasHint ? `${field}-hint` : null, errors[field] ? `${field}-error` : null];
		return ids.filter(Boolean).join(' ') || undefined;
	}

	function renderField(field: TextField, type?: 'text' | 'email' | 'tel', hint?: string) {
		const error = errors[field];
		const common = {
			id: field,
			className: controlClass,
			'aria-invalid': error ? true : undefined,
			'aria-describedby': describedBy(field, Boolean(hint)),
			...register(field),
		};
		return (
			<div>
				<label
					htmlFor={field}
					className="block font-medium"
				>
					{contactForm.labels[field]}
				</label>
				{hint && (
					<p
						id={`${field}-hint`}
						className="mt-1 text-sm text-slate-700"
					>
						{hint}
					</p>
				)}
				{type ? (
					<input
						type={type}
						{...common}
					/>
				) : (
					<textarea
						rows={5}
						{...common}
					/>
				)}
				{error && (
					<p
						id={`${field}-error`}
						role="alert"
						className="mt-1 text-sm text-red-700"
					>
						{contactForm.errorMessages[error.message ?? ''] ?? contactForm.genericError}
					</p>
				)}
			</div>
		);
	}

	return (
		<div className="mt-8">
			{!sent && (
				<form
					noValidate
					onSubmit={handleSubmit(onSubmit)}
					className="relative grid gap-6"
				>
					{renderField('firstName', 'text')}
					{renderField('lastName', 'text')}
					{renderField('email', 'email')}
					{renderField('phone', 'tel', contactForm.hints.phone)}
					{renderField('message', undefined, contactForm.hints.message)}
					<div className="absolute -left-[9999px] h-px w-px overflow-hidden">
						<label htmlFor="contact_hp">{contactForm.labels.honeypot}</label>
						<input
							id="contact_hp"
							type="text"
							tabIndex={-1}
							autoComplete="off"
							aria-hidden="true"
							{...register('contact_hp')}
						/>
					</div>
					<div>
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-60"
						>
							{isSubmitting ? contactForm.submittingLabel : contactForm.submitLabel}
						</button>
					</div>
				</form>
			)}
			<div
				role="status"
				aria-live="polite"
				className="mt-4"
			>
				{sent && (
					<div>
						<h3 className="text-xl font-bold">{contactForm.successTitle}</h3>
						<p className="mt-2 text-slate-700">{contactForm.successText}</p>
					</div>
				)}
				{failed && <p className="text-red-700">{contactForm.genericError}</p>}
			</div>
		</div>
	);
}
