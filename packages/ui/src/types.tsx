import { type Icon } from "@tabler/icons-react";

export interface DropdownEntry {
	action: () => void;
	IconComponent: Icon;
	key: string;
	label: string;
}
