import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { IconDots } from "@tabler/icons-react";
import { type DropdownEntry } from "../types";

interface Props {
	entries: DropdownEntry[];
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
