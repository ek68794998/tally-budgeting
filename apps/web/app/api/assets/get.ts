import { Ok } from "@ekumlin/typescript-toolkit/http";
import { type GetAssetsResponse } from "@tally/data-models/contracts/api/getAssets";
import { Lazy } from "@tally/utilities/lazy/lazy";
import z from "zod";
import { AssetsClient } from "../../storage/assetsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type NextResponseFn } from "../types";

const assetsClientLazy = new Lazy(() => new AssetsClient());

export const GetAssetsRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:ASSETS",
	handler: async () => {
		const assetsClient = assetsClientLazy.get();
		const assets = await assetsClient.getAssetsAsync();

		const data: GetAssetsResponse = { assets };

		return { data, ok: true, statusCode: Ok };
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: z.unknown(),
	},
});
