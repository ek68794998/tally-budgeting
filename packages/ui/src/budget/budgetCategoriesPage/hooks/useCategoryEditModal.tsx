"use client";

import { useDisclosure } from "@heroui/react";
import { type Category } from "@tally/data-models/contracts/category";
import { useMemo, useState } from "react";
import { CategoryEditModal } from "../categoryEditModal";

export const useCategoryEditModal = () => {
	const categoryEditModalState = useDisclosure();

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
					onSaveAsync={async () => {
						/* TODO */
					}}
				/>
			),
		}),
		[activeCategory, categoryEditModalState],
	);
};
