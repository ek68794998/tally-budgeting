import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { useTranslations } from "next-intl";
import { PageLayout } from "../components/pageLayout";

const SummaryLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const t = useTranslations();

	return (
		<PageLayout
			actions={
				<HelpLink
					linkPath="/help/summary"
					subject={t("summary.title")}
				/>
			}
			title={t("summary.title")}
		>
			{children}
		</PageLayout>
	);
};

export default SummaryLayout;
