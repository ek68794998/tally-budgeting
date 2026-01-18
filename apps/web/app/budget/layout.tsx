import { BudgetMenuDropdown } from "@tally/ui/budget/budgetPage/budgetMenuDropdown";
import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { useTranslations } from "next-intl";
import { PageLayout } from "../components/pageLayout";

const BudgetLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const t = useTranslations();

	return (
		<PageLayout
			actions={
				<>
					<HelpLink
						linkPath="/help/budget"
						subject={t("budget.title")}
					/>
					<BudgetMenuDropdown />
				</>
			}
			title={t("budget.title")}
		>
			{children}
		</PageLayout>
	);
};

export default BudgetLayout;
