import { invariant, unreachable } from "@ekumlin/typescript-toolkit/values";
import { type SelectProps } from "@heroui/react";
import type { ReorderPosition } from "./types";

export const getTableFilterProps = (
  label: string,
  isFilterActive: boolean,
): Omit<SelectProps, "children"> => ({
  "aria-label": label, // eslint-disable-line @typescript-eslint/naming-convention
  className: "w-48",
  color: isFilterActive ? "primary" : undefined,
  isClearable: true,
  isVirtualized: true,
  placeholder: label,
  selectionMode: "multiple",
  size: "sm",
});

export const reorderRows = <T extends { id: string | number }>(
  rows: T[],
  id: T["id"],
  position: ReorderPosition,
): T[] => {
  const rowsCount = rows.length;
  const rowsCopy = [...rows];
  const currentIndex = rowsCopy.findIndex((r) => r.id === id);

  if (currentIndex === -1) {
    return rowsCopy;
  }

  const [item] = rowsCopy.splice(currentIndex, 1);

  invariant(item);

  let targetIndex: number;

  switch (position) {
    case "up":
      targetIndex = Math.max(0, currentIndex - 1);
      break;
    case "down":
      targetIndex = Math.min(rowsCount - 1, currentIndex + 1);
      break;
    case "top":
      targetIndex = 0;
      break;
    case "bottom":
      targetIndex = rowsCount - 1;
      break;
    default:
      unreachable(position);
  }

  rowsCopy.splice(targetIndex, 0, item);

  return rowsCopy;
};
