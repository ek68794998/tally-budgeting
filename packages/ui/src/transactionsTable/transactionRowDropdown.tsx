import {
  IconBusinessplan,
  IconCopyPlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { MoreDropdown } from "../moreDropdown/moreDropdown";

interface Props {
  isOneTime: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onToggleOneTime: () => void;
}

export const TransactionRowDropdown: React.FC<Props> = ({
  isOneTime,
  onDelete,
  onDuplicate,
  onEdit,
  onToggleOneTime,
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
        },
        {
          action: onDuplicate,
          IconComponent: IconCopyPlus,
          key: "duplicate",
          label: t("common.actions.duplicate"),
        },
        {
          action: onToggleOneTime,
          IconComponent: IconBusinessplan,
          key: "toggleOneTime",
          label: t(
            isOneTime
              ? "transactions.oneTime.unmark"
              : "transactions.oneTime.mark",
          ),
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
