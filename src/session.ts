import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

import type { BotFatherConfig } from "./config.js";

export type LoginPrompts = {
	phoneNumber(): Promise<string>;
	phoneCode(): Promise<string>;
	password(): Promise<string>;
};

type LoginClient = {
	start(options: {
		phoneNumber(): Promise<string>;
		phoneCode(): Promise<string>;
		password(): Promise<string>;
		onError(error: Error): never;
	}): Promise<void>;
	disconnect(): Promise<void>;
};

export async function createTelegramClient(
	config: BotFatherConfig,
): Promise<TelegramClient> {
	const client = new TelegramClient(
		new StringSession(config.session),
		config.apiId,
		config.apiHash,
		{ connectionRetries: 5 },
	);
	await client.connect();
	return client;
}

export async function loginWithClient(
	config: Omit<BotFatherConfig, "session">,
	client: LoginClient,
	prompts: LoginPrompts,
	saveSession: () => string,
): Promise<BotFatherConfig> {
	try {
		await client.start({
			phoneNumber: prompts.phoneNumber,
			phoneCode: prompts.phoneCode,
			password: prompts.password,
			onError(error) {
				throw error;
			},
		});
		return {
			...config,
			session: saveSession(),
		};
	} finally {
		await client.disconnect();
	}
}

export async function login(
	config: Omit<BotFatherConfig, "session">,
	prompts: LoginPrompts,
): Promise<BotFatherConfig> {
	const session = new StringSession("");
	const client = new TelegramClient(session, config.apiId, config.apiHash, {
		connectionRetries: 5,
	});
	return loginWithClient(config, client, prompts, () => session.save());
}
