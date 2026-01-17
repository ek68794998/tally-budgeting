import { Ok } from "@ekumlin/typescript-toolkit/http";
import { type GetCategoriesResponse } from "@tally/data-models/contracts/api/getCategories";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import z from "zod";
import { CategoriesClient } from "../../storage/categoriesClient";
import { SubcategoriesClient } from "../../storage/subcategoriesClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type ApiResult } from "../handlers/types";
import { type NextResponseFn } from "../types";

const categoriesClientLazy = new Lazy(() => new CategoriesClient());
const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());

export const GetCategoriesRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:CATEGORIES",
	handler: async (): Promise<ApiResult<GetCategoriesResponse>> => {
		const categoriesClient = categoriesClientLazy.get();
		const subcategoriesClient = subcategoriesClientLazy.get();

		const categories = await categoriesClient.getCategoriesAsync();
		const subcategories = await subcategoriesClient.getSubcategoriesAsync();

		return {
			data: { categories, subcategories },
			statusCode: Ok,
		};
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: z.unknown(),
	},
});
