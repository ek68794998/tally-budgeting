import { isString } from "@ekumlin/typescript-toolkit/types";

const fromCents = (cents: number | string): number => {
	const centsValue = isString(cents) ? Number.parseInt(cents, 10) : cents;
	return Math.round(centsValue) / 100.0;
};

const toCents = (dollars: number | string): number => {
	const dollarsValue = isString(dollars)
		? Number.parseInt(dollars, 10)
		: dollars;
	return Math.round(dollarsValue * 100.0);
};

export const Dollars = {
	fromCents,
	toCents,
};
