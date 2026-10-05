import { type SelectProps } from "@heroui/react";

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
