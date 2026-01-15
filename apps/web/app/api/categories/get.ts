import { Ok } from "@ekumlin/typescript-toolkit/http";
import { type GetCategoriesResponse } from "@tally/data-models/contracts/api/getCategories";
import { Lazy } from "@tally/utilities/lazy/lazy";
import z from "zod";
import { CategoriesClient } from "../../storage/categoriesClient";
import { SubcategoriesClient } from "../../storage/subcategoriesClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type NextResponseFn } from "../types";

const categoriesClientLazy = new Lazy(() => new CategoriesClient());
const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());

export const GetCategoriesRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:CATEGORIES",
	handler: async () => {
		const categoriesClient = categoriesClientLazy.get();
		const subcategoriesClient = subcategoriesClientLazy.get();

		const categories = await categoriesClient.getCategoriesAsync();
		const subcategories = await subcategoriesClient.getSubcategoriesAsync();

		const data: GetCategoriesResponse = { categories, subcategories };

		return {
			data,
			ok: true,
			statusCode: Ok,
		};
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: z.unknown(),
	},
});
