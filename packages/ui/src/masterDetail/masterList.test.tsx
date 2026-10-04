import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MasterList } from "./masterList";

describe("MasterList", () => {
  it("renders each item with its selection state and select handler", () => {
    const onSelect = vi.fn();

    render(
      <MasterList
        getItemKey={(item: string) => item}
        items={["a", "b"]}
        onSelect={onSelect}
        renderItem={(item, isSelected, onClick) => (
          <button onClick={onClick} type="button">
            {`${item}${isSelected ? "*" : ""}`}
          </button>
        )}
        selectedKey="b"
      />,
    );

    fireEvent.click(screen.getByText("a"));

    expect(screen.getByText("b*")).toBeInTheDocument();
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it.each([
    { emptyState: undefined, expected: "No items available." },
    { emptyState: "Nothing yet", expected: "Nothing yet" },
  ])("shows $expected when empty", ({ emptyState, expected }) => {
    render(
      <MasterList
        emptyState={emptyState}
        getItemKey={(item: string) => item}
        items={[]}
        onSelect={vi.fn()}
        renderItem={() => null}
        selectedKey={null}
      />,
    );

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("shows a heading only where the group changes", () => {
    render(
      <MasterList
        getItemGroup={(item: string) => (item < "c" ? "Early" : "Late")}
        getItemKey={(item: string) => item}
        items={["a", "b", "c"]}
        onSelect={vi.fn()}
        renderItem={(item) => <span>{item}</span>}
        selectedKey={null}
      />,
    );

    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(
      ["Early", "a", "b", "Late", "c"],
    );
  });
});
