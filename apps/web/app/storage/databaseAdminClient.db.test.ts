import { sql } from "kysely";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getOrCreateSessionSecretAsync } from "./appSettingsClient";
import { DatabaseAdminClient } from "./databaseAdminClient";
import { runPgRestoreAsync } from "./databaseTools";
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
vi.mock("./databaseTools", () => ({
  runPgRestoreAsync: vi.fn(() => Promise.resolve()),
}));

describe("DatabaseAdminClient", () => {
  beforeAll(testDatabase.setUpAsync);
  beforeEach(async () => {
    await testDatabase.resetAsync();
    vi.clearAllMocks();
  });

  const createClient = () => new DatabaseAdminClient(testDatabase.database);

  it("drops everything, re-runs the migrations and issues a new session secret", async () => {
    const { database } = testDatabase;
    const oldSecret = await getOrCreateSessionSecretAsync();

    await sql`INSERT INTO app_setting (key, value) VALUES ('providersHidden', '["chase"]')`.execute(
      database,
    );

    await createClient().dropAllDataAsync();

    await expect(
      sql`SELECT count(*)::int AS count FROM app_setting`.execute(database),
    ).resolves.toMatchObject({ rows: [{ count: 0 }] });
    await expect(
      database.selectFrom("subcategory").select("id").execute(),
    ).resolves.toEqual([{ id: -1 }]);
    await expect(getOrCreateSessionSecretAsync()).resolves.not.toBe(oldSecret);
  });

  it("restores through pg_restore, then re-runs the migrations", async () => {
    await createClient().restoreAsync("/tmp/backup.dump");

    expect(runPgRestoreAsync).toHaveBeenCalledWith("/tmp/backup.dump");
    await expect(
      testDatabase.database.selectFrom("subcategory").select("id").execute(),
    ).resolves.toEqual([{ id: -1 }]);
  });
});
