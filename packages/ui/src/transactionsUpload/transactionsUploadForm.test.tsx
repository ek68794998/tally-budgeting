import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionsUploadForm } from "./transactionsUploadForm";

vi.mock("./transactionsUploadAccount", () => ({
  TransactionsUploadAccount: vi.fn(() => <div data-testid="account" />),
}));
vi.mock("./transactionsUploadProvider", () => ({
  TransactionsUploadProvider: vi.fn(({ children }: React.PropsWithChildren) => (
    <div data-testid="provider">{children}</div>
  )),
}));
vi.mock("./transactionsUploadResult", () => ({
  TransactionsUploadResult: vi.fn(() => <div data-testid="result" />),
}));
vi.mock("./transactionsUploadWidget", () => ({
  TransactionsUploadWidget: vi.fn(() => <div data-testid="widget" />),
}));

describe("TransactionsUploadForm", () => {
  it("composes the upload steps inside the provider", () => {
    render(<TransactionsUploadForm />);

    const provider = screen.getByTestId("provider");

    for (const testId of ["account", "widget", "result"]) {
      expect(provider).toContainElement(screen.getByTestId(testId));
    }
  });
});
