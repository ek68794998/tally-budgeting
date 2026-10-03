import { PageLayout } from "@tally/ui/common/pageLayout";
import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { useTranslations } from "next-intl";
import { HelpContent } from "../help/helpContent";

const AssetsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const t = useTranslations();

	return (
		<PageLayout
			actions={
				<HelpLink subject={t("assets.title")}>
					<HelpContent topic="assets" />
				</HelpLink>
			}
			title={t("assets.title")}
		>
			{children}
		</PageLayout>
	);
};

export default AssetsLayout;
