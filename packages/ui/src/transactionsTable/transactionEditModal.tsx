import {
  addToast,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  NumberInput,
  Switch,
  Textarea,
  type useDisclosure,
} from "@heroui/react";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useTranslations } from "next-intl";
import { SelectAccount } from "../common/selectAccount";
import { SelectSubcategory } from "../common/selectSubcategory";
import { formatCurrency } from "../format";
import { EditModalFooter } from "../modal/editModalFooter";
import { TransactionEditDirectionButtons } from "./transactionEditDirectionButtons";
import { TransactionHappinessSelect } from "./transactionHappinessSelect";
import { useTransactionForm } from "./useTransactionForm";

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

  const isModalOpen = isOpen && !!transaction;

  const {
    accountId,
    amount,
    buildTransaction,
    canSave,
    date,
    happiness,
    isOneTime,
    merchantName,
    notes,
    resetForNextTransaction,
    setAccountId,
    setAmount,
    setDate,
    setHappiness,
    setIsOneTime,
    setMerchantName,
    setNotes,
    setSubcategoryId,
    setTransactionType,
    subcategoryId,
    transactionType,
  } = useTransactionForm(transaction, isModalOpen);

  const transactionAmountText = transaction
    ? formatCurrency(Dollars.fromCents(transaction.amountCents), {
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
                : t("transactions.table.addOne")}
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
              <SelectSubcategory
                label={t("transactions.columns.category")}
                onChange={(subcategory) => setSubcategoryId(subcategory.id)}
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
                  maximumFractionDigits: 2,
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
              <TransactionHappinessSelect
                onChange={setHappiness}
                value={happiness}
              />
              <Textarea
                label={t("transactions.columns.notes")}
                onValueChange={setNotes}
                rows={3}
                value={notes}
              />
              <Switch
                isSelected={isOneTime}
                onValueChange={setIsOneTime}
                size="sm"
              >
                <div className="flex flex-col">
                  <span className="text-sm">
                    {t("transactions.oneTime.label")}
                  </span>
                  <span className="text-default-500 text-xs">
                    {t("transactions.oneTime.description")}
                  </span>
                </div>
              </Switch>
            </ModalBody>
            <EditModalFooter
              isSaveDisabled={!canSave}
              onClose={onClose}
              onSave={async (createMore) => {
                await onSaveAsync(buildTransaction());

                if (createMore) {
                  resetForNextTransaction();

                  addToast({
                    color: "success",
                    description: t("transactions.edit.successBody", {
                      amount: formatCurrency(amount),
                      merchantName,
                    }),
                    title: t("transactions.edit.successTitle"),
                  });
                }
              }}
              onSaveError={() =>
                addToast({
                  color: "danger",
                  description: t("transactions.edit.failureBody"),
                  title: t("transactions.edit.failureTitle"),
                })
              }
              showCreateMore={!transaction?.merchant}
            />
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
