"use client";

import { addToast } from "@heroui/react";
import { parseSettingValue } from "@tally/data-models/settings/parseSettingValue";
import {
	getSettingDefinition,
	isDatabaseSettingKey,
	type SettingKey,
	type SettingScope,
	type SettingValue,
} from "@tally/data-models/settings/settingDefinitions";
import { useSettingsStore } from "@tally/utilities/state/settings";
import { telemetry } from "@tally/utilities/telemetry/telemetry";
import { useLocalStorageState } from "ahooks";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";

export const settingStoragePrefix = "tally.settings.";

export interface UseSettingMeta {
	isLoading: boolean;
	scope: SettingScope;
}

const reportParseFailure = (key: SettingKey) => {
	telemetry().error("SETTING_PARSE_FAILED", { key });
};

/**
 * Components never need to know whether a setting lives in the database or in this browser.
 * Both backing stores are always subscribed to so the hook order never depends on the key.
 */
export const useSetting = <K extends SettingKey>(
	key: K,
): [SettingValue<K>, (value: SettingValue<K>) => void, UseSettingMeta] => {
	const t = useTranslations("settings");
	const { scope } = getSettingDefinition(key);
	const isDatabase = scope === "database";

	const { fetch, isFetching, isHydrated, settings } = useSettingsStore();
	const [localRaw, setLocalRaw] = useLocalStorageState<unknown>(
		`${settingStoragePrefix}${key}`,
	);

	useEffect(() => {
		if (isDatabase && !isHydrated && !isFetching) {
			void fetch();
		}
	}, [fetch, isDatabase, isFetching, isHydrated]);

	const databaseRaw: Record<string, unknown> = settings;
	const raw = isDatabase ? databaseRaw[key] : localRaw;

	const setValue = useCallback(
		(newValue: SettingValue<K>) => {
			if (!isDatabaseSettingKey(key)) {
				setLocalRaw(newValue);
				return;
			}

			void useSettingsStore
				.getState()
				.saveSettingAsync(key, newValue)
				.then((wasSaved) => {
					if (!wasSaved) {
						addToast({ color: "danger", title: t("saveFailed") });
					}
				});
		},
		[key, setLocalRaw, t],
	);

	return [
		parseSettingValue(key, raw, reportParseFailure),
		setValue,
		{ isLoading: isDatabase && !isHydrated, scope },
	];
};
