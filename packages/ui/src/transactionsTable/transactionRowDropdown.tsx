import { IconCopyPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { MoreDropdown } from "../moreDropdown/moreDropdown";

interface Props {
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
}

export const TransactionRowDropdown: React.FC<Props> = ({
  onDelete,
  onDuplicate,
  onEdit,
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
