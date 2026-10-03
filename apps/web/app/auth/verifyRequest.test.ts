import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetAuthConfigForTesting } from "./config";
import { createSessionToken } from "./session";
import { getSessionStatusAsync, isAuthenticatedAsync } from "./verifyRequest";

const secret = "test-secret";

vi.mock("../storage/appSettingsClient", () => ({
	getOrCreateSessionSecretAsync: vi.fn(() => Promise.resolve(secret)),
}));

vi.mock("next/headers", () => ({
	cookies: vi.fn(),
}));

describe("verifyRequest", () => {
	beforeEach(() => {
		resetAuthConfigForTesting();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		resetAuthConfigForTesting();
	});

	describe("with a password configured", () => {
		beforeEach(() => {
			vi.stubEnv("APP_PASSWORD", "pw");
			vi.stubEnv("DANGEROUSLY_DISABLE_AUTH", "");
		});

		it("accepts a valid cookie", async () => {
			const token = createSessionToken({
				now: new Date(),
				password: "pw",
				secret,
			});

			expect(await isAuthenticatedAsync(token)).toBe(true);
		});

		it.each([
			[undefined],
			[""],
			["garbage"],
		])("rejects the cookie %j", async (cookie) => {
			expect(await isAuthenticatedAsync(cookie)).toBe(false);
		});

		it("rejects a cookie issued for another password", async () => {
			const token = createSessionToken({
				now: new Date(),
				password: "old",
				secret,
			});

			expect(await isAuthenticatedAsync(token)).toBe(false);
		});
	});

	it("treats everyone as authenticated when auth is disabled", async () => {
		vi.stubEnv("DANGEROUSLY_DISABLE_AUTH", "1");

		expect(await getSessionStatusAsync(undefined)).toEqual({
			shouldRefresh: false,
			valid: true,
		});
	});
});
