"use client";

import { Button, Spinner } from "@heroui/react";
import { IconPlus } from "@tabler/icons-react";
import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
	ModalDefaultCategory,
	ModalDefaultSubcategory,
} from "../../common/modalDefault";
import { useCategories } from "../../hooks/store/useCategories";
import { MasterDetail } from "../../masterDetail/masterDetail";
import { CategoryDetailContent } from "./categoryDetailContent";
import { CategoryListItem } from "./categoryListItem";
import { useCategoryEditModal } from "./hooks/useCategoryEditModal";
import { useCategoryDeleteModal } from "./hooks/useDeleteCategoryModal";
import { useSubcategoryDeleteModal } from "./hooks/useDeleteSubcategoryModal";
import { useSubcategoryEditModal } from "./hooks/useSubcategoryEditModal";
import { SubcategoryActions } from "./subcategoryActions";

export const CategoriesMasterDetail: React.FC = () => {
	const { categories, isLoading, subcategories } = useCategories();
	const { open: openCategoryDeleteModal, render: renderCategoryDeleteModal } =
		useCategoryDeleteModal();
	const { open: openCategoryEditModal, render: renderCategoryEditModal } =
		useCategoryEditModal();
	const {
		open: openSubcategoryDeleteModal,
		render: renderSubcategoryDeleteModal,
	} = useSubcategoryDeleteModal();
	const {
		open: openSubcategoryEditModal,
		render: renderSubcategoryEditModal,
	} = useSubcategoryEditModal();
	const t = useTranslations("budget.categoriesEdit");

	const sortedCategories = useMemo(
		() => categories.sort((a, b) => a.label.localeCompare(b.label)),
		[categories],
	);

	const sortedSubcategories = useMemo(
		() => subcategories.sort((a, b) => a.label.localeCompare(b.label)),
		[subcategories],
	);

	const handleAddCategory = () => {
		openCategoryEditModal(ModalDefaultCategory);
	};

	const handleAddSubcategory = () => {
		openSubcategoryEditModal(ModalDefaultSubcategory);
	};

	const handleDeleteCategory = (category: Category) => {
		openCategoryDeleteModal(category);
	};

	const handleDeleteSubcategory = (subcategory: Subcategory) => {
		openSubcategoryDeleteModal(subcategory);
	};

	const handleEditCategory = (category: Category) => {
		openCategoryEditModal(category);
	};

	const handleEditSubcategory = (subcategory: Subcategory) => {
		openSubcategoryEditModal(subcategory);
	};

	return (
		<>
			<MasterDetail
				detail={{
					actions: (category) => (
						<SubcategoryActions
							category={category}
							onAddSubcategory={handleAddSubcategory}
							onDeleteCategory={handleDeleteCategory}
							onEditCategory={handleEditCategory}
						/>
					),
					content: (category) => {
						if (!category) {
							return null;
						}

						return (
							<CategoryDetailContent
								category={category}
								onDeleteSubcategory={handleDeleteSubcategory}
								onEditSubcategory={handleEditSubcategory}
								subcategories={sortedSubcategories}
							/>
						);
					},
					title: (category) => category?.label ?? "",
				}}
				getItemKey={(category) => category.id}
				master={{
					actions: (
						<Button color="primary" onPress={handleAddCategory}>
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
						<CategoryListItem
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
			{renderCategoryDeleteModal()}
			{renderCategoryEditModal()}
			{renderSubcategoryDeleteModal()}
			{renderSubcategoryEditModal()}
		</>
	);
};
