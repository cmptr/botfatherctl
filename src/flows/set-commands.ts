import type { BotFatherConversation } from "../botfather-client.js";
import { expectSuccess, requireNonBlank, selectBot } from "./shared.js";

export type BotCommand = {
	command: string;
	description: string;
};

export type SetCommandsInput = {
	botUsername: string;
	commands: BotCommand[];
};

export async function setCommands(
	conversation: BotFatherConversation,
	input: SetCommandsInput,
): Promise<void> {
	if (input.commands.length === 0)
		throw new Error("at least one command is required");
	await selectBot(conversation, "/setcommands", input.botUsername);
	const response = await conversation.send(formatCommands(input.commands));
	expectSuccess(response, `command list change for ${input.botUsername}`);
}

export function formatCommands(commands: BotCommand[]): string {
	return commands
		.map((command) => {
			const name = requireNonBlank(command.command, "command").replace(
				/^\//,
				"",
			);
			const description = requireNonBlank(
				command.description,
				"command description",
			);
			return `${name} - ${description}`;
		})
		.join("\n");
}
