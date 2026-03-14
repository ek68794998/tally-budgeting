import { PageLayout } from "@tally/ui/common/pageLayout";
import { useTranslations } from "next-intl";

const SettingsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const t = useTranslations();

	return <PageLayout title={t("settings.title")}>{children}</PageLayout>;
};

export default SettingsLayout;
