import type { BotFatherConversation } from "../botfather-client.js";
import { expectSuccess, selectBot } from "./shared.js";

export type SetDescriptionInput = {
	botUsername: string;
	description: string;
};

export async function setDescription(
	conversation: BotFatherConversation,
	input: SetDescriptionInput,
): Promise<void> {
	await selectBot(conversation, "/setdescription", input.botUsername);
	const response = await conversation.send(input.description.trim());
	expectSuccess(response, `description change for ${input.botUsername}`);
}
