import { dangerouslyCoerceType } from "@ekumlin/typescript-toolkit/testing";
import {
  IconBabyCarriage,
  IconCar,
  IconHome,
  IconQuestionMark,
  IconShoppingBag,
} from "@tabler/icons-react";
import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { formatCurrency } from "../format";
import {
  calculateBudgetScore,
  getBudgetScoreColor,
  getBudgetScoreExplanation,
  getIconForCategory,
  getSpentText,
  getStartDate,
} from "./helpers";

type BudgetTranslator = Parameters<typeof getSpentText>[3];

interface RichValues {
  bold: (chunks: ReactNode) => ReactNode;
  budget: string;
  period: string;
  spent: string;
}

interface TestCase {
  budgeted: number;
  expectedScore: number | null;
  income: number;
  name: string;
  reasoning: string;
  spent: number;
}

const testCases: TestCase[] = [
  // Perfect 10s
  {
    budgeted: 100_000,
    expectedScore: 10,
    income: 1_000_000,
    name: "Extreme saver",
    reasoning:
      "Nearly perfect savings (99.9%), massive cushion, excellent discipline",
    spent: 1,
  },
  {
    budgeted: 80_000,
    expectedScore: 10,
    income: 100_000,
    name: "Strong saver",
    reasoning: "35% savings rate, 18.75% budget cushion, very disciplined",
    spent: 65_000,
  },
  {
    budgeted: 85_000,
    expectedScore: 10,
    income: 100_000,
    name: "Minimum perfect score",
    reasoning:
      "30% savings rate, 17.6% budget cushion - just hits the excellence threshold",
    spent: 70_000,
  },

  // High scores (8-9)
  {
    budgeted: 90_000,
    expectedScore: 8.6,
    income: 100_000,
    name: "Good saver",
    reasoning: "20% savings, 11% budget cushion - solid financial health",
    spent: 80_000,
  },
  {
    budgeted: 95_000,
    expectedScore: 6.5,
    income: 100_000,
    name: "Modest saver",
    reasoning: "10% savings, 5% budget cushion - adequate but not exceptional",
    spent: 90_000,
  },

  // Mid scores (5-7)
  {
    budgeted: 100_000,
    expectedScore: 4.5,
    income: 100_000,
    name: "Broke even on budget",
    reasoning:
      "Met budget exactly but no cushion or savings - base success only",
    spent: 100_000,
  },
  {
    budgeted: 98_000,
    expectedScore: 5.6,
    income: 100_000,
    name: "Minimal savings",
    reasoning: "5% savings, 3% budget cushion - minimal financial buffer",
    spent: 95_000,
  },

  // Failed budget (0-4)
  {
    budgeted: 90_000,
    expectedScore: 3.6,
    income: 100_000,
    name: "Minor overage",
    reasoning: "2.2% over budget - small slip but concerning",
    spent: 92_000,
  },
  {
    budgeted: 90_000,
    expectedScore: 1.8,
    income: 100_000,
    name: "Moderate overage",
    reasoning: "11% over budget - serious budget failure",
    spent: 100_000,
  },
  {
    budgeted: 90_000,
    expectedScore: 0.6,
    income: 100_000,
    name: "Major overage",
    reasoning: "22% over budget - severe financial mismanagement",
    spent: 110_000,
  },

  // Edge cases
  {
    budgeted: 98_000,
    expectedScore: 9.5,
    income: 100_000,
    name: "Unrealistic budget",
    reasoning:
      "50% savings is excellent, but budgeting 98% of income shows poor planning (should be penalized slightly from 10)",
    spent: 50_000,
  },
  {
    budgeted: 75_000,
    expectedScore: 10,
    income: 100_000,
    name: "Reasonable budget, excellent execution",
    reasoning:
      "40% savings, 20% budget cushion, realistic budget - textbook perfect",
    spent: 60_000,
  },
  {
    budgeted: 50_000,
    expectedScore: null,
    income: 100_000,
    name: "Spent nothing",
    reasoning:
      "100% savings is unrealistic long-term but shows ultimate discipline",
    spent: 0,
  },
];

