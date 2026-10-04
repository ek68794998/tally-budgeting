import {
  type TransactionRule,
  type TransactionRuleFields,
} from "../contracts/transactionRule";
import { type TxnRuleRow } from "../database/txnRuleRow";

export const convertTransactionRuleFieldsToTxnRuleRow = (
  transactionRule: TransactionRuleFields,
): Omit<TxnRuleRow, "id" | "priority"> => {
  const { active, matcher, merchantName, subcategoryId } = transactionRule;

  return {
    active,
    flags: matcher.flags,
    merchant: merchantName,
    pattern: matcher.pattern,
    subcategory: subcategoryId,
  };
};

export const convertTransactionRuleToTxnRuleRow = (
  transactionRule: TransactionRule,
): TxnRuleRow => ({
  ...convertTransactionRuleFieldsToTxnRuleRow(transactionRule),
  id: transactionRule.id,
  priority: transactionRule.priority,
});

export const getTransactionRuleFields = (
  transactionRule: TransactionRule,
): TransactionRuleFields => {
  const { active, matcher, merchantName, subcategoryId } = transactionRule;

  return { active, matcher, merchantName, subcategoryId };
};

export const convertTxnRuleRowToTransactionRule = (
  row: TxnRuleRow,
): TransactionRule => {
  const { active, flags, id, merchant, pattern, priority, subcategory } = row;

  return {
    active,
    id,
    matcher: { flags, pattern },
    merchantName: merchant,
    priority,
    subcategoryId: subcategory,
  };
};
