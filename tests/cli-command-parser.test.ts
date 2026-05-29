import { describe, expect, test } from "bun:test";

import { parseBotCommandsJson } from "../src/commands-file.js";

describe("parseBotCommandsJson", () => {
	test("parses command definitions from JSON", () => {
		expect(
			parseBotCommandsJson('[{"command":"start","description":"Start bot"}]'),
		).toEqual([{ command: "start", description: "Start bot" }]);
	});

	test("rejects invalid command JSON", () => {
		expect(() => parseBotCommandsJson('{"command":"start"}')).toThrow(
			"commands file must contain an array",
		);
		expect(() =>
			parseBotCommandsJson('[{"command":"","description":"Start bot"}]'),
		).toThrow("command and description are required");
	});
});
