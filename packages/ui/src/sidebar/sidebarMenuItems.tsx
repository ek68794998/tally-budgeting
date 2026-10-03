import { Button } from "@heroui/react";
import { type Icon } from "@tabler/icons-react";
import NextLink from "next/link";

export interface SidebarMenuItem {
	href: string;
	IconComponent: Icon;
	id: string;
	isSelected: boolean;
	label: string;
}

export interface SidebarAction {
	IconComponent: Icon;
	id: string;
	label: string;
	onPress: () => void;
}

interface Props {
	footerActions?: SidebarAction[];
	footerMenuItems?: SidebarMenuItem[];
	menuItems: SidebarMenuItem[];
}

const copyrightStartYear = 2025;
const currentYear = new Date().getFullYear();
const copyrightYear =
	currentYear === copyrightStartYear
		? currentYear
		: `${copyrightStartYear}–${currentYear}`;

export const SidebarMenuItems: React.FC<Props> = ({
	footerActions,
	footerMenuItems,
	menuItems,
}) => (
	<div className="flex flex-1 flex-col">
		<div className="flex flex-1 flex-col gap-2">
			{menuItems.map(({ href, IconComponent, id, isSelected, label }) => (
				<Button
					as={NextLink}
					className="justify-start"
					href={href}
					key={id}
					startContent={<IconComponent />}
					variant={isSelected ? "flat" : "light"}
				>
					{label}
				</Button>
			))}
		</div>
		<div className="flex flex-col gap-2">
			{footerMenuItems?.map(
				({ href, IconComponent, id, isSelected, label }) => (
					<Button
						as={NextLink}
						className="justify-start"
						href={href}
						key={id}
						startContent={<IconComponent />}
						variant={isSelected ? "flat" : "light"}
					>
						{label}
					</Button>
				),
			)}
			{footerActions?.map(({ IconComponent, id, label, onPress }) => (
				<Button
					className="justify-start"
					key={id}
					onPress={onPress}
					startContent={<IconComponent />}
					variant="light"
				>
					{label}
				</Button>
			))}
		</div>
		<div className="text-center text-xs text-stone-500">
			<div className="my-4 h-px bg-stone-200" />
			{`© ${copyrightYear} Eric Kumlin`}
		</div>
	</div>
);
