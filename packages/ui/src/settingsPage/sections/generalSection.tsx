"use client";

import { useTranslations } from "next-intl";
import { useSetting } from "../../hooks/useSetting";
import { SettingRow } from "../controls/settingRow";
import { SettingSegmented } from "../controls/settingSegmented";

export const GeneralSection: React.FC = () => {
  const t = useTranslations("settings.general.theme");
  const [theme, setTheme, { scope }] = useSetting("displayTheme");

  return (
    <SettingRow description={t("description")} label={t("label")} scope={scope}>
      <SettingSegmented
        label={t("label")}
        onChange={setTheme}
        options={[
          { label: t("system"), value: "system" },
          { label: t("light"), value: "light" },
          { label: t("dark"), value: "dark" },
        ]}
        value={theme}
      />
    </SettingRow>
  );
};
