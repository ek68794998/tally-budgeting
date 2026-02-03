import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { useTranslations } from "next-intl";
import { PageLayout } from "../components/pageLayout";

const TransactionsLayout: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const t = useTranslations();

	return (
		<PageLayout
			actions={
				<HelpLink
					linkPath="/help/transactions"
					subject={t("transactions.title")}
				/>
			}
			title={t("transactions.title")}
		>
			{children}
		</PageLayout>
	);
};

export default TransactionsLayout;
