import { Created } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { postAssetRequestSchema } from "@tally/data-models/contracts/api/postAsset";
import z from "zod";
import { AssetsClient } from "../../storage/assetsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type NextResponseFn } from "../types";

const assetsClientLazy = new Lazy(() => new AssetsClient());

export const PostAssetsRouteAsync: NextResponseFn = createApiHandler({
  eventName: "POST:ASSETS",
  handler: async ({ body }) => {
    await assetsClientLazy.get().insertAssetsAsync([body.asset]);

    return { statusCode: Created };
  },
  schemata: {
    body: postAssetRequestSchema,
    params: z.unknown(),
    query: z.unknown(),
  },
});
