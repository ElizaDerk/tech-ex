import {describe, expect, it} from 'vitest';
import {contactSchema} from '@/schemas/contact';

const valid = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada@example.com',
	phone: '+1 (555) 123-4567',
	message: 'Hello, I need a bridge built.',
};

function keys(input: unknown) {
	const result = contactSchema.safeParse(input);
	if (result.success) return null;
	return Object.fromEntries(result.error.issues.map(issue => [String(issue.path[0]), issue.message]));
}

describe('contactSchema', () => {
	it('parses valid data', () => {
		expect(contactSchema.safeParse(valid).success).toBe(true);
	});

	it.each([
		['firstName', 'firstName.required'],
		['lastName', 'lastName.required'],
		['email', 'email.required'],
		['message', 'message.tooShort'],
	])('rejects empty, whitespace-only and missing %s', (field, key) => {
		expect(keys({...valid, [field]: ''})?.[field]).toBe(key);
		expect(keys({...valid, [field]: '   '})?.[field]).toBe(key);
		expect(keys({...valid, [field]: undefined})?.[field]).toBe(key);
	});

	it('returns only message keys for an empty object', () => {
		expect(keys({})).toEqual({
			firstName: 'firstName.required',
			lastName: 'lastName.required',
			email: 'email.required',
			message: 'message.tooShort',
		});
	});

	it('rejects an invalid email', () => {
		expect(keys({...valid, email: 'not-an-email'})?.email).toBe('email.invalid');
	});

	it('accepts an empty or omitted phone', () => {
		expect(contactSchema.safeParse({...valid, phone: ''}).success).toBe(true);
		expect(contactSchema.safeParse({...valid, phone: undefined}).success).toBe(true);
	});

	it.each(['call me maybe', '       ', '-------'])('rejects invalid phone %j', phone => {
		expect(keys({...valid, phone})?.phone).toBe('phone.invalid');
	});

	it.each([
		[6, false],
		[7, true],
		[20, true],
		[21, false],
	])('phone length %i passes: %s', (length, passes) => {
		expect(contactSchema.safeParse({...valid, phone: '1'.repeat(length)}).success).toBe(passes);
	});

	it.each([
		[9, 'message.tooShort'],
		[10, null],
		[1000, null],
		[1001, 'message.tooLong'],
	])('message length %i gives %s', (length, key) => {
		expect(keys({...valid, message: 'a'.repeat(length)})?.message ?? null).toBe(key);
	});

	it('accepts and exposes a filled honeypot', () => {
		const result = contactSchema.safeParse({...valid, contact_hp: 'bot'});
		expect(result.success).toBe(true);
		expect(result.data?.contact_hp).toBe('bot');
	});
});
