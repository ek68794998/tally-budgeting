import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { deleteSubcategoryParamsSchema } from "@tally/data-models/contracts/api/deleteSubcategory";
import z from "zod";
import { SubcategoriesClient } from "../../../../storage/subcategoriesClient";
import { createApiHandler } from "../../../handlers/createApiHandler";
import { type NextResponseFn } from "../../../types";

const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());

export const DeleteCategoriesSubIdRouteAsync: NextResponseFn = createApiHandler(
	{
		eventName: "DELETE:CATEGORIES/SUB/[ID]",
		handler: async ({ params }) => {
			const { id } = params;

			const subcategoriesClient = subcategoriesClientLazy.get();

			const idNumber = parseInt(id, 10);
			await subcategoriesClient.deleteSubcategoryAsync(idNumber);

			return { statusCode: NoContent };
		},
		schemata: {
			body: z.unknown(),
			params: deleteSubcategoryParamsSchema,
			query: z.unknown(),
		},
	},
);
