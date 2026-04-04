import { describe, expect, it } from "vitest";
import z from "zod";
import { validateIsStatementRow } from "./helpers";

describe("validateIsStatementRow", () => {
	const schema = z.object({
		field: z.string().min(1),
	});

	it("should return true for a valid statement row", () => {
		const validationErrors: string[] = [];
		const result = validateIsStatementRow(
			{ field: "value" },
			schema,
			validationErrors,
		);
		expect(result).toBe(true);
		expect(validationErrors).toHaveLength(0);
	});

	it("should return false for an invalid statement row", () => {
		const validationErrors: string[] = [];
		const result = validateIsStatementRow(
			{ field: "" },
			schema,
			validationErrors,
		);
		expect(result).toBe(false);
		expect(validationErrors).toEqual([
			"field: Too small: expected string to have >=1 characters",
		]);
	});
});
