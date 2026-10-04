import { addToast } from "@heroui/react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBackupDownload } from "./useBackupDownload";

const actions = vi.hoisted(() => ({
	backupAsync: vi.fn<() => Promise<void>>(),
}));

vi.mock("@heroui/react", async (importOriginal) => ({
	...(await importOriginal<typeof import("@heroui/react")>()),
	addToast: vi.fn(),
}));
vi.mock("@tally/utilities/telemetry/telemetry", () => ({
	telemetry: () => ({ error: vi.fn() }),
}));
vi.mock("./useDatabaseActions", () => ({
	useDatabaseActions: () => actions,
}));

describe("useBackupDownload", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("downloads without a toast when the backup succeeds", async () => {
		actions.backupAsync.mockResolvedValue();
		const { result } = renderHook(() => useBackupDownload());

		await act(() => result.current.downloadBackupAsync());

		expect(actions.backupAsync).toHaveBeenCalledOnce();
		expect(addToast).not.toHaveBeenCalled();
		expect(result.current.isDownloading).toBe(false);
	});

	it("shows the server's reason in a toast when the backup fails", async () => {
		actions.backupAsync.mockRejectedValue(
			new Error("spawn pg_dump ENOENT"),
		);
		const { result } = renderHook(() => useBackupDownload());

		await act(() => result.current.downloadBackupAsync());

		expect(addToast).toHaveBeenCalledWith(
			expect.objectContaining({
				color: "danger",
				description: "spawn pg_dump ENOENT",
				title: "Backup failed",
			}),
		);
		expect(result.current.isDownloading).toBe(false);
	});
});
