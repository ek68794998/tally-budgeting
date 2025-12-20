"use client";

import { type PostTransactionsUploadResponse } from "@tally/data-models/contracts/api/postTransactionsUpload";
import { DefaultSubcategoryId } from "@tally/data-models/contracts/subcategory";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import {
	Accordion,
	AccordionItem,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	useDisclosure,
} from "@heroui/react";
import {
	IconAlertCircle,
	IconAlertTriangle,
	IconCheck,
	IconEditOff,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import z from "zod";
import { ModalDefaultTransactionRule } from "../common/modalDefault";
import { usePostTransactionRule } from "../hooks/api/usePostTransactionRule";
import { RuleEditModal } from "../rulesTable/ruleEditModal";
import { TransactionsUploadResultTransactionRow } from "./transactionsUploadResultTransactionRow";

interface Props {
	response: PostTransactionsUploadResponse;
}

type UnprocessedItem = z.Infer<typeof unprocessedItemSchema>;

const chipIconSize = 16;
const unprocessedItemSchema = z.record(z.string(), z.string());

const IconCategorized = IconCheck;
const IconUncategorized = IconAlertTriangle;
const IconIgnored = IconEditOff;
const IconFailed = IconAlertCircle;

export const TransactionsUploadResultDetails: React.FC<Props> = ({
	response,
}) => {
	const ruleEditModalState = useDisclosure();
	const { postTransactionRuleAsync } = usePostTransactionRule();
	const t = useTranslations("transactions");

	const [merchantToCategorize, setMerchantToCategorize] = useState<
		string | null
	>(null);

	const {
		inputCsvHeaders,
		rowsFailed,
		rowsIgnored,
		transactionsCategorized,
		transactionsUncategorized,
	} = useMemo(() => {
		const itemHeaders: string[] = [];
		const itemsCategorized: Transaction[] = [];
		const itemsUncategorized: Transaction[] = [];
		const itemsFailed: unknown[] = [...response.rowsFailed];
		const itemsIgnored: unknown[] = [...response.rowsIgnored];

		const firstUnprocessedRow = itemsFailed[0] ?? itemsIgnored[0];

		if (firstUnprocessedRow) {
			itemHeaders.push(...Object.keys(firstUnprocessedRow));
		}

		for (const transaction of response.rowsProcessed) {
			if (transaction.subcategoryId === DefaultSubcategoryId) {
				itemsUncategorized.push(transaction);
				continue;
			}

			itemsCategorized.push(transaction);
		}

		return {
			inputCsvHeaders: itemHeaders,
			rowsFailed: itemsFailed,
			rowsIgnored: itemsIgnored,
			transactionsCategorized: itemsCategorized,
			transactionsUncategorized: itemsUncategorized,
		};
	}, [response]);

	const unprocessedItemHeaders = inputCsvHeaders.map((header) => ({
		header,
	}));

	const renderUnprocessedItemTable = (rows: unknown[]) => {
		const items: UnprocessedItem[] = rows.map((row) => {
			const parsedRow = unprocessedItemSchema.safeParse(row);
			return parsedRow.success ? parsedRow.data : {};
		});

		return (
			<Table
				classNames={{
					wrapper:
						"bg-background/80 dark:bg-background/20 backdrop-blur-md backdrop-saturate-150",
				}}
			>
				<TableHeader columns={unprocessedItemHeaders}>
					{({ header }) => (
						<TableColumn key={header}>{header}</TableColumn>
					)}
				</TableHeader>
				<TableBody items={items}>
					{(item) => (
						<TableRow key={JSON.stringify(item)}>
							{(columnKey) => (
								<TableCell
									className="font-mono whitespace-nowrap"
									key={columnKey}
								>
									{item[columnKey]}
								</TableCell>
							)}
						</TableRow>
					)}
				</TableBody>
			</Table>
		);
	};

	const renderTransactions = (transactions: Transaction[]) => {
		const items: Record<string, Transaction & { count: number }> = {};

		for (const transaction of transactions) {
			const count = items[transaction.merchant]?.count || 0;

			items[transaction.merchant] = {
				...transaction,
				count: count + 1,
			};
		}

		return (
			<div className="mb-2 flex flex-col gap-2">
				{Object.values(items).map((item) => (
					<TransactionsUploadResultTransactionRow
						count={item.count}
						key={`${item.id}-${item.merchant}-${item.date}`}
						onCreateRule={() => {
							setMerchantToCategorize(item.merchant);
							ruleEditModalState.onOpen();
						}}
						transaction={item}
					/>
				))}
			</div>
		);
	};

	return (
		<>
			<div className="flex gap-6">
				<Chip
					color="success"
					startContent={<IconCategorized size={chipIconSize} />}
					variant="flat"
				>
					{t("upload.resultCard.countCategorized", {
						count: transactionsCategorized.length,
					})}
				</Chip>
				<Chip
					color="warning"
					startContent={<IconUncategorized size={chipIconSize} />}
					variant="flat"
				>
					{t("upload.resultCard.countUncategorized", {
						count: transactionsUncategorized.length,
					})}
				</Chip>
				<Chip
					color="default"
					startContent={<IconIgnored size={chipIconSize} />}
					variant="flat"
				>
					{t("upload.resultCard.countIgnored", {
						count: rowsIgnored.length,
					})}
				</Chip>
				<Chip
					color="danger"
					startContent={<IconFailed size={chipIconSize} />}
					variant="flat"
				>
					{t("upload.resultCard.countFailed", {
						count: rowsFailed.length,
					})}
				</Chip>
			</div>
			<Accordion selectionMode="multiple">
				<AccordionItem
					isDisabled={transactionsUncategorized.length === 0}
					key="uncategorized"
					startContent={<IconUncategorized />}
					title={t("upload.resultCard.titleUncategorized")}
				>
					{renderTransactions(transactionsUncategorized)}
				</AccordionItem>
				<AccordionItem
					isDisabled={rowsIgnored.length === 0}
					key="ignored"
					startContent={<IconIgnored />}
					title={t("upload.resultCard.titleIgnored")}
				>
					<div className="mb-4 text-xs text-stone-500">
						{t("upload.resultCard.descriptionUnprocessed")}
					</div>
					{renderUnprocessedItemTable(rowsIgnored)}
				</AccordionItem>
				<AccordionItem
					isDisabled={rowsFailed.length === 0}
					key="failed"
					startContent={<IconFailed />}
					title={t("upload.resultCard.titleFailed")}
				>
					<div className="mb-4 text-xs text-stone-500">
						{t("upload.resultCard.descriptionUnprocessed")}
					</div>
					{renderUnprocessedItemTable(rowsFailed)}
				</AccordionItem>
			</Accordion>
			<RuleEditModal
				merchantToMatch={merchantToCategorize ?? undefined}
				modalState={ruleEditModalState}
				onSaveAsync={async (rule) => {
					await postTransactionRuleAsync(rule);
				}}
				rule={ModalDefaultTransactionRule}
			/>
		</>
	);
};
