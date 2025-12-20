import {
	type RetirementCalculatorInputs,
	type RetirementData,
	type RetirementDataByYear,
} from "./types";

export const calculateRetirementData = (
	inputs: RetirementCalculatorInputs,
	currentYear: number,
	monthsLeftInCurrentYear: number,
): RetirementData => {
	const dataByYear: RetirementDataByYear[] = [];

	const {
		annualInflationRatePercent,
		annualInvestmentReturnPercent,
		annualRaise,
		contributionPercent,
		currentAge,
		currentPretaxIncome,
		currentRetirementInvestments,
		lifeExpectancy,
		postRetirementIncomeNeeded,
		retirementAge,
	} = inputs;

	const numberOfYears = lifeExpectancy - currentAge;

	let previousRetirementAmount = currentRetirementInvestments;
	let previousYearIncome = currentPretaxIncome;

	for (let i = 0; i <= numberOfYears; i++) {
		const year = currentYear + i;
		const age = currentAge + i;
		const isRetiredInYear = age > retirementAge;

		const multiplier = i === 0 ? monthsLeftInCurrentYear / 12 : 1;

		const raiseThisYear = i === 0 ? 0 : annualRaise;
		const assumedIncome = isRetiredInYear
			? 0
			: previousYearIncome * (1 + raiseThisYear);

		const addedToRetirement =
			multiplier * assumedIncome * contributionPercent;
		const compoundInflation = (1 + annualInflationRatePercent) ** i;
		const distributedFromRetirement = isRetiredInYear
			? multiplier * postRetirementIncomeNeeded * compoundInflation
			: 0;

		let retirementAmount = previousRetirementAmount;
		retirementAmount -= distributedFromRetirement;
		retirementAmount *= 1 + annualInvestmentReturnPercent * multiplier;
		retirementAmount += addedToRetirement;

		if (retirementAmount < 0) {
			retirementAmount = 0;
		}

		const retirementAmountToday = retirementAmount / compoundInflation;

		dataByYear.push({
			addedToRetirement,
			age,
			assumedIncome,
			compoundInflation,
			distributedFromRetirement,
			retirementAmount,
			retirementAmountToday,
			year,
		});

		previousRetirementAmount = retirementAmount;
		previousYearIncome = assumedIncome;
	}

	return {
		dataByYear,
	};
};

export const getDefaultRetirementCalculatorInputs =
	(): RetirementCalculatorInputs => ({
		annualInflationRatePercent: 0.04,
		annualInvestmentReturnPercent: 0.06,
		annualRaise: 0,
		contributionPercent: 0,
		currentAge: 18,
		currentPretaxIncome: 0,
		currentRetirementInvestments: 0,
		lifeExpectancy: 85,
		postRetirementIncomeNeeded: 0,
		retirementAge: 65,
	});
