"use client";

import { Spinner } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useSetting } from "../../hooks/useSetting";
import { SettingProviderList } from "../controls/settingProviderList";
import { SettingScopeChip } from "../controls/settingScopeChip";

export const ProvidersSection: React.FC = () => {
	const t = useTranslations("settings.providers");
	const [hiddenProviders, setHiddenProviders, { isLoading, scope }] =
		useSetting("providersHidden");

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<span className="font-semibold">{t("label")}</span>
				<SettingScopeChip scope={scope} />
			</div>
			<span className="text-sm opacity-60">{t("help")}</span>
			{isLoading ? (
				<Spinner />
			) : (
				<SettingProviderList
					hiddenProviders={hiddenProviders}
					onChange={setHiddenProviders}
				/>
			)}
		</div>
	);
};
