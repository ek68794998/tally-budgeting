import { type Category } from "@tally/data-models/contracts/category";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { useTranslations } from "next-intl";
import { SubcategoryItem } from "./subcategoryItem";

interface Props {
	category: Category;
	onDeleteSubcategory: (subcategory: Subcategory) => void;
	onEditSubcategory: (subcategory: Subcategory) => void;
	subcategories: Subcategory[];
}

export const CategoryDetailContent: React.FC<Props> = ({
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
						<SubcategoryItem
							key={sub.id}
							onDelete={() => onDeleteSubcategory(sub)}
							onEdit={() => onEditSubcategory(sub)}
							subcategory={sub}
						/>
					))}
				</div>
			)}
		</div>
	);
};
