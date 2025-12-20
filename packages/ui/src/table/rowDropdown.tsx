import {
	Button,
	Dropdown,
	DropdownItem,
	type DropdownItemProps,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { type Icon, IconDots } from "@tabler/icons-react";

interface DropdownEntry {
	action: () => void;
	color?: DropdownItemProps["color"];
	IconComponent: Icon;
	key: string;
	label: string;
}

interface Props {
	dropdownEntries: DropdownEntry[];
}

export const RowDropdown: React.FC<Props> = ({ dropdownEntries }) => (
	<Dropdown backdrop="opaque">
		<DropdownTrigger>
			<Button isIconOnly={true} size="sm" variant="light">
				<IconDots />
			</Button>
		</DropdownTrigger>
		<DropdownMenu items={dropdownEntries}>
			{({ action, color, IconComponent, key, label }) => (
				<DropdownItem
					color={color}
					key={key}
					onPress={action}
					startContent={<IconComponent />}
				>
					{label}
				</DropdownItem>
			)}
		</DropdownMenu>
	</Dropdown>
);
