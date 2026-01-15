import { Ok } from "@ekumlin/typescript-toolkit/http";
import {
	type PostAssetResponse,
	postAssetRequestSchema,
} from "@tally/data-models/contracts/api/postAsset";
import { Lazy } from "@tally/utilities/lazy/lazy";
import z from "zod";
import { AssetsClient } from "../../storage/assetsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type NextResponseFn } from "../types";

const assetsClientLazy = new Lazy(() => new AssetsClient());

export const PostAssetsRouteAsync: NextResponseFn = createApiHandler({
	eventName: "POST:ASSETS",
	handler: async ({ body }) => {
		const assetsClient = assetsClientLazy.get();
		await (body.asset.id >= 0
			? assetsClient.updateAssetAsync(body.asset)
			: assetsClient.insertAssetsAsync([body.asset]));

		const data: PostAssetResponse = { success: true };

		return {
			data,
			ok: true,
			statusCode: Ok,
		};
	},
	schemata: {
		body: postAssetRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
