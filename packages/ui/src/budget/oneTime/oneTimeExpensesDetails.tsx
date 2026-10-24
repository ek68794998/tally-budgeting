import { Link } from "@heroui/react";
import { type OneTimeExpenses } from "@tally/data-models/contracts/api/getBudgetSummary";
import { buildODataLiteFilter } from "@tally/utilities/oData/build";
import { buildWebRoute, web } from "@tally/utilities/routing/routeBuilder";
import { DateTime } from "luxon";
import { useLocale } from "next-intl";
import { formatCurrency } from "../../format";
import { useCategories } from "../../hooks/store/useCategories";
import { OneTimeExpensesSummary } from "./oneTimeExpensesSummary";

interface Props {
  oneTime: OneTimeExpenses;
}

const buildTransactionRoute = (id: number) =>
  buildWebRoute(web.transactions.base, {
    query: {
      filter: buildODataLiteFilter([
        { field: "id", operator: "eq", value: id },
      ]),
    },
  });

export const OneTimeExpensesDetails: React.FC<Props> = ({
  oneTime: { totalSpent, transactions },
}) => {
  const { subcategories } = useCategories();
  const locale = useLocale();

  return (
    <div className="flex w-72 max-w-full flex-col gap-3 p-2 text-sm">
      <OneTimeExpensesSummary totalSpent={totalSpent} />
      <ul className="flex flex-col gap-2">
        {transactions.map(({ amount, date, id, merchant, subcategoryId }) => {
          const subcategoryLabel = subcategories.find(
            (subcategory) => subcategory.id === subcategoryId,
          )?.label;
          const dateText = DateTime.fromISO(date).toLocaleString(
            DateTime.DATE_MED,
            { locale },
          );

          return (
            <li className="flex items-baseline justify-between gap-4" key={id}>
              <div className="flex min-w-0 flex-col">
                <Link
                  className="block truncate"
                  href={buildTransactionRoute(id)}
                  isExternal={true}
                  size="sm"
                  title={merchant}
                >
                  {merchant}
                </Link>
                <span className="truncate text-xs opacity-70">
                  {[dateText, subcategoryLabel].filter(Boolean).join(" · ")}
                </span>
              </div>
              <span className="shrink-0 font-bold">
                {formatCurrency(amount, { showCents: false })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
