import { Chip, Tooltip } from "@heroui/react";
import { IconDatabase, IconDeviceDesktop } from "@tabler/icons-react";
import { type SettingScope } from "@tally/data-models/settings/settingDefinitions";
import { useTranslations } from "next-intl";

interface Props {
  scope: SettingScope;
}

export const SettingScopeChip: React.FC<Props> = ({ scope }) => {
  const t = useTranslations("settings.scope");
  const isLocal = scope === "local";
  const Icon = isLocal ? IconDeviceDesktop : IconDatabase;

  return (
    <Tooltip content={t(isLocal ? "localTooltip" : "databaseTooltip")}>
      <Chip
        size="sm"
        startContent={<Icon className="ml-1" size={14} />}
        variant="flat"
      >
        {t(isLocal ? "local" : "database")}
      </Chip>
    </Tooltip>
  );
};
