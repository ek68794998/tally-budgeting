import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import { type ODataLiteFilterExpression } from "./types";

export const buildODataLiteFilter = (
	expressions: ODataLiteFilterExpression[],
): string => {
	if (expressions.length === 0) {
		return "";
	}

	return expressions
		.map(({ field, operator, value }) => {
			const formattedValue = formatODataValue(value);
			return `${field} ${operator} ${formattedValue}`;
		})
		.join(" and ");
};

const formatODataValue = (value: unknown): string => {
	if (isNullOrUndefined(value)) {
		return "null";
	}

	if (typeof value === "string") {
		return `'${value.replace(/'/g, "''")}'`;
	}

	if (typeof value === "boolean") {
		return value.toString();
	}

	if (typeof value === "number") {
		return value.toString();
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	throw new Error(`Unsupported value type: ${typeof value}`);
};
