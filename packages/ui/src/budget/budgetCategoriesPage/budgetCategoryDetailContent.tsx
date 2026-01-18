import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { useTranslations } from "next-intl";
import { BudgetSubcategoryItem } from "./budgetSubcategoryItem";

interface Props {
	category: Category;
	onDeleteSubcategory?: (subcategoryId: number) => void;
	onEditSubcategory?: (subcategoryId: number) => void;
	subcategories: Subcategory[];
}

export const BudgetCategoryDetailContent: React.FC<Props> = ({
	category,
	onDeleteSubcategory,
	onEditSubcategory,
	subcategories,
}) => {
	const t = useTranslations("budget.categoriesEdit");

	const categorySubcategories = subcategories
		.filter((s) => s.categoryId === category.id)
		.sort((a, b) => a.label.localeCompare(b.label));

	return (
		<div className="my-4">
			{categorySubcategories.length === 0 ? (
				<p className="py-8 text-center opacity-70">
					{t("noSubcategories", {
						newSubcategory: t("newSubcategory"),
					})}
				</p>
			) : (
				<div className="flex flex-col gap-4">
					{categorySubcategories.map((sub) => (
						<BudgetSubcategoryItem
							key={sub.id}
							onDelete={() => onDeleteSubcategory?.(sub.id)}
							onEdit={() => onEditSubcategory?.(sub.id)}
							subcategory={sub}
						/>
					))}
				</div>
			)}
		</div>
	);
};
