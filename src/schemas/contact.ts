import {z} from 'zod';

const requiredText = (key: string) => z.string({error: key}).trim().min(1, {error: key});

function isValidPhone(raw: string) {
	if (raw === '') return true;
	const value = raw.trim();
	return /^[0-9\s+\-()]+$/.test(value) && /\d/.test(value) && value.length >= 7 && value.length <= 20;
}

export const contactSchema = z.object({
	firstName: requiredText('firstName.required'),
	lastName: requiredText('lastName.required'),
	email: z
		.string({error: 'email.required'})
		.trim()
		.min(1, {error: 'email.required'})
		.pipe(z.email({error: 'email.invalid'})),
	phone: z
		.string()
		.refine(isValidPhone, {error: 'phone.invalid'})
		.transform(value => value.trim())
		.optional(),
	message: z
		.string({error: 'message.tooShort'})
		.trim()
		.min(10, {error: 'message.tooShort'})
		.max(1000, {error: 'message.tooLong'}),
	contact_hp: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
