import { NotFound, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import {
  putCategoryParamsSchema,
  putCategoryRequestSchema,
} from "@tally/data-models/contracts/api/putCategory";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import z from "zod";
import { CategoriesClient } from "../../../storage/categoriesClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
import { type NextResponseFn } from "../../types";
import { assertNotDefaultRecord } from "../assertNotDefaultRecord";

const categoriesClientLazy = new Lazy(() => new CategoriesClient());

export const PutCategoriesIdRouteAsync: NextResponseFn = createApiHandler({
  eventName: "PUT:CATEGORIES/[ID]",
  handler: async ({ body, params }) => {
    assertNotDefaultRecord(params.id, DefaultCategoryId);

    const wasUpdated = await categoriesClientLazy
      .get()
      .updateCategoryAsync({ ...body.category, id: params.id });

    if (!wasUpdated) {
      throw new HttpError("Category not found", NotFound);
    }

    return { statusCode: Ok };
  },
  schemata: {
    body: putCategoryRequestSchema,
    params: putCategoryParamsSchema,
    query: z.unknown(),
  },
});
