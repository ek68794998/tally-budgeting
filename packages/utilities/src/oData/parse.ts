import {
	type ODataLiteFilterExpression,
	type ODataLiteFilterOperator,
	oDataLiteFilterOperatorSchema,
} from "./types";

export const parseODataLiteFilter = (
	filter: string,
): ODataLiteFilterExpression[] => {
	if (!filter.trim()) {
		return [];
	}

	const expressions = splitOnAnd(filter);

	return expressions.map((expr) => {
		const trimmed = expr.trim();
		const operators: ODataLiteFilterOperator[] = Object.values(
			oDataLiteFilterOperatorSchema.enum,
		);

		for (const operator of operators) {
			const operatorPos = findOperatorPosition(trimmed, operator);

			if (operatorPos !== -1) {
				const field = trimmed.slice(0, operatorPos).trim();
				const rawValue = trimmed
					.slice(operatorPos + operator.length)
					.trim();
				const value = parseODataValue(rawValue);

				return { field, operator, value };
			}
		}

		throw new Error(`Invalid filter expression: ${expr}`);
	});
};

const splitOnAnd = (filter: string): string[] => {
	const expressions: string[] = [];
	let current = "";
	let inString = false;
	const andPattern = " and ";

	for (let i = 0; i < filter.length; i++) {
		if (filter[i] === "'") {
			if (i + 1 < filter.length && filter[i + 1] === "'") {
				current += "''";
				i++;
				continue;
			}

			inString = !inString;
			current += filter[i];
			continue;
		}

		if (
			!inString &&
			filter.slice(i, i + andPattern.length) === andPattern
		) {
			expressions.push(current);
			current = "";
			i += andPattern.length - 1;
			continue;
		}

		current += filter[i];
	}

	if (current) {
		expressions.push(current);
	}

	return expressions;
};

const findOperatorPosition = (expr: string, operator: string): number => {
	let inString = false;
	const pattern = ` ${operator} `;

	for (let i = 0; i <= expr.length - pattern.length; i++) {
		if (expr[i] === "'") {
			if (i + 1 < expr.length && expr[i + 1] === "'") {
				i++;
				continue;
			}

			inString = !inString;
		}

		if (!inString && expr.slice(i, i + pattern.length) === pattern) {
			return i + 1;
		}
	}

	return -1;
};

const parseODataValue = (raw: string): unknown => {
	if (raw === "null") {
		return null;
	}

	if (raw === "true") {
		return true;
	}

	if (raw === "false") {
		return false;
	}

	if (raw.startsWith("'") && raw.endsWith("'")) {
		return raw.slice(1, -1).replace(/''/g, "'");
	}

	const num = Number(raw);

	if (!Number.isNaN(num)) {
		return num;
	}

	const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

	if (isoDateRegex.test(raw)) {
		return new Date(raw);
	}

	return raw;
};
