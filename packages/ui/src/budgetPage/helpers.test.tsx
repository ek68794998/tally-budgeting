import { describe, expect, it } from "vitest";
import { calculateBudgetScore } from "./helpers";

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
		reasoning:
			"10% savings, 5% budget cushion - adequate but not exceptional",
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
		it.each<TestCase>(testCases)(
			"should calculate budget score for $name",
			({ budgeted, expectedScore, income, spent }) => {
				const score = calculateBudgetScore(spent, income, budgeted);

				const scoreToOneDecimal = score?.toFixed(1) ?? "null";
				const expectedScoreToOneDecimal =
					expectedScore?.toFixed(1) ?? "null";

				expect(scoreToOneDecimal).toBe(expectedScoreToOneDecimal);
			},
		);
	});
});
