import type { BotFatherConversation } from "../botfather-client.js";
import { extractToken, selectBot } from "./shared.js";

export type RevokeTokenInput = {
	botUsername: string;
};

export async function revokeToken(
	conversation: BotFatherConversation,
	input: RevokeTokenInput,
): Promise<{ token: string }> {
	const response = await selectBot(conversation, "/revoke", input.botUsername);
	return extractToken(response, "token revoke");
}
