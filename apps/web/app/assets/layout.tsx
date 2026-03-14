import { PageLayout } from "@tally/ui/common/pageLayout";
import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { useTranslations } from "next-intl";

const AssetsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const t = useTranslations();

	return (
		<PageLayout
			actions={
				<HelpLink linkPath="/help/assets" subject={t("assets.title")} />
			}
			title={t("assets.title")}
		>
			{children}
		</PageLayout>
	);
};

export default AssetsLayout;
