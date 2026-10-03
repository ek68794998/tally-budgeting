import { addToast, type useDisclosure } from "@heroui/react";
import {
	buildSubcategory,
	buildTransactionRule,
} from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelectSubcategory } from "../common/selectSubcategory";
import { EditModalFooter } from "../modal/editModalFooter";
import { RuleEditMerchantMatchAlert } from "./ruleEditMerchantMatchAlert";
import { RuleEditModal } from "./ruleEditModal";

vi.mock("@heroui/react", async (importOriginal) => ({
	...(await importOriginal<typeof import("@heroui/react")>()),
	addToast: vi.fn(),
}));
vi.mock("../common/selectSubcategory", () => ({
	SelectSubcategory: vi.fn(() => <div data-testid="select-subcategory" />),
}));
vi.mock("../modal/editModalFooter", () => ({
	EditModalFooter: vi.fn(() => <div data-testid="edit-modal-footer" />),
}));
vi.mock("./ruleEditMerchantMatchAlert", () => ({
	RuleEditMerchantMatchAlert: vi.fn(() => <div data-testid="match-alert" />),
}));

const modalState = mockIncompleteObject<ReturnType<typeof useDisclosure>>({
	isOpen: true,
	onOpenChange: vi.fn(),
});

const lastFooterProps = () => vi.mocked(EditModalFooter).mock.lastCall?.[0];
const lastAlertProps = () =>
	vi.mocked(RuleEditMerchantMatchAlert).mock.lastCall?.[0];

const coffee = buildTransactionRule({
	active: false,
	matcher: { flags: "i", pattern: "coffee" },
	merchantName: "Coffee",
});

const renderModal = (
	props: Partial<React.ComponentProps<typeof RuleEditModal>> = {},
) => {
	const onSaveAsync = vi.fn(() => Promise.resolve());

	render(
		<RuleEditModal
			modalState={modalState}
			onSaveAsync={onSaveAsync}
			rule={coffee}
			{...props}
		/>,
	);

	return { onSaveAsync };
};

describe("RuleEditModal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("edits and saves an existing rule as active", async () => {
		const { onSaveAsync } = renderModal({ merchantToMatch: "SQ *COFFEE" });

		expect(screen.getByText("Edit {ruleName}")).toBeInTheDocument();
		expect(lastAlertProps()).toEqual({
			isRegexMismatch: false,
			merchantToMatch: "SQ *COFFEE",
		});

		fireEvent.click(screen.getByText("Case-sensitive?"));
		act(() => {
			vi.mocked(SelectSubcategory).mock.lastCall?.[0].onChange(
				buildSubcategory({ id: 9 }),
			);
		});

		expect(lastAlertProps()?.isRegexMismatch).toBe(true);

		await act(() => lastFooterProps()?.onSave(false) ?? Promise.resolve());

		expect(onSaveAsync).toHaveBeenCalledWith({
			...coffee,
			active: true,
			matcher: { flags: "", pattern: "coffee" },
			subcategoryId: 9,
		});

		act(() => {
			lastFooterProps()?.onSaveError(new Error("nope"));
		});

		expect(addToast).toHaveBeenCalledOnce();
	});

	it("derives the expression from a new rule's merchant until it is edited", () => {
		renderModal({
			rule: buildTransactionRule({
				matcher: { flags: "i", pattern: "" },
				merchantName: "",
			}),
		});

		expect(screen.getByText("New Rule")).toBeInTheDocument();
		expect(lastFooterProps()?.isSaveDisabled).toBe(true);

		const [merchantInput, regexInput] = screen.getAllByRole("textbox");
		fireEvent.change(merchantInput ?? document.body, {
			target: { value: "Coffee" },
		});

		expect(regexInput).toHaveValue("Coffee");
		expect(lastFooterProps()?.isSaveDisabled).toBe(false);

		fireEvent.change(regexInput ?? document.body, {
			target: { value: "(" },
		});
		fireEvent.change(merchantInput ?? document.body, {
			target: { value: "Coffee Shop" },
		});

		expect(regexInput).toHaveValue("(");
		expect(lastFooterProps()?.isSaveDisabled).toBe(true);
	});

	it("stays closed without a rule", () => {
		renderModal({ rule: null });

		expect(screen.queryByTestId("edit-modal-footer")).toBeNull();
	});
});
