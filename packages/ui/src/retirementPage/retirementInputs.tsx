"use client";

import { Card, CardBody, CardHeader, Form, NumberInput } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRetirementContext } from "./retirementProvider";
import { type RetirementCalculatorInputs } from "./types";

interface Props {
  className?: string;
}

export const RetirementInputs: React.FC<Props> = ({ className }) => {
  const { inputs, setInputs } = useRetirementContext();
  const t = useTranslations("retirement");

  const getInputSetter =
    (key: keyof RetirementCalculatorInputs) =>
    (value: RetirementCalculatorInputs[typeof key]) => {
      setInputs({
        ...inputs,
        [key]: value,
      });
    };

  return (
    <Card className={className} isBlurred={true}>
      <CardHeader>
        <h2 className="text-2xl font-black">{t("inputs.title")}</h2>
      </CardHeader>
      <CardBody>
        <Form className="grid grid-cols-2" validationBehavior="aria">
          <NumberInput
            formatOptions={{
              minimumFractionDigits: 1,
              style: "percent",
            }}
            label={t("inputs.assumedAnnualRaise")}
            onValueChange={getInputSetter("annualRaise")}
            value={inputs.annualRaise}
            variant="bordered"
          />
          <NumberInput
            formatOptions={{
              minimumFractionDigits: 1,
              style: "percent",
            }}
            label={t("inputs.assumedInflationRatePercent")}
            onValueChange={getInputSetter("annualInflationRatePercent")}
            value={inputs.annualInflationRatePercent}
            variant="bordered"
          />
          <NumberInput
            formatOptions={{
              minimumFractionDigits: 1,
              style: "percent",
            }}
            label={t("inputs.assumedInvestmentReturnPercent")}
            onValueChange={getInputSetter("annualInvestmentReturnPercent")}
            value={inputs.annualInvestmentReturnPercent}
            variant="bordered"
          />
          <NumberInput
            formatOptions={{
              currency: "USD",
              maximumFractionDigits: 0,
              style: "currency",
            }}
            label={t("inputs.assumedPostRetirementIncomeNeeded")}
            onValueChange={getInputSetter("postRetirementIncomeNeeded")}
            value={inputs.postRetirementIncomeNeeded}
            variant="bordered"
          />
          <NumberInput
            formatOptions={{
              minimumFractionDigits: 1,
              style: "percent",
            }}
            label={t("inputs.contributionPercent")}
            onValueChange={getInputSetter("contributionPercent")}
            value={inputs.contributionPercent}
            variant="bordered"
          />
          <NumberInput
            formatOptions={{ maximumFractionDigits: 0 }}
            label={t("inputs.currentAge")}
            onValueChange={getInputSetter("currentAge")}
            value={inputs.currentAge}
            variant="bordered"
          />
          <NumberInput
            formatOptions={{
              currency: "USD",
              maximumFractionDigits: 0,
              style: "currency",
            }}
            label={t("inputs.currentPreTaxIncome")}
            onValueChange={getInputSetter("currentPretaxIncome")}
            value={inputs.currentPretaxIncome}
            variant="bordered"
          />
          <NumberInput
            formatOptions={{
              currency: "USD",
              maximumFractionDigits: 0,
              style: "currency",
            }}
            label={t("inputs.currentRetirementInvestments")}
            onValueChange={getInputSetter("currentRetirementInvestments")}
            value={inputs.currentRetirementInvestments}
            variant="bordered"
          />
          <NumberInput
            formatOptions={{ maximumFractionDigits: 0 }}
            label={t("inputs.lifeExpectancy")}
            onValueChange={getInputSetter("lifeExpectancy")}
            value={inputs.lifeExpectancy}
            variant="bordered"
          />
          <NumberInput
            formatOptions={{ maximumFractionDigits: 0 }}
            label={t("inputs.retirementAge")}
            onValueChange={getInputSetter("retirementAge")}
            value={inputs.retirementAge}
            variant="bordered"
          />
        </Form>
      </CardBody>
    </Card>
  );
};
