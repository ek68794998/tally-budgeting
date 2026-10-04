import { type DropdownItemProps } from "@heroui/react";
import { type Icon } from "@tabler/icons-react";

interface BaseDropdownEntry
  extends Omit<DropdownItemProps, "children" | "startContent"> {
  IconComponent: Icon;
  key: string;
  label: string;
}

export type DropdownActionEntry = BaseDropdownEntry & {
  action: () => void;
};

export type DropdownLinkEntry = BaseDropdownEntry & {
  href: string;
};

export type DropdownEntry = DropdownActionEntry | DropdownLinkEntry;
