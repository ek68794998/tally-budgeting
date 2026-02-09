import { unreachable } from "@ekumlin/typescript-toolkit/values";
import { Spinner } from "@heroui/react";
import { type ActionItem } from "@tally/data-models/contracts/api/getBudgetSummary";
import { telemetry } from "@tally/utilities/telemetry/index";
import { useCategories } from "../../hooks/store/useCategories";
import { type BudgetDate } from "../types";
import { BudgetActionItemAboveAverage } from "./budgetActionItemAboveAverage";
import { BudgetActionItemBudgetChange } from "./budgetActionItemBudgetChange";
import { type BudgetActionItemCommonProps } from "./budgetActionItemCell";
import { BudgetActionItemOverBudget } from "./budgetActionItemOverBudget";

interface Props {
	data: ActionItem[];
	periodEnd: BudgetDate;
}

export const BudgetActionItemsSection: React.FC<Props> = ({
	data,
	periodEnd,
}) => {
	const { categories, isLoading, subcategories } = useCategories();

	const firstItem = data[0];

	if (!firstItem) {
		return null;
	}

	if (isLoading) {
		return <Spinner />;
	}

	const getCategory = (categoryId: number) =>
		categories.find((category) => category.id === categoryId);

	const getSubcategory = (subcategoryId: number) =>
		subcategories.find((subcategory) => subcategory.id === subcategoryId);

	const sortedData = data
		.map((d) => ({ ...d, subcategory: getSubcategory(d.subcategoryId) }))
		.sort((a, b) =>
			(a.subcategory?.label ?? "").localeCompare(
				b.subcategory?.label ?? "",
			),
		);

	return (
		<div className="flex flex-col gap-4">
			{sortedData.map((datum) => {
				const key = `${datum.subcategoryId}-${datum.type}`;
				let content: React.ReactNode;

				const subcategory = getSubcategory(datum.subcategoryId);
				const category =
					subcategory && getCategory(subcategory.categoryId);

				if (!category) {
					telemetry.warn("INVALID_CATEGORY", {
						id: datum.subcategoryId,
					});
					return null;
				}

				const additionalProps: BudgetActionItemCommonProps = {
					category,
					periodEnd,
					subcategory,
				};

				switch (datum.type) {
					case "aboveAverage":
						content = (
							<BudgetActionItemAboveAverage
								data={datum}
								key={key}
								{...additionalProps}
							/>
						);
						break;
					case "budgetChange":
						content = (
							<BudgetActionItemBudgetChange
								data={datum}
								key={key}
								{...additionalProps}
							/>
						);
						break;
					case "overBudget":
						content = (
							<BudgetActionItemOverBudget
								data={datum}
								key={key}
								{...additionalProps}
							/>
						);
						break;
					default:
						unreachable(datum);
				}

				return content;
			})}
		</div>
	);
};
