import { omitKeys } from "@ekumlin/typescript-toolkit/collections";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import {
  type Selection,
  type SortDescriptor,
  useDisclosure,
} from "@heroui/react";
import { getTransactionsResponseSchema } from "@tally/data-models/contracts/api/getTransactions";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { isAccount } from "@tally/data-models/data/accountHelpers";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import { ZodError } from "zod";
import { ModalDefaultTransaction } from "../common/modalDefault";
import { useDeleteTransaction } from "../hooks/api/useDeleteTransaction";
import { usePostTransaction } from "../hooks/api/usePostTransaction";
import { usePutTransaction } from "../hooks/api/usePutTransaction";
import { useAssets } from "../hooks/store/useAssets";
import { useCategories } from "../hooks/store/useCategories";
import { getTransactionsTableData } from "./helpers";
import { type TransactionTableData } from "./types";

export type TransactionKey = keyof Transaction | "actions";

export const transactionsPerPage = 15;

const maxQueryAttempts = 3;

export const transactionSortFields: Partial<Record<TransactionKey, string>> = {
  accountId: "account",
  amountCents: "amount",
  date: "date",
  merchant: "merchant",
  subcategoryId: "category",
};

export const useTransactionsTable = () => {
  const { assets, isLoading: assetsLoading } = useAssets();
  const { isLoading: categoriesLoading, subcategories } = useCategories();
  const { deleteTransactionAsync } = useDeleteTransaction();
  const deleteModalState = useDisclosure();
  const editModalState = useDisclosure();
  const locale = useLocale();
  const { postTransactionAsync } = usePostTransaction();
  const { putTransactionAsync } = usePutTransaction();

  const [activeTransaction, setActiveTransaction] =
    useState<Transaction | null>(null);
  const [editsMade, setEditsMade] = useState(0);
  const [filterValue, setFilterValue] = useState("");
  const [isNewTransaction, setIsNewTransaction] = useState(false);
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<Selection>(new Set());
  const [transactionToDelete, setTransactionToDelete] =
    useState<TransactionTableData | null>(null);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "date",
    direction: "descending",
  });

  const incrementEditsMade = () => setEditsMade((v) => v + 1);

  const accounts = assets.filter(isAccount);

  const searchParams = {
    direction: String(sortDescriptor.direction),
    filter: String(filterValue).trim(),
    limit: String(transactionsPerPage),
    page: String(page),
    sortBy: String(
      Object.entries(transactionSortFields).find(
        ([key]) => key === sortDescriptor.column,
      )?.[1] ?? "date",
    ),
  };

  const { data, error, isFetching } = useQuery({
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const urlSearchParams = new URLSearchParams(searchParams);

      const response = await apiFetch(
        buildApiRoute(api.transactions.base, {
          query: urlSearchParams,
        }),
        { signal },
      );

      const json: unknown = await response.json();
      const { nextLink: _, ...result } =
        getTransactionsResponseSchema.parse(json);

      return result;
    },
    queryKey: ["transactions", searchParams, editsMade],
    retry: (failureCount, attemptError) => {
      if (failureCount >= maxQueryAttempts) {
        return false;
      }

      if (attemptError instanceof ZodError) {
        return false;
      }

      return true;
    },
  });

  const pageCount = Math.ceil((data?.count ?? 0) / transactionsPerPage);

  const transactionsData = useMemo(
    () =>
      getTransactionsTableData(data?.transactions || [], {
        accounts,
        locale,
        subcategories,
      }),
    [accounts, data, locale, subcategories],
  );

  const openEditModal = (toEdit: Transaction, isNew: boolean) => {
    setActiveTransaction(toEdit);
    setIsNewTransaction(isNew);
    editModalState.onOpen();
  };

  const findTransaction = (id: number) =>
    data?.transactions.find((transaction) => transaction.id === id);

  return {
    activeTransaction,
    confirmDeleteAsync: async () => {
      invariant(transactionToDelete, "Transaction to delete must be defined");
      await deleteTransactionAsync(transactionToDelete.id);
      incrementEditsMade();
    },
    deleteModalState,
    duplicateTransaction: (id: number) => {
      const transactionFromData = findTransaction(id);

      if (!transactionFromData) {
        return;
      }

      openEditModal(transactionFromData, true);
    },
    editModalState,
    editTransaction: (id: number) => {
      const transactionFromData = findTransaction(id);

      if (!transactionFromData) {
        return;
      }

      openEditModal(transactionFromData, false);
    },
    error,
    filterValue,
    isLoading: isFetching || categoriesLoading || assetsLoading,
    pageCount,
    requestDelete: (item: TransactionTableData) => {
      setTransactionToDelete(item);
      deleteModalState.onOpen();
    },
    saveTransactionAsync: async (transaction: Transaction) => {
      await (isNewTransaction
        ? postTransactionAsync(omitKeys(transaction, "id"))
        : putTransactionAsync(transaction));
      incrementEditsMade();
    },
    selectedPage: Math.min(page, pageCount),
    selection,
    setFilterValue,
    setPage,
    setSelection,
    setSortDescriptor,
    sortDescriptor,
    startNewTransaction: () => {
      openEditModal(ModalDefaultTransaction, true);
    },
    transactionsData,
    transactionToDelete,
  };
};
