import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import {
  getSettingDefinition,
  type SettingKey,
  type SettingValue,
} from "./settingDefinitions";

export const parseSettingValue = <K extends SettingKey>(
  key: K,
  raw: unknown,
  onParseFailed?: (key: K, raw: unknown) => void,
): SettingValue<K> => {
  const { defaultValue, schema } = getSettingDefinition(key);

  if (isNullOrUndefined(raw)) {
    return defaultValue;
  }

  const result = schema.safeParse(raw);

  if (result.success) {
    return result.data;
  }

  onParseFailed?.(key, raw);

  return defaultValue;
};
