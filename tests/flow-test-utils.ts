import type { BotFatherConversation } from "../src/botfather-client.js";

export class FakeConversation implements BotFatherConversation {
	readonly sent: string[] = [];
	private readonly responses: string[];

	constructor(responses: string[]) {
		this.responses = [...responses];
	}

	async send(text: string): Promise<string> {
		this.sent.push(text);
		const response = this.responses.shift();
		if (!response) throw new Error("missing fake response");
		return response;
	}
}
