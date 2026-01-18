import { invariant } from "@ekumlin/typescript-toolkit/values";
import { describe, expect, it } from "vitest";
import { calculateRetirementData } from "./helpers";
import type { RetirementCalculatorInputs } from "./types";

describe("retirementPage helpers", () => {
	describe("calculateRetirementData", () => {
		const baseInputs: RetirementCalculatorInputs = {
			annualInflationRatePercent: 0.03,
			annualInvestmentReturnPercent: 0.07,
			annualRaise: 0.02,
			contributionPercent: 0.15,
			currentAge: 30,
			currentPretaxIncome: 100000,
			currentRetirementInvestments: 50000,
			lifeExpectancy: 85,
			postRetirementIncomeNeeded: 60000,
			retirementAge: 65,
		};

		describe("basic structure", () => {
			it("should generate correct number of years", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				// lifeExpectancy - currentAge + 1 (inclusive)
				expect(result.dataByYear).toHaveLength(56);
			});

			it("should start at current year and age", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				invariant(result.dataByYear[0]);

				expect(result.dataByYear[0].year).toBe(2024);
				expect(result.dataByYear[0].age).toBe(30);
			});

			it("should increment year and age correctly", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				invariant(result.dataByYear[1]);
				invariant(result.dataByYear[10]);

				expect(result.dataByYear[1].year).toBe(2025);
				expect(result.dataByYear[1].age).toBe(31);
				expect(result.dataByYear[10].year).toBe(2034);
				expect(result.dataByYear[10].age).toBe(40);
			});
		});

		describe("partial first year", () => {
			it("should prorate contributions for first year", () => {
				const result = calculateRetirementData(baseInputs, 2024, 6);

				const firstYear = result.dataByYear[0];
				const fullYearContribution =
					baseInputs.currentPretaxIncome *
					baseInputs.contributionPercent;

				invariant(firstYear);

				expect(firstYear.addedToRetirement).toBe(
					fullYearContribution * 0.5,
				);
			});

			it("should prorate investment returns for first year", () => {
				const inputs = {
					...baseInputs,
					contributionPercent: 0,
					currentRetirementInvestments: 100000,
				};

				const halfYear = calculateRetirementData(inputs, 2024, 6);
				const fullYear = calculateRetirementData(inputs, 2024, 12);

				invariant(halfYear.dataByYear[0]);
				invariant(fullYear.dataByYear[0]);

				const halfYearGrowth =
					halfYear.dataByYear[0].retirementAmount -
					inputs.currentRetirementInvestments;
				const fullYearGrowth =
					fullYear.dataByYear[0].retirementAmount -
					inputs.currentRetirementInvestments;

				expect(halfYearGrowth).toBeCloseTo(fullYearGrowth * 0.5, 0);
			});

			it("should not apply raise in first year", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				invariant(result.dataByYear[0]);

				expect(result.dataByYear[0].assumedIncome).toBe(
					baseInputs.currentPretaxIncome,
				);
			});
		});

		describe("accumulation phase", () => {
			it("should apply annual raise after first year", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				invariant(result.dataByYear[1]);

				const year1Income = result.dataByYear[1].assumedIncome;
				const expectedIncome =
					baseInputs.currentPretaxIncome *
					(1 + baseInputs.annualRaise);

				expect(year1Income).toBeCloseTo(expectedIncome, 2);
			});

			it("should compound raises over multiple years", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				invariant(result.dataByYear[5]);

				const year5Income = result.dataByYear[5].assumedIncome;
				const expectedIncome =
					baseInputs.currentPretaxIncome *
					(1 + baseInputs.annualRaise) ** 5;

				expect(year5Income).toBeCloseTo(expectedIncome, 2);
			});

			it("should add contributions based on income", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				const year1 = result.dataByYear[1];
				invariant(year1);

				const expectedContribution =
					year1.assumedIncome * baseInputs.contributionPercent;

				expect(year1.addedToRetirement).toBeCloseTo(
					expectedContribution,
					2,
				);
			});

			it("should not distribute during accumulation", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				// Check years before retirement
				const preRetirementYears = result.dataByYear.filter(
					(y) => y.age <= baseInputs.retirementAge,
				);

				preRetirementYears.forEach((year) => {
					expect(year.distributedFromRetirement).toBe(0);
				});
			});

			it("should grow retirement balance with contributions and returns", () => {
				const inputs = {
					...baseInputs,
					annualInvestmentReturnPercent: 0.1,
					contributionPercent: 0.2,
					currentPretaxIncome: 100000,
					currentRetirementInvestments: 0,
				};

				const result = calculateRetirementData(inputs, 2024, 12);
				const firstYear = result.dataByYear[0];

				invariant(firstYear);

				// Order: withdraw (0), grow (0 * 1.1 = 0), contribute (20000)
				const expectedContribution = 100000 * 0.2;
				const expectedBalance = expectedContribution;

				expect(firstYear.retirementAmount).toBeCloseTo(
					expectedBalance,
					2,
				);
			});
		});

		describe("retirement transition", () => {
			it("should stop income after retirement age", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				const retirementYearIndex =
					baseInputs.retirementAge - baseInputs.currentAge;
				const atRetirement = result.dataByYear[retirementYearIndex];
				const afterRetirement =
					result.dataByYear[retirementYearIndex + 1];

				invariant(atRetirement);
				invariant(afterRetirement);

				expect(atRetirement.assumedIncome).toBeGreaterThan(0);
				expect(afterRetirement.assumedIncome).toBe(0);
			});

			it("should start distributions year after retirement age", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				const retirementYearIndex =
					baseInputs.retirementAge - baseInputs.currentAge;
				const atRetirement = result.dataByYear[retirementYearIndex];
				const afterRetirement =
					result.dataByYear[retirementYearIndex + 1];

				invariant(atRetirement);
				invariant(afterRetirement);

				expect(atRetirement.distributedFromRetirement).toBe(0);
				expect(
					afterRetirement.distributedFromRetirement,
				).toBeGreaterThan(0);
			});

			it("should stop contributions after retirement", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				const postRetirementYears = result.dataByYear.filter(
					(y) => y.age > baseInputs.retirementAge,
				);

				postRetirementYears.forEach((year) => {
					expect(year.addedToRetirement).toBe(0);
				});
			});
		});

		describe("retirement distributions", () => {
			it("should apply inflation to distributions", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				const retirementYearIndex =
					baseInputs.retirementAge - baseInputs.currentAge + 1;
				const firstRetiredYear = result.dataByYear[retirementYearIndex];
				const secondRetiredYear =
					result.dataByYear[retirementYearIndex + 1];

				const expectedFirstDistribution =
					baseInputs.postRetirementIncomeNeeded *
					(1 + baseInputs.annualInflationRatePercent) **
						retirementYearIndex;
				const expectedSecondDistribution =
					baseInputs.postRetirementIncomeNeeded *
					(1 + baseInputs.annualInflationRatePercent) **
						(retirementYearIndex + 1);

				invariant(firstRetiredYear);
				invariant(secondRetiredYear);

				expect(firstRetiredYear.distributedFromRetirement).toBeCloseTo(
					expectedFirstDistribution,
					2,
				);
				expect(secondRetiredYear.distributedFromRetirement).toBeCloseTo(
					expectedSecondDistribution,
					2,
				);
			});

			it("should prorate distributions in partial years", () => {
				const inputs = {
					...baseInputs,
					currentAge: 66, // Already past retirement age
					retirementAge: 65,
				};

				const halfYear = calculateRetirementData(inputs, 2024, 6);
				const fullYear = calculateRetirementData(inputs, 2024, 12);

				invariant(halfYear.dataByYear[0]);
				invariant(fullYear.dataByYear[0]);

				// Age 66 is already > retirementAge, so distributions happen in year 0
				const halfYearDist =
					halfYear.dataByYear[0].distributedFromRetirement;
				const fullYearDist =
					fullYear.dataByYear[0].distributedFromRetirement;

				expect(halfYearDist).toBeCloseTo(fullYearDist * 0.5, 2);
			});
		});

		describe("inflation calculations", () => {
			it("should calculate compound inflation correctly", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				result.dataByYear.forEach((year, index) => {
					const expectedInflation =
						(1 + baseInputs.annualInflationRatePercent) ** index;
					expect(year.compoundInflation).toBeCloseTo(
						expectedInflation,
						10,
					);
				});
			});

			it("should calculate present value correctly", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				result.dataByYear.forEach((year) => {
					const expectedPresentValue =
						year.retirementAmount / year.compoundInflation;
					expect(year.retirementAmountToday).toBeCloseTo(
						expectedPresentValue,
						2,
					);
				});
			});

			it("should have present value equal to nominal value in year 0", () => {
				const result = calculateRetirementData(baseInputs, 2024, 12);

				const firstYear = result.dataByYear[0];
				invariant(firstYear);

				expect(firstYear.retirementAmountToday).toBeCloseTo(
					firstYear.retirementAmount,
					2,
				);
			});
		});

		describe("running out of money", () => {
			it("should floor retirement amount at zero", () => {
				const inputs: RetirementCalculatorInputs = {
					...baseInputs,
					annualInvestmentReturnPercent: 0,
					currentRetirementInvestments: 10000,
					postRetirementIncomeNeeded: 100000,
				};

				const result = calculateRetirementData(inputs, 2024, 12);

				const postRetirementYears = result.dataByYear.filter(
					(y) => y.age > inputs.retirementAge,
				);
				const zeroYear = postRetirementYears.find(
					(y) => y.retirementAmount === 0,
				);

				invariant(zeroYear);
				expect(zeroYear.retirementAmount).toBe(0);
			});

			it("should stay at zero after running out", () => {
				const inputs: RetirementCalculatorInputs = {
					...baseInputs,
					annualInvestmentReturnPercent: 0,
					currentRetirementInvestments: 10000,
					postRetirementIncomeNeeded: 100000,
				};

				const result = calculateRetirementData(inputs, 2024, 12);

				let hitZero = false;
				result.dataByYear.forEach((year) => {
					if (year.retirementAmount === 0) {
						hitZero = true;
					}

					if (hitZero) {
						expect(year.retirementAmount).toBe(0);
					}
				});
			});

			it("should not go negative", () => {
				const inputs: RetirementCalculatorInputs = {
					...baseInputs,
					annualInvestmentReturnPercent: 0,
					currentRetirementInvestments: 1000,
					postRetirementIncomeNeeded: 1000000,
				};

				const result = calculateRetirementData(inputs, 2024, 12);

				result.dataByYear.forEach((year) => {
					expect(year.retirementAmount).toBeGreaterThanOrEqual(0);
				});
			});
		});

		describe("edge cases", () => {
			it("should handle zero contribution percent", () => {
				const inputs = {
					...baseInputs,
					contributionPercent: 0,
				};

				const result = calculateRetirementData(inputs, 2024, 12);

				result.dataByYear.forEach((year) => {
					expect(year.addedToRetirement).toBe(0);
				});
			});

			it("should handle zero investment return", () => {
				const inputs = {
					...baseInputs,
					annualInvestmentReturnPercent: 0,
					contributionPercent: 0,
				};

				const result = calculateRetirementData(inputs, 2024, 12);

				// Balance should stay at initial amount (no growth, no contributions, pre-retirement)
				const preRetirementYears = result.dataByYear.filter(
					(y) => y.age <= inputs.retirementAge,
				);
				preRetirementYears.forEach((year) => {
					expect(year.retirementAmount).toBe(
						inputs.currentRetirementInvestments,
					);
				});
			});

			it("should handle already retired person", () => {
				const inputs = {
					...baseInputs,
					currentAge: 70,
					retirementAge: 65,
				};

				const result = calculateRetirementData(inputs, 2024, 12);

				result.dataByYear.forEach((year) => {
					expect(year.assumedIncome).toBe(0);
					expect(year.addedToRetirement).toBe(0);
					expect(year.distributedFromRetirement).toBeGreaterThan(0);
				});
			});

			it("should handle person retiring this year", () => {
				const inputs = {
					...baseInputs,
					currentAge: 65,
					retirementAge: 65,
				};

				const result = calculateRetirementData(inputs, 2024, 12);

				const currentYear = result.dataByYear[0];
				const nextYear = result.dataByYear[1];

				invariant(currentYear);
				invariant(nextYear);

				// Current year: still working (age === retirementAge, not >)
				expect(currentYear.assumedIncome).toBe(
					baseInputs.currentPretaxIncome,
				);
				expect(currentYear.distributedFromRetirement).toBe(0);

				// Next year: retired (age > retirementAge)
				expect(nextYear.assumedIncome).toBe(0);
				expect(nextYear.distributedFromRetirement).toBeGreaterThan(0);
			});

			it("should handle 1 month left in current year", () => {
				const result = calculateRetirementData(baseInputs, 2024, 1);

				const firstYear = result.dataByYear[0];
				const fullYearContribution =
					baseInputs.currentPretaxIncome *
					baseInputs.contributionPercent;

				invariant(firstYear);

				expect(firstYear.addedToRetirement).toBeCloseTo(
					fullYearContribution / 12,
					2,
				);
			});

			it("should handle negative raise (pay cut)", () => {
				const inputs = {
					...baseInputs,
					annualRaise: -0.05,
				};

				const result = calculateRetirementData(inputs, 2024, 12);

				invariant(result.dataByYear[1]);

				const year1Income = result.dataByYear[1].assumedIncome;
				const expectedIncome = baseInputs.currentPretaxIncome * 0.95;

				expect(year1Income).toBeCloseTo(expectedIncome, 2);
			});
		});

		describe("calculation order", () => {
			it("should apply operations in correct order: withdraw, grow, contribute", () => {
				const inputs: RetirementCalculatorInputs = {
					annualInflationRatePercent: 0,
					annualInvestmentReturnPercent: 0.1,
					annualRaise: 0,
					contributionPercent: 0,
					currentAge: 66,
					currentPretaxIncome: 0,
					currentRetirementInvestments: 100000,
					lifeExpectancy: 67,
					postRetirementIncomeNeeded: 10000,
					retirementAge: 65,
				};

				const result = calculateRetirementData(inputs, 2024, 12);
				const firstYear = result.dataByYear[0];

				invariant(firstYear);

				// Starting balance: 100,000
				// Withdraw: 10,000 -> 90,000
				// Grow: 90,000 * 1.1 = 99,000
				// Contribute: 0
				// Final: 99,000

				expect(firstYear.retirementAmount).toBeCloseTo(99000, 2);
			});
		});
	});
});
