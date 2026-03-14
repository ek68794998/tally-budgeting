import { PageLayout } from "@tally/ui/common/pageLayout";
import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { useTranslations } from "next-intl";

const RetirementLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const t = useTranslations();

	return (
		<PageLayout
			actions={
				<HelpLink
					linkPath="/help/retirement"
					subject={t("retirement.title")}
				/>
			}
			title={t("retirement.title")}
		>
			{children}
		</PageLayout>
	);
};

export default RetirementLayout;
