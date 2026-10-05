import { type MovePosition } from "@ekumlin/typescript-toolkit/collections";
import {
  IconArrowBarToDown,
  IconArrowBarToUp,
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { MoreDropdown } from "../moreDropdown/moreDropdown";

interface Props {
  onDelete: () => void;
  onEdit: () => void;
  onReorder: (position: MovePosition) => void;
}

export const RuleRowDropdown: React.FC<Props> = ({
  onDelete,
  onEdit,
  onReorder,
}) => {
  const t = useTranslations();

  return (
    <MoreDropdown
      entries={[
        {
          action: onEdit,
          IconComponent: IconEdit,
          key: "edit",
          label: t("common.actions.edit"),
          showDivider: true,
        },
        {
          action: () => onReorder("up"),
          IconComponent: IconArrowNarrowUp,
          key: "moveUp",
          label: t("common.actions.move.up"),
        },
        {
          action: () => onReorder("down"),
          IconComponent: IconArrowNarrowDown,
          key: "moveDown",
          label: t("common.actions.move.down"),
        },
        {
          action: () => onReorder("top"),
          IconComponent: IconArrowBarToUp,
          key: "moveTop",
          label: t("common.actions.move.top"),
        },
        {
          action: () => onReorder("bottom"),
          IconComponent: IconArrowBarToDown,
          key: "moveBottom",
          label: t("common.actions.move.bottom"),
          showDivider: true,
        },
        {
          action: onDelete,
          color: "danger",
          IconComponent: IconTrash,
          key: "delete",
          label: t("common.actions.delete"),
        },
      ]}
    />
  );
};
