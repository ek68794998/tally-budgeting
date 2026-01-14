import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { MoreDropdown } from "../moreDropdown/moreDropdown";

interface Props {
	onDelete: () => void;
	onEdit: () => void;
}

export const AssetCardDropdown: React.FC<Props> = ({ onDelete, onEdit }) => {
	const t = useTranslations();

	return (
		<MoreDropdown
			entries={[
				{
					action: onEdit,
					IconComponent: IconEdit,
					key: "edit",
					label: t("common.actions.edit"),
					showDivider: true,
				},
				{
					action: onDelete,
					IconComponent: IconTrash,
					key: "delete",
					label: t("common.actions.delete"),
				},
			]}
		/>
	);
};
