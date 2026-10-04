import { DropdownItem } from "@heroui/react";
import NextLink from "next/link";
import { type DropdownEntry } from "../types";

/** Renders an entry as a pressable action or, without an action, a client-side link. Pass as `DropdownMenu` children. */
export const renderDropdownEntry = (entry: DropdownEntry) => {
  const { action, IconComponent, key, label, ...itemProps } = {
    action: undefined,
    ...entry,
  };

  return (
    <DropdownItem
      key={key}
      startContent={<IconComponent />}
      {...itemProps}
      {...(action ? { onPress: action } : { as: NextLink })}
    >
      {label}
    </DropdownItem>
  );
};
