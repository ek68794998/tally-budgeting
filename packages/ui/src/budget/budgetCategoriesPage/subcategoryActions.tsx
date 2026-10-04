"use client";

import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  IconChevronDown,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { type Category } from "@tally/data-models/contracts/category";
import { useTranslations } from "next-intl";

interface Props {
  category: Category;
  onAddSubcategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onEditCategory: (category: Category) => void;
}

export const SubcategoryActions: React.FC<Props> = ({
  category,
  onAddSubcategory,
  onDeleteCategory,
  onEditCategory,
}) => {
  const t = useTranslations();

  return (
    <div className="flex gap-2">
      <Button onPress={() => onAddSubcategory(category)} variant="light">
        <IconPlus />
        {t("budget.categoriesEdit.newSubcategory")}
      </Button>
      <div className="bg-divider my-2 w-px" />
      <ButtonGroup>
        <Button
          isIconOnly={true}
          onPress={() => onEditCategory(category)}
          variant="light"
        >
          <IconEdit />
        </Button>
        <Dropdown backdrop="opaque" placement="bottom-end">
          <DropdownTrigger>
            <Button isIconOnly={true} variant="light">
              <IconChevronDown />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label={t("common.actions.more")}>
            <DropdownItem
              color="danger"
              key="delete"
              onPress={() => onDeleteCategory(category)}
              startContent={<IconTrash />}
              variant="light"
            >
              {t("common.actions.delete")}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </ButtonGroup>
    </div>
  );
};
