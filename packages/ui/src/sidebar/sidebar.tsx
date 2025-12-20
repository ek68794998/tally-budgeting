"use client";

import {
	IconBeach,
	IconChartBarPopular,
	IconDashboard,
	IconDashboardFilled,
	IconPig,
	IconPigFilled,
	IconReceipt,
	IconReceiptFilled,
	IconSettings,
	IconSettingsFilled,
	IconWallet,
} from "@tabler/icons-react";
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
							DefaultIconComponent: IconDashboard,
							FilledIconComponent: IconDashboardFilled,
							id: "summary",
							label: t("summary.title"),
							path: "/",
						}),
						createMenuItem({
							DefaultIconComponent: IconWallet,
							id: "budget",
							label: t("budget.title"),
							path: "/budget",
						}),
						createMenuItem({
							DefaultIconComponent: IconReceipt,
							FilledIconComponent: IconReceiptFilled,
							id: "transactions",
							label: t("transactions.title"),
							path: "/transactions",
						}),
						createMenuItem({
							DefaultIconComponent: IconChartBarPopular,
							id: "net-worth",
							label: t("netWorth.title"),
							path: "/net-worth",
						}),
						createMenuItem({
							DefaultIconComponent: IconBeach,
							id: "retirement",
							label: t("retirement.title"),
							path: "/retirement",
						}),
						createMenuItem({
							DefaultIconComponent: IconPig,
							FilledIconComponent: IconPigFilled,
							id: "assets",
							label: t("assets.title"),
							path: "/assets",
						}),
					]}
				/>
			</div>
		</div>
	);
};
