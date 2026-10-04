import { NotFound, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import {
	putSubcategoryParamsSchema,
	putSubcategoryRequestSchema,
} from "@tally/data-models/contracts/api/putSubcategory";
import z from "zod";
import { SubcategoriesClient } from "../../../../storage/subcategoriesClient";
import { createApiHandler } from "../../../handlers/createApiHandler";
import { HttpError } from "../../../handlers/httpError";
import { type NextResponseFn } from "../../../types";

const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());

export const PutCategoriesSubIdRouteAsync: NextResponseFn = createApiHandler({
	eventName: "PUT:CATEGORIES/SUB/[ID]",
	handler: async ({ body, params }) => {
		const wasUpdated = await subcategoriesClientLazy
			.get()
			.updateSubcategoryAsync({ ...body.subcategory, id: params.id });

		if (!wasUpdated) {
			throw new HttpError("Subcategory not found", NotFound);
		}

		return { statusCode: Ok };
	},
	schemata: {
		body: putSubcategoryRequestSchema,
		params: putSubcategoryParamsSchema,
		query: z.unknown(),
	},
});
