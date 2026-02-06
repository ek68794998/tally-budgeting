import { type Category } from "@tally/data-models/contracts/category";
import {
	DefaultSubcategory,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { describe, expect, it } from "vitest";
import { createCategoryMap } from "./createCategoryMap";

describe("createCategoryMap", () => {
	it("creates a map with category IDs as keys", () => {
		const categories: Category[] = [
			{ id: 1, label: "Food" },
			{ id: 2, label: "Transport" },
		];
		const subcategories: Subcategory[] = [];

		const result = createCategoryMap(categories, subcategories);

		expect(result).toHaveProperty("1");
		expect(result).toHaveProperty("2");
		expect(Object.keys(result)).toHaveLength(2);
	});

	it("maps each category ID to its category and subcategories", () => {
		const categories: Category[] = [{ id: 1, label: "Food" }];
		const subcategories: Subcategory[] = [
			{
				...DefaultSubcategory,
				budget: { amountCents: 0, frequency: 1, type: "expense" },
				categoryId: 1,
				description: "",
				id: 1,
				label: "Groceries",
			},
		];

		const result = createCategoryMap(categories, subcategories);

		expect(result[1]).toEqual([categories[0], [subcategories[0]]]);
	});

	it("maintains sorted order from sortAndFlattenCategories", () => {
		const categories: Category[] = [
			{ id: 1, label: "Zebra" },
			{ id: 2, label: "Apple" },
		];
		const subcategories: Subcategory[] = [
			{
				...DefaultSubcategory,
				budget: { amountCents: 0, frequency: 1, type: "expense" },
				categoryId: 1,
				description: "",
				id: 1,
				label: "Sub Z",
			},
			{
				...DefaultSubcategory,
				budget: { amountCents: 0, frequency: 1, type: "expense" },
				categoryId: 1,
				description: "",
				id: 2,
				label: "Sub A",
			},
		];

		const result = createCategoryMap(categories, subcategories);

		expect(result[1]?.[1]).toEqual([subcategories[1], subcategories[0]]);
	});

	it("handles empty arrays", () => {
		const result = createCategoryMap([], []);
		expect(result).toEqual({});
	});

	it("creates correct map for multiple categories with mixed subcategories", () => {
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
			{
				...DefaultSubcategory,
				budget: { amountCents: 0, frequency: 1, type: "expense" },
				categoryId: 1,
				description: "",
				id: 3,
				label: "Dining",
			},
		];

		const result = createCategoryMap(categories, subcategories);

		expect(result[1]?.[1]).toHaveLength(2);
		expect(result[2]?.[1]).toHaveLength(1);
		expect(result[1]?.[1]?.[0]?.label).toBe("Dining");
		expect(result[1]?.[1]?.[1]?.label).toBe("Groceries");
	});
});
