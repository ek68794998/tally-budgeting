import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type CircularProgressProps } from "@heroui/react";
import {
	type Icon,
	IconBabyCarriage,
	IconBriefcase,
	IconBuildingBank,
	IconCar,
	IconChartLine,
	IconCoin,
	IconCreditCard,
	IconDeviceDesktop,
	IconDeviceTv,
	IconGift,
	IconHeartbeat,
	IconHome,
	IconLock,
	IconPaw,
	IconPigMoney,
	IconPlane,
	IconQuestionMark,
	IconReceipt,
	IconSchool,
	IconShoppingBag,
	IconSparkles,
	IconToolsKitchen2,
	IconTrendingUp,
} from "@tabler/icons-react";
import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { Dollars } from "@tally/utilities/financial/dollars";
import { DateTime } from "luxon";
import { type useTranslations } from "next-intl";
import { formatCurrency } from "../format";
import { type BudgetDate } from "./types";

const knownIcons = [
	[/\bAuto\b/i, IconCar],
	[/\b(Bill|Util)/i, IconReceipt],
	[/\bBusiness\b/i, IconBriefcase],
	[/\bEducation\b/i, IconSchool],
	[/\bEntertain/i, IconDeviceTv],
	[/\b(Fee|Charge)/i, IconCreditCard],
	[/\bFinanc/i, IconChartLine],
	[/\bFood\b/i, IconToolsKitchen2],
	[/\b(Gift|Donation|Charity)/i, IconGift],
	[/\b(Health|Fitness)\b/i, IconHeartbeat],
	[/\bHome\b/i, IconHome],
	[/\bIncome\b/i, IconCoin],
	[/\bInvest/i, IconTrendingUp],
	[/\bKids?\b/i, IconBabyCarriage],
	[/\bLoans?\b/i, IconPigMoney],
	[/\bPersonal\s*Care\b/i, IconSparkles],
	[/\bPets?\b/i, IconPaw],
	[/\bShop/i, IconShoppingBag],
	[/\bSecur/i, IconLock],
	[/\bTax(es)?\b/i, IconBuildingBank],
	[/\b(Tech|Electronic|Compute)/i, IconDeviceDesktop],
	[/\bTravel\b/i, IconPlane],
	[/\bUncategorized\b/i, IconQuestionMark],
] satisfies [RegExp, Icon][];

export const calculateBudgetScore = (
	totalSpending: number,
	totalIncome: number,
	totalBudgeted: number,
): number | null => {
	// Edge cases
	if (totalIncome <= 0 || totalBudgeted <= 0 || totalSpending <= 0) {
		return null;
	}

	const budgetVariance = totalBudgeted - totalSpending;
	const budgetAdherence = budgetVariance / totalBudgeted;
	const savingsRate = (totalIncome - totalSpending) / totalIncome;
	const budgetToIncomeRatio = totalBudgeted / totalIncome;

	// Failed to stay within budget
	if (budgetVariance < 0) {
		const overageRate = Math.abs(budgetVariance) / totalBudgeted;

		if (overageRate <= 0.05) {
			return 3 + (1 - overageRate / 0.05);
		}

		if (overageRate <= 0.15) {
			return 1 + 2 * (1 - (overageRate - 0.05) / 0.1);
		}

		return Math.max(0, 1 - (overageRate - 0.15) / 0.2);
	}

	// Successfully stayed within budget
	let score = 5;

	// Reward 1: Budget cushion (0-2.5 points)
	const cushionBonus =
		budgetAdherence <= 0.1
			? budgetAdherence * 15
			: 1.5 + Math.min(1, (budgetAdherence - 0.1) * 6.67);
	score += cushionBonus;

	// Reward 2: Savings rate (0-3 points)
	const savingsBonus =
		savingsRate <= 0.2
			? savingsRate * 10
			: 2 + Math.min(1, (savingsRate - 0.2) * 10);
	score += savingsBonus;

	// Penalty: Unrealistic budget (budgeted > 90% of income)
	if (budgetToIncomeRatio > 0.9) {
		score -= (budgetToIncomeRatio - 0.9) * 5;
	}

	// Check for perfect 10 eligibility
	// Must have: good cushion, good savings, AND realistic budget
	const isPerfect =
		budgetAdherence >= 0.15 &&
		savingsRate >= 0.15 &&
		budgetToIncomeRatio <= 0.85; // Budget should leave 15%+ unallocated

	if (isPerfect) {
		return 10;
	}

	return Math.max(0, Math.min(9.5, score));
};

