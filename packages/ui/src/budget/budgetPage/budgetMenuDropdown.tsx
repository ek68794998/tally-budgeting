"use client";

import { Button, Dropdown, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { IconCategory, IconDots } from "@tabler/icons-react";
import { web } from "@tally/utilities/routing/routeBuilder";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { renderDropdownEntry } from "../../common/renderDropdownEntry";
import { type DropdownLinkEntry } from "../../types";

export const BudgetMenuDropdown = () => {
	const t = useTranslations("budget");
	const tCommon = useTranslations("common");

	const dropdownEntries: DropdownLinkEntry[] = useMemo(
		() => [
			{
				href: web.budget.categories,
				IconComponent: IconCategory,
				key: "edit",
				label: t("editCategories"),
			},
		],
		[t],
	);

	return (
		<Dropdown backdrop="opaque" placement="bottom-end">
			<DropdownTrigger>
				<Button isIconOnly={true} size="sm" variant="light">
					<IconDots />
				</Button>
			</DropdownTrigger>
			<DropdownMenu
				aria-label={tCommon("actions.more")}
				items={dropdownEntries}
			>
				{renderDropdownEntry}
			</DropdownMenu>
		</Dropdown>
	);
};
