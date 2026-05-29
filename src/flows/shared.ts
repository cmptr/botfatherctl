import type { BotFatherConversation } from "../botfather-client.js";
import { isGenericSuccess, parseToken } from "../botfather-parser.js";

export function normalizeBotUsername(username: string): string {
	const trimmed = username.trim();
	return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function expectSuccess(response: string, action: string): void {
	if (!isGenericSuccess(response)) {
		throw new Error(`BotFather did not confirm ${action}`);
	}
}

export async function selectBot(
	conversation: BotFatherConversation,
	command: string,
	botUsername: string,
): Promise<string> {
	await conversation.send(command);
	return conversation.send(normalizeBotUsername(botUsername));
}

export function extractToken(
	response: string,
	action: string,
): { token: string } {
	const token = parseToken(response);
	if (!token) {
		throw new Error(`BotFather did not return a token after ${action}`);
	}
	return { token };
}

export function requireNonBlank(value: string, name: string): string {
	const trimmed = value.trim();
	if (!trimmed) throw new Error(`${name} is required`);
	return trimmed;
}
