import { describe, expect, it } from "vitest";
import { reorderRows } from "./helpers";

interface TestItem {
	id: number;
	name: string;
}

interface TestItemString {
	id: string;
	value: number;
}

describe("table helpers", () => {
	describe("reorderRows", () => {
		describe("moving up", () => {
			it.each([
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description:
						"should move an item up one position from the middle",
					expected: [
						{ id: 2, name: "b" },
						{ id: 1, name: "a" },
						{ id: 3, name: "c" },
					],
					id: 2,
				},
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description: "should move an item up from the bottom",
					expected: [
						{ id: 1, name: "a" },
						{ id: 3, name: "c" },
						{ id: 2, name: "b" },
					],
					id: 3,
				},
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description:
						"should not change array when moving first item up",
					expected: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					id: 1,
				},
			])("$description", ({ array, expected, id }) => {
				const result = reorderRows(array, id, "up");
				expect(result).toEqual(expected);
				expect(result).not.toBe(array);
			});
		});

		describe("moving down", () => {
			it.each([
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description:
						"should move an item down one position from the middle",
					expected: [
						{ id: 1, name: "a" },
						{ id: 3, name: "c" },
						{ id: 2, name: "b" },
					],
					id: 2,
				},
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description: "should move an item down from the top",
					expected: [
						{ id: 2, name: "b" },
						{ id: 1, name: "a" },
						{ id: 3, name: "c" },
					],
					id: 1,
				},
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description:
						"should not change array when moving last item down",
					expected: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					id: 3,
				},
			])("$description", ({ array, expected, id }) => {
				const result = reorderRows(array, id, "down");
				expect(result).toEqual(expected);
				expect(result).not.toBe(array);
			});
		});

		describe("moving to top", () => {
			it.each([
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description:
						"should move an item from the middle to the top",
					expected: [
						{ id: 2, name: "b" },
						{ id: 1, name: "a" },
						{ id: 3, name: "c" },
					],
					id: 2,
				},
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
						{ id: 4, name: "d" },
					],
					description:
						"should move an item from the bottom to the top",
					expected: [
						{ id: 4, name: "d" },
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					id: 4,
				},
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description:
						"should not change array when moving first item to top",
					expected: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					id: 1,
				},
			])("$description", ({ array, expected, id }) => {
				const result = reorderRows(array, id, "top");
				expect(result).toEqual(expected);
				expect(result).not.toBe(array);
			});
		});

		describe("moving to bottom", () => {
			it.each([
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description:
						"should move an item from the middle to the bottom",
					expected: [
						{ id: 1, name: "a" },
						{ id: 3, name: "c" },
						{ id: 2, name: "b" },
					],
					id: 2,
				},
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
						{ id: 4, name: "d" },
					],
					description:
						"should move an item from the top to the bottom",
					expected: [
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
						{ id: 4, name: "d" },
						{ id: 1, name: "a" },
					],
					id: 1,
				},
				{
					array: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					description:
						"should not change array when moving last item to bottom",
					expected: [
						{ id: 1, name: "a" },
						{ id: 2, name: "b" },
						{ id: 3, name: "c" },
					],
					id: 3,
				},
			])("$description", ({ array, expected, id }) => {
				const result = reorderRows(array, id, "bottom");
				expect(result).toEqual(expected);
				expect(result).not.toBe(array);
			});
		});

		describe("with string IDs", () => {
			it.each([
				{
					array: [
						{ id: "a", value: 1 },
						{ id: "b", value: 2 },
						{ id: "c", value: 3 },
					],
					description: "should handle string IDs when moving up",
					expected: [
						{ id: "b", value: 2 },
						{ id: "a", value: 1 },
						{ id: "c", value: 3 },
					],
					id: "b",
					position: "up" as const,
				},
				{
					array: [
						{ id: "a", value: 1 },
						{ id: "b", value: 2 },
						{ id: "c", value: 3 },
					],
					description:
						"should handle string IDs when moving to bottom",
					expected: [
						{ id: "b", value: 2 },
						{ id: "c", value: 3 },
						{ id: "a", value: 1 },
					],
					id: "a",
					position: "bottom" as const,
				},
			])("$description", ({ array, expected, id, position }) => {
				const result = reorderRows<TestItemString>(array, id, position);
				expect(result).toEqual(expected);
				expect(result).not.toBe(array);
			});
		});

		describe("edge cases", () => {
			it("should handle single-item array", () => {
				const array: TestItem[] = [{ id: 1, name: "a" }];
				const result = reorderRows(array, 1, "down");
				expect(result).toEqual(array);
				expect(result).not.toBe(array);
			});

			it("should handle two-item array moving first down", () => {
				const array: TestItem[] = [
					{ id: 1, name: "a" },
					{ id: 2, name: "b" },
				];
				const result = reorderRows(array, 1, "down");
				expect(result).toEqual([
					{ id: 2, name: "b" },
					{ id: 1, name: "a" },
				]);
			});

			it("should handle two-item array moving last up", () => {
				const array: TestItem[] = [
					{ id: 1, name: "a" },
					{ id: 2, name: "b" },
				];
				const result = reorderRows(array, 2, "up");
				expect(result).toEqual([
					{ id: 2, name: "b" },
					{ id: 1, name: "a" },
				]);
			});

			it("should return original array when ID not found", () => {
				const array: TestItem[] = [
					{ id: 1, name: "a" },
					{ id: 2, name: "b" },
				];
				const result = reorderRows(array, 999, "up");
				expect(result).toEqual(array);
				expect(result).not.toBe(array);
			});

			it("should handle empty array", () => {
				const array: TestItem[] = [];
				const result = reorderRows(array, 1, "up");
				expect(result).toEqual([]);
				expect(result).not.toBe(array);
			});
		});

		describe("immutability", () => {
			it("should not mutate the original array", () => {
				const array: TestItem[] = [
					{ id: 1, name: "a" },
					{ id: 2, name: "b" },
					{ id: 3, name: "c" },
				];
				const original = [...array];
				reorderRows(array, 2, "up");
				expect(array).toEqual(original);
			});

			it("should create a shallow copy of items", () => {
				const item1 = { id: 1, name: "a" };
				const item2 = { id: 2, name: "b" };
				const item3 = { id: 3, name: "c" };
				const array = [item1, item2, item3];

				const result = reorderRows(array, 2, "up");

				expect(result[0]).toBe(item2);
				expect(result[1]).toBe(item1);
				expect(result[2]).toBe(item3);
			});
		});
	});
});
