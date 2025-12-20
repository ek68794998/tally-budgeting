import { getCategoriesResponseSchema } from "@tally/data-models/contracts/api/getCategories";
import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CategoryStore {
	categories: Category[];
	error: string | null;
	fetchCategories: () => Promise<void>;
	isFetching: boolean;
	isHydrated: boolean;
	setCategories: (categories: Category[]) => void;
	subcategories: Subcategory[];
}

export const useCategoryStore = create<CategoryStore>()(
	subscribeWithSelector((set, _get) => ({
		categories: [],
		error: null,
		fetchCategories: async () => {
			set({
				isFetching: true,
			});

			try {
				const response = await fetch("/api/categories");
				const responseJson: unknown = await response.json();
				const { categories, subcategories } =
					getCategoriesResponseSchema.parse(responseJson);

				set({
					categories,
					error: null,
					isFetching: false,
					isHydrated: true,
					subcategories,
				});
			} catch (_error) {
				// TODO
				set({
					error: "Failed to fetch categories",
					isFetching: false,
					isHydrated: true,
				});
			}
		},
		isFetching: false,
		isHydrated: false,
		setCategories: (categories) => set({ categories }),
		subcategories: [],
	})),
);
