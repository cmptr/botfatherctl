export type CreatedBot = {
	username: string;
	token: string;
};

const tokenPattern = /\b\d+:[A-Za-z0-9_-]{8,}\b/;
const telegramUsernamePattern = /(?:t\.me\/|@)([A-Za-z][A-Za-z0-9_]{4,})/i;

export function parseCreatedBot(text: string): CreatedBot | null {
	const token = text.match(tokenPattern)?.[0];
	if (!token) return null;

	const username = text.match(telegramUsernamePattern)?.[1];
	if (!username) return null;

	return { username, token };
}

export function isUsernameRejected(text: string): boolean {
	return /sorry|taken|invalid|not available|too short/i.test(text);
}

export function isPrivacyConfirmation(text: string): boolean {
	return /success/i.test(text) && /\b(enabled|disabled)\b/i.test(text);
}

export function parseToken(text: string): string | null {
	return text.match(tokenPattern)?.[0] ?? null;
}

export function isGenericSuccess(text: string): boolean {
	return /success|done|updated|deleted/i.test(text);
}
