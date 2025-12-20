import { type TransactionRule } from "../contracts/transactionRule";
import { type TransactionRuleRow } from "../database/transactionRuleRow";

export const convertTransactionRuleToTransactionRuleRow = (
	transactionRule: TransactionRule,
): TransactionRuleRow => {
	const { id, isActive, matcher, merchantName, priority, subcategoryId } =
		transactionRule;

	return {
		flags: matcher.flags,
		id,
		isActive: isActive ? 1 : 0,
		merchant: merchantName,
		pattern: matcher.pattern,
		priority,
		subcategoryId,
	};
};

export const convertTransactionRuleRowToTransactionRule = (
	row: TransactionRuleRow,
): TransactionRule => {
	const { flags, id, isActive, merchant, pattern, priority, subcategoryId } =
		row;

	return {
		id,
		isActive: isActive > 0,
		matcher: { flags, pattern },
		merchantName: merchant,
		priority,
		subcategoryId,
	};
};
