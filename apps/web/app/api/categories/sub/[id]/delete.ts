import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { deleteSubcategoryParamsSchema } from "@tally/data-models/contracts/api/deleteSubcategory";
import { DefaultSubcategoryId } from "@tally/data-models/contracts/subcategory";
import z from "zod";
import { SubcategoriesClient } from "../../../../storage/subcategoriesClient";
import { createApiHandler } from "../../../handlers/createApiHandler";
import { type NextResponseFn } from "../../../types";
import { assertNotDefaultRecord } from "../../assertNotDefaultRecord";

const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());

export const DeleteCategoriesSubIdRouteAsync: NextResponseFn = createApiHandler(
  {
    eventName: "DELETE:CATEGORIES/SUB/[ID]",
    handler: async ({ params }) => {
      assertNotDefaultRecord(params.id, DefaultSubcategoryId);

      const { id } = params;

      const subcategoriesClient = subcategoriesClientLazy.get();
      await subcategoriesClient.deleteSubcategoryAsync(id);

      return { statusCode: NoContent };
    },
    schemata: {
      body: z.unknown(),
      params: deleteSubcategoryParamsSchema,
      query: z.unknown(),
    },
  },
);
