import { buildNetWorthSnapshot } from "@tally/data-models/testing/fixtures";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NetWorthSnapshotsClient } from "./netWorthSnapshotsClient";
import { createTestDatabaseHandle } from "./testing/testDatabase";

vi.mock("../auth/verifyRequest", () => ({
  assertAuthenticatedAsync: vi.fn(() => Promise.resolve()),
}));

describe("NetWorthSnapshotsClient", () => {
  const testDatabase = createTestDatabaseHandle();

  beforeAll(testDatabase.setUpAsync);
  beforeEach(testDatabase.resetAsync);
  const createClient = () => new NetWorthSnapshotsClient(testDatabase.database);

  it("inserts new snapshots and overwrites the value of an existing date", async () => {
    const client = createClient();
    const january = "2025-01-01T00:00:00.000Z";
    const february = "2025-02-01T00:00:00.000Z";

    await client.upsertNetWorthSnapshotsAsync([
      buildNetWorthSnapshot({ date: january, id: 0, valueCents: 100 }),
      buildNetWorthSnapshot({ date: february, id: 0, valueCents: 200 }),
    ]);
    await client.upsertNetWorthSnapshotsAsync(
      buildNetWorthSnapshot({ date: january, id: 0, valueCents: 150 }),
    );

    const snapshots = await client.getNetWorthSnapshotsAsync();

    expect(snapshots.map(({ valueCents }) => valueCents)).toEqual([150, 200]);
    expect(snapshots.map(({ id }) => id)).toEqual([1, 2]);
  });
});
