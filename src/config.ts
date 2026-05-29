import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

export type BotFatherConfig = {
	apiId: number;
	apiHash: string;
	session: string;
};

export function defaultConfigPath(): string {
	return join(homedir(), ".config", "botfatherctl", "config.json");
}

export async function loadConfig(
	path = defaultConfigPath(),
): Promise<BotFatherConfig> {
	const raw = await readFile(path, "utf8");
	const parsed: unknown = JSON.parse(raw);
	if (!isConfig(parsed)) {
		throw new Error(`Invalid config at ${path}`);
	}
	return parsed;
}

export async function saveConfig(
	config: BotFatherConfig,
	path = defaultConfigPath(),
): Promise<void> {
	await mkdir(dirname(path), { recursive: true, mode: 0o700 });
	await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, {
		mode: 0o600,
	});
}

function isConfig(value: unknown): value is BotFatherConfig {
	if (!value || typeof value !== "object") return false;
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.apiId === "number" &&
		Number.isInteger(candidate.apiId) &&
		typeof candidate.apiHash === "string" &&
		candidate.apiHash.length > 0 &&
		typeof candidate.session === "string"
	);
}
