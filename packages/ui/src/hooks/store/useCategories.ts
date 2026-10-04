"use client";

import { useCategoryStore } from "@tally/utilities/state/category";
import { useStoreState } from "./useStoreState";

export const useCategories = () => {
  const store = useCategoryStore();
  const storeState = useStoreState(store);

  return {
    ...storeState,
    categories: store.categories,
    subcategories: store.subcategories,
  };
};
