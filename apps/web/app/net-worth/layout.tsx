import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { useTranslations } from "next-intl";
import { PageLayout } from "../components/pageLayout";

const NetWorthLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const t = useTranslations();

	return (
		<PageLayout
			actions={
				<HelpLink
					linkPath="/help/net-worth"
					subject={t("netWorth.title")}
				/>
			}
			title={t("netWorth.title")}
		>
			{children}
		</PageLayout>
	);
};

export default NetWorthLayout;
