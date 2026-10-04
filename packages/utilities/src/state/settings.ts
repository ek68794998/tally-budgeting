import { toError } from "@ekumlin/typescript-toolkit/error";
import { ContentType, Put } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import { getSettingsResponseSchema } from "@tally/data-models/contracts/api/getSettings";
import {
	putSettingRequestSchema,
	putSettingResponseSchema,
} from "@tally/data-models/contracts/api/putSetting";
import { type DatabaseSettingKey } from "@tally/data-models/settings/settingDefinitions";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { apiFetch } from "../routing/apiFetch";
import { api, buildApiRoute } from "../routing/routeBuilder";
import { telemetry } from "../telemetry/telemetry";
import { type StoreState } from "./storeState";

export type SettingsStore = StoreState<{
	/** Resolves to `false` (after rolling back) if the save failed. */
	saveSettingAsync: (
		key: DatabaseSettingKey,
		value: unknown,
	) => Promise<boolean>;
	/** Raw values by key; consumers parse them against the setting definitions. */
	settings: Record<string, unknown>;
}>;

export const useSettingsStore = create<SettingsStore>()(
	subscribeWithSelector((set, get) => ({
		error: null,
		fetch: async () => {
			set({ isFetching: true });

			try {
				const response = await apiFetch(
					buildApiRoute(api.settings.base),
				);
				const responseJson: unknown = await response.json();
				const { settings } =
					getSettingsResponseSchema.parse(responseJson);

				set({
					error: null,
					isFetching: false,
					isHydrated: true,
					settings,
				});
			} catch (error) {
				telemetry().error("STORE_FETCH_FAILED", {
					errorMessage: toError(error).message,
					store: "settings",
				});
				set({
					error: "Failed to fetch settings",
					isFetching: false,
					isHydrated: true,
				});
			}
		},
		isFetching: false,
		isHydrated: false,
		saveSettingAsync: async (key, value) => {
			const previous = get().settings;

			set({ settings: { ...previous, [key]: value } });

			try {
				const body = putSettingRequestSchema.parse({ value });
				const response = await apiFetch(
					buildApiRoute(api.settings.base, { params: [key] }),
					{
						body: JSON.stringify(body),
						headers: { [ContentType]: ApplicationJson },
						method: Put,
					},
				);
				const { success } = putSettingResponseSchema.parse(
					await response.json(),
				);

				if (!success) {
					throw new Error("Setting was not saved.");
				}

				return true;
			} catch (error) {
				telemetry().error("SETTING_SAVE_FAILED", {
					errorMessage: toError(error).message,
					key,
				});
				set({ settings: previous });

				return false;
			}
		},
		settings: {},
	})),
);
