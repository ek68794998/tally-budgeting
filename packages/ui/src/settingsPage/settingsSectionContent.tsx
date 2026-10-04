import { type SettingsSectionId } from "@tally/data-models/settings/settingDefinitions";
import { useTranslations } from "next-intl";
import { DataSection } from "./sections/dataSection";
import { GeneralSection } from "./sections/generalSection";
import { ProvidersSection } from "./sections/providersSection";
import { sectionHasLocalSettings } from "./settingsSections";

interface Props {
  sectionId: SettingsSectionId;
}

const sectionComponents: Record<SettingsSectionId, React.FC> = {
  data: DataSection,
  general: GeneralSection,
  providers: ProvidersSection,
};

export const SettingsSectionContent: React.FC<Props> = ({ sectionId }) => {
  const t = useTranslations("settings.scope");
  const SectionComponent = sectionComponents[sectionId];

  return (
    <div className="flex flex-col gap-2">
      {sectionHasLocalSettings(sectionId) && (
        <p className="text-sm opacity-60">{t("localSectionNote")}</p>
      )}
      <SectionComponent />
    </div>
  );
};
