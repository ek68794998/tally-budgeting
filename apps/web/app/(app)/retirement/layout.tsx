import { PageLayout } from "@tally/ui/common/pageLayout";
import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { useTranslations } from "next-intl";
import { HelpContent } from "../help/helpContent";

const RetirementLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const t = useTranslations();

  return (
    <PageLayout
      actions={
        <HelpLink subject={t("retirement.title")}>
          <HelpContent topic="retirement" />
        </HelpLink>
      }
      title={t("retirement.title")}
    >
      {children}
    </PageLayout>
  );
};

export default RetirementLayout;
