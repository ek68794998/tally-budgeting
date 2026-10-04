import { IconCurrencyDollar } from "@tabler/icons-react";
import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { getIconForCategory } from "../helpers";
import { type BudgetDate } from "../types";

export interface BudgetActionItemCommonProps {
  category: Category;
  periodEnd: BudgetDate;
  subcategory: Subcategory;
}

interface Props extends Omit<BudgetActionItemCommonProps, "periodEnd"> {
  content: React.ReactNode;
  subcontent?: React.ReactNode;
}

export const BudgetActionItemCell: React.FC<Props> = ({
  category,
  content,
  subcategory,
  subcontent,
}) => {
  const IconComponent = getIconForCategory(
    category,
    subcategory,
    IconCurrencyDollar,
  );

  return (
    <div className="ml-4 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
      <div className="row-span-2">
        <div className="bg-default/40 rounded-sm p-1">
          <IconComponent size={16} />
        </div>
      </div>
      <div>
        <span className="mr-2 font-light opacity-70">{subcategory.label}</span>
        {content}
      </div>
      {subcontent ? (
        <div className="text-xs opacity-70">{subcontent}</div>
      ) : null}
    </div>
  );
};
