#!/usr/bin/env bun
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { createTelegramClient, login } from "./session.js";
import { defaultConfigPath, loadConfig, saveConfig } from "./config.js";
import { TelegramBotFatherConversation } from "./botfather-client.js";
import { createBot } from "./flows/create-bot.js";
import { deleteBot } from "./flows/delete-bot.js";
import { getToken } from "./flows/get-token.js";
import { revokeToken } from "./flows/revoke-token.js";
import { setAboutText } from "./flows/set-about-text.js";
import { parseBotCommandsJson } from "./commands-file.js";
import { setCommands } from "./flows/set-commands.js";
import { setDescription } from "./flows/set-description.js";
import { setJoinGroups } from "./flows/set-join-groups.js";
import { setName } from "./flows/set-name.js";
import { setPrivacy } from "./flows/set-privacy.js";

type ParsedArgs = {
	command: string | undefined;
	options: Record<string, string | boolean>;
};

function parseArgs(argv: string[]): ParsedArgs {
	const [command, ...rest] = argv;
	const options: Record<string, string | boolean> = {};
	for (let index = 0; index < rest.length; index += 1) {
		const arg = rest[index];
		if (!arg?.startsWith("--")) continue;
		const key = arg.slice(2);
		const next = rest[index + 1];
		if (!next || next.startsWith("--")) {
			options[key] = true;
		} else {
			options[key] = next;
			index += 1;
		}
	}
	return { command, options };
}

function requireString(
	options: Record<string, string | boolean>,
	name: string,
): string {
	const value = options[name];
	if (typeof value !== "string" || !value.trim()) {
		throw new Error(`Missing required option --${name}`);
	}
	return value.trim();
}

function optionalString(
	options: Record<string, string | boolean>,
	name: string,
): string | undefined {
	const value = options[name];
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseBoolean(value: string): boolean {
	if (["true", "yes", "1", "enable", "enabled"].includes(value.toLowerCase()))
		return true;
	if (["false", "no", "0", "disable", "disabled"].includes(value.toLowerCase()))
		return false;
	throw new Error(`Invalid boolean value: ${value}`);
}

async function withConversation<T>(
	configPath: string | undefined,
	fn: (conversation: TelegramBotFatherConversation) => Promise<T>,
): Promise<T> {
	const config = await loadConfig(configPath);
	const client = await createTelegramClient(config);
	try {
		return await fn(new TelegramBotFatherConversation(client));
	} finally {
		await client.disconnect();
	}
}

async function run(): Promise<void> {
	const { command, options } = parseArgs(process.argv.slice(2));
	const configPath = optionalString(options, "config");

	switch (command) {
		case "login": {
			const apiId = Number.parseInt(requireString(options, "api-id"), 10);
			const apiHash = requireString(options, "api-hash");
			if (!Number.isInteger(apiId))
				throw new Error("--api-id must be an integer");

			const rl = createInterface({ input, output });
			try {
				const config = await login(
					{ apiId, apiHash },
					{
						phoneNumber: () => rl.question("Phone number: "),
						phoneCode: () => rl.question("Login code: "),
						password: () => rl.question("2FA password: "),
					},
				);
				const path = configPath ?? defaultConfigPath();
				await saveConfig(config, path);
				output.write(`Saved Telegram session to ${path}\n`);
			} finally {
				rl.close();
			}
			return;
		}
		case "create-bot": {
			const displayName = requireString(options, "name");
			const username = requireString(options, "username");
			const created = await withConversation(configPath, (conversation) =>
				createBot(conversation, { displayName, username }),
			);
			output.write(`${JSON.stringify(created, null, 2)}\n`);
			return;
		}
		case "get-token": {
			const botUsername = requireString(options, "bot");
			const result = await withConversation(configPath, (conversation) =>
				getToken(conversation, { botUsername }),
			);
			output.write(`${JSON.stringify(result, null, 2)}\n`);
			return;
		}
		case "revoke-token": {
			const botUsername = requireString(options, "bot");
			const result = await withConversation(configPath, (conversation) =>
				revokeToken(conversation, { botUsername }),
			);
			output.write(`${JSON.stringify(result, null, 2)}\n`);
			return;
		}
		case "set-name": {
			const botUsername = requireString(options, "bot");
			const name = requireString(options, "name");
			await withConversation(configPath, (conversation) =>
				setName(conversation, { botUsername, name }),
			);
			output.write(`Name updated for ${botUsername}\n`);
			return;
		}
		case "set-description": {
			const botUsername = requireString(options, "bot");
			const description = requireString(options, "description");
			await withConversation(configPath, (conversation) =>
				setDescription(conversation, { botUsername, description }),
			);
			output.write(`Description updated for ${botUsername}\n`);
			return;
		}
		case "set-about-text": {
			const botUsername = requireString(options, "bot");
			const aboutText = requireString(options, "about");
			await withConversation(configPath, (conversation) =>
				setAboutText(conversation, { botUsername, aboutText }),
			);
			output.write(`About text updated for ${botUsername}\n`);
			return;
		}
		case "set-commands": {
			const botUsername = requireString(options, "bot");
			const commandsPath = requireString(options, "commands");
			const commands = parseBotCommandsJson(
				await readFile(commandsPath, "utf8"),
			);
			await withConversation(configPath, (conversation) =>
				setCommands(conversation, { botUsername, commands }),
			);
			output.write(`Commands updated for ${botUsername}\n`);
			return;
		}
		case "set-join-groups": {
			const botUsername = requireString(options, "bot");
			const enabled = parseBoolean(requireString(options, "enabled"));
			await withConversation(configPath, (conversation) =>
				setJoinGroups(conversation, { botUsername, enabled }),
			);
			output.write(
				`Join groups ${enabled ? "enabled" : "disabled"} for ${botUsername}\n`,
			);
			return;
		}
		case "set-privacy": {
			const botUsername = requireString(options, "bot");
			const enabled = parseBoolean(requireString(options, "enabled"));
			await withConversation(configPath, (conversation) =>
				setPrivacy(conversation, { botUsername, enabled }),
			);
			output.write(
				`Privacy ${enabled ? "enabled" : "disabled"} for ${botUsername}\n`,
			);
			return;
		}
		case "delete-bot": {
			const botUsername = requireString(options, "bot");
			const confirmUsername = requireString(options, "confirm");
			await withConversation(configPath, (conversation) =>
				deleteBot(conversation, { botUsername, confirmUsername }),
			);
			output.write(`Deleted ${botUsername}\n`);
			return;
		}
		default:
			output.write(
				`Usage:\n  botfatherctl login --api-id ID --api-hash HASH [--config PATH]\n  botfatherctl create-bot --name NAME --username USERNAME [--config PATH]\n  botfatherctl get-token --bot USERNAME [--config PATH]\n  botfatherctl revoke-token --bot USERNAME [--config PATH]\n  botfatherctl set-name --bot USERNAME --name NAME [--config PATH]\n  botfatherctl set-description --bot USERNAME --description TEXT [--config PATH]\n  botfatherctl set-about-text --bot USERNAME --about TEXT [--config PATH]\n  botfatherctl set-commands --bot USERNAME --commands FILE [--config PATH]\n  botfatherctl set-join-groups --bot USERNAME --enabled true|false [--config PATH]\n  botfatherctl set-privacy --bot USERNAME --enabled true|false [--config PATH]\n  botfatherctl delete-bot --bot USERNAME --confirm USERNAME [--config PATH]\n`,
			);
			if (command) throw new Error(`Unknown command: ${command}`);
	}
}

run().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
