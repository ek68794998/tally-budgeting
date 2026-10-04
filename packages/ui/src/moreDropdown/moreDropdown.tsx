import { Button, Dropdown, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { IconDots } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { renderDropdownEntry } from "../common/renderDropdownEntry";
import { type DropdownEntry } from "../types";

interface Props {
  entries: DropdownEntry[];
}

export const MoreDropdown: React.FC<Props> = ({ entries }) => {
  const t = useTranslations();

  return (
    <Dropdown backdrop="opaque">
      <DropdownTrigger>
        <Button isIconOnly={true} size="sm" variant="light">
          <IconDots />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label={t("common.actions.more")} items={entries}>
        {renderDropdownEntry}
      </DropdownMenu>
    </Dropdown>
  );
};
