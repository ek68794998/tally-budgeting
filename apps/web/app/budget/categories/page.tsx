import { CategoriesMasterDetail } from "@tally/ui/budget/budgetCategoriesPage/categoriesMasterDetail";
import { DateTime } from "luxon";

const BudgetCategoriesPage: React.FC = () => {
	const getPeriodEnd = () => {
		const utcNow = DateTime.utc().minus({ months: 1 });
		return { month: utcNow.month, year: utcNow.year };
	};

	const periodEnd = getPeriodEnd();

	return (
		<div className="flex flex-col gap-4">
			<CategoriesMasterDetail />
		</div>
	);
};

export default BudgetCategoriesPage;
