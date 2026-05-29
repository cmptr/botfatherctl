import type { BotFatherConversation } from "../botfather-client.js";
import { expectSuccess, normalizeBotUsername } from "./shared.js";

export type DeleteBotInput = {
	botUsername: string;
	confirmUsername: string;
};

export async function deleteBot(
	conversation: BotFatherConversation,
	input: DeleteBotInput,
): Promise<void> {
	if (
		normalizeBotUsername(input.botUsername) !==
		normalizeBotUsername(input.confirmUsername)
	) {
		throw new Error("delete confirmation does not match bot username");
	}

	await conversation.send("/deletebot");
	await conversation.send(normalizeBotUsername(input.botUsername));
	const response = await conversation.send("Yes, I am totally sure.");
	expectSuccess(response, `delete bot ${input.botUsername}`);
}
