import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetAuthConfigForTesting } from "./app/auth/config";
import { migrateToLatestAsync } from "./app/storage/migrate";
import { telemetry } from "./app/telemetry/telemetry";
import { register } from "./instrumentation";

vi.mock("./app/storage/migrate", () => ({
	migrateToLatestAsync: vi.fn(() => Promise.resolve()),
}));

vi.mock("./app/telemetry/telemetry", () => {
	const logger = { warn: vi.fn() };
	return { telemetry: () => logger };
});

describe("register", () => {
	beforeEach(() => {
		vi.stubEnv("NEXT_RUNTIME", "nodejs");
		vi.stubEnv("APP_PASSWORD", "pw");
		vi.stubEnv("DANGEROUSLY_DISABLE_AUTH", "");
		resetAuthConfigForTesting();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.clearAllMocks();
		resetAuthConfigForTesting();
	});

	it("does nothing outside the nodejs runtime", async () => {
		vi.stubEnv("NEXT_RUNTIME", "edge");

		await register();

		expect(migrateToLatestAsync).not.toHaveBeenCalled();
		expect(telemetry().warn).not.toHaveBeenCalled();
	});

	it("runs migrations without warning when auth is enabled", async () => {
		await register();

		expect(migrateToLatestAsync).toHaveBeenCalledOnce();
		expect(telemetry().warn).not.toHaveBeenCalled();
	});

	it("warns when auth is disabled and still runs migrations", async () => {
		vi.stubEnv("APP_PASSWORD", "");
		vi.stubEnv("DANGEROUSLY_DISABLE_AUTH", "1");

		await register();

		expect(telemetry().warn).toHaveBeenCalledWith(
			"AUTH_DISABLED",
			expect.anything(),
		);
		expect(migrateToLatestAsync).toHaveBeenCalledOnce();
	});
});
