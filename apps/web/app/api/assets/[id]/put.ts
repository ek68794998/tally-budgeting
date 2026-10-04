import { NotFound, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import {
  putAssetParamsSchema,
  putAssetRequestSchema,
} from "@tally/data-models/contracts/api/putAsset";
import z from "zod";
import { AssetsClient } from "../../../storage/assetsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
import { type NextResponseFn } from "../../types";

const assetsClientLazy = new Lazy(() => new AssetsClient());

export const PutAssetsIdRouteAsync: NextResponseFn = createApiHandler({
  eventName: "PUT:ASSETS/[ID]",
  handler: async ({ body, params }) => {
    const wasUpdated = await assetsClientLazy
      .get()
      .updateAssetAsync({ ...body.asset, id: params.id });

    if (!wasUpdated) {
      throw new HttpError("Asset not found", NotFound);
    }

    return { statusCode: Ok };
  },
  schemata: {
    body: putAssetRequestSchema,
    params: putAssetParamsSchema,
    query: z.unknown(),
  },
});
