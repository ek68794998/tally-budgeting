"use client";

import { invariant } from "@ekumlin/typescript-toolkit/values";
import { useDisclosure } from "@heroui/react";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ConfirmationModal } from "../../../common/confirmationModal";

export const useSubcategoryDeleteModal = () => {
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
						// TODO delete activeSubcategory
					}}
					title={t("deleteSubcategoryTitle")}
				/>
			),
		}),
		[activeSubcategory, subcategoryDeleteModalState, t],
	);
};
