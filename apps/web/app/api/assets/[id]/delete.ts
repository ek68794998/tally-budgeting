import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { deleteAssetParamsSchema } from "@tally/data-models/contracts/api/deleteAsset";
import z from "zod";
import { AssetsClient } from "../../../storage/assetsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const assetsClientLazy = new Lazy(() => new AssetsClient());

export const DeleteAssetsIdRouteAsync: NextResponseFn = createApiHandler({
  eventName: "DELETE:ASSETS/[ID]",
  handler: async ({ params }) => {
    const { id } = params;

    const assetsClient = assetsClientLazy.get();
    await assetsClient.deleteAssetAsync(id);

    return { statusCode: NoContent };
  },
  schemata: {
    body: z.unknown(),
    params: deleteAssetParamsSchema,
    query: z.unknown(),
  },
});
