import {
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { withoutId } from "@tally/utilities/object/withoutId";
import { act, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationModal } from "../../../common/confirmationModal";
import {
	ModalDefaultCategory,
	ModalDefaultSubcategory,
} from "../../../common/modalDefault";
import { useDeleteCategory } from "../../../hooks/api/useDeleteCategory";
import { useDeleteSubcategory } from "../../../hooks/api/useDeleteSubcategory";
import { usePostCategory } from "../../../hooks/api/usePostCategory";
import { usePostSubcategory } from "../../../hooks/api/usePostSubcategory";
import { usePutCategory } from "../../../hooks/api/usePutCategory";
import { usePutSubcategory } from "../../../hooks/api/usePutSubcategory";
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
vi.mock("../../../hooks/api/usePutCategory", () => ({
	usePutCategory: vi.fn(),
}));
vi.mock("../../../hooks/api/usePutSubcategory", () => ({
	usePutSubcategory: vi.fn(),
}));
vi.mock("../../../hooks/store/useCategories", () => ({
	useCategories: vi.fn(),
}));

const deleteCategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
const deleteSubcategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
const postCategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
const postSubcategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
const putCategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
const putSubcategoryAsync = vi.fn(() => Promise.resolve({ success: true }));
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
		vi.mocked(usePutCategory).mockReturnValue({ putCategoryAsync });
		vi.mocked(usePutSubcategory).mockReturnValue({ putSubcategoryAsync });
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

	const openCategoryModal = (
		open: (hook: ReturnType<typeof useCategoryEditModal>) => void,
	) => {
		const { result } = renderHook(useCategoryEditModal);
		act(() => {
			open(result.current);
		});
		render(result.current.render());

		const {
			category: item,
			modalState,
			onSaveAsync,
		} = lastProps(CategoryEditModal);

		return { item, modalState, onSaveAsync };
	};

	const openSubcategoryModal = (
		open: (hook: ReturnType<typeof useSubcategoryEditModal>) => void,
	) => {
		const { result } = renderHook(useSubcategoryEditModal);
		act(() => {
			open(result.current);
		});
		render(result.current.render());

		const {
			modalState,
			onSaveAsync,
			subcategory: item,
		} = lastProps(SubcategoryEditModal);

		return { item, modalState, onSaveAsync };
	};

	it.each([
		{
			expectedCall: [postCategoryAsync, withoutId(ModalDefaultCategory)],
			expectedItem: ModalDefaultCategory,
			name: "creates a new category",
			renderOpened: () => openCategoryModal((hook) => hook.openNew()),
		},
		{
			expectedCall: [putCategoryAsync, category],
			expectedItem: category,
			name: "updates an existing category",
			renderOpened: () =>
				openCategoryModal((hook) => hook.openEdit(category)),
		},
		{
			expectedCall: [
				postSubcategoryAsync,
				withoutId({
					...ModalDefaultSubcategory,
					categoryId: category.id,
				}),
			],
			expectedItem: {
				...ModalDefaultSubcategory,
				categoryId: category.id,
			},
			name: "creates a new subcategory in the given category",
			renderOpened: () =>
				openSubcategoryModal((hook) => hook.openNew(category)),
		},
		{
			expectedCall: [putSubcategoryAsync, subcategory],
			expectedItem: subcategory,
			name: "updates an existing subcategory",
			renderOpened: () =>
				openSubcategoryModal((hook) => hook.openEdit(subcategory)),
		},
	] as const)("the edit modal $name, then refetches", async ({
		expectedCall: [apiCall, expectedArgument],
		expectedItem,
		renderOpened,
	}) => {
		const { item, modalState, onSaveAsync } = renderOpened();

		expect(item).toEqual(expectedItem);
		expect(modalState.isOpen).toBe(true);

		await act(() => onSaveAsync(dangerouslyCoerceType(item)));

		expect(apiCall).toHaveBeenCalledExactlyOnceWith(expectedArgument);
		expect(refetch).toHaveBeenCalledOnce();

		for (const otherCall of [
			postCategoryAsync,
			postSubcategoryAsync,
			putCategoryAsync,
			putSubcategoryAsync,
		].filter((call) => call !== apiCall)) {
			expect(otherCall).not.toHaveBeenCalled();
		}
	});
});
