"use client";

import {
	IconBeach,
	IconLogout,
	IconPig,
	IconPigFilled,
	IconReceipt,
	IconReceiptFilled,
	IconSettings,
	IconSettingsFilled,
	IconWallet,
} from "@tabler/icons-react";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import {
	api,
	buildApiRoute,
	buildWebRoute,
	web,
} from "@tally/utilities/routing/routeBuilder";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../auth/authContext";
import { SidebarLogo } from "./sidebarLogo";
import {
	type SidebarAction,
	SidebarMenuItems,
	type SidebarMenuLink,
} from "./sidebarMenuItems";

interface Props {
	className?: string;
}

type PartialMenuLink = Pick<SidebarMenuLink, "id" | "label"> & {
	DefaultIconComponent: SidebarMenuLink["IconComponent"];
	FilledIconComponent?: SidebarMenuLink["IconComponent"];
	path: string;
};

type PartialMenuItem = PartialMenuLink | SidebarAction;

export const Sidebar = ({ className }: Props) => {
	const t = useTranslations();
	const pathName = usePathname();
	const router = useRouter();
	const { isAuthEnabled } = useAuth();

	const logoutAsync = async () => {
		await apiFetch(buildApiRoute(api.auth.logout), { method: "POST" });
		router.replace(buildWebRoute(web.login));
		router.refresh();
	};

	const createMenuItem = (item: PartialMenuItem) => {
		if ("onPress" in item) {
			return item;
		}

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
						isAuthEnabled &&
							createMenuItem({
								IconComponent: IconLogout,
								id: "logout",
								label: t("auth.logout"),
								onPress: () => {
									void logoutAsync();
								},
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
