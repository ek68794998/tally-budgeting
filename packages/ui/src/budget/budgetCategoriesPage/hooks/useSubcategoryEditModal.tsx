"use client";

import { useDisclosure } from "@heroui/react";
import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { withoutId } from "@tally/utilities/object/withoutId";
import { useMemo, useState } from "react";
import { ModalDefaultSubcategory } from "../../../common/modalDefault";
import { usePostSubcategory } from "../../../hooks/api/usePostSubcategory";
import { usePutSubcategory } from "../../../hooks/api/usePutSubcategory";
import { useCategories } from "../../../hooks/store/useCategories";
import { SubcategoryEditModal } from "../subcategoryEditModal";

export const useSubcategoryEditModal = () => {
  const { refetch } = useCategories();
  const subcategoryEditModalState = useDisclosure();
  const { postSubcategoryAsync } = usePostSubcategory();
  const { putSubcategoryAsync } = usePutSubcategory();

  const [activeSubcategory, setActiveSubcategory] =
    useState<Subcategory | null>(null);
  const [isNewSubcategory, setIsNewSubcategory] = useState(false);

  return useMemo(() => {
    const open = (subcategory: Subcategory, isNew: boolean) => {
      setActiveSubcategory(subcategory);
      setIsNewSubcategory(isNew);
      subcategoryEditModalState.onOpen();
    };

    return {
      openEdit: (subcategory: Subcategory) => open(subcategory, false),
      openNew: (category: Category) =>
        open({ ...ModalDefaultSubcategory, categoryId: category.id }, true),
      render: () => (
        <SubcategoryEditModal
          modalState={subcategoryEditModalState}
          onSaveAsync={async (subcategory) => {
            await (isNewSubcategory
              ? postSubcategoryAsync(withoutId(subcategory))
              : putSubcategoryAsync(subcategory));
            await refetch();
          }}
          subcategory={activeSubcategory}
        />
      ),
    };
  }, [
    activeSubcategory,
    isNewSubcategory,
    postSubcategoryAsync,
    putSubcategoryAsync,
    refetch,
    subcategoryEditModalState,
  ]);
};
