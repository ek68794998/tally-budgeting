import { useTranslations } from "next-intl";
import { PageLayout } from "../components/pageLayout";

const SettingsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const t = useTranslations();

	return <PageLayout title={t("settings.title")}>{children}</PageLayout>;
};

export default SettingsLayout;
