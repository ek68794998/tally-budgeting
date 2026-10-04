import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getOrCreateSessionSecretAsync } from "./appSettingsClient";
import { SettingsClient } from "./settingsClient";
import { createTestDatabaseHandle } from "./testing/testDatabase";

const testDatabase = createTestDatabaseHandle();

vi.mock("../auth/verifyRequest", () => ({
  assertAuthenticatedAsync: vi.fn(() => Promise.resolve()),
}));

vi.mock(
  "../telemetry/telemetry",
  async () =>
    (await import("../api/testing/routeTesting")).silentTelemetryModule,
);

vi.mock("./database", () => ({
  getDatabase: () => testDatabase.database,
}));

describe("SettingsClient", () => {
  beforeAll(testDatabase.setUpAsync);
  beforeEach(testDatabase.resetAsync);

  const createClient = () => new SettingsClient(testDatabase.database);

  it("returns defaults, then upserts array values as JSON", async () => {
    const client = createClient();

    await expect(client.getSettingsAsync()).resolves.toEqual({
      providersHidden: [],
    });

    await client.putSettingAsync("providersHidden", ["chase", "apple"]);
    await client.putSettingAsync("providersHidden", ["fidelity"]);

    await expect(client.getSettingsAsync()).resolves.toEqual({
      providersHidden: ["fidelity"],
    });
  });

  it("falls back to the default for an unparseable row and never exposes the session secret", async () => {
    const secret = await getOrCreateSessionSecretAsync();

    await testDatabase.database
      .insertInto("app_setting")
      .values({ key: "providersHidden", value: JSON.stringify("bad") })
      .execute();

    await expect(createClient().getSettingsAsync()).resolves.toEqual({
      providersHidden: [],
    });
    await expect(getOrCreateSessionSecretAsync()).resolves.toBe(secret);
  });
});
