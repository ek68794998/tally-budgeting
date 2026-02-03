"use client";

import {
	Chip,
	Pagination,
	type Selection,
	type SortDescriptor,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
	useDisclosure,
} from "@heroui/react";
import { IconNote } from "@tabler/icons-react";
import { getTransactionsResponseSchema } from "@tally/data-models/contracts/api/getTransactions";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { isAccount } from "@tally/data-models/data/accountHelpers";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useMemo, useState } from "react";
import { ZodError } from "zod";
import { ModalDefaultTransaction } from "../common/modalDefault";
import { useDeleteTransaction } from "../hooks/api/useDeleteTransaction";
import { usePostTransaction } from "../hooks/api/usePostTransaction";
import { useAssets } from "../hooks/store/useAssets";
import { useCategories } from "../hooks/store/useCategories";
import { TableLoadError } from "../table/tableLoadError";
import { getTransactionsTableData } from "./helpers";
import { TransactionEditModal } from "./transactionEditModal";
import { TransactionRowDropdown } from "./transactionRowDropdown";
import { TransactionsTableControls } from "./transactionsTableControls";
import { type TransactionTableData } from "./types";

type TransactionKey = keyof Transaction | "actions";

const transactionsPerPage = 15;

export const TransactionsTable: React.FC = () => {
	const { assets, isLoading: assetsLoading } = useAssets();
	const { isLoading: categoriesLoading, subcategories } = useCategories();
	const { deleteTransactionAsync } = useDeleteTransaction();
	const editModalState = useDisclosure();
	const locale = useLocale();
	const { postTransactionAsync } = usePostTransaction();
	const t = useTranslations("transactions");

	const [activeTransaction, setActiveTransaction] =
		useState<Transaction | null>(null);
	const [editsMade, setEditsMade] = useState(0);
	const [filterValue, setFilterValue] = useState("");
	const [page, setPage] = useState(1);
	const [selection, setSelection] = useState<Selection>(new Set());
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "date",
		direction: "descending",
	});

	const incrementEditsMade = () => setEditsMade((v) => v + 1);

	const accounts = assets.filter(isAccount);

	const editTransaction = (toEdit: Transaction) => {
		setActiveTransaction(toEdit);
		editModalState.onOpen();
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
			sortField: "date",
		},
		{
			getValue: (item) => {
				if (item.notes) {
					return (
						<Tooltip content={item.notes}>
							<span>
								{item.merchant}
								<IconNote
									className="m-1 mt-0 inline leading-0"
									size={14}
								/>
							</span>
						</Tooltip>
					);
				}

				return item.merchant;
			},
			key: "merchant",
			label: t("columns.merchant"),
			sortField: "merchant",
		},
		{
			getValue: (item) => item.subcategory,
			key: "subcategoryId",
			label: t("columns.category"),
			sortField: "category",
		},
		{
			getValue: (item) => item.account,
			key: "accountId",
			label: t("columns.account"),
			sortField: "account",
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
			sortField: "amountCents",
		},
		{
			getValue: (item) => (
				<TransactionRowDropdown
					onDelete={() => {
						void deleteTransactionAsync(item.id);
					}}
					onDuplicate={() => {
						const transactionFromData = data?.transactions.find(
							(transaction) => transaction.id === item.id,
						);

						if (!transactionFromData) {
							return;
						}

						transactionFromData.id = ModalDefaultTransaction.id;
						editTransaction(transactionFromData);
					}}
					onEdit={() => {
						const transactionFromData = data?.transactions.find(
							(transaction) => transaction.id === item.id,
						);

						if (!transactionFromData) {
							return;
						}

						editTransaction(transactionFromData);
					}}
				/>
			),
			key: "actions",
			label: "",
		},
	];

	const searchParams = {
		direction: String(sortDescriptor.direction),
		filter: String(filterValue).trim(),
		limit: String(transactionsPerPage),
		page: String(page),
		sortBy: String(
			columns.find((c) => c.key === sortDescriptor.column)?.sortField ??
				"date",
		),
	};

	const { data, error, isFetching } = useQuery({
		placeholderData: keepPreviousData,
		queryFn: async ({ signal }) => {
			const urlSearchParams = new URLSearchParams(searchParams);

			const response = await fetch(
				`/api/transactions?${urlSearchParams}`,
				{ signal },
			);

			const json: unknown = await response.json();
			const { nextLink: _, ...result } =
				getTransactionsResponseSchema.parse(json);

			return result;
		},
		queryKey: ["transactions", searchParams, editsMade],
		retry: (failureCount, attemptError) => {
			if (failureCount >= 3) {
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

	const isLoading = isFetching || categoriesLoading || assetsLoading;
	const selectedPage = Math.min(page, pageCount);

	return (
		<div className="flex flex-col gap-4">
			<TransactionsTableControls
				onFilterChange={setFilterValue}
				onNewTransaction={() => {
					setActiveTransaction(ModalDefaultTransaction);
					editModalState.onOpen();
				}}
			/>
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
						<TableColumn
							allowsSorting={!!column.sortField}
							key={column.key}
						>
							{column.label}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody
					emptyContent={
						error ? <TableLoadError error={error} /> : undefined
					}
					isLoading={isLoading}
					items={transactionsData}
					loadingContent={<Spinner />}
				>
					{(item) => {
						const { amount, date, id, merchant, type } = item;

						return (
							<TableRow
								key={`${id}-${amount}-${date}-${merchant}-${type}`}
							>
								{(columnKey) => {
									const column = columns.find(
										(c) => c.key === columnKey,
									);

									return (
										<TableCell>
											{column?.getValue(item)}
										</TableCell>
									);
								}}
							</TableRow>
						);
					}}
				</TableBody>
			</Table>
			<TransactionEditModal
				modalState={editModalState}
				onSaveAsync={async (transaction) => {
					await postTransactionAsync(transaction);
					incrementEditsMade();
				}}
				transaction={activeTransaction}
			/>
		</div>
	);
};
