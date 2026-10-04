import { describe, expect, it } from "vitest";
import {
  convertSubcategoryRowToSubcategory,
  convertSubcategoryToSubcategoryRow,
} from "./subcategory";

describe("subcategory converters", () => {
  describe("convertSubcategoryRowToSubcategory", () => {
    it("converts a row to a subcategory", () => {
      const result = convertSubcategoryRowToSubcategory({
        /* eslint-disable @typescript-eslint/naming-convention */
        budget_amount_cents: "10000",
        budget_frequency_months: 1,
        budget_type: "expense",
        category: 5,
        description: "Coffee and cafes",
        id: 101,
        label: "Coffee",
        pct_needs: 40,
        pct_savings: 10,
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      expect(result).toEqual({
        budget: {
          amountCents: 10000,
          frequency: 1,
          type: "expense",
        },
        categoryId: 5,
        description: "Coffee and cafes",
        id: 101,
        label: "Coffee",
        percentNeeds: 40,
        percentSavings: 10,
      });
    });

    it("coerces budget_amount_cents string to number", () => {
      const result = convertSubcategoryRowToSubcategory({
        /* eslint-disable @typescript-eslint/naming-convention */
        budget_amount_cents: "99999",
        budget_frequency_months: 3,
        budget_type: "income",
        category: 1,
        description: null,
        id: 1,
        label: "Salary",
        pct_needs: 0,
        pct_savings: 100,
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      expect(result.budget.amountCents).toBe(99999);
    });

    it("maps null description to empty string", () => {
      const result = convertSubcategoryRowToSubcategory({
        /* eslint-disable @typescript-eslint/naming-convention */
        budget_amount_cents: "0",
        budget_frequency_months: 12,
        budget_type: "expense",
        category: 1,
        description: null,
        id: 2,
        label: "Misc",
        pct_needs: 0,
        pct_savings: 0,
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      expect(result.description).toBe("");
    });

    it.each([
      ["expense", 1],
      ["income", 6],
      ["neutral", 12],
    ] as const)("handles budget_type=%s with frequency=%d", (budgetType, frequency) => {
      const result = convertSubcategoryRowToSubcategory({
        /* eslint-disable @typescript-eslint/naming-convention */
        budget_amount_cents: "5000",
        budget_frequency_months: frequency,
        budget_type: budgetType,
        category: 1,
        description: "test",
        id: 1,
        label: "Test",
        pct_needs: 50,
        pct_savings: 20,
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      expect(result.budget.type).toBe(budgetType);
      expect(result.budget.frequency).toBe(frequency);
    });
  });

  describe("convertSubcategoryToSubcategoryRow", () => {
    it("converts a subcategory to a row", () => {
      const result = convertSubcategoryToSubcategoryRow({
        budget: {
          amountCents: 10000,
          frequency: 1,
          type: "expense",
        },
        categoryId: 5,
        description: "Coffee and cafes",
        id: 101,
        label: "Coffee",
        percentNeeds: 40,
        percentSavings: 10,
      });

      expect(result).toEqual({
        /* eslint-disable @typescript-eslint/naming-convention */
        budget_amount_cents: "10000",
        budget_frequency_months: 1,
        budget_type: "expense",
        category: 5,
        description: "Coffee and cafes",
        id: 101,
        label: "Coffee",
        pct_needs: 40,
        pct_savings: 10,
        /* eslint-enable @typescript-eslint/naming-convention */
      });
    });

    it("stringifies amountCents", () => {
      const result = convertSubcategoryToSubcategoryRow({
        budget: {
          amountCents: 75000,
          frequency: 12,
          type: "neutral",
        },
        categoryId: 2,
        description: "",
        id: 3,
        label: "Emergency Fund",
        percentNeeds: 0,
        percentSavings: 100,
      });

      expect(result.budget_amount_cents).toBe("75000");
    });

    it("maps empty description to empty string", () => {
      const result = convertSubcategoryToSubcategoryRow({
        budget: {
          amountCents: 0,
          frequency: 1,
          type: "expense",
        },
        categoryId: 1,
        description: "",
        id: 1,
        label: "Misc",
        percentNeeds: 0,
        percentSavings: 0,
      });

      expect(result.description).toBe("");
    });
  });

  describe("round-trip", () => {
    it.each([
      {
        budget: {
          amountCents: 50000,
          frequency: 1,
          type: "expense" as const,
        },
        categoryId: 3,
        description: "Dining out",
        id: 10,
        label: "Restaurants",
        percentNeeds: 30,
        percentSavings: 0,
      },
      {
        budget: {
          amountCents: 0,
          frequency: 12,
          type: "neutral" as const,
        },
        categoryId: 7,
        description: "",
        id: 20,
        label: "Investments",
        percentNeeds: 0,
        percentSavings: 100,
      },
    ])("subcategory → row → subcategory is identity for %o", (subcategory) => {
      const row = convertSubcategoryToSubcategoryRow(subcategory);
      const result = convertSubcategoryRowToSubcategory(row);

      expect(result).toEqual(subcategory);
    });
  });
});
