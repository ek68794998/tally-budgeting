import {
  type TransactionRule,
  type TransactionRuleFields,
} from "../contracts/transactionRule";
import { type TxnRuleRow } from "../database/txnRuleRow";

export const convertTransactionRuleFieldsToTxnRuleRow = (
  transactionRule: TransactionRuleFields,
): Omit<TxnRuleRow, "id"> => {
  const { active, matcher, merchantName, priority, subcategoryId } =
    transactionRule;

  return {
    active,
    flags: matcher.flags,
    merchant: merchantName,
    pattern: matcher.pattern,
    priority,
    subcategory: subcategoryId,
  };
};

export const convertTransactionRuleToTxnRuleRow = (
  transactionRule: TransactionRule,
): TxnRuleRow => ({
  ...convertTransactionRuleFieldsToTxnRuleRow(transactionRule),
  id: transactionRule.id,
});

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
