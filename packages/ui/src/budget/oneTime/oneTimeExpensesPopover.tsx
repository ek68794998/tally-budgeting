import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { type OneTimeExpenses } from "@tally/data-models/contracts/api/getBudgetSummary";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../../format";
import { OneTimeExpensesDetails } from "./oneTimeExpensesDetails";

interface Props {
  oneTime: OneTimeExpenses;
}

export const OneTimeExpensesPopover: React.FC<Props> = ({ oneTime }) => {
  const t = useTranslations("budget.oneTime");

  return (
    <div className="font-numeric text-sm">
      {t.rich("cardSummary", {
        amount: formatCurrency(oneTime.totalSpent, { showCents: false }),
        amountFmt: (chunks) => <b>{chunks}</b>,
        count: oneTime.transactions.length,
        link: (chunks) => (
          <Popover placement="bottom">
            <PopoverTrigger>
              <button
                className="cursor-pointer underline underline-offset-2"
                type="button"
              >
                {chunks}
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <OneTimeExpensesDetails oneTime={oneTime} />
            </PopoverContent>
          </Popover>
        ),
      })}
    </div>
  );
};
