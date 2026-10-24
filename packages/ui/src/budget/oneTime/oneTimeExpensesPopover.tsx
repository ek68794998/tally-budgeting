import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { type OneTimeExpenses } from "@tally/data-models/contracts/api/getBudgetSummary";
import { useTranslations } from "next-intl";
import { OneTimeExpensesDetails } from "./oneTimeExpensesDetails";
import { OneTimeExpensesSummary } from "./oneTimeExpensesSummary";

interface Props {
  oneTime: OneTimeExpenses;
}

export const OneTimeExpensesPopover: React.FC<Props> = ({ oneTime }) => {
  const t = useTranslations("budget.oneTime");

  return (
    <div className="flex flex-wrap items-baseline gap-x-1 font-numeric text-sm">
      <OneTimeExpensesSummary totalSpent={oneTime.totalSpent} />
      <span aria-hidden="true">{"·"}</span>
      <Popover placement="bottom">
        <PopoverTrigger>
          <button
            className="cursor-pointer underline underline-offset-2"
            type="button"
          >
            {t("count", { count: oneTime.transactions.length })}
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <OneTimeExpensesDetails oneTime={oneTime} />
        </PopoverContent>
      </Popover>
    </div>
  );
};
