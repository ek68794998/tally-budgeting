import { Card } from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useLocale, useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { DataProviderIcon } from "../dataProviderIcons/dataProviderIcon";
import { formatCurrency } from "../format";
import { AssetCardDropdown } from "./assetCardDropdown";

interface Props {
	asset: Asset;
	onDelete: () => void;
	onEdit: () => void;
	onSetActive: (value: boolean) => void;
}

export const AssetCard: React.FC<Props> = ({
	asset,
	onDelete,
	onEdit,
	onSetActive,
}) => {
	const locale = useLocale();
	const t = useTranslations("assets");

	const { active, name, provider, type, valueCents } = asset;

	const separator = "•";

	const value = Dollars.fromCents(valueCents);
	const valueString = formatCurrency(value, { locale });

	const isLiability =
		type === "long_term_liability" || type === "short_term_liability";

	return (
		<Card isBlurred={true}>
			<div
				className={twMerge(
					"flex flex-col gap-2 p-4",
					!active && "opacity-60",
				)}
			>
				<h2 className="mb-2 flex items-center gap-2 font-serif text-xl font-bold whitespace-nowrap">
					<div className="flex-0">
						<DataProviderIcon provider={provider} size="md" />
					</div>
					<span className="min-w-0 overflow-hidden overflow-ellipsis">
						{name}
					</span>
				</h2>
				<h3
					className={twMerge(
						"text-3xl",
						isLiability && value && "text-danger-600",
					)}
				>
					{valueString}
				</h3>
				<div className="flex items-center gap-2 text-sm opacity-80">
					<span>{t(`types.${type}`, { plural: "no" })}</span>
					{separator}
					<span>{t(active ? "activeYes" : "activeNo")}</span>
					<span className="flex-1" />
					<AssetCardDropdown
						isActive={active}
						onDelete={onDelete}
						onEdit={onEdit}
						onSetActive={onSetActive}
					/>
				</div>
			</div>
		</Card>
	);
};
