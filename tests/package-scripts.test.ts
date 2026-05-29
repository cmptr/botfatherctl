import { readFileSync } from "node:fs";

import { describe, expect, test } from "bun:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
	name: string;
	bin: Record<string, string>;
	scripts: Record<string, string>;
};

describe("package metadata", () => {
	test("uses botfatherctl for package, binary, and local script names", () => {
		expect(packageJson.name).toBe("botfatherctl");
		expect(packageJson.bin.botfatherctl).toBe("dist/cli.js");
		expect(packageJson.scripts.botfatherctl).toBe("bun run src/cli.ts");
	});
});
