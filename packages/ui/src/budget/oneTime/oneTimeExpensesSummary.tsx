import { useTranslations } from "next-intl";
import { formatCurrency } from "../../format";

interface Props {
  totalSpent: number;
}

export const OneTimeExpensesSummary: React.FC<Props> = ({ totalSpent }) => {
  const t = useTranslations("budget.oneTime");

  return (
    <span className="opacity-80">
      {t.rich("summary", {
        amount: formatCurrency(totalSpent, { showCents: false }),
        amountFmt: (chunks) => <b>{chunks}</b>,
      })}
    </span>
  );
};
