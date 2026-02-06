import { type Category } from "@tally/data-models/contracts/category";
import {
	DefaultSubcategory,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { describe, expect, it } from "vitest";
import { sortAndFlattenCategories } from "./sortAndFlattenCategories";

describe("sortAndFlattenCategories", () => {
	it("sorts categories alphabetically by label", () => {
		const categories: Category[] = [
			{ id: 1, label: "Zebra" },
			{ id: 2, label: "Apple" },
			{ id: 3, label: "Mango" },
		];
		const subcategories: Subcategory[] = [];

		const result = sortAndFlattenCategories(categories, subcategories);

		expect(result).toEqual([
			[{ id: 2, label: "Apple" }, []],
			[{ id: 3, label: "Mango" }, []],
			[{ id: 1, label: "Zebra" }, []],
		]);
	});

	it("sorts subcategories alphabetically by label within each category", () => {
		const categories: Category[] = [{ id: 1, label: "Food" }];
		const subcategories: Subcategory[] = [
			{
				...DefaultSubcategory,
				budget: { amountCents: 0, frequency: 1, type: "expense" },
				categoryId: 1,
				description: "",
				id: 1,
				label: "Snacks",
			},
			{
				...DefaultSubcategory,
				budget: { amountCents: 0, frequency: 1, type: "expense" },
				categoryId: 1,
				description: "",
				id: 2,
				label: "Groceries",
			},
			{
				...DefaultSubcategory,
				budget: { amountCents: 0, frequency: 1, type: "expense" },
				categoryId: 1,
				description: "",
				id: 3,
				label: "Dining",
			},
		];

		const result = sortAndFlattenCategories(categories, subcategories);

		expect(result[0]?.[1]).toEqual([
			subcategories[2], // Dining
			subcategories[1], // Groceries
			subcategories[0], // Snacks
		]);
	});

	it("filters subcategories to only include those matching the category", () => {
		const categories: Category[] = [
			{ id: 1, label: "Food" },
			{ id: 2, label: "Transport" },
		];
		const subcategories: Subcategory[] = [
			{
				...DefaultSubcategory,
				budget: { amountCents: 0, frequency: 1, type: "expense" },
				categoryId: 1,
				description: "",
				id: 1,
				label: "Groceries",
			},
			{
				...DefaultSubcategory,
				budget: { amountCents: 0, frequency: 1, type: "expense" },
				categoryId: 2,
				description: "",
				id: 2,
				label: "Gas",
			},
		];

		const result = sortAndFlattenCategories(categories, subcategories);

		expect(result).toEqual([
			[{ id: 1, label: "Food" }, [subcategories[0]]],
			[{ id: 2, label: "Transport" }, [subcategories[1]]],
		]);
	});

	it("handles empty arrays", () => {
		const result = sortAndFlattenCategories([], []);
		expect(result).toEqual([]);
	});

	it("handles categories with no subcategories", () => {
		const categories: Category[] = [
			{ id: 1, label: "Food" },
			{ id: 2, label: "Transport" },
		];

		const result = sortAndFlattenCategories(categories, []);

		expect(result).toEqual([
			[{ id: 1, label: "Food" }, []],
			[{ id: 2, label: "Transport" }, []],
		]);
	});

	it("performs case-insensitive sorting", () => {
		const categories: Category[] = [
			{ id: 1, label: "food" },
			{ id: 2, label: "Apple" },
		];

		const result = sortAndFlattenCategories(categories, []);

		expect(result[0]?.[0].label).toBe("Apple");
		expect(result[1]?.[0].label).toBe("food");
	});
});
