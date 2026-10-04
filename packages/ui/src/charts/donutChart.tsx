"use client";

import {
  pieChartItemDataSchema,
  tooltipPayloadSchema,
} from "@tally/data-models/thirdParty/recharts";
import { useTranslations } from "next-intl";
import React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { type ContentType as DefaultLegendContentType } from "recharts/types/component/DefaultLegendContent";
import {
  type NameType,
  type ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { type ContentType as TooltipContentType } from "recharts/types/component/Tooltip";
import { twMerge } from "tailwind-merge";
import { formatPercent } from "../format";

interface DonutData {
  color: string;
  name: string;
  value: number;
}

interface DonutLegendProps {
  enabled?: boolean;
  maxItems?: number;
  sortBy?: "value" | "name";
}

interface Props {
  data: DonutData[];
  formatValue?: (value: number) => string;
  innerRadius?: number;
  legend?: DonutLegendProps;
  outerRadius?: number;
  showTooltip?: boolean;
  size?: number;
  title?: string;
}

const defaultLegendProps: DonutLegendProps = {
  enabled: true,
};

export const DonutChart: React.FC<Props> = ({
  data,
  formatValue = (value) => value.toString(),
  innerRadius = 60,
  legend = defaultLegendProps,
  outerRadius = 120,
  showTooltip = true,
  size = 400,
  title,
}) => {
  const t = useTranslations("common.charts");

  const renderCustomTooltip: TooltipContentType<ValueType, NameType> = ({
    active,
    payload,
  }) => {
    const tooltipDataParsed = tooltipPayloadSchema.safeParse(payload[0]);

    if (!active || !tooltipDataParsed.success) {
      return null;
    }

    const tooltipData = tooltipDataParsed.data;
    const tooltipPayload = pieChartItemDataSchema.parse(tooltipData.payload);

    return (
      <div
        className="
          bg-background border-background-300 rounded-sm border p-2 shadow-sm
        "
      >
        <p className="text-sm font-medium">{tooltipData.name}</p>
        <p className="text-sm">
          {t.rich("tooltipValue", {
            bold: (chunks) => <span className="font-semibold">{chunks}</span>,
            value: formatValue(tooltipData.value),
          })}
        </p>
        <p className="text-sm">
          {t.rich("tooltipPercentage", {
            bold: (chunks) => <span className="font-semibold">{chunks}</span>,
            value: formatPercent(
              (tooltipData.value / tooltipPayload.total) * 100,
            ),
          })}
        </p>
      </div>
    );
  };

  const renderCustomLegend: DefaultLegendContentType = (props) => {
    const { payload } = props;

    const payloadEntries = payload?.slice() ?? [];

    if (!payloadEntries.length) {
      return null;
    }

    payloadEntries.sort((a, b) => {
      if (legend.sortBy === "value") {
        return Number(b.payload?.value) - Number(a.payload?.value);
      }

      if (legend.sortBy === "name") {
        const { value: aName = "" } = a;
        const { value: bName = "" } = b;
        return aName.localeCompare(bName);
      }

      return 0;
    });

    const legendEntries = legend.maxItems
      ? payloadEntries.slice(0, legend.maxItems)
      : payloadEntries;

    return (
      <ul className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {legendEntries.map((entry) => (
          <li className="flex items-center gap-2" key={entry.value}>
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-stone-700">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Calculate total for percentage calculations
  const dataWithTotal = data.map((item) => ({
    ...item,
    total: data.reduce((sum, d) => sum + d.value, 0),
  }));

  const rotation = 90;
  const titleSize = size > 200 ? "text-2xl" : "text-xl";

  return (
    <div className="w-full">
      {title && (
        <h2 className={twMerge("mb-4 text-center font-black", titleSize)}>
          {title}
        </h2>
      )}
      <ResponsiveContainer height={size} width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={dataWithTotal}
            dataKey="value"
            endAngle={360 + rotation}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={1}
            startAngle={rotation}
            stroke="none"
          >
            {dataWithTotal.map((entry) => (
              <Cell fill={entry.color} key={`cell-${entry.name}`} />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              animationDuration={0} // Workaround for: https://github.com/shadcn-ui/ui/issues/8005
              content={renderCustomTooltip}
            />
          )}
          {legend.enabled && <Legend content={renderCustomLegend} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
