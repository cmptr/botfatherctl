import type { BotFatherConversation } from "../botfather-client.js";
import { expectSuccess, selectBot } from "./shared.js";

export type SetJoinGroupsInput = {
	botUsername: string;
	enabled: boolean;
};

export async function setJoinGroups(
	conversation: BotFatherConversation,
	input: SetJoinGroupsInput,
): Promise<void> {
	await selectBot(conversation, "/setjoingroups", input.botUsername);
	const response = await conversation.send(
		input.enabled ? "Enable" : "Disable",
	);
	expectSuccess(response, `join groups change for ${input.botUsername}`);
}
