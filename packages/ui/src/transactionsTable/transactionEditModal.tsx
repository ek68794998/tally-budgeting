import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategoryId } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { type TransactionDirection } from "@tally/data-models/contracts/transactionDirection";
import {
	addToast,
	DatePicker,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	NumberInput,
	Textarea,
	type useDisclosure,
} from "@heroui/react";
import {
	type CalendarDate,
	getLocalTimeZone,
	parseAbsoluteToLocal,
	toCalendarDate,
	today,
} from "@internationalized/date";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SelectAccount } from "../common/selectAccount";
import { SelectCategory } from "../common/selectCategory";
import { formatCurrency } from "../format";
import { EditModalFooter } from "../modal/editModalFooter";
import { TransactionEditDirectionButtons } from "./transactionEditDirectionButtons";

interface Props {
	modalState: ReturnType<typeof useDisclosure>;
	onSaveAsync: (transaction: Transaction) => Promise<void>;
	transaction: Transaction | null;
}

export const TransactionEditModal: React.FC<Props> = ({
	modalState: { isOpen, onOpenChange },
	onSaveAsync,
	transaction,
}) => {
	const t = useTranslations();

	const [accountId, setAccountId] = useState(0);
	const [amount, setAmount] = useState(0);
	const [date, setDate] = useState<CalendarDate | null>(
		today(getLocalTimeZone()),
	);
	const [merchantName, setMerchantName] = useState("");
	const [notes, setNotes] = useState("");
	const [subcategoryId, setSubcategoryId] = useState(DefaultSubcategoryId);
	const [transactionType, setTransactionType] =
		useState<TransactionDirection>("debit");

	const isModalOpen = isOpen && !!transaction;

	const canSave =
		!!merchantName && !!date && !!subcategoryId && accountId > 0;

	useEffect(() => {
		if (!isModalOpen) {
			return;
		}

		setAccountId(transaction.accountId);
		setAmount(transaction.amount);
		setDate(toCalendarDate(parseAbsoluteToLocal(transaction.date)));
		setMerchantName(transaction.merchant);
		setNotes(transaction.notes ?? "");
		setSubcategoryId(transaction.subcategoryId);
		setTransactionType(transaction.type);
	}, [isModalOpen, transaction]);

	const transactionAmountText = transaction
		? formatCurrency(transaction.amount, {
				showCentsIfLessThanDigits: 2,
			})
		: "";

	return (
		<Modal
			autoFocus={true}
			backdrop="blur"
			isOpen={isModalOpen}
			onOpenChange={onOpenChange}
			placement="top-center"
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader>
							{transaction?.merchant
								? t("transactions.edit.title", {
										amount: transactionAmountText,
										merchantName: transaction.merchant,
									})
								: t("transactions.listControls.addOne")}
						</ModalHeader>
						<ModalBody>
							<TransactionEditDirectionButtons
								direction={transactionType}
								onChange={setTransactionType}
							/>
							<Input
								label={t("transactions.columns.merchant")}
								onValueChange={setMerchantName}
								value={merchantName}
							/>
							<SelectCategory
								label={t("transactions.columns.category")}
								onChange={(subcategory) =>
									setSubcategoryId(subcategory.id)
								}
								value={subcategoryId}
							/>
							<SelectAccount
								label={t("transactions.columns.account")}
								onChange={(account) => setAccountId(account.id)}
								value={accountId}
							/>
							<NumberInput
								formatOptions={{
									currency: "USD",
									style: "currency",
								}}
								label={t("transactions.columns.amount")}
								minValue={0}
								onValueChange={setAmount}
								value={amount}
							/>
							<DatePicker
								granularity="day"
								label={t("transactions.columns.date")}
								onChange={setDate}
								value={date}
							/>
							<Textarea
								label={t("transactions.columns.notes")}
								onValueChange={setNotes}
								rows={3}
								value={notes}
							/>
						</ModalBody>
						<EditModalFooter
							isSaveDisabled={!canSave}
							onClose={onClose}
							onSave={async () => {
								invariant(
									transaction,
									"Transaction must be defined.",
								);
								await onSaveAsync({
									...transaction,
									accountId,
									amount,
									date: date
										? `${date.toString()}T12:00:00Z`
										: transaction.date,
									merchant: merchantName,
									notes,
									subcategoryId,
									type: transactionType,
								});
							}}
							onSaveError={() =>
								addToast({
									color: "danger",
									description: t(
										"transactions.edit.failureBody",
									),
									title: t("transactions.edit.failureTitle"),
								})
							}
						/>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};
