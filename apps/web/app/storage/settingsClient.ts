import { type GetSettingsResponse } from "@tally/data-models/contracts/api/getSettings";
import { parseSettingValue } from "@tally/data-models/settings/parseSettingValue";
import {
  type DatabaseSettingKey,
  databaseSettingKeySchema,
  getSettingDefinition,
  type SettingValue,
} from "@tally/data-models/settings/settingDefinitions";
import { telemetry } from "../telemetry/telemetry";
import { TableName } from "./appSettingsClient";
import { DatabaseClient } from "./databaseClient";
import { toJsonb } from "./helpers";

export type DatabaseSettings = GetSettingsResponse["settings"];

const reportParseFailure = (key: DatabaseSettingKey) => {
  telemetry().error("SETTING_PARSE_FAILED", { key });
};

export class SettingsClient extends DatabaseClient {
  public async getSettingsAsync(): Promise<DatabaseSettings> {
    const database = await this.getAuthorizedDatabaseAsync();

    const rows = await database
      .selectFrom(TableName)
      .select(["key", "value"])
      .where("key", "in", databaseSettingKeySchema.options)
      .execute();

    const rawByKey = new Map(rows.map(({ key, value }) => [key, value]));

    return {
      providersHidden: parseSettingValue(
        "providersHidden",
        rawByKey.get("providersHidden"),
        reportParseFailure,
      ),
    };
  }

  public async putSettingAsync<K extends DatabaseSettingKey>(
    key: K,
    value: SettingValue<K>,
  ): Promise<void> {
    const database = await this.getAuthorizedDatabaseAsync();
    const parsed = getSettingDefinition(key).schema.parse(value);

    await database
      .insertInto(TableName)
      .values({ key, value: toJsonb(parsed) })
      .onConflict((oc) =>
        oc.column("key").doUpdateSet({ value: toJsonb(parsed) }),
      )
      .execute();
  }
}
