import { describe, expect, it } from "vitest";
import {
  databaseSettingKeySchema,
  isDatabaseSettingKey,
  settingDefinitions,
  settingKeySchema,
} from "./settingDefinitions";

describe("settingDefinitions", () => {
  it.each(
    settingKeySchema.options,
  )("declares %s with the scope the API allow-list expects", (key) => {
    expect(settingDefinitions[key].scope === "database").toBe(
      databaseSettingKeySchema.safeParse(key).success,
    );
  });

  it.each(
    settingKeySchema.options,
  )("accepts the default value of %s", (key) => {
    const { defaultValue, schema } = settingDefinitions[key];

    expect(schema.safeParse(defaultValue).success).toBe(true);
  });

  it.each([
    { expected: true, key: "providersHidden" },
    { expected: false, key: "displayTheme" },
    { expected: false, key: "session_secret" },
  ])("isDatabaseSettingKey($key) is $expected", ({ expected, key }) => {
    expect(isDatabaseSettingKey(key)).toBe(expected);
  });
});
