import { addToast, type useDisclosure } from "@heroui/react";
import { buildTransaction } from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditModalFooter } from "../modal/editModalFooter";
import { TransactionEditModal } from "./transactionEditModal";

vi.mock("@heroui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@heroui/react")>()),
  addToast: vi.fn(),
}));
vi.mock("../common/selectAccount", () => ({
  SelectAccount: vi.fn(() => <div data-testid="select-account" />),
}));
vi.mock("../common/selectSubcategory", () => ({
  SelectSubcategory: vi.fn(() => <div data-testid="select-subcategory" />),
}));
vi.mock("../modal/editModalFooter", () => ({
  EditModalFooter: vi.fn(() => <div data-testid="edit-modal-footer" />),
}));
vi.mock("./transactionEditDirectionButtons", () => ({
  TransactionEditDirectionButtons: vi.fn(() => <div data-testid="direction" />),
}));
vi.mock("./transactionHappinessSelect", () => ({
  TransactionHappinessSelect: vi.fn(() => <div data-testid="happiness" />),
}));

const coffee = buildTransaction({ accountId: 1, amountCents: 4_50 });

const modalState = mockIncompleteObject<ReturnType<typeof useDisclosure>>({
  isOpen: true,
  onOpenChange: vi.fn(),
});

const lastFooterProps = () => vi.mocked(EditModalFooter).mock.lastCall?.[0];

describe("TransactionEditModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("edits an existing transaction and closes after saving", async () => {
    const onSaveAsync = vi.fn(() => Promise.resolve());

    render(
      <TransactionEditModal
        modalState={modalState}
        onSaveAsync={onSaveAsync}
        transaction={coffee}
      />,
    );

    expect(
      screen.getByText("Edit $4.50 transaction with Coffee Shop"),
    ).toBeInTheDocument();
    expect(lastFooterProps()).toMatchObject({
      isSaveDisabled: false,
      showCreateMore: false,
    });

    await act(() => lastFooterProps()?.onSave(false) ?? Promise.resolve());

    expect(onSaveAsync).toHaveBeenCalledWith({
      ...coffee,
      date: "2025-01-15T12:00:00Z",
    });
    expect(addToast).not.toHaveBeenCalled();
  });

  it("offers creating more for a new transaction, then resets and confirms", async () => {
    render(
      <TransactionEditModal
        modalState={modalState}
        onSaveAsync={vi.fn(() => Promise.resolve())}
        transaction={{ ...coffee, merchant: "" }}
      />,
    );

    expect(screen.getByText("New Transaction")).toBeInTheDocument();
    expect(lastFooterProps()).toMatchObject({
      isSaveDisabled: true,
      showCreateMore: true,
    });

    await act(() => lastFooterProps()?.onSave(true) ?? Promise.resolve());

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "success" }),
    );
  });

  it("toasts when saving fails", () => {
    render(
      <TransactionEditModal
        modalState={modalState}
        onSaveAsync={vi.fn()}
        transaction={coffee}
      />,
    );

    lastFooterProps()?.onSaveError(new Error("nope"));

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger" }),
    );
  });

  it("stays closed without a transaction", () => {
    render(
      <TransactionEditModal
        modalState={modalState}
        onSaveAsync={vi.fn()}
        transaction={null}
      />,
    );

    expect(screen.queryByTestId("edit-modal-footer")).toBeNull();
  });
});
