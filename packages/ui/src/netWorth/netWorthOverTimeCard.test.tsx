import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NetWorthOverTimeCard } from "./netWorthOverTimeCard";

const { recharts } = vi.hoisted(() => ({
  recharts: {
    CartesianGrid: vi.fn(() => null),
    Line: vi.fn(() => null),
    LineChart: vi.fn(({ children }: React.PropsWithChildren) => (
      <div>{children}</div>
    )),
    ResponsiveContainer: vi.fn(({ children }: React.PropsWithChildren) => (
      <div>{children}</div>
    )),
    Tooltip: vi.fn(
      (_props: {
        content: (props: {
          active: boolean;
          payload: unknown[];
        }) => React.ReactNode;
      }) => null,
    ),
    xAxis: vi.fn(
      (_props: { tickFormatter: (value: number) => string }) => null,
    ),
    yAxis: vi.fn(
      (_props: {
        domain: number[];
        tickFormatter: (value: number) => string;
      }) => null,
    ),
  },
}));

vi.mock("recharts", () => {
  const { xAxis, yAxis, ...rest } = recharts;

  return {
    ...rest,
    ...Object.fromEntries([
      ["XAxis", xAxis],
      ["YAxis", yAxis],
    ]),
  };
});

const data = [
  { date: "2025-01-15T12:00:00.000Z", valueCents: 1000_00 },
  { date: "2025-02-15T12:00:00.000Z", valueCents: 2000_00 },
];

const getProps = <T,>(mock: { mock: { lastCall?: [T] } }) => {
  const props = mock.mock.lastCall?.[0];

  if (!props) {
    throw new Error("Component was not rendered.");
  }

  return props;
};

describe("NetWorthOverTimeCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<NetWorthOverTimeCard data={data} />);
  });

  it("pads the value axis by 20% of the range without going below zero", () => {
    expect(getProps(recharts.yAxis).domain).toEqual([800, 2200]);
  });

  it.each([
    { expected: "$2.50M", value: 2_500_000 },
    { expected: "$13K", value: 12_500 },
    { expected: "$500", value: 500 },
  ])("formats $value on the value axis as $expected", ({ expected, value }) => {
    expect(getProps(recharts.yAxis).tickFormatter(value)).toBe(expected);
  });

  it("formats dates on the time axis", () => {
    expect(
      getProps(recharts.xAxis).tickFormatter(
        Date.parse("2025-02-15T12:00:00.000Z"),
      ),
    ).toBe("Feb 15");
  });

  it("renders a tooltip for an active, valid point only", () => {
    const { content } = getProps(recharts.Tooltip);
    const point = {
      dataKey: "value",
      hide: false,
      name: "value",
      payload: {
        date: "2025-02-15T12:00:00.000Z",
        timestamp: 1,
        value: 2000,
      },
      value: 2000,
    };

    expect(content({ active: false, payload: [point] })).toBeNull();
    expect(content({ active: true, payload: [] })).toBeNull();

    render(content({ active: true, payload: [point] }));

    expect(screen.getByText("February 15, 2025")).toBeInTheDocument();
    expect(screen.getByText("$2,000")).toBeInTheDocument();
  });
});
