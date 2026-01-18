"use client";

import { Accordion, AccordionItem } from "@heroui/react";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { sortAndFlattenCategories } from "@tally/utilities/categories/sortAndFlattenCategories";
import { Dollars } from "@tally/utilities/financial/dollars";
import { DateTime } from "luxon";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { useCategories } from "../../hooks/store/useCategories";
import { getIconForCategory } from "../helpers";
import { type BudgetDate } from "../types";
import { BudgetSubcategorySpend } from "./budgetSubcategorySpend";

interface Props {
	headerClassName?: string;
	periodEnd: BudgetDate;
	subcategorySpending: { spent: number; subcategoryId: number }[];
}

export const BudgetCategoriesList: React.FC<Props> = ({
	headerClassName,
	periodEnd,
	subcategorySpending,
}) => {
	const { categories, subcategories } = useCategories();

	const t = useTranslations("budget");

	const endDate = DateTime.fromObject(periodEnd).endOf("month");

	const items = sortAndFlattenCategories(categories, subcategories);

	const getAmountPaid = (subcategoryId: number) =>
		subcategorySpending.find((s) => s.subcategoryId === subcategoryId)
			?.spent ?? 0;

	const iconFgClassName = "text-success-900 dark:text-green-100";
	const iconBgClassName = "bg-success-200 dark:bg-green-900";

	return (
		<div>
			<h2 className={headerClassName}>{t("categoriesView.title")}</h2>
			<p className="mb-2 text-sm opacity-70">
				{t.rich("categoriesView.description", {
					bold: (chunks) => <b>{chunks}</b>,
					endDate: endDate.toFormat("LLLL"),
				})}
			</p>
			<Accordion selectionMode="multiple">
				{items.map(([cat, subcats]) => {
					const IconComponent = getIconForCategory(cat);

					let countOverBudget = 0;
					let countWithValues = 0;

					for (const subcat of subcats) {
						const amountPaid = getAmountPaid(subcat.id);
						const amountBudgeted = Dollars.fromCents(
							subcat.budget.amountCents,
						);

						if (amountBudgeted || amountPaid) {
							countWithValues++;
						}

						if (amountBudgeted && amountPaid > amountBudgeted) {
							countOverBudget++;
						}
					}

					if (countWithValues === 0) {
						return null;
					}

					const subtitle =
						countOverBudget > 0
							? t("overBudgetCount", { count: countOverBudget })
							: t("underBudget");

					return (
						<AccordionItem
							classNames={{
								content: "flex flex-col gap-4 mb-4",
								heading: "font-sans! font-bold",
								subtitle: "font-light opacity-70",
								titleWrapper: "cursor-pointer",
							}}
							key={cat.id}
							startContent={
								<div
									className={twMerge(
										iconFgClassName,
										iconBgClassName,
										"flex h-9 w-9 items-center justify-center rounded-lg",
									)}
								>
									{IconComponent ? (
										<IconComponent />
									) : (
										<IconCurrencyDollar />
									)}
								</div>
							}
							subtitle={subtitle}
							title={cat.label}
						>
							{subcats.map((subcat) => (
								<BudgetSubcategorySpend
									amountPaid={getAmountPaid(subcat.id)}
									key={subcat.id}
									periodEnd={periodEnd}
									subcategory={subcat}
								/>
							))}
						</AccordionItem>
					);
				})}
			</Accordion>
		</div>
	);
};
