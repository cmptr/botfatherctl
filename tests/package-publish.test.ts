import { readFileSync } from "node:fs";

import { describe, expect, test } from "bun:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
	private?: boolean;
	bin: Record<string, string>;
	exports: Record<string, { types: string; import: string }>;
	files: string[];
	scripts: Record<string, string>;
	types: string;
	repository: { type: string; url: string };
	homepage: string;
	bugs: { url: string };
};

describe("npm publish metadata", () => {
	test("publishes built JavaScript and type declarations", () => {
		expect(packageJson.private).toBe(false);
		expect(packageJson.bin.botfatherctl).toBe("dist/cli.js");
		expect(packageJson.exports["."]).toEqual({
			types: "./dist/index.d.ts",
			import: "./dist/index.js",
		});
		expect(packageJson.types).toBe("./dist/index.d.ts");
		expect(packageJson.files).toEqual(["dist/", "README.md", "LICENSE"]);
		expect(packageJson.repository).toEqual({
			type: "git",
			url: "git+https://github.com/cmptr/botfatherctl.git",
		});
		expect(packageJson.homepage).toBe(
			"https://github.com/cmptr/botfatherctl#readme",
		);
		expect(packageJson.bugs).toEqual({
			url: "https://github.com/cmptr/botfatherctl/issues",
		});
		expect(packageJson.scripts.build).toBe("tsc -p tsconfig.build.json");
		expect(packageJson.scripts.prepublishOnly).toContain("npm pack --dry-run");
	});
});
