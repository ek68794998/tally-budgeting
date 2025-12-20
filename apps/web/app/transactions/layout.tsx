import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { TransactionsMenuDropdown } from "@tally/ui/transactionsPage/transactionsMenuDropdown";
import { useTranslations } from "next-intl";
import { PageLayout } from "../components/pageLayout";

const TransactionsLayout: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const t = useTranslations();

	return (
		<PageLayout
			actions={
				<>
					<HelpLink
						linkPath="/help/assets"
						subject={t("assets.title")}
					/>
					<TransactionsMenuDropdown />
				</>
			}
			title={t("transactions.title")}
		>
			{children}
		</PageLayout>
	);
};

export default TransactionsLayout;
