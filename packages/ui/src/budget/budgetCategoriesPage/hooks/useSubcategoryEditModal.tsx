"use client";

import { useDisclosure } from "@heroui/react";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { useMemo, useState } from "react";
import { usePostSubcategory } from "../../../hooks/api/usePostSubcategory";
import { useCategories } from "../../../hooks/store/useCategories";
import { SubcategoryEditModal } from "../subcategoryEditModal";

export const useSubcategoryEditModal = () => {
	const { refetch } = useCategories();
	const subcategoryEditModalState = useDisclosure();
	const { postSubcategoryAsync } = usePostSubcategory();

	const [activeSubcategory, setActiveSubcategory] =
		useState<Subcategory | null>(null);

	return useMemo(
		() => ({
			open: (subcategory: Subcategory) => {
				setActiveSubcategory(subcategory);
				subcategoryEditModalState.onOpen();
			},
			render: () => (
				<SubcategoryEditModal
					modalState={subcategoryEditModalState}
					onSaveAsync={async (subcategory) => {
						await postSubcategoryAsync(subcategory);
						await refetch();
					}}
					subcategory={activeSubcategory}
				/>
			),
		}),
		[
			activeSubcategory,
			postSubcategoryAsync,
			refetch,
			subcategoryEditModalState,
		],
	);
};
