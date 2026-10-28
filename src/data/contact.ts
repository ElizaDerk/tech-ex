import type {ContactContent, ContactFormContent} from './types';

export const contactId = 'contact';

export const contact: ContactContent = {
	id: contactId,
	heading: 'Request a quote',
	intro: 'Tell us about your bridge project and we will get back to you.',
};

export const contactForm: ContactFormContent = {
	labels: {
		firstName: 'First name',
		lastName: 'Last name',
		email: 'Email',
		phone: 'Phone (optional)',
		message: 'Message',
		honeypot: 'Leave this field empty',
	},
	hints: {
		phone: 'Digits, spaces, +, -, ( and ) only, 7 to 20 characters.',
		message: 'Between 10 and 1000 characters.',
	},
	submitLabel: 'Send message',
	submittingLabel: 'Sending...',
	successTitle: 'Thank you!',
	successText: 'Your message was sent. We will get back to you soon.',
	genericError: 'Something went wrong. Please try again.',
	errorMessages: {
		'firstName.required': 'Enter your first name.',
		'lastName.required': 'Enter your last name.',
		'email.required': 'Enter your email address.',
		'email.invalid': 'Enter a valid email address, for example name@example.com.',
		'phone.invalid': 'Use only digits, spaces, +, -, ( and ), with 7 to 20 characters, or leave the field empty.',
		'message.tooShort': 'Write a message of at least 10 characters.',
		'message.tooLong': 'Shorten your message to at most 1000 characters.',
	},
};
