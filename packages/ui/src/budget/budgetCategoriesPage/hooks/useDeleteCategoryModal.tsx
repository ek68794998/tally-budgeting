"use client";

import { invariant } from "@ekumlin/typescript-toolkit/values";
import { useDisclosure } from "@heroui/react";
import { type Category } from "@tally/data-models/contracts/category";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ConfirmationModal } from "../../../common/confirmationModal";
import { useDeleteCategory } from "../../../hooks/api/useDeleteCategory";
import { useCategories } from "../../../hooks/store/useCategories";

export const useCategoryDeleteModal = () => {
	const { refetch } = useCategories();
	const { deleteCategoryAsync } = useDeleteCategory();
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
						await deleteCategoryAsync(activeCategory.id);
						await refetch();
					}}
					title={t("deleteCategoryTitle")}
				/>
			),
		}),
		[
			activeCategory,
			categoryDeleteModalState,
			refetch,
			deleteCategoryAsync,
			t,
		],
	);
};