export const getBudgetScoreColor = (
	budgetScore: number | null,
): CircularProgressProps["color"] => {
	if (isNullOrUndefined(budgetScore)) {
		return "default";
	}

	if (budgetScore >= 8) {
		return "success";
	}

	if (budgetScore >= 5) {
		return "warning";
	}

	return "danger";
};

export const getBudgetScoreExplanation = (
	budgetScore: number | null,
	t: ReturnType<typeof useTranslations<"budget">>,
) => {
	type LocalizationKey = Parameters<typeof t>[0];

	const localizationKeys: LocalizationKey[] = [
		"summary.explanations.score0",
		"summary.explanations.score1",
		"summary.explanations.score2",
		"summary.explanations.score3",
		"summary.explanations.score4",
		"summary.explanations.score5",
		"summary.explanations.score6",
		"summary.explanations.score7",
		"summary.explanations.score8",
		"summary.explanations.score9",
		"summary.explanations.score10",
	];

	const numericBudgetScore = budgetScore ?? 0;
	const index = Math.floor(numericBudgetScore);

	invariant(localizationKeys[index], `Invalid index ${index}`);

	return t(localizationKeys[index]);
};

export const getSpentText = (
	spent: number,
	budget: Subcategory["budget"],
	endDate: BudgetDate,
	t: ReturnType<typeof useTranslations<"budget">>,
	locale: string,
) => {
	const startDate = getStartDate(endDate, budget.frequency);
	const budgetAmount = Dollars.fromCents(budget.amountCents);

	const amountBudgeted = formatCurrency(budgetAmount, {
		showCentsIfLessThanDigits: 2,
	});
	const amountSpent = formatCurrency(spent, {
		showCentsIfLessThanDigits: 2,
	});

	let spendingPeriod: string;

	if (startDate.month === endDate.month && startDate.year === endDate.year) {
		const endMonthName = DateTime.fromObject({
			month: endDate.month,
			year: endDate.year,
		}).toLocaleString({ month: "short" }, { locale });

		spendingPeriod = t("durations.oneMonth", {
			month: endMonthName,
		});
	} else {
		const startMonthName = DateTime.fromObject({
			month: startDate.month,
			year: startDate.year,
		}).toLocaleString(
			{
				month: "short",
				year: startDate.year === endDate.year ? undefined : "numeric",
			},
			{ locale },
		);

		spendingPeriod = t("durations.multipleMonths", {
			month: startMonthName,
		});
	}

	return t.rich(budgetAmount ? "spentInBudget" : "spentOverall", {
		bold: (chunks) => <b>{chunks}</b>,
		budget: amountBudgeted,
		period: spendingPeriod,
		spent: amountSpent,
	});
};

export const getStartDate = (
	endDate: BudgetDate,
	months: number,
): BudgetDate => {
	const startDate = { month: endDate.month, year: endDate.year };

	for (let i = 1; i < months; i++) {
		startDate.month -= 1;

		if (startDate.month < 1) {
			startDate.month = 12;
			startDate.year -= 1;
		}
	}

	return startDate;
};

export const getIconForCategory = (
	category: Category,
	subcategory: Subcategory | undefined,
	DefaultIconComponent: Icon,
): Icon => {
	let MainIconComponent: Icon | undefined;
	let SubIconComponent: Icon | undefined;

	for (const knownIcon of knownIcons) {
		if (knownIcon[0].test(category.label)) {
			MainIconComponent = knownIcon[1];
		}

		if (subcategory && knownIcon[0].test(subcategory.label)) {
			SubIconComponent = knownIcon[1];
			break;
		}
	}

	return SubIconComponent || MainIconComponent || DefaultIconComponent;
};
