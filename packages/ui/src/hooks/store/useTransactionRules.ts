"use client";

import { useTransactionRuleStore } from "@tally/utilities/state/transactionRule";
import { useStoreState } from "./useStoreState";

export const useTransactionRules = () => {
  const store = useTransactionRuleStore();
  const storeState = useStoreState(store);

  return {
    ...storeState,
    transactionRules: store.transactionRules,
  };
};
