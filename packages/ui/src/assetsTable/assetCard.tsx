import { Card } from "@heroui/react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { type Asset } from "@tally/data-models/contracts/asset";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useLocale, useTranslations } from "next-intl";
import { DataProviderIcon } from "../dataProviderIcons/dataProviderIcon";
import { formatCurrency } from "../format";
import { RowDropdown } from "../table/rowDropdown";

interface AssetCardProps {
	asset: Asset;
	onDelete: () => void;
	onEdit: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
	asset,
	onDelete,
	onEdit,
}) => {
	const locale = useLocale();
	const t = useTranslations();

	const { active, name, provider, type, valueCents } = asset;

	const separator = "•";

	const value = Dollars.fromCents(valueCents);
	const valueString = formatCurrency(value, { locale });

	return (
		<Card className="flex flex-col gap-4 p-4" isBlurred={true}>
			<h2 className="flex gap-2 font-serif text-xl font-bold whitespace-nowrap">
				<div className="flex-0">
					<DataProviderIcon provider={provider} size="md" />
				</div>
				<span className="min-w-0 overflow-hidden overflow-ellipsis">
					{name}
				</span>
			</h2>
			<h3 className="text-3xl">{valueString}</h3>
			<div className="flex gap-2 text-sm opacity-80">
				<span>{t(`assets.types.${type}`, { plural: "no" })}</span>
				{separator}
				<span>
					{t(active ? "assets.activeYes" : "assets.activeNo")}
				</span>
				<span className="flex-1" />
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
			</div>
		</Card>
	);
};
