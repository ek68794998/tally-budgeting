"use client";

import {
	IconBeach,
	IconPig,
	IconPigFilled,
	IconReceipt,
	IconReceiptFilled,
	IconSettings,
	IconSettingsFilled,
	IconWallet,
} from "@tabler/icons-react";
import { buildWebRoute, web } from "@tally/utilities/routing/routeBuilder";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { SidebarLogo } from "./sidebarLogo";
import { type SidebarMenuItem, SidebarMenuItems } from "./sidebarMenuItems";

interface Props {
	className?: string;
}

type PartialMenuItem = Pick<SidebarMenuItem, "id" | "label"> & {
	DefaultIconComponent: SidebarMenuItem["IconComponent"];
	FilledIconComponent?: SidebarMenuItem["IconComponent"];
	path: string;
};

export const Sidebar = ({ className }: Props) => {
	const t = useTranslations();
	const pathName = usePathname();

	const createMenuItem = (item: PartialMenuItem): SidebarMenuItem => {
		const { DefaultIconComponent, FilledIconComponent, path, ...rest } =
			item;
		const isSelected = pathName === path;

		return {
			...rest,
			href: path,
			IconComponent:
				isSelected && FilledIconComponent
					? FilledIconComponent
					: DefaultIconComponent,
			isSelected,
		};
	};

	return (
		<div className={className}>
			<div className="flex h-full flex-col gap-4">
				<SidebarLogo />
				<SidebarMenuItems
					footerMenuItems={[
						createMenuItem({
							DefaultIconComponent: IconSettings,
							FilledIconComponent: IconSettingsFilled,
							id: "settings",
							label: t("settings.title"),
							path: "/settings",
						}),
					]}
					menuItems={[
						createMenuItem({
							DefaultIconComponent: IconWallet,
							id: "budget",
							label: t("budget.title"),
							path: buildWebRoute(web.home),
						}),
						createMenuItem({
							DefaultIconComponent: IconReceipt,
							FilledIconComponent: IconReceiptFilled,
							id: "transactions",
							label: t("transactions.title"),
							path: buildWebRoute(web.transactions.base),
						}),
						createMenuItem({
							DefaultIconComponent: IconPig,
							FilledIconComponent: IconPigFilled,
							id: "assets",
							label: t("assets.title"),
							path: buildWebRoute(web.assets),
						}),
						createMenuItem({
							DefaultIconComponent: IconBeach,
							id: "retirement",
							label: t("retirement.title"),
							path: buildWebRoute(web.retirement),
						}),
					]}
				/>
			</div>
		</div>
	);
};
