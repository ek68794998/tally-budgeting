"use client";

import { Button, Spinner } from "@heroui/react";
import { IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useCategories } from "../../hooks/store/useCategories";
import { MasterDetail } from "../../masterDetail/masterDetail";
import { BudgetCategoryDetailContent } from "./budgetCategoryDetailContent";
import { BudgetCategoryListItem } from "./budgetCategoryListItem";

export const BudgetCategoriesMasterDetail: React.FC = () => {
	const { categories, isLoading, subcategories } = useCategories();
	const t = useTranslations("budget.categoriesEdit");

	const sortedCategories = useMemo(
		() => categories.sort((a, b) => a.label.localeCompare(b.label)),
		[categories],
	);

	const sortedSubcategories = useMemo(
		() => subcategories.sort((a, b) => a.label.localeCompare(b.label)),
		[subcategories],
	);

	return (
		<MasterDetail
			detail={{
				actions: (category) => (
					<Button
						onPress={() => {
							// TODO: Implement add subcategory
							console.log("Add subcategory for", category.id);
						}}
					>
						<IconPlus />
						{t("newSubcategory")}
					</Button>
				),
				content: (category) => {
					if (!category) {
						return null;
					}

					return (
						<BudgetCategoryDetailContent
							category={category}
							onDeleteSubcategory={(subcategoryId) => {
								// TODO: Implement delete subcategory
								console.log(
									"Delete subcategory",
									subcategoryId,
								);
							}}
							onEditSubcategory={(subcategoryId) => {
								// TODO: Implement edit subcategory
								console.log("Edit subcategory", subcategoryId);
							}}
							subcategories={sortedSubcategories}
						/>
					);
				},
				title: (category) => category?.label ?? "",
			}}
			getItemKey={(category) => category.id}
			master={{
				actions: (
					<Button color="primary">
						<IconPlus />
						{t("newCategory")}
					</Button>
				),
				emptyState: isLoading ? (
					<Spinner />
				) : (
					<p>
						{t("noCategories", {
							newCategory: t("newCategory"),
						})}
					</p>
				),
				items: sortedCategories,
				renderItem: (category, isSelected, onClick) => (
					<BudgetCategoryListItem
						category={category}
						isSelected={isSelected}
						onClick={onClick}
						subcategoryCount={
							sortedSubcategories.filter(
								(s) => s.categoryId === category.id,
							).length
						}
					/>
				),
				title: "Categories",
			}}
		/>
	);
};
