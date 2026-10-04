import { type useDisclosure } from "@heroui/react";
import { buildTransaction } from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationModal } from "../common/confirmationModal";
import { ContentUnavailableView } from "../contentUnavailableView/contentUnavailableView";
import { TransactionEditModal } from "./transactionEditModal";
import { TransactionRowDropdown } from "./transactionRowDropdown";
import { TransactionsTable } from "./transactionsTable";
import { TransactionsTableControls } from "./transactionsTableControls";
import { type TransactionTableData } from "./types";
import { useTransactionsTable } from "./useTransactionsTable";

vi.mock("./useTransactionsTable", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./useTransactionsTable.js")>()),
  useTransactionsTable: vi.fn(),
}));
vi.mock("../common/confirmationModal", () => ({
  ConfirmationModal: vi.fn(() => <div data-testid="confirmation-modal" />),
}));
vi.mock("../contentUnavailableView/contentUnavailableView", () => ({
  ContentUnavailableView: vi.fn(() => (
    <div data-testid="content-unavailable" />
  )),
}));
vi.mock("../table/tableLoadError", () => ({
  TableLoadError: vi.fn(() => <div data-testid="table-load-error" />),
}));
vi.mock("./transactionEditModal", () => ({
  TransactionEditModal: vi.fn(() => (
    <div data-testid="transaction-edit-modal" />
  )),
}));
vi.mock("./transactionRowDropdown", () => ({
  TransactionRowDropdown: vi.fn(() => <div data-testid="row-dropdown" />),
}));
vi.mock("./transactionsTableControls", () => ({
  TransactionsTableControls: vi.fn(() => <div data-testid="table-controls" />),
}));

const coffeeRow: TransactionTableData = {
  account: "Checking",
  amount: "$4.50",
  date: "January 15, 2025",
  id: 7,
  merchant: "Coffee Shop",
  notes: "latte",
  subcategory: "Coffee",
  type: "debit",
};
const salaryRow: TransactionTableData = {
  ...coffeeRow,
  amount: "$100.00",
  id: 8,
  merchant: "Employer",
  notes: "",
  type: "credit",
};

type TableState = ReturnType<typeof useTransactionsTable>;

const modalState = mockIncompleteObject<ReturnType<typeof useDisclosure>>({
  isOpen: false,
});

const buildState = (overrides: Partial<TableState> = {}): TableState => ({
  activeTransaction: buildTransaction(),
  confirmDeleteAsync: vi.fn(),
  deleteModalState: modalState,
  duplicateTransaction: vi.fn(),
  editModalState: modalState,
  editTransaction: vi.fn(),
  error: null,
  filterValue: "",
  isLoading: false,
  pageCount: 2,
  requestDelete: vi.fn(),
  saveTransactionAsync: vi.fn(),
  selectedPage: 1,
  selection: new Set(),
  setFilterValue: vi.fn(),
  setPage: vi.fn(),
  setSelection: vi.fn(),
  setSortDescriptor: vi.fn(),
  sortDescriptor: { column: "date", direction: "descending" },
  startNewTransaction: vi.fn(),
  transactionsData: [coffeeRow, salaryRow],
  transactionToDelete: coffeeRow,
  ...overrides,
});

describe("TransactionsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a row per transaction with its type and pagination", () => {
    const state = buildState();
    vi.mocked(useTransactionsTable).mockReturnValue(state);

    render(<TransactionsTable />);

    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    expect(screen.getByText("Employer")).toBeInTheDocument();
    expect(screen.getByText("Expense")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(vi.mocked(TransactionsTableControls).mock.lastCall?.[0]).toEqual({
      onFilterChange: state.setFilterValue,
      onNewTransaction: state.startNewTransaction,
    });
    expect(vi.mocked(TransactionEditModal).mock.lastCall?.[0]).toMatchObject({
      onSaveAsync: state.saveTransactionAsync,
      transaction: state.activeTransaction,
    });
    expect(vi.mocked(ConfirmationModal).mock.lastCall?.[0]).toMatchObject({
      isDestructive: true,
      onConfirmAsync: state.confirmDeleteAsync,
    });
  });

  it("wires each row's actions to the table state", () => {
    const state = buildState();
    vi.mocked(useTransactionsTable).mockReturnValue(state);

    render(<TransactionsTable />);

    const firstRowActions = vi
      .mocked(TransactionRowDropdown)
      .mock.calls.map(([props]) => props)
      .at(0);

    firstRowActions?.onDelete();
    firstRowActions?.onDuplicate();
    firstRowActions?.onEdit();

    expect(state.requestDelete).toHaveBeenCalledWith(coffeeRow);
    expect(state.duplicateTransaction).toHaveBeenCalledWith(7);
    expect(state.editTransaction).toHaveBeenCalledWith(7);
  });

  it.each([
    { expectedText: "No transactions found.", filterValue: "" },
    {
      expectedText: "No transactions matched your search.",
      filterValue: "x",
    },
  ])("explains an empty table (filter: '$filterValue')", ({
    expectedText,
    filterValue,
  }) => {
    vi.mocked(useTransactionsTable).mockReturnValue(
      buildState({ filterValue, pageCount: 0, transactionsData: [] }),
    );

    render(<TransactionsTable />);

    expect(vi.mocked(ContentUnavailableView).mock.lastCall?.[0]).toMatchObject({
      primaryText: expectedText,
    });
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("shows the load error instead of the empty state", () => {
    vi.mocked(useTransactionsTable).mockReturnValue(
      buildState({ error: new Error("boom"), transactionsData: [] }),
    );

    render(<TransactionsTable />);

    expect(screen.getByTestId("table-load-error")).toBeInTheDocument();
  });
});
