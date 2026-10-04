import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import { tooltipPayloadSchema } from "@tally/data-models/thirdParty/recharts";
import { Dollars } from "@tally/utilities/financial/dollars";
import { DateTime } from "luxon";
import { useLocale } from "next-intl";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type NameType,
  type ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { type ContentType as TooltipContentType } from "recharts/types/component/Tooltip";
import z from "zod";
import { ChartColors } from "../colors";
import { formatCurrency } from "../format";

interface Props {
  data: Omit<NetWorthSnapshot, "id">[];
}

const chartDataPointSchema = z.object({
  date: z.iso.datetime(),
  timestamp: z.number().min(0),
  value: z.number().min(0),
});

type ChartDataPoint = z.infer<typeof chartDataPointSchema>;

export const NetWorthOverTimeCard: React.FC<Props> = ({ data }) => {
  const locale = useLocale();

  const chartData = data.map(
    (point): ChartDataPoint => ({
      date: point.date,
      timestamp: DateTime.fromISO(point.date).toMillis(),
      value: Dollars.fromCents(point.valueCents),
    }),
  );

  // Calculate Y-axis domain with padding
  const getYAxisDomain = () => {
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range * 0.2; // 20% padding on each side

    const lowerBound = Math.max(0, min - padding); // Don't go below 0 unless data does
    const upperBound = max + padding;

    return [lowerBound, upperBound];
  };

  // Custom tooltip to format dollar amounts
  const renderCustomTooltip: TooltipContentType<ValueType, NameType> = ({
    active,
    payload,
  }) => {
    const tooltipDataParsed = tooltipPayloadSchema.safeParse(payload[0]);

    if (!active || !tooltipDataParsed.success) {
      return null;
    }

    const tooltipData = tooltipDataParsed.data;
    const tooltipPayload = chartDataPointSchema.parse(tooltipData.payload);

    return (
      <div
        className="
          bg-background border-background-300 rounded-sm border p-2 shadow-sm
        "
      >
        <p className="text-sm font-medium">
          {DateTime.fromISO(tooltipPayload.date).toLocaleString(
            { day: "numeric", month: "long", year: "numeric" },
            { locale },
          )}
        </p>
        <p className="text-success-600 text-sm">
          {formatCurrency(tooltipPayload.value)}
        </p>
      </div>
    );
  };

  // Y-axis tick formatter for dollars
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) {
      // Format as millions with 2 decimal places
      return new Intl.NumberFormat(locale, {
        compactDisplay: "short",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        notation: "compact",
        style: "currency",
      }).format(value);
    } else if (value >= 1_000) {
      // Format as thousands with no decimal places
      return new Intl.NumberFormat(locale, {
        compactDisplay: "short",
        currency: "USD",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
        notation: "compact",
        style: "currency",
      }).format(value);
    } else {
      // Format as regular dollars
      return new Intl.NumberFormat(locale, {
        currency: "USD",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
        style: "currency",
      }).format(value);
    }
  };

  // X-axis tick formatter for dates
  const formatXAxis = (timestamp: number) =>
    DateTime.fromMillis(timestamp).toFormat("MMM dd");

  return (
    <ResponsiveContainer height={400} width="100%">
      <LineChart
        data={chartData}
        margin={{ bottom: 5, left: 20, right: 30, top: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          domain={["dataMin", "dataMax"]}
          tick={{ fontSize: 12 }}
          tickFormatter={formatXAxis}
          type="number"
        />
        <YAxis
          domain={getYAxisDomain()}
          tick={{ fontSize: 12 }}
          tickFormatter={formatYAxis}
        />
        <Tooltip
          animationDuration={0} // Workaround for: https://github.com/shadcn-ui/ui/issues/8005
          content={renderCustomTooltip}
        />
        <Line
          activeDot={{ r: 5 }}
          dataKey="value"
          dot={{ r: 3 }}
          stroke={ChartColors[0]}
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
