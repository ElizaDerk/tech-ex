import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {isRateLimited} from '@/lib/chat-rate-limit';

let counter = 0;
let key: string;

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
	key = `ip-${counter++}`;
});

afterEach(() => {
	vi.useRealTimers();
});

describe('isRateLimited', () => {
	it('allows 10 calls within a minute and blocks the 11th', () => {
		for (let i = 0; i < 10; i++) expect(isRateLimited(key)).toBe(false);
		expect(isRateLimited(key)).toBe(true);
	});

	it('allows calls again after 60 seconds', () => {
		for (let i = 0; i < 10; i++) isRateLimited(key);
		expect(isRateLimited(key)).toBe(true);
		vi.advanceTimersByTime(60_000);
		expect(isRateLimited(key)).toBe(false);
	});

	it('does not let different keys affect each other', () => {
		for (let i = 0; i < 10; i++) isRateLimited(key);
		expect(isRateLimited(key)).toBe(true);
		expect(isRateLimited(`${key}-other`)).toBe(false);
	});

	it('does not count blocked calls against the window', () => {
		for (let i = 0; i < 10; i++) isRateLimited(key);
		vi.advanceTimersByTime(30_000);
		for (let i = 0; i < 5; i++) expect(isRateLimited(key)).toBe(true);
		vi.advanceTimersByTime(30_000);
		expect(isRateLimited(key)).toBe(false);
	});

	it('forgets keys whose entries have expired', () => {
		isRateLimited(key);
		vi.advanceTimersByTime(61_000);
		const other = `${key}-later`;
		for (let i = 0; i < 10; i++) isRateLimited(other);
		// the expired key starts with a clean window
		expect(isRateLimited(key)).toBe(false);
	});
});
