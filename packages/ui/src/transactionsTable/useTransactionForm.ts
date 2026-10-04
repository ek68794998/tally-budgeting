import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type DateValue } from "@heroui/react";
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  toCalendarDate,
  today,
} from "@internationalized/date";
import {
  type HappinessLevel,
  HappinessLevelDefault,
} from "@tally/data-models/contracts/happinessLevel";
import { DefaultSubcategoryId } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { type TransactionDirection } from "@tally/data-models/contracts/transactionDirection";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useEffect, useState } from "react";

export const useTransactionForm = (
  transaction: Transaction | null,
  isModalOpen: boolean,
) => {
  const [accountId, setAccountId] = useState(0);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState<DateValue | null>(today(getLocalTimeZone()));
  const [happiness, setHappiness] = useState<HappinessLevel>(
    HappinessLevelDefault,
  );
  const [merchantName, setMerchantName] = useState("");
  const [notes, setNotes] = useState("");
  const [subcategoryId, setSubcategoryId] = useState(DefaultSubcategoryId);
  const [transactionType, setTransactionType] =
    useState<TransactionDirection>("debit");

  useEffect(() => {
    if (!isModalOpen || !transaction) {
      return;
    }

    setAccountId(transaction.accountId ?? -1);
    setAmount(Dollars.fromCents(transaction.amountCents));
    setDate(toCalendarDate(parseAbsoluteToLocal(transaction.date)));
    setHappiness(transaction.happiness);
    setMerchantName(transaction.merchant);
    setNotes(transaction.notes);
    setSubcategoryId(transaction.subcategoryId);
    setTransactionType(transaction.type);
  }, [isModalOpen, transaction]);

  return {
    accountId,
    amount,
    buildTransaction: (): Transaction => {
      invariant(transaction, "Transaction must be defined.");

      return {
        ...transaction,
        accountId,
        amountCents: Dollars.toCents(amount),
        date: date ? `${date.toString()}T12:00:00Z` : transaction.date,
        happiness,
        merchant: merchantName,
        notes,
        subcategoryId,
        type: transactionType,
      };
    },
    canSave:
      !!merchantName &&
      !!date &&
      !!subcategoryId &&
      accountId > 0 &&
      amount !== 0,
    date,
    happiness,
    merchantName,
    notes,
    resetForNextTransaction: () => {
      setAmount(0);
      setHappiness(HappinessLevelDefault);
      setNotes("");
    },
    setAccountId,
    setAmount,
    setDate,
    setHappiness,
    setMerchantName,
    setNotes,
    setSubcategoryId,
    setTransactionType,
    subcategoryId,
    transactionType,
  };
};
