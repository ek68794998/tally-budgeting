import { IconClick } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export const DetailEmptyState: React.FC = () => {
	const t = useTranslations("common.masterDetail");

	return (
		<div className="flex flex-col items-center gap-4 p-12 opacity-70">
			<IconClick size={48} />
			{t("detailEmptyState")}
		</div>
	);
};
