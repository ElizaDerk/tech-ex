const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

// In-memory sliding window. On Vercel this is per instance and best-effort (see research.md section 6).
const requests = new Map<string, number[]>();

export function isRateLimited(key: string, now: number = Date.now()): boolean {
	for (const [storedKey, timestamps] of requests) {
		const recent = timestamps.filter(timestamp => now - timestamp < WINDOW_MS);
		if (recent.length === 0) requests.delete(storedKey);
		else requests.set(storedKey, recent);
	}

	const recent = requests.get(key) ?? [];
	if (recent.length >= MAX_REQUESTS) return true;

	requests.set(key, [...recent, now]);
	return false;
}
