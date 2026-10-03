import { Button, Dropdown, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { IconDots } from "@tabler/icons-react";
import { renderDropdownEntry } from "../common/renderDropdownEntry";
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
		<DropdownMenu items={entries}>{renderDropdownEntry}</DropdownMenu>
	</Dropdown>
);
