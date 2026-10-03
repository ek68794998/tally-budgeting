import { addToast, type useDisclosure } from "@heroui/react";
import { buildCategory } from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditModalFooter } from "../../modal/editModalFooter";
import { CategoryEditModal } from "./categoryEditModal";

vi.mock("@heroui/react", async (importOriginal) => ({
	...(await importOriginal<typeof import("@heroui/react")>()),
	addToast: vi.fn(),
}));
vi.mock("../../modal/editModalFooter", () => ({
	EditModalFooter: vi.fn(() => <div data-testid="edit-modal-footer" />),
}));

const modalState = mockIncompleteObject<ReturnType<typeof useDisclosure>>({
	isOpen: true,
	onOpenChange: vi.fn(),
});

const lastFooterProps = () => vi.mocked(EditModalFooter).mock.lastCall?.[0];

describe("CategoryEditModal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("edits and saves the category label", async () => {
		const onSaveAsync = vi.fn(() => Promise.resolve());
		const category = buildCategory({ label: "Food" });

		render(
			<CategoryEditModal
				category={category}
				modalState={modalState}
				onSaveAsync={onSaveAsync}
			/>,
		);

		expect(screen.getByText("Edit Food")).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText("Label"), {
			target: { value: "Groceries" },
		});
		await act(() => lastFooterProps()?.onSave(false) ?? Promise.resolve());

		expect(onSaveAsync).toHaveBeenCalledWith({
			...category,
			label: "Groceries",
		});

		act(() => {
			lastFooterProps()?.onSaveError(new Error("nope"));
		});

		expect(addToast).toHaveBeenCalledWith(
			expect.objectContaining({ color: "danger" }),
		);
	});

	it("titles a new category and disables saving without a label", () => {
		render(
			<CategoryEditModal
				category={buildCategory({ label: "" })}
				modalState={modalState}
				onSaveAsync={vi.fn()}
			/>,
		);

		expect(screen.getByText("New Category")).toBeInTheDocument();
		expect(lastFooterProps()?.isSaveDisabled).toBe(true);
	});

	it("stays closed without a category", () => {
		render(
			<CategoryEditModal
				category={null}
				modalState={modalState}
				onSaveAsync={vi.fn()}
			/>,
		);

		expect(screen.queryByTestId("edit-modal-footer")).toBeNull();
	});
});
