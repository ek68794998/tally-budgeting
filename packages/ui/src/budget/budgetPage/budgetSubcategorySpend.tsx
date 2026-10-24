import { Chip, Progress, Tooltip } from "@heroui/react";
import { IconBusinessplan, IconHelpCircle } from "@tabler/icons-react";
import { type OneTimeExpenses } from "@tally/data-models/contracts/api/getBudgetSummary";
import { type Subcategory } from "@tally/data-models/contracts/subcategory";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useLocale, useTranslations } from "next-intl";
import { formatCurrency } from "../../format";
import { getSpentText } from "../helpers";
import { OneTimeExpensesDetails } from "../oneTime/oneTimeExpensesDetails";
import { type BudgetDate } from "../types";

interface Props {
  amountPaid: number;
  oneTime?: OneTimeExpenses;
  periodEnd: BudgetDate;
  subcategory: Subcategory;
}

export const BudgetSubcategorySpend: React.FC<Props> = ({
  amountPaid,
  oneTime,
  periodEnd,
  subcategory,
}) => {
  const { budget, description, label } = subcategory;

  const locale = useLocale();
  const t = useTranslations("budget");

  const budgetAmount = Dollars.fromCents(budget.amountCents);
  const underBudget = budgetAmount - amountPaid;
  const hasBudget = !!budgetAmount;
  const isUnderBudget = underBudget >= 0;

  return (
    <Progress
      aria-hidden="true"
      color={!hasBudget ? "secondary" : isUnderBudget ? "success" : "danger"}
      label={
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            {label}
            {description && (
              <Tooltip content={description}>
                <IconHelpCircle size={16} />
              </Tooltip>
            )}
            {oneTime?.transactions.length && (
              <Tooltip content={<OneTimeExpensesDetails oneTime={oneTime} />}>
                <IconBusinessplan
                  aria-label={t("oneTime.iconLabel")}
                  size={16}
                />
              </Tooltip>
            )}
          </span>
          {isUnderBudget || !hasBudget ? null : (
            <Chip aria-hidden="true" color="danger" size="sm">
              {t("overBudget", {
                amount: formatCurrency(-underBudget, {
                  showCentsIfLessThanDigits: 2,
                }),
              })}
            </Chip>
          )}
        </span>
      }
      maxValue={budgetAmount}
      minValue={0}
      showValueLabel={true}
      size="sm"
      value={amountPaid}
      valueLabel={
        <span className="text-sm opacity-70">
          {getSpentText(amountPaid, budget, periodEnd, t, locale)}
        </span>
      }
    />
  );
};
