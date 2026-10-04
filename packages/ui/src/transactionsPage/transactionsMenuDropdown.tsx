"use client";

import { Button, Dropdown, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { IconCategory, IconDots, IconList } from "@tabler/icons-react";
import { web } from "@tally/utilities/routing/routeBuilder";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { renderDropdownEntry } from "../common/renderDropdownEntry";
import { type DropdownLinkEntry } from "../types";

export const TransactionsMenuDropdown = () => {
  const t = useTranslations();

  const dropdownEntries: DropdownLinkEntry[] = useMemo(
    () => [
      {
        href: web.transactions.rules,
        IconComponent: IconList,
        key: "rules",
        label: t("transactions.rules.edit"),
      },
      {
        href: web.budget.categories,
        IconComponent: IconCategory,
        key: "categories",
        label: t("budget.editCategories"),
      },
    ],
    [t],
  );

  return (
    <Dropdown backdrop="opaque" placement="bottom-end">
      <DropdownTrigger>
        <Button isIconOnly={true} variant="light">
          <IconDots />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t("common.actions.more")}
        items={dropdownEntries}
      >
        {renderDropdownEntry}
      </DropdownMenu>
    </Dropdown>
  );
};
