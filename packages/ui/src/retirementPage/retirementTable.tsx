"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";
import { formatCurrency, formatNumber } from "../format";
import { useRetirementContext } from "./retirementProvider";
import { type RetirementDataByYear } from "./types";

interface Props {
  className?: string;
}

export const RetirementTable: React.FC<Props> = ({ className }) => {
  const { calculatedData } = useRetirementContext();
  const t = useTranslations("retirement.table");

  const columns: {
    getValue: (item: RetirementDataByYear) => ReactNode;
    key: keyof RetirementDataByYear;
    label: string;
  }[] = [
    {
      getValue: (item) => item.year,
      key: "year",
      label: t("columns.year"),
    },
    {
      getValue: (item) => item.age,
      key: "age",
      label: t("columns.age"),
    },
    {
      getValue: (item) => formatCurrency(item.assumedIncome),
      key: "assumedIncome",
      label: t("columns.assumedIncome"),
    },
    {
      getValue: (item) => formatCurrency(item.addedToRetirement),
      key: "addedToRetirement",
      label: t("columns.addedToRetirement"),
    },
    {
      getValue: (item) => formatCurrency(item.distributedFromRetirement),
      key: "distributedFromRetirement",
      label: t("columns.distributedFromRetirement"),
    },
    {
      getValue: (item) => formatCurrency(item.retirementAmount),
      key: "retirementAmount",
      label: t("columns.retirementAmount"),
    },
    {
      getValue: (item) =>
        formatNumber(item.compoundInflation, { decimalPlaces: 1 }),
      key: "compoundInflation",
      label: t("columns.compoundInflation"),
    },
    {
      getValue: (item) => formatCurrency(item.retirementAmountToday),
      key: "retirementAmountToday",
      label: t("columns.retirementAmountToday"),
    },
  ];

  return (
    <Table
      aria-label={t("title")}
      className={className}
      classNames={{
        wrapper:
          "bg-background/80 dark:bg-background/20 backdrop-blur-md backdrop-saturate-150",
      }}
      topContent={<h2 className="text-2xl font-black">{t("title")}</h2>}
    >
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={calculatedData.dataByYear}>
        {(item) => (
          <TableRow key={`${item.year}`}>
            {(columnKey) => {
              const column = columns.find((c) => c.key === columnKey);

              return <TableCell>{column?.getValue(item)}</TableCell>;
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
