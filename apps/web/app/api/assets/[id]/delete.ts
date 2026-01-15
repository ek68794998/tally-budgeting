import { Ok } from "@ekumlin/typescript-toolkit/http";
import { deleteTransactionRuleParamsSchema } from "@tally/data-models/contracts/api/deleteTransactionRule";
import z from "zod";
import { AssetsClient } from "../../../storage/assetsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const assetsClient = new AssetsClient();

export const DeleteAssetsIdRouteAsync: NextResponseFn = createApiHandler({
	eventName: "DELETE:ASSETS/[ID]",
	handler: async ({ params }) => {
		const { id } = params;

		const idNumber = parseInt(id, 10);
		await assetsClient.deleteAssetAsync(idNumber);

		return {
			data: null,
			ok: true,
			statusCode: Ok,
		};
	},
	schemata: {
		body: z.unknown(),
		params: deleteTransactionRuleParamsSchema,
		query: z.unknown(),
	},
});
