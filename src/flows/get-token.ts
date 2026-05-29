import type { BotFatherConversation } from "../botfather-client.js";
import { extractToken, selectBot } from "./shared.js";

export type GetTokenInput = {
	botUsername: string;
};

export async function getToken(
	conversation: BotFatherConversation,
	input: GetTokenInput,
): Promise<{ token: string }> {
	const response = await selectBot(conversation, "/token", input.botUsername);
	return extractToken(response, "token lookup");
}
