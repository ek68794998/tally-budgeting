import { Tooltip } from "@heroui/react";
import { IconEyeOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

/** Marks picker items from providers hidden in Settings. HeroUI section titles can't hold nodes, so the hint lives on the item. */
export const HiddenProviderIcon: React.FC = () => {
	const t = useTranslations("settings.hiddenProviders");

	return (
		<Tooltip content={t("tooltip")}>
			<IconEyeOff aria-label={t("title")} size={16} />
		</Tooltip>
	);
};
