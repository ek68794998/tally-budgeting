import { type BudgetType } from "@tally/data-models/contracts/budgetType";
import {
  DefaultSubcategory,
  type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { describe, expect, it } from "vitest";
import { calculateBudgetSpending } from "./helpers";

describe("calculateBudgetSpending", () => {
  const createSubcategory = (
    id: number,
    type: BudgetType,
    percentNeeds = 0,
    percentSavings = 0,
  ): Subcategory => ({
    ...DefaultSubcategory,
    budget: {
      amountCents: 10000,
      frequency: 1,
      type,
    },
    categoryId: 1,
    description: "",
    id,
    label: `Subcategory ${id}`,
    percentNeeds,
    percentSavings,
  });

  const createTransaction = (
    id: number,
    subcategoryId: number,
    amountCents: number,
  ): Transaction => ({
    amountCents,
    categoryId: 1,
    date: "2025-01-15T00:00:00.000Z",
    happiness: 2,
    id,
    merchant: "Test Merchant",
    notes: "",
    subcategoryId,
    type: "debit",
  });

  it("should return zeros and empty spending for no transactions", () => {
    const result = calculateBudgetSpending({
      subcategories: [createSubcategory(1, "expense")],
      transactions: [],
    });

    expect(result).toEqual({
      spending: [],
      spentOnNeedsCents: 0,
      spentOnSavingsCents: 0,
      spentOnWantsCents: 0,
    });
  });

  it("should skip transactions with an unrecognized subcategoryId", () => {
    const result = calculateBudgetSpending({
      subcategories: [],
      transactions: [createTransaction(1, 99, 5000)],
    });

    expect(result).toEqual({
      spending: [],
      spentOnNeedsCents: 0,
      spentOnSavingsCents: 0,
      spentOnWantsCents: 0,
    });
  });

  it.each<BudgetType>([
    "neutral",
    "income",
  ])("should not include %s transactions in the spending array", (type) => {
    const result = calculateBudgetSpending({
      subcategories: [createSubcategory(1, type)],
      transactions: [createTransaction(1, 1, 10000)],
    });

    expect(result.spending).toHaveLength(0);
  });

  it("should completely ignore neutral transactions", () => {
    const result = calculateBudgetSpending({
      subcategories: [createSubcategory(1, "neutral")],
      transactions: [createTransaction(1, 1, 10000)],
    });

    expect(result).toEqual({
      spending: [],
      spentOnNeedsCents: 0,
      spentOnSavingsCents: 0,
      spentOnWantsCents: 0,
    });
  });

  it.each([
    // [percentNeeds, percentSavings, expectedNeeds, expectedSavings, expectedWants]
    [100, 0, 10000, 0, 0],
    [0, 100, 0, 10000, 0],
    [50, 50, 5000, 5000, 0],
    [50, 25, 5000, 2500, 2500],
    [0, 0, 0, 0, 10000],
    [33, 33, 3300, 3300, 3400],
  ])("should split expense amountCents correctly with percentNeeds=%i percentSavings=%i", (percentNeeds, percentSavings, expectedNeeds, expectedSavings, expectedWants) => {
    const result = calculateBudgetSpending({
      subcategories: [
        createSubcategory(1, "expense", percentNeeds, percentSavings),
      ],
      transactions: [createTransaction(1, 1, 10000)],
    });

    expect(result.spentOnNeedsCents).toBe(expectedNeeds);
    expect(result.spentOnSavingsCents).toBe(expectedSavings);
    expect(result.spentOnWantsCents).toBe(expectedWants);
  });

  it.each([
    // [incomeCents, expenseAmountCents, expensePercentNeeds, expensePercentSavings, expectedSavings]
    // No expenses — all unspent income rolls into savings
    [10000, 0, 0, 0, 10000],
    // Expenses < income — remainder rolls into savings
    [10000, 4000, 0, 0, 6000],
    // Expenses >= income — notSpentCents clamps to 0, no bonus savings
    [5000, 8000, 0, 0, 0],
    // Income with percentSavings on income subcategory + unspent remainder
    [10000, 0, 0, 20, 10000],
  ])("should roll unspent income into savings (income=%i expense=%i needsPct=%i savingsPct=%i)", (incomeCents, expenseAmountCents, percentNeeds, percentSavings, expectedSavings) => {
    const subcategories = [
      createSubcategory(1, "income", percentNeeds, percentSavings),
    ];
    const transactions = [createTransaction(1, 1, incomeCents)];

    if (expenseAmountCents > 0) {
      subcategories.push(createSubcategory(2, "expense", 0, 0));
      transactions.push(createTransaction(2, 2, expenseAmountCents));
    }

    const result = calculateBudgetSpending({ subcategories, transactions });

    expect(result.spentOnSavingsCents).toBe(expectedSavings);
  });

  it("should aggregate multiple transactions for the same subcategory", () => {
    const subcategory = createSubcategory(1, "expense", 0, 0);
    const result = calculateBudgetSpending({
      subcategories: [subcategory],
      transactions: [
        createTransaction(1, 1, 3000),
        createTransaction(2, 1, 7000),
        createTransaction(3, 1, 500),
      ],
    });

    expect(result.spending).toEqual([{ spentCents: 10500, subcategoryId: 1 }]);
    expect(result.spentOnWantsCents).toBe(10500);
  });

  it("should sort the spending array descending by spentCents", () => {
    const result = calculateBudgetSpending({
      subcategories: [
        createSubcategory(1, "expense"),
        createSubcategory(2, "expense"),
        createSubcategory(3, "expense"),
      ],
      transactions: [
        createTransaction(1, 1, 300),
        createTransaction(2, 2, 5000),
        createTransaction(3, 3, 1200),
      ],
    });

    expect(result.spending.map((s) => s.subcategoryId)).toEqual([2, 3, 1]);
  });

  it("should correctly aggregate a comprehensive set of transactions across multiple categories", () => {
    // Subcategories:
    //   1 = Rent (expense, 60% needs, 0% savings)         → all needs
    //   2 = Groceries (expense, 80% needs, 0% savings)    → mostly needs, rest wants
    //   3 = Entertainment (expense, 0% needs, 0% savings) → all wants
    //   4 = Gym (expense, 0% needs, 10% savings)          → 10% savings, 90% wants
    //   5 = Salary (income, 0% needs, 5% savings)         → income
    //   6 = Bank fees (neutral)                           → ignored

    const subcategories: Subcategory[] = [
      createSubcategory(1, "expense", 60, 0),
      createSubcategory(2, "expense", 80, 0),
      createSubcategory(3, "expense", 0, 0),
      createSubcategory(4, "expense", 0, 10),
      createSubcategory(5, "income", 0, 5),
      createSubcategory(6, "neutral"),
    ];

    const transactions: Transaction[] = [
      // Rent: 2 payments of $500 each = $1000 total
      createTransaction(1, 1, 50000),
      createTransaction(2, 1, 50000),
      // Groceries: $300
      createTransaction(3, 2, 30000),
      // Entertainment: $150 + $50
      createTransaction(4, 3, 15000),
      createTransaction(5, 3, 5000),
      // Gym: $40
      createTransaction(6, 4, 4000),
      // Salary: $3000
      createTransaction(7, 5, 300000),
      // Bank fee (neutral): ignored
      createTransaction(8, 6, 500),
    ];

    const result = calculateBudgetSpending({ subcategories, transactions });

    // spending array covers only expense subcategories, sorted desc
    expect(result.spending).toEqual([
      { spentCents: 100000, subcategoryId: 1 }, // Rent $1000
      { spentCents: 30000, subcategoryId: 2 }, // Groceries $300
      { spentCents: 20000, subcategoryId: 3 }, // Entertainment $200
      { spentCents: 4000, subcategoryId: 4 }, // Gym $40
    ]);

    // Needs:
    //   Rent: 60% of 100000 = 60000
    //   Groceries: 80% of 30000 = 24000
    //   Entertainment: 0
    //   Gym: 0
    //   Total = 84000
    expect(result.spentOnNeedsCents).toBe(84000);

    // Wants:
    //   Rent: 40% of 100000 = 40000
    //   Groceries: 20% of 30000 = 6000
    //   Entertainment: 100% of 20000 = 20000
    //   Gym: 90% of 4000 = 3600
    //   Total = 69600
    expect(result.spentOnWantsCents).toBe(69600);

    // Savings before notSpent:
    //   Gym: 10% of 4000 = 400
    //   Salary (income): 5% of 300000 = 15000
    //   Subtotal = 15400
    // notSpentCents = max(0, income - needs - savings - wants)
    //   = max(0, 300000 - 84000 - 15400 - 69600)
    //   = max(0, 131000) = 131000
    // spentOnSavingsCents = round(15400 + 131000) = 146400
    expect(result.spentOnSavingsCents).toBe(146400);
  });
});
