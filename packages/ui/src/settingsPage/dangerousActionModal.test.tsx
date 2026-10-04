import { addToast } from "@heroui/react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type DangerousAction,
  DangerousActionModal,
} from "./dangerousActionModal";

vi.mock("@heroui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@heroui/react")>()),
  addToast: vi.fn(),
}));
vi.mock("@tally/utilities/telemetry/telemetry", () => ({
  telemetry: () => ({ error: vi.fn() }),
}));

const renderModal = (
  action: DangerousAction,
  overrides: Partial<React.ComponentProps<typeof DangerousActionModal>> = {},
) => {
  const props = {
    action,
    isOpen: true,
    onClose: vi.fn(),
    onConfirmAsync: vi.fn(() => Promise.resolve()),
    onDownloadBackup: vi.fn(),
    ...overrides,
  };

  render(<DangerousActionModal {...props} />);

  return props;
};

const chooseFile = () =>
  fireEvent.change(screen.getByTestId("restore-file"), {
    target: { files: [new File(["dump"], "backup.dump")] },
  });

const confirmButton = () => screen.getByRole("button", { name: "Confirm" });
const checkbox = () => screen.getByRole("checkbox");

describe("DangerousActionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      action: "restore" as const,
      text: /replaced with the contents of the backup file/,
    },
    {
      action: "drop" as const,
      text: /database will be reset to an empty state/,
    },
  ])("explains what $action does, plus the sign-out and backup advice", ({
    action,
    text,
  }) => {
    const { onDownloadBackup } = renderModal(action);

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByText("You will be signed out.")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("link", { name: "Click here to create one." }),
    );

    expect(onDownloadBackup).toHaveBeenCalledOnce();
  });

  it("asks for a file only when restoring", () => {
    renderModal("drop");

    expect(screen.queryByTestId("restore-file")).not.toBeInTheDocument();
  });

  it("keeps Confirm disabled until the checkbox is ticked (drop)", () => {
    renderModal("drop");

    expect(confirmButton()).toBeDisabled();

    fireEvent.click(checkbox());

    expect(confirmButton()).toBeEnabled();
  });

  it("also needs a file before a restore can be acknowledged", () => {
    renderModal("restore");

    expect(checkbox()).toBeDisabled();
    expect(confirmButton()).toBeDisabled();

    chooseFile();
    fireEvent.click(checkbox());

    expect(confirmButton()).toBeEnabled();
  });

  it("passes the chosen file to the confirm handler", async () => {
    const { onConfirmAsync } = renderModal("restore");

    chooseFile();
    fireEvent.click(checkbox());
    fireEvent.click(confirmButton());

    await waitFor(() => {
      expect(onConfirmAsync).toHaveBeenCalledWith(expect.any(File));
    });
  });

  it("Cancel closes the modal and resets the checkbox", () => {
    const { onClose } = renderModal("drop");

    fireEvent.click(checkbox());
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(checkbox()).not.toBeChecked();
  });

  it("can't be closed while the request is running", async () => {
    let finish: () => void = vi.fn();
    const { onClose } = renderModal("drop", {
      onConfirmAsync: () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    });

    fireEvent.click(checkbox());
    fireEvent.click(confirmButton());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();

    await act(() => {
      finish();

      return Promise.resolve();
    });
  });

  it("shows the failure in a toast and stays open", async () => {
    const { onClose } = renderModal("drop", {
      onConfirmAsync: () => Promise.reject(new Error("pg_restore: bad")),
    });

    fireEvent.click(checkbox());
    fireEvent.click(confirmButton());

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "danger",
          description: "pg_restore: bad",
        }),
      );
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
