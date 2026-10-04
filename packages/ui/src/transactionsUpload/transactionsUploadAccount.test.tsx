import { buildAsset } from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelectAccount } from "../common/selectAccount";
import { TransactionsUploadAccount } from "./transactionsUploadAccount";
import { useTransactionsUploadContext } from "./transactionsUploadProvider";

vi.mock("../common/selectAccount", () => ({
  SelectAccount: vi.fn(() => <div data-testid="select-account" />),
}));
vi.mock("./transactionsUploadProvider", () => ({
  useTransactionsUploadContext: vi.fn(),
}));

const setAccount = vi.fn();

const renderWithAccount = (
  account: ReturnType<typeof useTransactionsUploadContext>["account"],
) => {
  vi.mocked(useTransactionsUploadContext).mockReturnValue(
    mockIncompleteObject<ReturnType<typeof useTransactionsUploadContext>>({
      account,
      setAccount,
    }),
  );

  render(<TransactionsUploadAccount />);

  return vi.mocked(SelectAccount).mock.lastCall?.[0];
};

describe("TransactionsUploadAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asks for an account with a provider when none is selected", () => {
    const props = renderWithAccount(null);

    expect(props).toMatchObject({
      onChange: setAccount,
      showOnlyWithProvider: true,
      value: undefined,
    });
    expect(props?.selectProps?.description).toBe(
      "Please select an account associated with a known financial provider.",
    );
  });

  it("describes the selected account's provider", () => {
    const props = renderWithAccount(buildAsset({ id: 3, provider: "chase" }));

    render(props?.selectProps?.description);

    expect(props?.value).toBe(3);
    expect(screen.getByText("Chase Bank").closest("div")?.textContent).toBe(
      "This account is associated with Chase Bank.",
    );
  });
});
