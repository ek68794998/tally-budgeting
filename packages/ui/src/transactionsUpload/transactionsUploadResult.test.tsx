import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTransactionsUploadContext } from "./transactionsUploadProvider";
import { TransactionsUploadResult } from "./transactionsUploadResult";

vi.mock("./transactionsUploadProvider", () => ({
	useTransactionsUploadContext: vi.fn(),
}));
vi.mock("./transactionsUploadResultDetails", () => ({
	TransactionsUploadResultDetails: vi.fn(() => <div data-testid="details" />),
}));

const response = {
	rowsFailed: [],
	rowsIgnored: [],
	rowsProcessed: [],
	success: true as const,
};

const setSelectedFile = vi.fn();
const uploadSelectedFile =
	vi.fn<(isValidationOnly: boolean) => Promise<boolean>>();

const renderResult = (hasFile: boolean) => {
	vi.mocked(useTransactionsUploadContext).mockReturnValue(
		mockIncompleteObject<ReturnType<typeof useTransactionsUploadContext>>({
			selectedFile: hasFile ? new File(["x"], "bank.csv") : null,
			setSelectedFile,
			uploadResponse: response,
			uploadSelectedFile,
		}),
	);

	render(<TransactionsUploadResult />);
};

describe("TransactionsUploadResult", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("waits for a file before showing results", () => {
		renderResult(false);

		expect(
			screen.getByText("Waiting for transactions to upload…"),
		).toBeInTheDocument();
		expect(screen.queryByTestId("details")).toBeNull();
	});

	it("validates again without clearing the file", () => {
		uploadSelectedFile.mockResolvedValue(true);
		renderResult(true);

		fireEvent.click(screen.getByText("Re-run Categorization"));

		expect(uploadSelectedFile).toHaveBeenCalledWith(true);
		expect(screen.getByTestId("details")).toBeInTheDocument();
	});

	it.each([
		{ clearCalls: 1, succeeded: true },
		{ clearCalls: 0, succeeded: false },
	])("confirms the upload and clears the file when it succeeded=$succeeded", async ({
		clearCalls,
		succeeded,
	}) => {
		uploadSelectedFile.mockResolvedValue(succeeded);
		renderResult(true);

		fireEvent.click(screen.getByText("Confirm & Save"));

		await waitFor(() => {
			expect(uploadSelectedFile).toHaveBeenCalledWith(false);
		});
		await waitFor(() => {
			expect(setSelectedFile).toHaveBeenCalledTimes(clearCalls);
		});
	});
});
