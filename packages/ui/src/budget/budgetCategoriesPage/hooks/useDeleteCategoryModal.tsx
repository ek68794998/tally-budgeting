"use client";

import { invariant } from "@ekumlin/typescript-toolkit/values";
import { useDisclosure } from "@heroui/react";
import { type Category } from "@tally/data-models/contracts/category";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ConfirmationModal } from "../../../common/confirmationModal";

export const useCategoryDeleteModal = () => {
	const categoryDeleteModalState = useDisclosure();
	const t = useTranslations("budget.categoriesEdit");

	const [activeCategory, setActiveCategory] = useState<Category | null>(null);

	return useMemo(
		() => ({
			open: (category: Category) => {
				setActiveCategory(category);
				categoryDeleteModalState.onOpen();
			},
			render: () => (
				<ConfirmationModal
					body={t.rich("deleteCategoryDescription", {
						bold: (children: React.ReactNode) => <b>{children}</b>,
						label: activeCategory?.label ?? "",
					})}
					confirmText={t("deleteCategoryAction")}
					isDestructive={true}
					modalState={categoryDeleteModalState}
					onConfirmAsync={async () => {
						invariant(
							activeCategory,
							"Active category must be defined",
						);
						// TODO delete activeCategory
					}}
					title={t("deleteCategoryTitle")}
				/>
			),
		}),
		[activeCategory, categoryDeleteModalState, t],
	);
};
