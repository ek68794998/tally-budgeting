import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { useTranslations } from "next-intl";
import { PageLayout } from "../components/pageLayout";

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
