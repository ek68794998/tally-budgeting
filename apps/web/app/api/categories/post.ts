import { Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { postCategoryRequestSchema } from "@tally/data-models/contracts/api/postCategory";
import z from "zod";
import { CategoriesClient } from "../../storage/categoriesClient";
import { hasId } from "../../storage/helpers";
import { createApiHandler } from "../handlers/createApiHandler";
import { type NextResponseFn } from "../types";

const categoriesClientLazy = new Lazy(() => new CategoriesClient());

export const PostCategoriesRouteAsync: NextResponseFn = createApiHandler({
	eventName: "POST:CATEGORIES",
	handler: async ({ body }) => {
		const categoriesClient = categoriesClientLazy.get();

		await (hasId(body.category)
			? categoriesClient.updateCategoryAsync(body.category)
			: categoriesClient.insertCategoriesAsync([body.category]));

		return { statusCode: Ok };
	},
	schemata: {
		body: postCategoryRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
