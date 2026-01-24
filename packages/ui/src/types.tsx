import { type Icon } from "@tabler/icons-react";

export interface DropdownEntry {
	action: () => void;
	destructive?: boolean;
	IconComponent: Icon;
	key: string;
	label: string;
}
