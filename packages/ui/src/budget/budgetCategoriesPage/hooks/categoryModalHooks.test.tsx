import {
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { act, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationModal } from "../../../common/confirmationModal";
import { useDeleteCategory } from "../../../hooks/api/useDeleteCategory";
import { useDeleteSubcategory } from "../../../hooks/api/useDeleteSubcategory";
import { usePostCategory } from "../../../hooks/api/usePostCategory";
import { usePostSubcategory } from "../../../hooks/api/usePostSubcategory";
import { useCategories } from "../../../hooks/store/useCategories";
import { CategoryEditModal } from "../categoryEditModal";
import { SubcategoryEditModal } from "../subcategoryEditModal";
import { useCategoryEditModal } from "./useCategoryEditModal";
import { useCategoryDeleteModal } from "./useDeleteCategoryModal";
import { useSubcategoryDeleteModal } from "./useDeleteSubcategoryModal";
import { useSubcategoryEditModal } from "./useSubcategoryEditModal";

vi.mock("../../../common/confirmationModal", () => ({
	ConfirmationModal: vi.fn(() => <div data-testid="confirmation-modal" />),
}));
vi.mock("../categoryEditModal", () => ({
	CategoryEditModal: vi.fn(() => <div data-testid="category-edit-modal" />),
}));
vi.mock("../subcategoryEditModal", () => ({
	SubcategoryEditModal: vi.fn(() => (
		<div data-testid="subcategory-edit-modal" />
	)),
}));
vi.mock("../../../hooks/api/useDeleteCategory", () => ({
	useDeleteCategory: vi.fn(),
}));
vi.mock("../../../hooks/api/useDeleteSubcategory", () => ({
	useDeleteSubcategory: vi.fn(),
}));
vi.mock("../../../hooks/api/usePostCategory", () => ({
	usePostCategory: vi.fn(),
}));
vi.mock("../../../hooks/api/usePostSubcategory", () => ({
	usePostSubcategory: vi.fn(),
}));
vi.mock("../../../hooks/store/useCategories", () => ({
	useCategories: vi.fn(),
}));

const deleteCategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
const deleteSubcategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
const postCategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
const postSubcategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
const refetch = vi.fn(() => Promise.resolve());

const category = buildCategory({ label: "Food" });
const subcategory = buildSubcategory({ label: "Coffee" });

const lastProps = <T,>(component: (props: T) => unknown): T => {
	const props = vi.mocked(component).mock.lastCall?.[0];

	if (!props) {
		throw new Error("The component was not rendered.");
	}

	return props;
};

describe("category page modal hooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useDeleteCategory).mockReturnValue({ deleteCategoryAsync });
		vi.mocked(useDeleteSubcategory).mockReturnValue({
			deleteSubcategoryAsync,
		});
		vi.mocked(usePostCategory).mockReturnValue({ postCategoryAsync });
		vi.mocked(usePostSubcategory).mockReturnValue({ postSubcategoryAsync });
		vi.mocked(useCategories).mockReturnValue({
			categories: [],
			error: null,
			isLoading: false,
			refetch,
			subcategories: [],
		});
	});

	it.each([
		{
			apiCall: deleteCategoryAsync,
			name: "useCategoryDeleteModal",
			renderOpened: () => {
				const { result } = renderHook(useCategoryDeleteModal);
				act(() => {
					result.current.open(category);
				});
				render(result.current.render());
			},
		},
		{
			apiCall: deleteSubcategoryAsync,
			name: "useSubcategoryDeleteModal",
			renderOpened: () => {
				const { result } = renderHook(useSubcategoryDeleteModal);
				act(() => {
					result.current.open(subcategory);
				});
				render(result.current.render());
			},
		},
	])("$name confirms deletion of the opened item, then refetches", async ({
		apiCall,
		renderOpened,
	}) => {
		renderOpened();

		const props = lastProps(ConfirmationModal);

		expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
		expect(props.isDestructive).toBe(true);
		expect(props.modalState.isOpen).toBe(true);

		await act(() => props.onConfirmAsync());

		expect(apiCall).toHaveBeenCalledWith(1);
		expect(refetch).toHaveBeenCalledOnce();
	});

	it.each([
		useCategoryDeleteModal,
		useSubcategoryDeleteModal,
	])("%o refuses to confirm before an item is opened", async (useHook) => {
		const { result } = renderHook(useHook);
		render(result.current.render());

		await expect(
			lastProps(ConfirmationModal).onConfirmAsync(),
		).rejects.toThrow(/must be defined/);
	});

	it("saves a category from the edit modal, then refetches", async () => {
		const { result } = renderHook(useCategoryEditModal);

		act(() => {
			result.current.open(category);
		});
		render(result.current.render());

		const props = lastProps(CategoryEditModal);

		expect(props.category).toBe(category);
		expect(props.modalState.isOpen).toBe(true);

		await act(() => props.onSaveAsync(category));

		expect(postCategoryAsync).toHaveBeenCalledWith(category);
		expect(refetch).toHaveBeenCalledOnce();
	});

	it("saves a subcategory from the edit modal, then refetches", async () => {
		const { result } = renderHook(useSubcategoryEditModal);

		act(() => {
			result.current.open(subcategory);
		});
		render(result.current.render());

		const props = lastProps(SubcategoryEditModal);

		expect(props.subcategory).toBe(subcategory);
		expect(props.modalState.isOpen).toBe(true);

		await act(() => props.onSaveAsync(subcategory));

		expect(postSubcategoryAsync).toHaveBeenCalledWith(subcategory);
		expect(refetch).toHaveBeenCalledOnce();
	});
});
