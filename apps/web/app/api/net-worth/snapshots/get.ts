import { Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { type GetNetWorthSnapshotsResponse } from "@tally/data-models/contracts/api/getNetWorthSnapshots";
import z from "zod";
import { NetWorthSnapshotsClient } from "../../../storage/netWorthSnapshotsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type ApiResult } from "../../handlers/types";
import { type NextResponseFn } from "../../types";

const netWorthSnapshotsClientLazy = new Lazy(
  () => new NetWorthSnapshotsClient(),
);

export const GetNetWorthSnapshotsRouteAsync: NextResponseFn = createApiHandler({
  eventName: "GET:NETWORTH/SNAPSHOTS",
  handler: async (): Promise<ApiResult<GetNetWorthSnapshotsResponse>> => {
    const netWorthSnapshotsClient = netWorthSnapshotsClientLazy.get();
    const snapshots = await netWorthSnapshotsClient.getNetWorthSnapshotsAsync();

    return {
      data: { snapshots },
      statusCode: Ok,
    };
  },
  schemata: {
    body: z.unknown(),
    params: z.unknown(),
    query: z.unknown(),
  },
});
