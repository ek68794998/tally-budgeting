import { Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { postSubcategoryRequestSchema } from "@tally/data-models/contracts/api/postSubcategory";
import z from "zod";
import { hasId } from "../../../storage/helpers";
import { SubcategoriesClient } from "../../../storage/subcategoriesClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());

export const PostCategoriesSubRouteAsync: NextResponseFn = createApiHandler({
	eventName: "POST:CATEGORIES/SUB",
	handler: async ({ body }) => {
		const subcategoriesClient = subcategoriesClientLazy.get();

		await (hasId(body.subcategory)
			? subcategoriesClient.updateSubcategoryAsync(body.subcategory)
			: subcategoriesClient.insertSubcategoriesAsync([body.subcategory]));

		return { statusCode: Ok };
	},
	schemata: {
		body: postSubcategoryRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
