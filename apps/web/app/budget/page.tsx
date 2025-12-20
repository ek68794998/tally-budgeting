import { BudgetDetails } from "@tally/ui/budgetPage/budgetDetails";
import { DateTime } from "luxon";

const BudgetPage: React.FC = () => {
	const getPeriodEnd = () => {
		const utcNow = DateTime.utc().minus({ months: 1 });
		return { month: utcNow.month, year: utcNow.year };
	};

	const periodEnd = getPeriodEnd();

	return (
		<div className="flex flex-col gap-4">
			<BudgetDetails periodEnd={periodEnd} />
		</div>
	);
};

export default BudgetPage;
