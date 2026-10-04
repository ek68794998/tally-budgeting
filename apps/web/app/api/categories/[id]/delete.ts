import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { deleteCategoryParamsSchema } from "@tally/data-models/contracts/api/deleteCategory";
import z from "zod";
import { CategoriesClient } from "../../../storage/categoriesClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const categoriesClientLazy = new Lazy(() => new CategoriesClient());

export const DeleteCategoriesIdRouteAsync: NextResponseFn = createApiHandler({
  eventName: "DELETE:CATEGORIES/[ID]",
  handler: async ({ params }) => {
    const { id } = params;

    const categoriesClient = categoriesClientLazy.get();
    await categoriesClient.deleteCategoryAsync(id);

    return { statusCode: NoContent };
  },
  schemata: {
    body: z.unknown(),
    params: deleteCategoryParamsSchema,
    query: z.unknown(),
  },
});
