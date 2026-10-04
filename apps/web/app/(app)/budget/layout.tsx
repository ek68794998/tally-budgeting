import { BudgetMenuDropdown } from "@tally/ui/budget/budgetPage/budgetMenuDropdown";
import { PageLayout } from "@tally/ui/common/pageLayout";
import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { buildSubpageMap } from "@tally/utilities/routing/pageData";
import { web } from "@tally/utilities/routing/routeBuilder";
import { useTranslations } from "next-intl";
import { HelpContent } from "../help/helpContent";

const BudgetLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const t = useTranslations();

  const subpages = buildSubpageMap([
    [web.budget.categories, t("budget.categoriesEdit.title")],
    [web.budget.spending, t("budget.spending.title")],
  ]);

  return (
    <PageLayout
      actions={
        <>
          <HelpLink subject={t("budget.title")}>
            <HelpContent topic="budget" />
          </HelpLink>
          <BudgetMenuDropdown />
        </>
      }
      knownSubpages={subpages}
      title={t("budget.title")}
    >
      {children}
    </PageLayout>
  );
};

export default BudgetLayout;
