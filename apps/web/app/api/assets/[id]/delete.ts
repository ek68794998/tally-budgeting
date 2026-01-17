import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { deleteTransactionRuleParamsSchema } from "@tally/data-models/contracts/api/deleteTransactionRule";
import { Lazy } from "@tally/utilities/lazy/lazy";
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

		const idNumber = parseInt(id, 10);
		await assetsClient.deleteAssetAsync(idNumber);

		return { statusCode: NoContent };
	},
	schemata: {
		body: z.unknown(),
		params: deleteTransactionRuleParamsSchema,
		query: z.unknown(),
	},
});
