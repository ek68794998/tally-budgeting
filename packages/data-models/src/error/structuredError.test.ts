import { describe, expect, it } from "vitest";
import { StructuredError } from "./structuredError";

describe("StructuredError", () => {
	it("creates error with message and code", () => {
		const error = new StructuredError("Something went wrong", "http500");

		expect(error.message).toBe("Something went wrong");
		expect(error.code).toBe("http500");
		expect(error.name).toBe("StructuredError");
		expect(error.params).toBeUndefined();
	});

	it("creates error with params", () => {
		const params = { action: "delete", userId: "123" };
		const error = new StructuredError("Failed action", "http403", params);

		expect(error.params).toEqual(params);
	});

	it("is instance of Error", () => {
		const error = new StructuredError("Test", "http500");

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(StructuredError);
	});
});
