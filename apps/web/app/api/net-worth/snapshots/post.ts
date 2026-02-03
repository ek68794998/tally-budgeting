import { BadRequest, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { postNetWorthSnapshotRequestSchema } from "@tally/data-models/contracts/api/postNetWorthSnapshot";
import { isValidDate } from "@tally/utilities/date/isValidDate";
import z from "zod";
import { NetWorthSnapshotsClient } from "../../../storage/netWorthSnapshotsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
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

			if (!isValidDate(completeDate)) {
				throw new HttpError(
					"Invalid date format",
					BadRequest,
					"invalidRequestBody",
				);
			}

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
