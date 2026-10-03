import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readAuthConfig } from "./config";

const writePasswordFile = (contents: string): string => {
	const file = join(mkdtempSync(join(tmpdir(), "tally-auth-")), "password");
	writeFileSync(file, contents);

	return file;
};

const env = (...entries: [string, string][]) => Object.fromEntries(entries);

describe("readAuthConfig", () => {
	it("reads APP_PASSWORD", () => {
		expect(readAuthConfig(env(["APP_PASSWORD", "pw"]))).toEqual({
			mode: "password",
			password: "pw",
		});
	});

	it("reads and trims APP_PASSWORD_FILE", () => {
		const file = writePasswordFile("  from-file\n");

		expect(readAuthConfig(env(["APP_PASSWORD_FILE", file]))).toEqual({
			mode: "password",
			password: "from-file",
		});
	});

	it("disables auth with DANGEROUSLY_DISABLE_AUTH=1", () => {
		expect(readAuthConfig(env(["DANGEROUSLY_DISABLE_AUTH", "1"]))).toEqual({
			mode: "disabled",
		});
	});

	it("lets the disable flag win over a configured password", () => {
		expect(
			readAuthConfig(
				env(["APP_PASSWORD", "pw"], ["DANGEROUSLY_DISABLE_AUTH", "1"]),
			),
		).toEqual({ mode: "disabled" });
	});

	it.each([
		[
			"a non-1 disable flag only",
			env(["DANGEROUSLY_DISABLE_AUTH", "true"]),
		],
		["nothing set", env()],
		[
			"an empty password file",
			env(["APP_PASSWORD_FILE", writePasswordFile("\n")]),
		],
		[
			"both password and file",
			env(["APP_PASSWORD", "pw"], ["APP_PASSWORD_FILE", "/nonexistent"]),
		],
	])("throws for %s", (_name, config) => {
		expect(() => readAuthConfig(config)).toThrow();
	});
});
