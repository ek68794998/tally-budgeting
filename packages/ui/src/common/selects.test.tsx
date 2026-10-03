import { Autocomplete, Select } from "@heroui/react";
import {
	buildAsset,
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAssets } from "../hooks/store/useAssets";
import { useCategories } from "../hooks/store/useCategories";
import { buildSelection } from "../testing/heroUi";
import { SelectAccount } from "./selectAccount";
import { SelectCategory } from "./selectCategory";
import { SelectProvider } from "./selectProvider";
import { SelectSubcategory } from "./selectSubcategory";

vi.mock("@heroui/react", async () => {
	const { heroUiCollectionStubs } = await import("../testing/heroUi.js");
	return heroUiCollectionStubs;
});
vi.mock("../dataProviderIcons/dataProviderIcon", () => ({
	DataProviderIcon: vi.fn(() => <span data-testid="provider-icon" />),
}));
vi.mock("../hooks/store/useAssets", () => ({ useAssets: vi.fn() }));
vi.mock("../hooks/store/useCategories", () => ({ useCategories: vi.fn() }));

const lastSelectProps = () => vi.mocked(Select).mock.lastCall?.[0];
const lastAutocompleteProps = () => vi.mocked(Autocomplete).mock.lastCall?.[0];

const checking = buildAsset({ id: 1, name: "Checking", provider: "chase" });
const brokerage = buildAsset({ id: 2, name: "Brokerage" });
const closed = buildAsset({ active: false, id: 3, name: "Closed" });

const food = buildCategory({ id: 1, label: "Food" });
const housing = buildCategory({ id: 2, label: "Housing" });
const coffee = buildSubcategory({ categoryId: 1, id: 10, label: "Coffee" });
const groceries = buildSubcategory({
	categoryId: 1,
	id: 11,
	label: "Groceries",
});
const rent = buildSubcategory({ categoryId: 2, id: 20, label: "Rent" });
const uncategorized = buildSubcategory({
	categoryId: -1,
	id: -1,
	label: "Uncategorized",
});

describe("select inputs", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useAssets).mockReturnValue({
			assets: [checking, closed, brokerage],
			error: null,
			isLoading: false,
			refetch: vi.fn(),
		});
		vi.mocked(useCategories).mockReturnValue({
			categories: [
				housing,
				food,
				buildCategory({ id: -1, label: "Uncategorized" }),
			],
			error: null,
			isLoading: false,
			refetch: vi.fn(),
			subcategories: [rent, groceries, coffee, uncategorized],
		});
	});

	describe("SelectAccount", () => {
		it.each([
			{ expected: ["Brokerage", "Checking"], props: {} },
			{
				expected: ["Brokerage", "Checking", "Closed"],
				props: { showInactive: true },
			},
			{ expected: ["Checking"], props: { showOnlyWithProvider: true } },
		])("lists accounts for $props", ({ expected, props }) => {
			render(
				<SelectAccount
					onChange={vi.fn()}
					value={undefined}
					{...props}
				/>,
			);

			const items = screen.getByTestId("select").textContent;

			expect(expected.every((name) => items.includes(name))).toBe(true);
			expect(items.includes("Closed")).toBe(expected.includes("Closed"));
			expect(items).toContain(
				expected.includes("Checking") ? "Chase Bank" : "",
			);
		});

		it.each([
			{ key: "2", shouldChange: true, value: 1 },
			{ key: "1", shouldChange: false, value: checking },
			{ key: "99", shouldChange: false, value: 1 },
		])("reports a change to account $key only when it differs", ({
			key,
			shouldChange,
			value,
		}) => {
			const onChange = vi.fn();
			render(
				<SelectAccount
					label="Account"
					onChange={onChange}
					value={value}
				/>,
			);

			expect(lastSelectProps()?.selectedKeys).toEqual(["1"]);

			lastSelectProps()?.onSelectionChange?.(buildSelection(key));

			expect(onChange).toHaveBeenCalledTimes(shouldChange ? 1 : 0);
		});
	});

	describe("SelectProvider", () => {
		it("lists every provider and reports a newly selected one", () => {
			const onChange = vi.fn();
			render(
				<SelectProvider
					label="Provider"
					onChange={onChange}
					value="chase"
				/>,
			);

			expect(
				screen.getByText("Fidelity Investments"),
			).toBeInTheDocument();
			expect(lastSelectProps()?.selectedKeys).toEqual(["chase"]);

			lastSelectProps()?.onSelectionChange?.(buildSelection("chase"));
			lastSelectProps()?.onSelectionChange?.(buildSelection("fidelity"));

			expect(onChange).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ id: "fidelity" }),
			);
		});

		it("selects nothing without a provider", () => {
			render(<SelectProvider onChange={vi.fn()} value={null} />);

			expect(lastSelectProps()?.selectedKeys).toEqual([]);
		});
	});

	describe("SelectCategory", () => {
		it.each([
			{ expected: food, key: 1 },
			{
				expected: buildCategory({ id: -1, label: "Uncategorized" }),
				key: null,
			},
		])("sorts categories and reports selection of $key", ({
			expected,
			key,
		}) => {
			const onChange = vi.fn();
			render(
				<SelectCategory
					label="Category"
					onChange={onChange}
					value={2}
				/>,
			);

			const props = lastAutocompleteProps();

			expect(props?.placeholder).toBe("Housing");
			expect(props?.items).toEqual([
				food,
				housing,
				buildCategory({ id: -1, label: "Uncategorized" }),
			]);

			props?.onSelectionChange?.(key);

			expect(onChange).toHaveBeenCalledWith(expected);
		});

		it("accepts a category object as the value and rejects unknown ids", () => {
			render(<SelectCategory onChange={vi.fn()} value={food} />);

			const props = lastAutocompleteProps();

			expect(props?.selectedKey).toBe(1);
			expect(() => props?.onSelectionChange?.(99)).toThrow(
				"Category must be present within the data set",
			);
		});
	});

	describe("SelectSubcategory", () => {
		it("groups subcategories by category and filters by the typed text", () => {
			render(
				<SelectSubcategory
					label="Category"
					onChange={vi.fn()}
					value={10}
				/>,
			);

			expect(lastAutocompleteProps()?.placeholder).toBe("Coffee");
			expect(lastAutocompleteProps()?.items).toEqual([
				{ id: 1, label: "Food", subcategories: [coffee, groceries] },
				{ id: 2, label: "Housing", subcategories: [rent] },
				{
					id: -1,
					label: "Uncategorized",
					subcategories: [uncategorized],
				},
			]);

			act(() => {
				lastAutocompleteProps()?.onInputChange?.("gro");
			});

			expect(lastAutocompleteProps()?.items).toEqual([
				{ id: 1, label: "Food", subcategories: [groceries] },
			]);
		});

		it.each([
			{ expected: rent, key: 20 },
			{ expected: uncategorized, key: null },
		])("reports selection of $key", ({ expected, key }) => {
			const onChange = vi.fn();
			render(<SelectSubcategory onChange={onChange} value={coffee} />);

			lastAutocompleteProps()?.onSelectionChange?.(key);

			expect(onChange).toHaveBeenCalledWith(expected);
		});

		it("rejects an unknown subcategory", () => {
			render(<SelectSubcategory onChange={vi.fn()} value={10} />);

			expect(() => {
				lastAutocompleteProps()?.onSelectionChange?.(99);
			}).toThrow("Subcategory must be present within the data set");
		});
	});
});
