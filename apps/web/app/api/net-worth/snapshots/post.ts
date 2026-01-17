import { Ok } from "@ekumlin/typescript-toolkit/http";
import {
	type PostNetWorthSnapshotResponse,
	postNetWorthSnapshotRequestSchema,
} from "@tally/data-models/contracts/api/postNetWorthSnapshot";
import { Lazy } from "@tally/utilities/lazy/lazy";
import z from "zod";
import { NetWorthSnapshotsClient } from "../../../storage/netWorthSnapshotsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type NextResponseFn } from "../../types";

const netWorthSnapshotsClientLazy = new Lazy(
	() => new NetWorthSnapshotsClient(),
);

export const PostNetWorthSnapshotsRouteAsync: NextResponseFn = createApiHandler(
	{
		eventName: "POST:NETWORTH/SNAPSHOTS",
		handler: async ({ body }) => {
			const netWorthSnapshotsClient = netWorthSnapshotsClientLazy.get();
			await netWorthSnapshotsClient.upsertNetWorthSnapshotsAsync(
				body.snapshot,
			);

			const data: PostNetWorthSnapshotResponse = {
				success: true,
			};

			return { data, ok: true, statusCode: Ok };
		},
		schemata: {
			body: postNetWorthSnapshotRequestSchema,
			params: z.unknown(),
			query: z.unknown(),
		},
	},
);
