import { Modal, ModalContent } from "@heroui/react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditModalFooter } from "./editModalFooter";

const renderFooter = (
  props: Partial<React.ComponentProps<typeof EditModalFooter>> = {},
) => {
  const handlers = {
    onClose: vi.fn(),
    onSave: vi.fn((_createMore: boolean) => Promise.resolve()),
    onSaveError: vi.fn(),
  };

  render(
    <Modal isOpen={true}>
      <ModalContent>
        <EditModalFooter isSaveDisabled={false} {...handlers} {...props} />
      </ModalContent>
    </Modal>,
  );

  return handlers;
};

describe("EditModalFooter", () => {
  it("saves and closes", async () => {
    const { onClose, onSave } = renderFooter();

    act(() => {
      fireEvent.click(screen.getByText("Save"));
    });

    expect(onSave).toHaveBeenCalledWith(false);
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it("stays open after saving when creating more", async () => {
    const { onClose, onSave } = renderFooter({ showCreateMore: true });

    fireEvent.click(screen.getByText("Create More"));
    act(() => {
      fireEvent.click(screen.getByText("Save"));
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(true);
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("reports save errors and cancels", async () => {
    const handlers = renderFooter({
      onSave: vi.fn(() => Promise.reject(new Error("nope"))),
    });

    act(() => {
      fireEvent.click(screen.getByText("Save"));
    });

    await waitFor(() => {
      expect(handlers.onSaveError).toHaveBeenCalledWith(new Error("nope"));
    });

    fireEvent.click(screen.getByText("Cancel"));

    expect(handlers.onClose).toHaveBeenCalledOnce();
  });

  it("hides the create-more option by default", () => {
    renderFooter({ isSaveDisabled: true });

    expect(screen.queryByText("Create More")).toBeNull();
  });
});
