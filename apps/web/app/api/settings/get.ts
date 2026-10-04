import { Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { type GetSettingsResponse } from "@tally/data-models/contracts/api/getSettings";
import z from "zod";
import { SettingsClient } from "../../storage/settingsClient";
import { createApiHandler } from "../handlers/createApiHandler";
import { type ApiResult } from "../handlers/types";
import { type NextResponseFn } from "../types";

const settingsClientLazy = new Lazy(() => new SettingsClient());

export const GetSettingsRouteAsync: NextResponseFn = createApiHandler({
  eventName: "GET:SETTINGS",
  handler: async (): Promise<ApiResult<GetSettingsResponse>> => {
    const settings = await settingsClientLazy.get().getSettingsAsync();

    return { data: { settings }, statusCode: Ok };
  },
  schemata: {
    body: z.unknown(),
    params: z.unknown(),
    query: z.unknown(),
  },
});
