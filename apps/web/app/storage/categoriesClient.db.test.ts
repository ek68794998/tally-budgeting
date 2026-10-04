import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
import {
  buildCategory,
  buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CategoriesClient } from "./categoriesClient";
import { SubcategoriesClient } from "./subcategoriesClient";
import { createTestDatabaseHandle } from "./testing/testDatabase";

vi.mock("../auth/verifyRequest", () => ({
  assertAuthenticatedAsync: vi.fn(() => Promise.resolve()),
}));

const uncategorized = buildCategory({ id: -1, label: "Uncategorized" });

describe("CategoriesClient", () => {
  const testDatabase = createTestDatabaseHandle();

  beforeAll(testDatabase.setUpAsync);
  beforeEach(testDatabase.resetAsync);
  const createClient = () => new CategoriesClient(testDatabase.database);

  it("inserts categories after the seeded default", async () => {
    const client = createClient();

    await client.insertCategoriesAsync(buildCategory({ id: 0, label: "Food" }));
    await client.insertCategoriesAsync([
      buildCategory({ id: 0, label: "Housing" }),
    ]);

    await expect(client.getCategoriesAsync()).resolves.toEqual([
      uncategorized,
      buildCategory({ id: 1, label: "Food" }),
      buildCategory({ id: 2, label: "Housing" }),
    ]);
  });

  it("updates a category and cascades deletes to its subcategories", async () => {
    const client = createClient();
    const subcategoriesClient = new SubcategoriesClient(testDatabase.database);
    await client.insertCategoriesAsync([
      buildCategory({ id: 0, label: "Food" }),
      buildCategory({ id: 0, label: "Fun" }),
    ]);
    await subcategoriesClient.insertSubcategoriesAsync(
      buildSubcategory({ categoryId: 2, id: 0, label: "Movies" }),
    );

    await expect(
      client.updateCategoryAsync(buildCategory({ id: 1, label: "Groceries" })),
    ).resolves.toBe(true);
    await expect(
      client.updateCategoryAsync(buildCategory({ id: 99 })),
    ).resolves.toBe(false);
    await client.deleteCategoryAsync(2);

    await expect(client.getCategoriesAsync()).resolves.toEqual([
      uncategorized,
      buildCategory({ id: 1, label: "Groceries" }),
    ]);
    await expect(subcategoriesClient.getSubcategoriesAsync()).resolves.toEqual([
      DefaultSubcategory,
    ]);
  });
});
