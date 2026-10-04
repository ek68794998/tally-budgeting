import {
	IconAdjustments,
	IconBuildingBank,
	IconDatabase,
} from "@tabler/icons-react";
import {
	type SettingsSectionId,
	settingDefinitions,
} from "@tally/data-models/settings/settingDefinitions";

export type SettingsSectionGroup = "preferences" | "system";

export interface SettingsSection {
	group: SettingsSectionGroup;
	icon: typeof IconAdjustments;
	id: SettingsSectionId;
}

export const settingsSections: SettingsSection[] = [
	{ group: "preferences", icon: IconAdjustments, id: "general" },
	{ group: "preferences", icon: IconBuildingBank, id: "providers" },
	{ group: "system", icon: IconDatabase, id: "data" },
];

export const isSettingsSectionId = (
	value: string | null,
): value is SettingsSectionId =>
	settingsSections.some(({ id }) => id === value);

export const sectionHasLocalSettings = (id: SettingsSectionId): boolean =>
	Object.values(settingDefinitions).some(
		({ scope, section }) => scope === "local" && section === id,
	);
