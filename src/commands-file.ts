import type { BotCommand } from "./flows/set-commands.js";

export function parseBotCommandsJson(json: string): BotCommand[] {
	const parsed: unknown = JSON.parse(json);
	if (!Array.isArray(parsed)) {
		throw new Error("commands file must contain an array");
	}
	return parsed.map((item) => {
		if (typeof item !== "object" || !item) {
			throw new Error("command entries must be objects");
		}
		const command = "command" in item ? item.command : undefined;
		const description = "description" in item ? item.description : undefined;
		if (
			typeof command !== "string" ||
			!command.trim() ||
			typeof description !== "string" ||
			!description.trim()
		) {
			throw new Error("command and description are required");
		}
		return { command: command.trim(), description: description.trim() };
	});
}
