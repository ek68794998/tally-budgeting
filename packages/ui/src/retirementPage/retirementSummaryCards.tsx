"use client";

import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { DataCard } from "../common/dataCard";
import { formatCurrency } from "../format";
import { useRetirementContext } from "./retirementProvider";

interface Props {
  className?: string;
}

export const RetirementSummaryCards: React.FC<Props> = ({ className }) => {
  const { inputs } = useRetirementContext();

  return (
    <div className={twMerge(className, "grid grid-cols-2 gap-4")}>
      <RetirementRemainingAtAgeCard age={inputs.retirementAge} />
      <RetirementRemainingAtAgeCard age={inputs.lifeExpectancy} />
    </div>
  );
};

const RetirementRemainingAtAgeCard: React.FC<{ age: number }> = ({ age }) => {
  const { calculatedData } = useRetirementContext();
  const t = useTranslations("retirement.summary");

  const title = t("retirementLeftAt", { age });
  const value = calculatedData.dataByYear.find(
    (yearData) => yearData.age === age,
  )?.retirementAmount;

  return (
    <DataCard
      centered={true}
      data={{
        title,
        value: formatCurrency(value ?? 0),
      }}
      size="xl"
    />
  );
};
