"use client";

import { omitKeys } from "@ekumlin/typescript-toolkit/collections";
import { useDisclosure } from "@heroui/react";
import { type Category } from "@tally/data-models/contracts/category";
import { useMemo, useState } from "react";
import { ModalDefaultCategory } from "../../../common/modalDefault";
import { usePostCategory } from "../../../hooks/api/usePostCategory";
import { usePutCategory } from "../../../hooks/api/usePutCategory";
import { useCategories } from "../../../hooks/store/useCategories";
import { CategoryEditModal } from "../categoryEditModal";

export const useCategoryEditModal = () => {
  const { refetch } = useCategories();
  const categoryEditModalState = useDisclosure();
  const { postCategoryAsync } = usePostCategory();
  const { putCategoryAsync } = usePutCategory();

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  return useMemo(() => {
    const open = (category: Category, isNew: boolean) => {
      setActiveCategory(category);
      setIsNewCategory(isNew);
      categoryEditModalState.onOpen();
    };

    return {
      openEdit: (category: Category) => open(category, false),
      openNew: () => open(ModalDefaultCategory, true),
      render: () => (
        <CategoryEditModal
          category={activeCategory}
          modalState={categoryEditModalState}
          onSaveAsync={async (category) => {
            await (isNewCategory
              ? postCategoryAsync(omitKeys(category, "id"))
              : putCategoryAsync(category));
            await refetch();
          }}
        />
      ),
    };
  }, [
    activeCategory,
    categoryEditModalState,
    isNewCategory,
    postCategoryAsync,
    putCategoryAsync,
    refetch,
  ]);
};
