"use client";

import { useDisclosure } from "@heroui/react";
import { type Category } from "@tally/data-models/contracts/category";
import { useMemo, useState } from "react";
import { usePostCategory } from "../../../hooks/api/usePostCategory";
import { useCategories } from "../../../hooks/store/useCategories";
import { CategoryEditModal } from "../categoryEditModal";

export const useCategoryEditModal = () => {
	const { refetch } = useCategories();
	const categoryEditModalState = useDisclosure();
	const { postCategoryAsync } = usePostCategory();

	const [activeCategory, setActiveCategory] = useState<Category | null>(null);

	return useMemo(
		() => ({
			open: (category: Category) => {
				setActiveCategory(category);
				categoryEditModalState.onOpen();
			},
			render: () => (
				<CategoryEditModal
					category={activeCategory}
					modalState={categoryEditModalState}
					onSaveAsync={async (category) => {
						await postCategoryAsync(category);
						await refetch();
					}}
				/>
			),
		}),
		[activeCategory, categoryEditModalState, postCategoryAsync, refetch],
	);
};
