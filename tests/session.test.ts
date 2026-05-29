import { describe, expect, test } from "bun:test";

import { loginWithClient } from "../src/session.js";

class FakeLoginClient {
	started = false;
	disconnected = false;

	async start(): Promise<void> {
		this.started = true;
	}

	async disconnect(): Promise<void> {
		this.disconnected = true;
	}
}

describe("loginWithClient", () => {
	test("disconnects the Telegram client after saving the session", async () => {
		const client = new FakeLoginClient();

		const config = await loginWithClient(
			{ apiId: 123, apiHash: "hash" },
			client,
			{
				phoneNumber: async () => "+15555550123",
				phoneCode: async () => "12345",
				password: async () => "password",
			},
			() => "saved-session",
		);

		expect(config).toEqual({
			apiId: 123,
			apiHash: "hash",
			session: "saved-session",
		});
		expect(client.started).toBe(true);
		expect(client.disconnected).toBe(true);
	});
});
