"use client";

import { useTransactionRuleStore } from "@tally/utilities/state/transactionRule";
import { useEffect } from "react";

export const useTransactionRules = () => {
	const store = useTransactionRuleStore();

	useEffect(() => {
		if (!store.isHydrated && !store.isFetching) {
			void store.fetchTransactionRules();
		}
	}, [store]);

	return {
		error: store.error,
		isLoading: !store.isHydrated || store.isFetching,
		refetch: store.fetchTransactionRules,
		transactionRules: store.transactionRules,
	};
};
