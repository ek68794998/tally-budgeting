import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { type SettingsSection } from "./settingsSections";

interface Props {
  isSelected: boolean;
  onClick: () => void;
  section: SettingsSection;
}

export const SettingsSectionListItem: React.FC<Props> = ({
  isSelected,
  onClick,
  section: { icon, id },
}) => {
  const t = useTranslations("settings.sections");

  const IconComponent = icon;

  return (
    <Button
      className="
        flex h-[unset] w-full items-center justify-start gap-2 p-2 text-left
      "
      onPress={onClick}
      variant={isSelected ? "solid" : "light"}
    >
      <IconComponent />
      <span className={isSelected ? "font-semibold" : ""}>{t(id)}</span>
    </Button>
  );
};
