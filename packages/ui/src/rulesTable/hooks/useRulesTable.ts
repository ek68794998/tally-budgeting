import { type Selection, useDisclosure } from "@heroui/react";
import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import { useCallback, useMemo, useState } from "react";
import { filterMatches } from "../../filter";
import { useDeleteTransactionRule } from "../../hooks/api/useDeleteTransactionRule";
import { usePostTransactionRule } from "../../hooks/api/usePostTransactionRule";
import { useTransactionRules } from "../../hooks/store/useTransactionRules";

export const useRulesTable = () => {
	const { deleteTransactionRuleAsync } = useDeleteTransactionRule();
	const deleteModalState = useDisclosure();
	const editModalState = useDisclosure();
	const { postTransactionRuleAsync } = usePostTransactionRule();
	const {
		isLoading,
		refetch: refetchTransactionRules,
		transactionRules: rules,
	} = useTransactionRules();

	const [activeRule, setActiveRule] = useState<TransactionRule | null>(null);
	const [filterValue, setFilterValue] = useState("");
	const [selection, setSelection] = useState<Selection>(new Set());

	const displayedRules = rules.filter((a) =>
		filterMatches(filterValue, a.merchantName),
	);

	const handleDeleteAsync = useCallback(
		async (rule: TransactionRule) => {
			await deleteTransactionRuleAsync(rule.id);
			void refetchTransactionRules();
			setActiveRule(null);
		},
		[deleteTransactionRuleAsync, refetchTransactionRules],
	);

	const handleEdit = useCallback(
		(rule: TransactionRule) => {
			setActiveRule(rule);
			editModalState.onOpen();
		},
		[editModalState],
	);

	const handleNewRule = useCallback(() => {
		handleEdit({
			active: true,
			id: -1,
			matcher: {
				flags: "i",
				pattern: "",
			},
			merchantName: "",
			priority: 0,
			subcategoryId: -1,
		});
	}, [handleEdit]);

	const handleSaveAsync = useCallback(
		async (rule: TransactionRule) => {
			await postTransactionRuleAsync(rule);
			void refetchTransactionRules();
			setActiveRule(null);
		},
		[postTransactionRuleAsync, refetchTransactionRules],
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
			deleteModalState,
			displayedRules,
			editModalState,
			filterValue,
			handleDeleteAsync,
			handleEdit,
			handleNewRule,
			handleSaveAsync,
			isLoading,
			openDeleteModal,
			selection,
			setFilterValue,
			setSelection,
		}),
		[
			activeRule,
			deleteModalState,
			displayedRules,
			editModalState,
			filterValue,
			handleDeleteAsync,
			handleEdit,
			handleNewRule,
			handleSaveAsync,
			isLoading,
			openDeleteModal,
			selection,
		],
	);
};
