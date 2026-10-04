import {
  DefaultSubcategory,
  DefaultSubcategoryId,
} from "@tally/data-models/contracts/subcategory";
import {
  buildAsset,
  buildCategory,
  buildSubcategory,
  buildTransaction,
} from "@tally/data-models/testing/fixtures";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AssetsClient } from "./assetsClient";
import { CategoriesClient } from "./categoriesClient";
import { SubcategoriesClient } from "./subcategoriesClient";
import { createTestDatabaseHandle } from "./testing/testDatabase";
import { TxnsClient } from "./txnsClient";

vi.mock("../auth/verifyRequest", () => ({
  assertAuthenticatedAsync: vi.fn(() => Promise.resolve()),
}));

describe("SubcategoriesClient", () => {
  const testDatabase = createTestDatabaseHandle();

  beforeAll(testDatabase.setUpAsync);
  beforeEach(testDatabase.resetAsync);
  const createClient = () => new SubcategoriesClient(testDatabase.database);

  beforeEach(async () => {
    await new CategoriesClient(testDatabase.database).insertCategoriesAsync(
      buildCategory({ id: 0 }),
    );
  });

  it("inserts single and multiple subcategories and reads them back", async () => {
    const client = createClient();
    const rent = buildSubcategory({ description: "Monthly", id: 0 });
    const income = buildSubcategory({
      budget: { amountCents: 50_00, frequency: 1, type: "income" },
      id: 0,
      label: "Salary",
      percentNeeds: 0,
    });

    await client.insertSubcategoriesAsync(rent);
    await client.insertSubcategoriesAsync([income]);

    await expect(client.getSubcategoriesAsync()).resolves.toEqual([
      DefaultSubcategory,
      { ...rent, id: 1 },
      { ...income, id: 2 },
    ]);
  });

  it("updates and deletes subcategories", async () => {
    const client = createClient();
    await client.insertSubcategoriesAsync([
      buildSubcategory({ id: 0, label: "Rent" }),
      buildSubcategory({ id: 0, label: "Utilities" }),
    ]);

    await expect(
      client.updateSubcategoryAsync(
        buildSubcategory({
          id: 1,
          label: "Mortgage",
          percentSavings: 20,
        }),
      ),
    ).resolves.toBe(true);
    await expect(
      client.updateSubcategoryAsync(buildSubcategory({ id: 99 })),
    ).resolves.toBe(false);
    await client.deleteSubcategoryAsync(2);

    await expect(client.getSubcategoriesAsync()).resolves.toEqual([
      DefaultSubcategory,
      buildSubcategory({ id: 1, label: "Mortgage", percentSavings: 20 }),
    ]);
  });

  it("rejects deleting the default subcategory while transactions use it", async () => {
    await new TxnsClient(testDatabase.database).insertTransactionsAsync(
      buildTransaction({ id: 0, subcategoryId: DefaultSubcategoryId }),
    );

    await expect(
      createClient().deleteSubcategoryAsync(DefaultSubcategoryId),
    ).rejects.toThrow();
  });

  it("breaks later deletes once an unused default subcategory is deleted", async () => {
    const client = createClient();
    await new AssetsClient(testDatabase.database).insertAssetsAsync(
      buildAsset({ id: 0 }),
    );
    await client.insertSubcategoriesAsync(buildSubcategory({ id: 0 }));
    await new TxnsClient(testDatabase.database).insertTransactionsAsync(
      buildTransaction({ id: 0, subcategoryId: 1 }),
    );

    await client.deleteSubcategoryAsync(DefaultSubcategoryId);

    await expect(client.deleteSubcategoryAsync(1)).rejects.toThrow();
  });
});
