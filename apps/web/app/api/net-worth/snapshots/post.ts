import { Ok } from "@ekumlin/typescript-toolkit/http";
import { postNetWorthSnapshotRequestSchema } from "@tally/data-models/contracts/api/postNetWorthSnapshot";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import z from "zod";
import { NetWorthSnapshotsClient } from "../../../storage/netWorthSnapshotsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const netWorthSnapshotsClientLazy = new Lazy(
	() => new NetWorthSnapshotsClient(),
);

const dateMatcher = /^(\d{4}-\d{2}-\d{2})/;

export const PostNetWorthSnapshotsRouteAsync: NextResponseFn = createApiHandler(
	{
		eventName: "POST:NETWORTH/SNAPSHOTS",
		handler: async ({ body }) => {
			const [date] = body.snapshot.date.match(dateMatcher) || [];
			const completeDate = `${date}T12:00:00Z`;

			const netWorthSnapshotsClient = netWorthSnapshotsClientLazy.get();
			await netWorthSnapshotsClient.upsertNetWorthSnapshotsAsync({
				...body.snapshot,
				date: completeDate,
			});

			return { statusCode: Ok };
		},
		schemata: {
			body: postNetWorthSnapshotRequestSchema,
			params: z.unknown(),
			query: z.unknown(),
		},
	},
);
