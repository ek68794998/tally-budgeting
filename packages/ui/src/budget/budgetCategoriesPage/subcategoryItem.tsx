import { Button } from "@heroui/react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../../format";

interface Props {
	onDelete?: () => void;
	onEdit?: () => void;
	subcategory: Subcategory;
}

export const SubcategoryItem: React.FC<Props> = ({
	onDelete,
	onEdit,
	subcategory,
}) => {
	const t = useTranslations("budget");

	const amount = Dollars.fromCents(subcategory.budget.amountCents);

	// TODO Localize
	const frequencyText =
		subcategory.budget.frequency === 1
			? "month"
			: `${subcategory.budget.frequency} months`;

	return (
		<div className="flex flex-col gap-1 border-t border-neutral-200 pt-3">
			<div className="flex gap-2">
				<h3 className="text-lg font-bold">{subcategory.label}</h3>
				<span className="flex-1" />
				<Button
					isIconOnly={true}
					onPress={onEdit}
					size="sm"
					variant="light"
				>
					<IconPencil />
				</Button>
				<Button
					color="danger"
					isIconOnly={true}
					onPress={onDelete}
					size="sm"
					variant="light"
				>
					<IconTrash />
				</Button>
			</div>
			<div className="flex flex-col items-start justify-between text-sm">
				<span className="flex gap-1">
					<span>
						{t.rich("durations.perPeriod", {
							amount: formatCurrency(amount),
							bold: (chunks) => <b>{chunks}</b>,
							period: frequencyText,
						})}
					</span>
					<span>{"·"}</span>
					<span>{t(`types.${subcategory.budget.type}`)}</span>
				</span>
				{subcategory.description && (
					<span className="mt-1 opacity-70">
						{subcategory.description}
					</span>
				)}
			</div>
		</div>
	);
};
