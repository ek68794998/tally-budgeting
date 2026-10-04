import { IconEdit } from "@tabler/icons-react";
import NextLink from "next/link";
import { isValidElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderDropdownEntry } from "./renderDropdownEntry";

const getProps = (element: React.ReactNode) => {
  if (!isValidElement<Record<string, unknown>>(element)) {
    throw new Error("Expected a React element.");
  }

  return { key: element.key, props: element.props };
};

describe("renderDropdownEntry", () => {
  it("renders an action entry as a pressable item with its extra props", () => {
    const action = vi.fn();

    const { key, props } = getProps(
      renderDropdownEntry({
        action,
        color: "danger",
        IconComponent: IconEdit,
        key: "edit",
        label: "Edit",
      }),
    );

    expect(key).toBe("edit");
    expect(props).toMatchObject({
      children: "Edit",
      color: "danger",
      onPress: action,
    });
    expect(props).not.toHaveProperty("action");
    expect(props).not.toHaveProperty("as");
  });

  it("renders a link entry as a client-side link", () => {
    const { props } = getProps(
      renderDropdownEntry({
        href: "/budget",
        IconComponent: IconEdit,
        key: "budget",
        label: "Budget",
      }),
    );

    expect(props).toMatchObject({ as: NextLink, href: "/budget" });
    expect(props).not.toHaveProperty("onPress");
  });
});
