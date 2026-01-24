import { type DropdownItemProps } from "@heroui/react";
import { type Icon } from "@tabler/icons-react";

export interface DropdownEntry
	extends Omit<DropdownItemProps, "children" | "startContent"> {
	action: () => void;
	IconComponent: Icon;
	key: string;
	label: string;
}
