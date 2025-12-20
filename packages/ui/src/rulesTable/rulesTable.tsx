"use client";

import { invariant } from "@ekumlin/typescript-toolkit/values";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import {
	Code,
	type Selection,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	useDisclosure,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { type Key, type ReactNode, useState } from "react";
import { ConfirmationModal } from "../common/confirmationModal";
import { useDeleteTransactionRule } from "../hooks/api/useDeleteTransactionRule";
import { usePostTransactionRule } from "../hooks/api/usePostTransactionRule";
import { useCategories } from "../hooks/store/useCategories";
import { useTransactionRules } from "../hooks/store/useTransactionRules";
import { RuleEditModal } from "./ruleEditModal";
import { RuleRowDropdown } from "./ruleRowDropdown";
import { RulesTableControls } from "./rulesTableControls";

export const RulesTable: React.FC = () => {
	type RuleKey = keyof (typeof rules)[number];
	type ColumnKey = RuleKey | "actions";

	const { subcategories } = useCategories();
	const { deleteTransactionRuleAsync } = useDeleteTransactionRule();
	const deleteModalState = useDisclosure();
	const editModalState = useDisclosure();
	const { postTransactionRuleAsync } = usePostTransactionRule();
	const { refetch: refetchTransactionRules, transactionRules: rules } =
		useTransactionRules();
	const t = useTranslations("rules");

	const [activeRule, setActiveRule] = useState<TransactionRule | null>(null);
	const [filterValue, setFilterValue] = useState("");
	const [selection, setSelection] = useState<Selection>(new Set());

	const columns: {
		key: ColumnKey;
		label: string;
	}[] = [
		{ key: "merchantName", label: t("columns.merchant") },
		{ key: "subcategoryId", label: t("columns.category") },
		{ key: "matcher", label: t("columns.regex") },
		{ key: "actions", label: "" },
	];

	const displayedRules = rules.filter(
		(a) =>
			!filterValue ||
			a.merchantName
				.toLocaleLowerCase()
				.includes(filterValue.toLocaleLowerCase()),
	);

	const handleDeleteAsync = async (rule: TransactionRule) => {
		await deleteTransactionRuleAsync(rule.id);
		void refetchTransactionRules();
		setActiveRule(null);
	};

	const handleEdit = (rule: TransactionRule) => {
		setActiveRule(rule);
		editModalState.onOpen();
	};

	const handleSaveAsync = async (rule: TransactionRule) => {
		await postTransactionRuleAsync(rule);
		void refetchTransactionRules();
		setActiveRule(null);
	};

	const getRowValue = (item: TransactionRule, key: Key): ReactNode => {
		switch (key) {
			case "merchantName":
				return item.merchantName;
			case "subcategoryId":
				return subcategories.find((c) => c.id === item.subcategoryId)
					?.label;
			case "matcher":
				const regexString = `/${item.matcher.pattern}/${item.matcher.flags}`;
				return <Code>{regexString}</Code>;
			case "actions":
				return (
					<RuleRowDropdown
						onDelete={() => {
							setActiveRule(item);
							deleteModalState.onOpen();
						}}
						onEdit={() => handleEdit(item)}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<RulesTableControls
				onFilterChange={setFilterValue}
				onNewRule={() =>
					handleEdit({
						id: -1,
						isActive: true,
						matcher: {
							flags: "i",
							pattern: "",
						},
						merchantName: "",
						priority: 0,
						subcategoryId: -1,
					})
				}
			/>
			<Table
				aria-label={t("title")}
				classNames={{
					wrapper:
						"bg-background/80 dark:bg-background/20 backdrop-blur-md backdrop-saturate-150",
				}}
				onRowAction={() => "noop"}
				onSelectionChange={setSelection}
				selectedKeys={selection}
				selectionMode="multiple"
			>
				<TableHeader columns={columns}>
					{(column) => (
						<TableColumn key={column.key}>
							{column.label}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody items={displayedRules}>
					{(item) => {
						const { id, merchantName } = item;

						return (
							<TableRow key={`${id}-${merchantName}`}>
								{(columnKey) => (
									<TableCell>
										{getRowValue(item, columnKey)}
									</TableCell>
								)}
							</TableRow>
						);
					}}
				</TableBody>
			</Table>
			<RuleEditModal
				modalState={editModalState}
				onSaveAsync={handleSaveAsync}
				rule={activeRule}
			/>
			<ConfirmationModal
				body={t("listControls.deleteBody", {
					merchant: activeRule?.merchantName ?? "",
				})}
				confirmText={t("listControls.deleteAction")}
				isDestructive={true}
				modalState={deleteModalState}
				onConfirmAsync={async () => {
					invariant(activeRule, "Active rule must be defined");
					await handleDeleteAsync(activeRule);
				}}
				title={t("listControls.deleteTitle")}
			/>
		</div>
	);
};
