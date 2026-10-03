import { addToast, type useDisclosure } from "@heroui/react";
import {
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelectCategory } from "../../common/selectCategory";
import { EditModalFooter } from "../../modal/editModalFooter";
import { buildSelection, heroUiCollectionStubs } from "../../testing/heroUi";
import { SubcategoryEditModal } from "./subcategoryEditModal";

vi.mock("@heroui/react", async (importOriginal) => {
	const { withHeroUiStubs } = await import("../../testing/heroUi.js");
	return { ...(await withHeroUiStubs(importOriginal)), addToast: vi.fn() };
});
vi.mock("../../common/selectCategory", () => ({
	SelectCategory: vi.fn(() => <div data-testid="select-category" />),
}));
vi.mock("../../modal/editModalFooter", () => ({
	EditModalFooter: vi.fn(() => <div data-testid="edit-modal-footer" />),
}));

const modalState = mockIncompleteObject<ReturnType<typeof useDisclosure>>({
	isOpen: true,
	onOpenChange: vi.fn(),
});

const lastFooterProps = () => vi.mocked(EditModalFooter).mock.lastCall?.[0];

const selectBudgetType = (key: string) => {
	act(() => {
		vi.mocked(
			heroUiCollectionStubs.Select,
		).mock.lastCall?.[0].onSelectionChange?.(buildSelection(key));
	});
};

const renderModal = (subcategory = buildSubcategory()) => {
	const onSaveAsync = vi.fn(() => Promise.resolve());

	render(
		<SubcategoryEditModal
			modalState={modalState}
			onSaveAsync={onSaveAsync}
			subcategory={subcategory}
		/>,
	);

	return { onSaveAsync };
};

describe("SubcategoryEditModal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("edits and saves an expense subcategory", async () => {
		const rent = buildSubcategory({ label: "Rent" });
		const { onSaveAsync } = renderModal(rent);

		expect(screen.getByText("Edit Rent")).toBeInTheDocument();
		expect(screen.getByLabelText("Needs")).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText("Description"), {
			target: { value: "Apartment" },
		});
		act(() => {
			vi.mocked(SelectCategory).mock.lastCall?.[0].onChange(
				buildCategory({ id: 4 }),
			);
		});
		await act(() => lastFooterProps()?.onSave(false) ?? Promise.resolve());

		expect(onSaveAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				categoryId: 4,
				description: "Apartment",
			}),
		);

		act(() => {
			lastFooterProps()?.onSaveError(new Error("nope"));
		});

		expect(addToast).toHaveBeenCalledOnce();
	});

	it.each([
		{ budgetType: "income", needs: 0, preTax: 1 },
		{ budgetType: "neutral", needs: 0, preTax: 0 },
		{ budgetType: "expense", needs: 1, preTax: 0 },
	])("shows type-specific fields for $budgetType", ({
		budgetType,
		needs,
		preTax,
	}) => {
		renderModal(buildSubcategory({ label: "" }));

		expect(screen.getByText("New Subcategory")).toBeInTheDocument();

		selectBudgetType(budgetType);

		expect(screen.queryAllByLabelText("Needs")).toHaveLength(needs);
		expect(screen.queryAllByText("Used for Pre-Tax Savings?")).toHaveLength(
			preTax,
		);
	});

	it("stays closed without a subcategory", () => {
		render(
			<SubcategoryEditModal
				modalState={modalState}
				onSaveAsync={vi.fn()}
				subcategory={null}
			/>,
		);

		expect(screen.queryByTestId("edit-modal-footer")).toBeNull();
	});
});
