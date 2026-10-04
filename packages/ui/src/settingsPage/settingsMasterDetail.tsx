"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MasterDetail } from "../masterDetail/masterDetail";
import { SettingsSectionContent } from "./settingsSectionContent";
import { SettingsSectionListItem } from "./settingsSectionListItem";
import {
	isSettingsSectionId,
	type SettingsSection,
	settingsSections,
} from "./settingsSections";

export const SettingsMasterDetail: React.FC = () => {
	const t = useTranslations("settings.sections");
	const sectionParam = useSearchParams().get("section");

	const handleSelectionChange = (section: SettingsSection | null) => {
		const query = section ? `?section=${section.id}` : "";

		window.history.replaceState(
			null,
			"",
			`${window.location.pathname}${query}`,
		);
	};

	return (
		<MasterDetail
			defaultSelectedKey={
				isSettingsSectionId(sectionParam) ? sectionParam : undefined
			}
			detail={{
				content: (section) =>
					section ? (
						<SettingsSectionContent sectionId={section.id} />
					) : null,
				title: (section) => (section ? t(section.id) : ""),
			}}
			getItemKey={({ id }) => id}
			master={{
				getItemGroup: ({ group }) => t(`groups.${group}`),
				items: settingsSections,
				renderItem: (section, isSelected, onClick) => (
					<SettingsSectionListItem
						isSelected={isSelected}
						onClick={onClick}
						section={section}
					/>
				),
				title: t("title"),
			}}
			onSelectionChange={handleSelectionChange}
		/>
	);
};
