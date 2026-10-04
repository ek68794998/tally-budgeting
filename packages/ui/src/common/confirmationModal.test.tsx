import { addToast } from "@heroui/react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationModal } from "./confirmationModal";

vi.mock("@heroui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@heroui/react")>()),
  addToast: vi.fn(),
}));

vi.mock("@tally/utilities/telemetry/telemetry", () => ({
  telemetry: () => ({ error: vi.fn() }),
}));

const buildModalState = (onClose = vi.fn()) => ({
  getButtonProps: vi.fn(),
  getDisclosureProps: vi.fn(),
  isControlled: true,
  isOpen: true,
  onClose,
  onOpen: vi.fn(),
  onOpenChange: vi.fn(),
});

describe("ConfirmationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the default actions and confirms, closing on success", async () => {
    const onConfirmAsync = vi.fn(() => Promise.resolve());
    const modalState = buildModalState();

    render(
      <ConfirmationModal
        body="Are you sure?"
        modalState={modalState}
        onConfirmAsync={onConfirmAsync}
        title="Delete it"
      />,
    );

    expect(screen.getByText("Delete it")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText("OK"));
    });

    expect(onConfirmAsync).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(modalState.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("uses custom labels and toasts when confirming fails", async () => {
    const onConfirmAsync = vi.fn(() => Promise.reject(new Error("nope")));
    const modalState = buildModalState();

    render(
      <ConfirmationModal
        body="Body"
        cancelText="Keep"
        confirmText="Remove"
        isDestructive={true}
        modalState={modalState}
        onConfirmAsync={onConfirmAsync}
        title="Title"
      />,
    );

    expect(screen.getByText("Keep")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText("Remove"));
    });

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ color: "danger" }),
      );
    });
    expect(modalState.onOpenChange).not.toHaveBeenCalled();
  });
});
