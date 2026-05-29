import { describe, expect, test } from "bun:test";

import { deleteBot } from "../src/flows/delete-bot.js";
import { getToken } from "../src/flows/get-token.js";
import { revokeToken } from "../src/flows/revoke-token.js";
import { setAboutText } from "../src/flows/set-about-text.js";
import { setCommands } from "../src/flows/set-commands.js";
import { setDescription } from "../src/flows/set-description.js";
import { setJoinGroups } from "../src/flows/set-join-groups.js";
import { setName } from "../src/flows/set-name.js";
import { FakeConversation } from "./flow-test-utils.js";

describe("getToken", () => {
	test("selects a bot and returns its token", async () => {
		const conversation = new FakeConversation([
			"Choose a bot to generate a new token.",
			"You can use this token to access HTTP API:\n1234567890:AAExample_Token-Value",
		]);

		const result = await getToken(conversation, { botUsername: "example_bot" });

		expect(conversation.sent).toEqual(["/token", "@example_bot"]);
		expect(result).toEqual({ token: "1234567890:AAExample_Token-Value" });
	});
});

describe("revokeToken", () => {
	test("selects a bot and returns its replacement token", async () => {
		const conversation = new FakeConversation([
			"Choose a bot to revoke its token.",
			"Done! New token is:\n1234567890:AAReplacement_Token-Value",
		]);

		const result = await revokeToken(conversation, {
			botUsername: "@example_bot",
		});

		expect(conversation.sent).toEqual(["/revoke", "@example_bot"]);
		expect(result).toEqual({ token: "1234567890:AAReplacement_Token-Value" });
	});
});

describe("setName", () => {
	test("sets a bot display name", async () => {
		const conversation = new FakeConversation([
			"Choose a bot.",
			"Send me the new name.",
			"Success! Name updated.",
		]);

		await setName(conversation, {
			botUsername: "example_bot",
			name: "Example Bot",
		});

		expect(conversation.sent).toEqual([
			"/setname",
			"@example_bot",
			"Example Bot",
		]);
	});
});

describe("setDescription", () => {
	test("sets a bot description", async () => {
		const conversation = new FakeConversation([
			"Choose a bot.",
			"Send me the new description.",
			"Success! Description updated.",
		]);

		await setDescription(conversation, {
			botUsername: "example_bot",
			description: "Longer description",
		});

		expect(conversation.sent).toEqual([
			"/setdescription",
			"@example_bot",
			"Longer description",
		]);
	});
});

describe("setAboutText", () => {
	test("sets a bot about text", async () => {
		const conversation = new FakeConversation([
			"Choose a bot.",
			"Send me the new about text.",
			"Success! About text updated.",
		]);

		await setAboutText(conversation, {
			botUsername: "example_bot",
			aboutText: "Short about text",
		});

		expect(conversation.sent).toEqual([
			"/setabouttext",
			"@example_bot",
			"Short about text",
		]);
	});
});

describe("setCommands", () => {
	test("formats and sends slash commands", async () => {
		const conversation = new FakeConversation([
			"Choose a bot.",
			"Send me the command list.",
			"Success! Command list updated.",
		]);

		await setCommands(conversation, {
			botUsername: "example_bot",
			commands: [
				{ command: "start", description: "Start the bot" },
				{ command: "/help", description: "Show help" },
			],
		});

		expect(conversation.sent).toEqual([
			"/setcommands",
			"@example_bot",
			"start - Start the bot\nhelp - Show help",
		]);
	});
});

describe("setJoinGroups", () => {
	test("enables joining groups", async () => {
		const conversation = new FakeConversation([
			"Choose a bot.",
			"Choose Enable or Disable.",
			"Success! Group joining enabled.",
		]);

		await setJoinGroups(conversation, {
			botUsername: "example_bot",
			enabled: true,
		});

		expect(conversation.sent).toEqual([
			"/setjoingroups",
			"@example_bot",
			"Enable",
		]);
	});
});

describe("deleteBot", () => {
	test("requires matching confirmation before sending delete commands", async () => {
		const conversation = new FakeConversation([
			"Choose a bot.",
			"Please confirm deletion.",
			"Success! Bot deleted.",
		]);

		await deleteBot(conversation, {
			botUsername: "example_bot",
			confirmUsername: "example_bot",
		});

		expect(conversation.sent).toEqual([
			"/deletebot",
			"@example_bot",
			"Yes, I am totally sure.",
		]);
	});

	test("rejects mismatched confirmation before contacting BotFather", async () => {
		const conversation = new FakeConversation([]);

		await expect(
			deleteBot(conversation, {
				botUsername: "example_bot",
				confirmUsername: "other_bot",
			}),
		).rejects.toThrow("delete confirmation does not match");
		expect(conversation.sent).toEqual([]);
	});
});
