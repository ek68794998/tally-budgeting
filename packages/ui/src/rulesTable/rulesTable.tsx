"use client";

import { invariant } from "@ekumlin/typescript-toolkit/values";
import {
	Code,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import { useTranslations } from "next-intl";
import { type Key, type ReactNode } from "react";
import { ConfirmationModal } from "../common/confirmationModal";
import { useCategories } from "../hooks/store/useCategories";
import { getRuleRowKey, useRulesTable } from "./hooks/useRulesTable";
import { RuleEditModal } from "./ruleEditModal";
import { RuleRowDropdown } from "./ruleRowDropdown";
import { RulesTableControls } from "./rulesTableControls";

export const RulesTable: React.FC = () => {
	const { subcategories } = useCategories();
	const {
		activeRule,
		bulkDeleteModalState,
		bulkDeleteRules,
		deleteModalState,
		displayedRules,
		editModalState,
		handleBulkDeleteAsync,
		handleDeleteAsync,
		handleEdit,
		handleNewRule,
		handleReorderAsync,
		handleSaveAsync,
		isLoading,
		openBulkDeleteModal,
		openDeleteModal,
		selection,
		setFilterValue,
		setSelection,
	} = useRulesTable();
	const t = useTranslations("rules");

	type RuleKey = keyof (typeof displayedRules)[number];
	type ColumnKey = RuleKey | "actions";

	const columns: {
		key: ColumnKey;
		label: string;
	}[] = [
		{ key: "merchantName", label: t("columns.merchant") },
		{ key: "subcategoryId", label: t("columns.category") },
		{ key: "matcher", label: t("columns.regex") },
		{ key: "actions", label: "" },
	];

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
						onDelete={() => openDeleteModal(item)}
						onEdit={() => handleEdit(item)}
						onReorder={(position) =>
							void handleReorderAsync(item, position)
						}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<RulesTableControls
				displayedCount={displayedRules.length}
				onDelete={openBulkDeleteModal}
				onFilterChange={setFilterValue}
				onNewRule={handleNewRule}
				selectedRules={selection}
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
				<TableBody
					isLoading={isLoading}
					items={displayedRules}
					loadingContent={<Spinner />}
				>
					{(item) => (
						<TableRow key={getRuleRowKey(item)}>
							{(columnKey) => (
								<TableCell>
									{getRowValue(item, columnKey)}
								</TableCell>
							)}
						</TableRow>
					)}
				</TableBody>
			</Table>
			<RuleEditModal
				modalState={editModalState}
				onSaveAsync={handleSaveAsync}
				rule={activeRule}
			/>
			<ConfirmationModal
				body={t(
					selection === "all"
						? "listControls.deleteAllBody"
						: "listControls.deleteSelectedBody",
					{ count: bulkDeleteRules.length },
				)}
				confirmText={t("listControls.deleteAction")}
				isDestructive={true}
				modalState={bulkDeleteModalState}
				onConfirmAsync={handleBulkDeleteAsync}
				title={t(
					selection === "all"
						? "listControls.deleteAllTitle"
						: "listControls.deleteSelectedTitle",
					{ count: bulkDeleteRules.length },
				)}
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
