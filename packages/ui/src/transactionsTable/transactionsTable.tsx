"use client";

import {
  Chip,
  cn,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import {
  IconBusinessplan,
  IconNote,
  IconZoomQuestion,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";
import { ConfirmationModal } from "../common/confirmationModal";
import { ContentUnavailableView } from "../contentUnavailableView/contentUnavailableView";
import { TableLoadError } from "../table/tableLoadError";
import { TransactionEditModal } from "./transactionEditModal";
import { TransactionRowDropdown } from "./transactionRowDropdown";
import { TransactionsTableControls } from "./transactionsTableControls";
import { type TransactionTableData } from "./types";
import {
  type TransactionKey,
  transactionSortFields,
  useTransactionsTable,
} from "./useTransactionsTable";

export const TransactionsTable: React.FC = () => {
  const t = useTranslations("transactions");
  const {
    activeTransaction,
    clearLinkedFilter,
    confirmDeleteAsync,
    deleteModalState,
    duplicateTransaction,
    editModalState,
    editTransaction,
    error,
    filterValue,
    isLinkedFilterActive,
    isLoading,
    pageCount,
    requestDelete,
    saveTransactionAsync,
    selectedPage,
    selection,
    setFilterValue,
    setPage,
    setSelection,
    setSortDescriptor,
    sortDescriptor,
    startNewTransaction,
    toggleOneTimeAsync,
    transactionsData,
    transactionToDelete,
  } = useTransactionsTable();

  const getItemMerchantField = ({
    isOneTime,
    merchant,
    notes,
  }: TransactionTableData): ReactNode => {
    const actions: ReactNode[] = [<span key="merchant">{merchant}</span>];

    const iconClassName = cn(
      "bg-primary/20 text-primary inline rounded-full p-1 leading-0",
    );
    const iconSize = 22;

    if (notes) {
      actions.push(
        <Tooltip content={notes} key="notes">
          <IconNote className={iconClassName} size={iconSize} />
        </Tooltip>,
      );
    }

    if (isOneTime) {
      actions.push(
        <Tooltip content={t("oneTime.label")} key="isOneTime">
          <IconBusinessplan
            aria-label={t("oneTime.label")}
            className={iconClassName}
            size={iconSize}
          />
        </Tooltip>,
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-x-1.5">{actions}</div>
    );
  };

  const columns: {
    getValue: (item: TransactionTableData) => ReactNode;
    key: TransactionKey;
    label: string;
    sortField?: string;
  }[] = [
    {
      getValue: (item) => item.date,
      key: "date",
      label: t("columns.date"),
      sortField: transactionSortFields.date,
    },
    {
      getValue: (item) => getItemMerchantField(item),
      key: "merchant",
      label: t("columns.merchant"),
      sortField: transactionSortFields.merchant,
    },
    {
      getValue: (item) => item.subcategory,
      key: "subcategoryId",
      label: t("columns.category"),
      sortField: transactionSortFields.subcategoryId,
    },
    {
      getValue: (item) => item.account,
      key: "accountId",
      label: t("columns.account"),
      sortField: transactionSortFields.accountId,
    },
    {
      getValue: (item) => (
        <Chip color={item.type === "credit" ? "success" : "warning"}>
          {t(`types.${item.type}`)}
        </Chip>
      ),
      key: "type",
      label: t("columns.type"),
    },
    {
      getValue: (item) => item.amount,
      key: "amountCents",
      label: t("columns.amount"),
      sortField: transactionSortFields.amountCents,
    },
    {
      getValue: (item) => (
        <TransactionRowDropdown
          isOneTime={item.isOneTime}
          onDelete={() => requestDelete(item)}
          onDuplicate={() => duplicateTransaction(item.id)}
          onEdit={() => editTransaction(item.id)}
          onToggleOneTime={() => void toggleOneTimeAsync(item.id)}
        />
      ),
      key: "actions",
      label: "",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <TransactionsTableControls
        onFilterChange={setFilterValue}
        onNewTransaction={startNewTransaction}
      />
      {isLinkedFilterActive && (
        <div>
          <Chip onClose={clearLinkedFilter} variant="flat">
            {t("table.linkedFilter")}
          </Chip>
        </div>
      )}
      <Table
        aria-label={t("title")}
        bottomContent={
          pageCount > 0 ? (
            <div className="flex w-full justify-center">
              <Pagination
                color="primary"
                isCompact={true}
                onChange={setPage}
                page={selectedPage}
                showControls={true}
                showShadow={true}
                total={pageCount}
              />
            </div>
          ) : null
        }
        classNames={{
          wrapper:
            "bg-background/80 dark:bg-background/20 backdrop-blur-md backdrop-saturate-150",
        }}
        onRowAction={() => "noop"}
        onSelectionChange={setSelection}
        onSortChange={setSortDescriptor}
        selectedKeys={selection}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn allowsSorting={!!column.sortField} key={column.key}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={
            error ? (
              <TableLoadError error={error} />
            ) : (
              <ContentUnavailableView
                IconComponent={filterValue ? IconZoomQuestion : undefined}
                primaryText={
                  filterValue ? t("table.noneMatched") : t("table.noneFound")
                }
              />
            )
          }
          isLoading={isLoading}
          items={transactionsData}
          loadingContent={<Spinner />}
        >
          {(item) => {
            const { amount, date, id, isOneTime, merchant, type } = item;

            return (
              <TableRow
                key={`${id}-${amount}-${date}-${merchant}-${type}-${isOneTime}`}
              >
                {(columnKey) => {
                  const column = columns.find((c) => c.key === columnKey);

                  return <TableCell>{column?.getValue(item)}</TableCell>;
                }}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
      <TransactionEditModal
        modalState={editModalState}
        onSaveAsync={saveTransactionAsync}
        transaction={activeTransaction}
      />
      <ConfirmationModal
        body={t("delete.body", {
          amount: transactionToDelete?.amount ?? "",
          merchantName: transactionToDelete?.merchant ?? "",
        })}
        confirmText={t("delete.action")}
        isDestructive={true}
        modalState={deleteModalState}
        onConfirmAsync={confirmDeleteAsync}
        title={t("delete.title")}
      />
    </div>
  );
};
