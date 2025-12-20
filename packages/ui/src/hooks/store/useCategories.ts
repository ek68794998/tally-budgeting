"use client";

import { useCategoryStore } from "@tally/utilities/state/category";
import { useEffect } from "react";

export const useCategories = () => {
	const store = useCategoryStore();

	useEffect(() => {
		if (!store.isHydrated && !store.isFetching) {
			void store.fetchCategories();
		}
	}, [store]);

	return {
		categories: store.categories,
		error: store.error,
		isLoading: !store.isHydrated || store.isFetching,
		refetch: store.fetchCategories,
		subcategories: store.subcategories,
	};
};
