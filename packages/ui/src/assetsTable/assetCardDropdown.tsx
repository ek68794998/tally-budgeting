import {
	IconEdit,
	IconToggleLeftFilled,
	IconToggleRightFilled,
	IconTrash,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { MoreDropdown } from "../moreDropdown/moreDropdown";

interface Props {
	isActive: boolean;
	onDelete: () => void;
	onEdit: () => void;
	onSetActive: (value: boolean) => void;
}

export const AssetCardDropdown: React.FC<Props> = ({
	isActive,
	onDelete,
	onEdit,
	onSetActive,
}) => {
	const t = useTranslations();

	return (
		<MoreDropdown
			entries={[
				{
					action: () => onSetActive(!isActive),
					IconComponent: isActive
						? IconToggleLeftFilled
						: IconToggleRightFilled,
					key: "setActive",
					label: t(
						isActive ? "assets.setActiveNo" : "assets.setActiveYes",
					),
				},
				{
					action: onEdit,
					IconComponent: IconEdit,
					key: "edit",
					label: t("common.actions.edit"),
					showDivider: true,
				},
				{
					action: onDelete,
					color: "danger",
					IconComponent: IconTrash,
					key: "delete",
					label: t("common.actions.delete"),
				},
			]}
		/>
	);
};
