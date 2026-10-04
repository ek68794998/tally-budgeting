import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { deleteCategoryParamsSchema } from "@tally/data-models/contracts/api/deleteCategory";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import z from "zod";
import { CategoriesClient } from "../../../storage/categoriesClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";
import { assertNotDefaultRecord } from "../assertNotDefaultRecord";

const categoriesClientLazy = new Lazy(() => new CategoriesClient());

export const DeleteCategoriesIdRouteAsync: NextResponseFn = createApiHandler({
  eventName: "DELETE:CATEGORIES/[ID]",
  handler: async ({ params }) => {
    assertNotDefaultRecord(params.id, DefaultCategoryId);

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
