import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { RowDropdown } from "../table/rowDropdown";

interface Props {
	onDelete: () => void;
	onEdit: () => void;
}

export const AssetRowDropdown: React.FC<Props> = ({ onDelete, onEdit }) => {
	const t = useTranslations();

	return (
		<RowDropdown
			dropdownEntries={[
				{
					action: onEdit,
					IconComponent: IconEdit,
					key: "edit",
					label: t("common.actions.edit"),
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
