import type { BotFatherConversation } from "../botfather-client.js";
import { expectSuccess, selectBot } from "./shared.js";

export type SetAboutTextInput = {
	botUsername: string;
	aboutText: string;
};

export async function setAboutText(
	conversation: BotFatherConversation,
	input: SetAboutTextInput,
): Promise<void> {
	await selectBot(conversation, "/setabouttext", input.botUsername);
	const response = await conversation.send(input.aboutText.trim());
	expectSuccess(response, `about text change for ${input.botUsername}`);
}
