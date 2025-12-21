import { type TransactionRule } from "../contracts/transactionRule";
import { type TxnRuleRow } from "../database/txnRuleRow";

export const convertTransactionRuleToTxnRuleRow = (
	transactionRule: TransactionRule,
): TxnRuleRow => {
	const { active, id, matcher, merchantName, priority, subcategoryId } =
		transactionRule;

	return {
		active,
		flags: matcher.flags,
		id,
		merchant: merchantName,
		pattern: matcher.pattern,
		priority,
		subcategory: subcategoryId,
	};
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
