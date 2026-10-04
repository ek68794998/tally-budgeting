import { Button } from "@heroui/react";
import { IconFolder } from "@tabler/icons-react";
import { type Category } from "@tally/data-models/contracts/category";
import { useTranslations } from "next-intl";
import { getIconForCategory } from "../helpers";

interface Props {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
  subcategoryCount: number;
}

export const CategoryListItem: React.FC<Props> = ({
  category,
  isSelected,
  onClick,
  subcategoryCount,
}) => {
  const t = useTranslations("budget.categoriesEdit");

  const CategoryIconComponent = getIconForCategory(
    category,
    undefined,
    IconFolder,
  );

  return (
    <Button
      className="
        grid h-[unset] w-full grid-cols-[auto_1fr] items-center justify-between
        gap-x-2 gap-y-0 p-2 text-left
      "
      onPress={onClick}
      variant={isSelected ? "solid" : "light"}
    >
      <CategoryIconComponent className="row-span-2" />
      <span className={isSelected ? "font-semibold" : ""}>
        {category.label}
      </span>
      <span className="text-sm opacity-40">
        {t("subcategoryCount", { count: subcategoryCount })}
      </span>
    </Button>
  );
};
