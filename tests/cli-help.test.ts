import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";

describe("CLI help", () => {
	for (const arg of ["--help", "-h", "help"]) {
		test(`${arg} prints usage without error`, () => {
			const result = spawnSync("bun", ["run", "src/cli.ts", arg], {
				encoding: "utf8",
			});

			expect(result.status).toBe(0);
			expect(result.stdout).toContain("Usage:");
			expect(result.stdout).toContain("botfatherctl login");
			expect(result.stderr).not.toContain("Unknown command");
		});
	}
});
