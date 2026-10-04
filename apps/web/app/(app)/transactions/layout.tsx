import { PageLayout } from "@tally/ui/common/pageLayout";
import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { buildSubpageMap } from "@tally/utilities/routing/pageData";
import { web } from "@tally/utilities/routing/routeBuilder";
import { useTranslations } from "next-intl";
import { HelpContent } from "../help/helpContent";

const TransactionsLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const t = useTranslations();

  const subpages = buildSubpageMap([
    [web.transactions.rules, t("transactions.rules.edit")],
    [web.transactions.upload, t("transactions.upload.action")],
  ]);

  return (
    <PageLayout
      actions={
        <HelpLink subject={t("transactions.title")}>
          <HelpContent topic="transactions" />
        </HelpLink>
      }
      knownSubpages={subpages}
      title={t("transactions.title")}
    >
      {children}
    </PageLayout>
  );
};

export default TransactionsLayout;
