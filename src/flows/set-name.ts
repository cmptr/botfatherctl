import type { BotFatherConversation } from "../botfather-client.js";
import { expectSuccess, requireNonBlank, selectBot } from "./shared.js";

export type SetNameInput = {
	botUsername: string;
	name: string;
};

export async function setName(
	conversation: BotFatherConversation,
	input: SetNameInput,
): Promise<void> {
	await selectBot(conversation, "/setname", input.botUsername);
	const response = await conversation.send(requireNonBlank(input.name, "name"));
	expectSuccess(response, `name change for ${input.botUsername}`);
}
