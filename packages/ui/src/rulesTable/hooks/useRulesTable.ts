import { type Selection, useDisclosure } from "@heroui/react";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import { withoutId } from "@tally/utilities/object/withoutId";
import { useCallback, useMemo, useState } from "react";
import { ModalDefaultTransactionRule } from "../../common/modalDefault";
import { filterMatches } from "../../filter";
import { useDeleteTransactionRule } from "../../hooks/api/useDeleteTransactionRule";
import { usePatchTransactionRulesReorder } from "../../hooks/api/usePatchTransactionRulesReorder";
import { usePostTransactionRule } from "../../hooks/api/usePostTransactionRule";
import { usePutTransactionRule } from "../../hooks/api/usePutTransactionRule";
import { useTransactionRules } from "../../hooks/store/useTransactionRules";
import { reorderRows } from "../../table/helpers";
import { type ReorderPosition } from "../../table/types";

export const getRuleRowKey = ({ id, merchantName }: TransactionRule) =>
	`${id}-${merchantName}`;

export const useRulesTable = () => {
	const bulkDeleteModalState = useDisclosure();
	const { deleteTransactionRuleAsync } = useDeleteTransactionRule();
	const deleteModalState = useDisclosure();
	const editModalState = useDisclosure();
	const { patchTransactionRulesReorderAsync } =
		usePatchTransactionRulesReorder();
	const { postTransactionRuleAsync } = usePostTransactionRule();
	const { putTransactionRuleAsync } = usePutTransactionRule();
	const {
		isLoading,
		refetch: refetchTransactionRules,
		transactionRules: rules,
	} = useTransactionRules();

	const [activeRule, setActiveRule] = useState<TransactionRule | null>(null);
	const [bulkDeleteRules, setBulkDeleteRules] = useState<TransactionRule[]>(
		[],
	);
	const [filterValue, setFilterValue] = useState("");
	const [isNewRule, setIsNewRule] = useState(false);
	const [selection, setSelection] = useState<Selection>(new Set());

	const sortedRules = useMemo(
		() => [...rules].sort((a, b) => a.priority - b.priority),
		[rules],
	);

	const displayedRules = useMemo(
		() =>
			sortedRules.filter((a) =>
				filterMatches(filterValue, a.merchantName),
			),
		[filterValue, sortedRules],
	);

	const handleDeleteAsync = useCallback(
		async (rule: TransactionRule) => {
			await deleteTransactionRuleAsync(rule.id);
			void refetchTransactionRules();
			setActiveRule(null);
		},
		[deleteTransactionRuleAsync, refetchTransactionRules],
	);

	const handleBulkDeleteAsync = useCallback(async () => {
		const failedRules: TransactionRule[] = [];
		let firstError: unknown = null;

		for (const rule of bulkDeleteRules) {
			try {
				await deleteTransactionRuleAsync(rule.id);
			} catch (error) {
				firstError ??= error;
				failedRules.push(rule);
			}
		}

		void refetchTransactionRules();
		setBulkDeleteRules(failedRules);
		setSelection(new Set(failedRules.map(getRuleRowKey)));

		if (failedRules.length > 0) {
			throw new Error(
				`Failed to delete ${failedRules.length} of ${bulkDeleteRules.length} rules`,
				{ cause: firstError },
			);
		}
	}, [bulkDeleteRules, deleteTransactionRuleAsync, refetchTransactionRules]);

	const openEditModal = useCallback(
		(rule: TransactionRule, isNew: boolean) => {
			setActiveRule(rule);
			setIsNewRule(isNew);
			editModalState.onOpen();
		},
		[editModalState],
	);

	const handleEdit = useCallback(
		(rule: TransactionRule) => openEditModal(rule, false),
		[openEditModal],
	);

	const handleNewRule = useCallback(
		() => openEditModal(ModalDefaultTransactionRule, true),
		[openEditModal],
	);

	const handleReorderAsync = useCallback(
		async (rule: TransactionRule, position: ReorderPosition) => {
			const ruleId = rule.id;
			const reorderedRows = reorderRows(sortedRules, ruleId, position);
			const reorderedIds = reorderedRows.map((row) => row.id);

			await patchTransactionRulesReorderAsync(reorderedIds);

			void refetchTransactionRules();
			setActiveRule(null);
		},
		[
			patchTransactionRulesReorderAsync,
			refetchTransactionRules,
			sortedRules,
		],
	);

	const handleSaveAsync = useCallback(
		async (rule: TransactionRule) => {
			await (isNewRule
				? postTransactionRuleAsync(withoutId(rule))
				: putTransactionRuleAsync(rule));
			void refetchTransactionRules();
			editModalState.onClose();
			setActiveRule(null);
		},
		[
			editModalState,
			isNewRule,
			postTransactionRuleAsync,
			putTransactionRuleAsync,
			refetchTransactionRules,
		],
	);

	const openBulkDeleteModal = useCallback(
		(rulesSelection: Selection) => {
			setBulkDeleteRules(
				rulesSelection === "all"
					? displayedRules
					: displayedRules.filter((rule) =>
							rulesSelection.has(getRuleRowKey(rule)),
						),
			);
			bulkDeleteModalState.onOpen();
		},
		[bulkDeleteModalState, displayedRules],
	);

	const openDeleteModal = useCallback(
		(rule: TransactionRule) => {
			setActiveRule(rule);
			deleteModalState.onOpen();
		},
		[deleteModalState],
	);

	return useMemo(
		() => ({
			activeRule,
			bulkDeleteModalState,
			bulkDeleteRules,
			deleteModalState,
			displayedRules,
			editModalState,
			filterValue,
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
		}),
		[
			activeRule,
			bulkDeleteModalState,
			bulkDeleteRules,
			deleteModalState,
			displayedRules,
			editModalState,
			filterValue,
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
		],
	);
};
