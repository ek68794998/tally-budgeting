import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { IconDots } from "@tabler/icons-react";
import NextLink from "next/link";
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
			{(item) => {
				const { action, IconComponent, key, label, ...entry } = {
					action: undefined,
					...item,
				};

				if (action) {
					entry.onPress = action;
				} else {
					entry.as = NextLink;
				}

				return (
					<DropdownItem
						key={key}
						startContent={<IconComponent />}
						{...entry}
					>
						{label}
					</DropdownItem>
				);
			}}
		</DropdownMenu>
	</Dropdown>
);