describe("Budget page helpers", () => {
  describe("calculateBudgetScore", () => {
    it.each<TestCase>(testCases)("should calculate budget score for $name", ({
      budgeted,
      expectedScore,
      income,
      spent,
    }) => {
      const score = calculateBudgetScore(spent, income, budgeted);

      const scoreToOneDecimal = score?.toFixed(1) ?? "null";
      const expectedScoreToOneDecimal = expectedScore?.toFixed(1) ?? "null";

      expect(scoreToOneDecimal).toBe(expectedScoreToOneDecimal);
    });
  });

  describe("getBudgetScoreColor", () => {
    it.each([
      [null, "default"],
      [8, "success"],
      [9, "success"],
      [10, "success"],
      [5, "warning"],
      [7.9, "warning"],
      [0, "danger"],
      [4.9, "danger"],
    ] as const)("returns %s for score %s", (score, expected) => {
      expect(getBudgetScoreColor(score)).toBe(expected);
    });
  });

  describe("getStartDate", () => {
    it.each([
      [{ month: 6, year: 2024 }, 1, { month: 6, year: 2024 }],
      [{ month: 6, year: 2024 }, 3, { month: 4, year: 2024 }],
      [{ month: 2, year: 2024 }, 3, { month: 12, year: 2023 }],
      [{ month: 1, year: 2024 }, 12, { month: 2, year: 2023 }],
      [{ month: 6, year: 2024 }, 6, { month: 1, year: 2024 }],
      [{ month: 3, year: 2025 }, 2, { month: 2, year: 2025 }],
    ] as const)("getStartDate(%o, %d) → %o", (endDate, months, expected) => {
      expect(getStartDate(endDate, months)).toEqual(expected);
    });
  });

  describe("getIconForCategory", () => {
    const makeCategory = (label: string): Category => ({ id: 1, label });
    const makeSubcategory = (label: string): Subcategory => ({
      budget: { amountCents: 0, frequency: 1, type: "expense" },
      categoryId: 1,
      description: "",
      id: 1,
      label,
      percentNeeds: 0,
      percentSavings: 0,
    });

    it("returns DefaultIconComponent when no match", () => {
      const result = getIconForCategory(
        makeCategory("Zzz Unrecognized"),
        undefined,
        IconQuestionMark,
      );

      expect(result).toBe(IconQuestionMark);
    });

    it("matches category label via regex", () => {
      const result = getIconForCategory(
        makeCategory("Auto Insurance"),
        undefined,
        IconQuestionMark,
      );

      expect(result).toBe(IconCar);
    });

    it("prefers subcategory match over category match", () => {
      const result = getIconForCategory(
        makeCategory("Auto Expenses"),
        makeSubcategory("Kids Activities"),
        IconQuestionMark,
      );

      expect(result).toBe(IconBabyCarriage);
    });

    it("falls back to category match when subcategory has no match", () => {
      const result = getIconForCategory(
        makeCategory("Home Improvement"),
        makeSubcategory("Unrecognized Sub"),
        IconQuestionMark,
      );

      expect(result).toBe(IconHome);
    });

    it("returns category match when subcategory is undefined", () => {
      const result = getIconForCategory(
        makeCategory("Shopping Spree"),
        undefined,
        IconQuestionMark,
      );

      expect(result).toBe(IconShoppingBag);
    });
  });

  describe("getBudgetScoreExplanation", () => {
    const t = dangerouslyCoerceType<BudgetTranslator>((key: string) => key);

    it.each([
      [null, "summary.explanations.score0"],
      [0, "summary.explanations.score0"],
      [7.9, "summary.explanations.score7"],
      [10, "summary.explanations.score10"],
    ] as const)("explains score %s with %s", (score, expected) => {
      expect(getBudgetScoreExplanation(score, t)).toBe(expected);
    });

    it("rejects a score outside 0-10", () => {
      expect(() => getBudgetScoreExplanation(11, t)).toThrow(
        "Invalid index 11",
      );
    });
  });

  describe("getSpentText", () => {
    const rich = vi.fn((key: string, values: RichValues) => ({
      key,
      values,
    }));
    const t = dangerouslyCoerceType<BudgetTranslator>(
      Object.assign(
        (key: string, values?: Record<string, string>) =>
          `${key}(${values?.month ?? ""})`,
        { rich },
      ),
    );

    it.each([
      {
        amountCents: 100_00,
        endDate: { month: 3, year: 2025 },
        expectedKey: "spentInBudget",
        expectedPeriod: "durations.oneMonth(Mar)",
        frequency: 1,
      },
      {
        amountCents: 1200_00,
        endDate: { month: 3, year: 2025 },
        expectedKey: "spentInBudget",
        expectedPeriod: "durations.multipleMonths(Jan)",
        frequency: 3,
      },
      {
        amountCents: 0,
        endDate: { month: 2, year: 2025 },
        expectedKey: "spentOverall",
        expectedPeriod: "durations.multipleMonths(Dec 2024)",
        frequency: 3,
      },
    ])("describes $frequency month(s) ending $endDate.month/$endDate.year as $expectedPeriod", ({
      amountCents,
      endDate,
      expectedKey,
      expectedPeriod,
      frequency,
    }) => {
      const spentText = getSpentText(
        5.5,
        { amountCents, frequency, type: "expense" },
        endDate,
        t,
        "en-US",
      );

      expect(spentText).toMatchObject({ key: expectedKey });
      expect(rich.mock.lastCall?.[1]).toMatchObject({
        budget: formatCurrency(amountCents / 100, {
          showCentsIfLessThanDigits: 2,
        }),
        period: expectedPeriod,
        spent: "$5.50",
      });
    });

    it("renders bold chunks", () => {
      const spentText = getSpentText(
        1,
        { amountCents: 1, frequency: 1, type: "expense" },
        { month: 1, year: 2025 },
        t,
        "en-US",
      );

      const [, values] = rich.mock.lastCall ?? [];
      render(<div>{values?.bold("total")}</div>);

      expect(spentText).toMatchObject({ key: "spentInBudget" });
      expect(screen.getByText("total").tagName).toBe("B");
    });
  });
});
