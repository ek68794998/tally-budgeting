import {
	Button,
	Dropdown,
	DropdownItem,
	type DropdownItemProps,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { type Icon, IconDots } from "@tabler/icons-react";

interface MoreDropdownEntry extends DropdownItemProps {
	action: () => void;
	IconComponent: Icon;
	key: string;
	label: string;
}

interface Props {
	entries: MoreDropdownEntry[];
}

export const MoreDropdown: React.FC<Props> = ({ entries }) => (
	<Dropdown backdrop="opaque">
		<DropdownTrigger>
			<Button isIconOnly={true} size="sm" variant="light">
				<IconDots />
			</Button>
		</DropdownTrigger>
		<DropdownMenu items={entries}>
			{({ action, IconComponent, key, label, ...entry }) => (
				<DropdownItem
					key={key}
					onPress={action}
					startContent={<IconComponent />}
					{...entry}
				>
					{label}
				</DropdownItem>
			)}
		</DropdownMenu>
	</Dropdown>
);
