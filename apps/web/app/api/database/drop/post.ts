import { Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { postDatabaseDropRequestSchema } from "@tally/data-models/contracts/api/postDatabaseDrop";
import z from "zod";
import { DatabaseAdminClient } from "../../../storage/databaseAdminClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const databaseAdminClientLazy = new Lazy(() => new DatabaseAdminClient());

export const PostDatabaseDropRouteAsync: NextResponseFn = createApiHandler({
	eventName: "POST:DATABASE/DROP",
	handler: async () => {
		await databaseAdminClientLazy.get().dropAllDataAsync();

		return { statusCode: Ok };
	},
	schemata: {
		body: postDatabaseDropRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
