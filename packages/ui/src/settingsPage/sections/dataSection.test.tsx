import { addToast } from "@heroui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataSection } from "./dataSection";

const backup = vi.hoisted(() => ({
  downloadBackupAsync: vi.fn(() => Promise.resolve()),
  isDownloading: false,
}));

const actions = vi.hoisted(() => ({
  dropAsync: vi.fn(() => Promise.resolve()),
  restoreAsync: vi.fn((_file: File) => Promise.resolve()),
}));

vi.mock("@heroui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@heroui/react")>()),
  addToast: vi.fn(),
}));
vi.mock("../../hooks/api/useDatabaseActions", () => ({
  useDatabaseActions: () => actions,
}));
vi.mock("../../hooks/api/useBackupDownload", () => ({
  useBackupDownload: () => backup,
}));
vi.mock("../dangerousActionModal", () => ({
  DangerousActionModal: vi.fn(
    ({
      action,
      isOpen,
      onConfirmAsync,
    }: {
      action: string;
      isOpen: boolean;
      onConfirmAsync: (file: File | null) => Promise<void>;
    }) =>
      isOpen ? (
        <div data-testid="modal">
          {action}
          <button
            onClick={() => {
              void onConfirmAsync(new File(["x"], "b.dump"));
            }}
            type="button"
          >
            {"run"}
          </button>
        </div>
      ) : null,
  ),
}));

describe("DataSection", () => {
  const assign = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("location", { assign });
  });

  it("downloads the backup on demand and keeps destructive actions in the danger zone", () => {
    render(<DataSection />);

    fireEvent.click(screen.getByRole("button", { name: "Download backup" }));

    expect(backup.downloadBackupAsync).toHaveBeenCalledOnce();
    expect(screen.getByText("Danger zone")).toBeInTheDocument();
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it.each([
    { button: "Restore…", called: "restoreAsync", modal: "restore" },
    { button: "Delete all data…", called: "dropAsync", modal: "drop" },
  ] as const)("$button opens the $modal modal and, once confirmed, runs it, then goes to the login page", async ({
    button,
    called,
    modal,
  }) => {
    render(<DataSection />);

    fireEvent.click(screen.getByRole("button", { name: button }));

    expect(screen.getByTestId("modal")).toHaveTextContent(modal);

    fireEvent.click(screen.getByRole("button", { name: "run" }));

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith("/login");
    });
    expect(actions[called]).toHaveBeenCalledOnce();
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "success" }),
    );
  });
});
