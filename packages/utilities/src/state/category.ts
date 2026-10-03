import { toError } from "@ekumlin/typescript-toolkit/error";
import { getCategoriesResponseSchema } from "@tally/data-models/contracts/api/getCategories";
import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { apiFetch } from "../routing/apiFetch";
import { api, buildApiRoute } from "../routing/routeBuilder";
import { telemetry } from "../telemetry/telemetry";
import { type StoreState } from "./storeState";

export type CategoryStore = StoreState<{
	categories: Category[];
	setCategories: (categories: Category[]) => void;
	subcategories: Subcategory[];
}>;

export const useCategoryStore = create<CategoryStore>()(
	subscribeWithSelector((set, _get) => ({
		categories: [],
		error: null,
		fetch: async () => {
			set({
				isFetching: true,
			});

			try {
				const response = await apiFetch(
					buildApiRoute(api.categories.base),
				);
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
			} catch (error) {
				telemetry().error("STORE_FETCH_FAILED", {
					errorMessage: toError(error).message,
					store: "category",
				});
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
