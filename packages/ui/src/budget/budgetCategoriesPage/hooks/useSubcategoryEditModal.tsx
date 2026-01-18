"use client";

import { useDisclosure } from "@heroui/react";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { useMemo, useState } from "react";
import { SubcategoryEditModal } from "../subcategoryEditModal";

export const useSubcategoryEditModal = () => {
	const subcategoryEditModalState = useDisclosure();

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
					onSaveAsync={async () => {
						/* TODO */
					}}
					subcategory={activeSubcategory}
				/>
			),
		}),
		[activeSubcategory, subcategoryEditModalState],
	);
};
