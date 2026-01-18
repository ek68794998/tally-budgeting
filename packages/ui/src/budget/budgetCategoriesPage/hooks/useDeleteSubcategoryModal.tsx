"use client";

import { invariant } from "@ekumlin/typescript-toolkit/values";
import { useDisclosure } from "@heroui/react";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ConfirmationModal } from "../../../common/confirmationModal";
import { useDeleteSubcategory } from "../../../hooks/api/useDeleteSubcategory";
import { useCategories } from "../../../hooks/store/useCategories";

export const useSubcategoryDeleteModal = () => {
	const { refetch } = useCategories();
	const { deleteSubcategoryAsync } = useDeleteSubcategory();
	const subcategoryDeleteModalState = useDisclosure();
	const t = useTranslations("budget.categoriesEdit");

	const [activeSubcategory, setActiveSubcategory] =
		useState<Subcategory | null>(null);

	return useMemo(
		() => ({
			open: (subcategory: Subcategory) => {
				setActiveSubcategory(subcategory);
				subcategoryDeleteModalState.onOpen();
			},
			render: () => (
				<ConfirmationModal
					body={t.rich("deleteSubcategoryDescription", {
						bold: (children: React.ReactNode) => <b>{children}</b>,
						label: activeSubcategory?.label ?? "",
					})}
					confirmText={t("deleteSubcategoryAction")}
					isDestructive={true}
					modalState={subcategoryDeleteModalState}
					onConfirmAsync={async () => {
						invariant(
							activeSubcategory,
							"Active subcategory must be defined",
						);
						await deleteSubcategoryAsync(activeSubcategory.id);
						await refetch();
					}}
					title={t("deleteSubcategoryTitle")}
				/>
			),
		}),
		[
			activeSubcategory,
			deleteSubcategoryAsync,
			refetch,
			subcategoryDeleteModalState,
			t,
		],
	);
};
