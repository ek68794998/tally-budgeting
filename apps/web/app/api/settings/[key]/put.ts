import { BadRequest, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import {
  putSettingParamsSchema,
  putSettingRequestSchema,
} from "@tally/data-models/contracts/api/putSetting";
import { getSettingDefinition } from "@tally/data-models/settings/settingDefinitions";
import z from "zod";
import { SettingsClient } from "../../../storage/settingsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
import { type NextResponseFn } from "../../types";

const settingsClientLazy = new Lazy(() => new SettingsClient());

export const PutSettingsKeyRouteAsync: NextResponseFn = createApiHandler({
  eventName: "PUT:SETTINGS/[KEY]",
  handler: async ({ body, params }) => {
    const { key } = params;
    const parsed = getSettingDefinition(key).schema.safeParse(body.value);

    if (!parsed.success) {
      throw new HttpError(
        "Invalid setting value",
        BadRequest,
        "invalidRequestBody",
      );
    }

    await settingsClientLazy.get().putSettingAsync(key, parsed.data);

    return { statusCode: Ok };
  },
  schemata: {
    body: putSettingRequestSchema,
    params: putSettingParamsSchema,
    query: z.unknown(),
  },
});
