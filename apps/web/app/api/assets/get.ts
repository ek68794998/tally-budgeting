import { Ok } from "@ekumlin/typescript-toolkit/http";
import { type GetAssetsResponse } from "@tally/data-models/contracts/api/getAssets";
import z from "zod";
import { AssetsClient } from "../../storage/assetsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type NextResponseFn } from "../types";

const assetsClient = new AssetsClient();

export const GetAssetsRouteAsync: NextResponseFn = createApiHandler({
	eventName: "GET:ASSETS",
	handler: async () => {
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
