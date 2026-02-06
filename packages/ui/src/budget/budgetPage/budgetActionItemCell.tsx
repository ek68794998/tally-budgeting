import { IconChevronRight } from "@tabler/icons-react";
import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { getIconForCategory } from "../helpers";

export interface BudgetActionItemCommonProps {
	category: Category;
	subcategory: Subcategory;
}

interface Props extends BudgetActionItemCommonProps {
	content: React.ReactNode;
}

export const BudgetActionItemCell: React.FC<Props> = ({
	category,
	content,
	subcategory,
}) => {
	const IconComponent = getIconForCategory(category) ?? IconChevronRight;

	return (
		<div className="ml-4 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
			<div className="row-span-2">
				<div className="bg-default/40 rounded p-1">
					<IconComponent size={16} />
				</div>
			</div>
			<div>{subcategory.label}</div>
			<div>{content}</div>
		</div>
	);
};
