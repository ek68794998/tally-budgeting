import { getTransactionRuleFields } from "@tally/data-models/converters/transactionRule";
import { buildTransactionRule } from "@tally/data-models/testing/fixtures";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDatabaseHandle } from "./testing/testDatabase";
import { TxnRulesClient } from "./txnRulesClient";

vi.mock("../auth/verifyRequest", () => ({
  assertAuthenticatedAsync: vi.fn(() => Promise.resolve()),
}));

const buildRuleFields = (name: string) =>
  getTransactionRuleFields(
    buildTransactionRule({
      matcher: { flags: "i", pattern: name },
      subcategoryId: -1,
    }),
  );

const summarize = (rules: { id: number; priority: number }[]) =>
  rules.map(({ id, priority }) => ({ id, priority }));

describe("TxnRulesClient", () => {
  const testDatabase = createTestDatabaseHandle();

  beforeAll(testDatabase.setUpAsync);
  beforeEach(testDatabase.resetAsync);
  const createClient = () => new TxnRulesClient(testDatabase.database);

  it("appends new rules after existing ones in insertion order", async () => {
    const client = createClient();

    await client.insertTransactionRulesAsync(buildRuleFields("a"));
    await client.insertTransactionRulesAsync([
      buildRuleFields("b"),
      buildRuleFields("c"),
    ]);

    const rules = await client.getTransactionRulesAsync();

    expect(rules.map((rule) => rule.matcher.pattern)).toEqual(["a", "b", "c"]);
    expect(summarize(rules)).toEqual([
      { id: 1, priority: 0 },
      { id: 2, priority: 1 },
      { id: 3, priority: 2 },
    ]);
  });

  it("inserts nothing for an empty list", async () => {
    const client = createClient();

    await client.insertTransactionRulesAsync([]);

    await expect(client.getTransactionRulesAsync()).resolves.toEqual([]);
  });

  it("updates writable fields without changing priority", async () => {
    const client = createClient();
    await client.insertTransactionRulesAsync([
      buildRuleFields("a"),
      buildRuleFields("b"),
    ]);

    await expect(
      client.updateTransactionRuleAsync({
        ...buildRuleFields("a"),
        active: false,
        id: 2,
        merchantName: "Renamed",
      }),
    ).resolves.toBe(true);
    await expect(
      client.updateTransactionRuleAsync({ ...buildRuleFields("a"), id: 99 }),
    ).resolves.toBe(false);

    const rules = await client.getTransactionRulesAsync();

    expect(rules[1]).toMatchObject({
      active: false,
      id: 2,
      merchantName: "Renamed",
      priority: 1,
    });
  });

  it("deletes rules", async () => {
    const client = createClient();
    await client.insertTransactionRulesAsync([
      buildRuleFields("a"),
      buildRuleFields("b"),
    ]);

    await client.deleteTransactionRuleAsync(2);

    const rules = await client.getTransactionRulesAsync();

    expect(summarize(rules)).toEqual([{ id: 1, priority: 0 }]);
  });

  it("reorders rules by the given ids, ignoring ids that no longer exist", async () => {
    const client = createClient();
    await client.insertTransactionRulesAsync([
      buildRuleFields("a"),
      buildRuleFields("b"),
      buildRuleFields("c"),
    ]);

    await client.updateTransactionRulesOrderAsync([3, 99, 1, 2]);

    const rules = await client.getTransactionRulesAsync();

    expect(summarize(rules)).toEqual([
      { id: 3, priority: 0 },
      { id: 1, priority: 2 },
      { id: 2, priority: 3 },
    ]);
  });

  it("keeps a reordered priority after an update", async () => {
    const client = createClient();
    await client.insertTransactionRulesAsync([
      buildRuleFields("a"),
      buildRuleFields("b"),
    ]);
    await client.updateTransactionRulesOrderAsync([2, 1]);

    await client.updateTransactionRuleAsync({
      ...buildRuleFields("a"),
      id: 1,
      merchantName: "Stale save",
    });

    const rules = await client.getTransactionRulesAsync();

    expect(summarize(rules)).toEqual([
      { id: 2, priority: 0 },
      { id: 1, priority: 1 },
    ]);
  });
});
