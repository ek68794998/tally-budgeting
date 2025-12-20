import { type Transaction } from "@tally/data-models/contracts/transaction";
import { Button, Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../format";

interface Props {
	count: number;
	onCreateRule: () => void;
	transaction: Transaction;
}

export const TransactionsUploadResultTransactionRow: React.FC<Props> = ({
	count,
	onCreateRule,
	transaction,
}) => {
	const t = useTranslations("transactions");

	return (
		<div className="flex items-center gap-2">
			<Chip variant="flat">
				{count > 1
					? count
					: formatCurrency(transaction.amount, {
							showCentsIfLessThanDigits: 4,
						})}
			</Chip>
			<div className="flex-1 overflow-hidden font-mono text-nowrap overflow-ellipsis">
				{transaction.merchant}
			</div>
			<div>
				<Button onPress={onCreateRule} size="sm" variant="ghost">
					{t("upload.createRule")}
				</Button>
			</div>
		</div>
	);
};
