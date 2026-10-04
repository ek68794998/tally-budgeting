import { addToast } from "@heroui/react";
import { buildAsset } from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTransactionsUploadContext } from "./transactionsUploadProvider";
import { TransactionsUploadWidget } from "./transactionsUploadWidget";

vi.mock("@heroui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@heroui/react")>()),
  addToast: vi.fn(),
}));
vi.mock("./transactionsUploadProvider", () => ({
  useTransactionsUploadContext: vi.fn(),
}));

type UploadContext = ReturnType<typeof useTransactionsUploadContext>;
type UploadCallbacks = Parameters<UploadContext["setUploadCallbacks"]>[0];

const context = {
  setSelectedFile: vi.fn(),
  setUploadCallbacks: vi.fn<(callbacks: UploadCallbacks) => void>(),
  setUploadResponse: vi.fn(),
  uploadFile: vi.fn(() => Promise.resolve(true)),
};

const validResponse = JSON.stringify({
  rowsFailed: [],
  rowsIgnored: [],
  rowsProcessed: [],
  success: true,
});

const renderWidget = (overrides: Partial<UploadContext> = {}) => {
  vi.mocked(useTransactionsUploadContext).mockReturnValue(
    mockIncompleteObject<UploadContext>({
      account: buildAsset({ provider: "chase" }),
      selectedFile: null,
      ...context,
      ...overrides,
    }),
  );

  const rendered = render(<TransactionsUploadWidget />);
  const callbacks = context.setUploadCallbacks.mock.lastCall?.[0];

  if (!callbacks) {
    throw new Error("Upload callbacks were not registered.");
  }

  return { ...rendered, callbacks };
};

const getProgressValue = (container: HTMLElement) =>
  container.querySelector("[role=progressbar]")?.getAttribute("aria-valuenow");

describe("TransactionsUploadWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads a dropped CSV file for validation", async () => {
    const { container } = renderWidget();
    const file = new File(["a,b"], "bank.csv", { type: "text/csv" });

    const input = container.querySelector("input");
    await act(async () => {
      fireEvent.change(input ?? document.body, {
        target: { files: [file] },
      });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(context.uploadFile).toHaveBeenCalledWith(file, true);
    });
    expect(
      screen.getByText("Drag and drop a file here, or click to browse"),
    ).toBeInTheDocument();
  });

  it("tracks upload progress and accepts a valid response", () => {
    const file = new File(["a,b"], "bank.csv");
    const { callbacks, container } = renderWidget({ selectedFile: file });

    act(() => {
      callbacks.onUploadStart(file);
      callbacks.onUploadProgress(100);
      callbacks.onUploadFinish(validResponse, 200, "OK");
    });

    expect(context.setSelectedFile).toHaveBeenCalledWith(file);
    expect(context.setUploadResponse).toHaveBeenCalledWith(
      JSON.parse(validResponse),
    );
    expect(getProgressValue(container)).toBe("100");
    expect(addToast).not.toHaveBeenCalled();

    act(() => {
      callbacks.onSelectNone();
    });

    expect(context.setSelectedFile).toHaveBeenLastCalledWith(null);
  });

  it.each([
    { responseText: "not json", status: 200 },
    { responseText: "", status: 400 },
    { responseText: "", status: 500 },
  ])("reports a failed upload (status $status)", ({ responseText, status }) => {
    const { callbacks } = renderWidget({ account: null });

    act(() => {
      callbacks.onUploadFinish(responseText, status, "Error");
    });

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "danger",
        title: "File Upload Failed",
      }),
    );
    expect(context.setUploadResponse).not.toHaveBeenCalled();
  });
});
