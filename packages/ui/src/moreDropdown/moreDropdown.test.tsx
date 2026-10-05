import { dangerouslyCoerceType } from "@ekumlin/typescript-toolkit/testing";
import { DropdownItem } from "@heroui/react";
import { type Icon } from "@tabler/icons-react";
import { fireEvent, render, screen } from "@testing-library/react";
import NextLink from "next/link";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type DropdownActionEntry, type DropdownLinkEntry } from "../types";
import { MoreDropdown } from "./moreDropdown";

vi.mock("next/link", () => ({
  default: "a",
}));

vi.mock("@tabler/icons-react", () => ({
  IconDots: vi.fn(() => null),
}));

vi.mock("@heroui/react", () => ({
  Button: vi.fn(() => null),
  Dropdown: vi.fn(({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  )),
  DropdownItem: vi.fn(
    ({
      children,
      onPress,
      startContent,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
      startContent?: React.ReactNode;
    }) => (
      <button data-testid="dropdown-item" onClick={onPress} type="button">
        {startContent}
        {children}
      </button>
    ),
  ),
  DropdownMenu: vi.fn(
    ({
      children,
      items,
    }: {
      children: (item: unknown) => React.ReactNode;
      items: unknown[];
    }) => <div>{items.map((item) => children(item))}</div>,
  ),
  DropdownTrigger: vi.fn(({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  )),
}));

const mockDropdownItem = vi.mocked(DropdownItem);

const MockIcon = dangerouslyCoerceType<Icon>(
  vi.fn(() => <span data-testid="icon" />),
);

const makeActionEntry = (
  overrides?: Partial<DropdownActionEntry>,
): DropdownActionEntry => ({
  action: vi.fn(),
  IconComponent: MockIcon,
  key: "action-key",
  label: "Action Label",
  ...overrides,
});

const makeLinkEntry = (
  overrides?: Partial<DropdownLinkEntry>,
): DropdownLinkEntry => ({
  href: "/some/path",
  IconComponent: MockIcon,
  key: "link-key",
  label: "Link Label",
  ...overrides,
});

describe("MoreDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders one item per entry", () => {
    render(
      <MoreDropdown
        entries={[makeActionEntry({ key: "a" }), makeLinkEntry({ key: "b" })]}
      />,
    );
    expect(screen.getAllByTestId("dropdown-item")).toHaveLength(2);
  });

  it("renders each entry's label", () => {
    render(
      <MoreDropdown
        entries={[
          makeActionEntry({ key: "a", label: "Edit" }),
          makeLinkEntry({ key: "b", label: "View" }),
        ]}
      />,
    );
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("View")).toBeInTheDocument();
  });

  it("renders IconComponent as startContent", () => {
    render(<MoreDropdown entries={[makeActionEntry()]} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("wires action entries to onPress and link entries to as=NextLink", () => {
    const action = vi.fn();
    render(
      <MoreDropdown
        entries={[
          makeActionEntry({ action, key: "a" }),
          makeLinkEntry({ key: "b" }),
        ]}
      />,
    );

    const actionProps = mockDropdownItem.mock.calls[0]?.[0];
    expect(actionProps?.onPress).toBe(action);
    expect(actionProps?.as).toBeUndefined();

    const linkProps = mockDropdownItem.mock.calls[1]?.[0];
    expect(linkProps?.as).toBe(NextLink);
    expect(linkProps?.onPress).toBeUndefined();
  });

  it("calls action when an action entry is pressed", () => {
    const action = vi.fn();
    render(<MoreDropdown entries={[makeActionEntry({ action })]} />);
    fireEvent.click(screen.getByTestId("dropdown-item"));
    expect(action).toHaveBeenCalledTimes(1);
  });
});
