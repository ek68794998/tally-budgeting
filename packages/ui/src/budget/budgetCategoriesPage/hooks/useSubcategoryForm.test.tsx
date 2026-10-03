import { buildSubcategory } from "@tally/data-models/testing/fixtures";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSubcategoryForm } from "./useSubcategoryForm";

const rent = buildSubcategory({
	budget: { amountCents: 1200_00, frequency: 12, type: "expense" },
	percentNeeds: 60,
	percentSavings: 10,
});

const renderForm = (subcategory = rent, isModalOpen = true) =>
	renderHook(
		(props) => useSubcategoryForm(props.subcategory, props.isModalOpen),
		{
			initialProps: { isModalOpen, subcategory },
		},
	);

describe("useSubcategoryForm", () => {
	it("loads the subcategory when the modal opens", () => {
		const { result } = renderForm();

		expect(result.current).toMatchObject({
			budgetAmount: 1200,
			budgetFrequency: 12,
			budgetType: "expense",
			canSave: true,
			label: "Rent",
			pctNeeds: 60,
			pctSavings: 10,
			pctWants: 30,
		});
		expect(result.current.buildSubcategory()).toEqual(rent);
	});

	it("stays empty and cannot save while closed", () => {
		const { result } = renderForm(rent, false);

		expect(result.current.label).toBe("");
		expect(result.current.canSave).toBe(false);
	});

	it.each([
		{ expected: { pctNeeds: 90, pctSavings: 0, pctWants: 10 }, needs: 90 },
		{ expected: { pctNeeds: 20, pctSavings: 50, pctWants: 30 }, needs: 20 },
	])("keeps needs + wants within 100% when needs become $needs", ({
		expected,
		needs,
	}) => {
		const { result } = renderForm();

		act(() => {
			result.current.updatePctNeeds(needs);
		});

		expect(result.current).toMatchObject(expected);
	});

	it.each([
		{ expected: { pctNeeds: 15, pctSavings: 0, pctWants: 85 }, wants: 85 },
		{ expected: { pctNeeds: 60, pctSavings: 30, pctWants: 10 }, wants: 10 },
	])("keeps needs + wants within 100% when wants become $wants", ({
		expected,
		wants,
	}) => {
		const { result } = renderForm();

		act(() => {
			result.current.updatePctWants(wants);
		});

		expect(result.current).toMatchObject(expected);
	});

	it.each([
		{ expectedSavings: 100, isPreTaxSavings: true },
		{ expectedSavings: 0, isPreTaxSavings: false },
	])("saves income with $expectedSavings% savings when pre-tax is $isPreTaxSavings", ({
		expectedSavings,
		isPreTaxSavings,
	}) => {
		const { result } = renderForm();

		act(() => {
			result.current.setBudgetType("income");
			result.current.setIsPreTaxSavings(isPreTaxSavings);
			result.current.setBudgetAmount(50);
			result.current.setBudgetFrequency(1);
			result.current.setCategoryId(4);
			result.current.setDescription("Paycheck");
			result.current.setLabel("Salary");
		});

		expect(result.current.buildSubcategory()).toEqual({
			...rent,
			budget: { amountCents: 50_00, frequency: 1, type: "income" },
			categoryId: 4,
			description: "Paycheck",
			label: "Salary",
			percentNeeds: 0,
			percentSavings: expectedSavings,
		});
	});

	it("recognizes existing pre-tax income savings", () => {
		const { result } = renderForm(
			buildSubcategory({
				budget: { amountCents: 0, frequency: 1, type: "income" },
				percentNeeds: 0,
				percentSavings: 100,
			}),
		);

		expect(result.current.isPreTaxSavings).toBe(true);
	});

	it("refuses to build without a subcategory", () => {
		const { result } = renderHook(() => useSubcategoryForm(null, true));

		expect(() => result.current.buildSubcategory()).toThrow(
			"Subcategory must be defined.",
		);
	});
});
