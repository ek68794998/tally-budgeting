import { Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { type GetAssetsResponse } from "@tally/data-models/contracts/api/getAssets";
import z from "zod";
import { AssetsClient } from "../../storage/assetsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type ApiResult } from "../handlers/types";
import { type NextResponseFn } from "../types";

const assetsClientLazy = new Lazy(() => new AssetsClient());

export const GetAssetsRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:ASSETS",
	handler: async (): Promise<ApiResult<GetAssetsResponse>> => {
		const assetsClient = assetsClientLazy.get();
		const assets = await assetsClient.getAssetsAsync();

		return { data: { assets }, statusCode: Ok };
	},
	schemata: {
		body: z.unknown(),
		params: z.unknown(),
		query: z.unknown(),
	},
});
