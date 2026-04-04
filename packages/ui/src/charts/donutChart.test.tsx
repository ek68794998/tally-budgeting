import { invariant } from "@ekumlin/typescript-toolkit/values";
import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { render, screen } from "@testing-library/react";
import {
	type TooltipProps as ExtendedTooltipProps,
	Legend,
	type NameType,
	Tooltip,
	type ValueType,
} from "recharts";
import { type Props as LegendProps } from "recharts/types/component/DefaultLegendContent";
import { type Props as DefaultTooltipProps } from "recharts/types/component/DefaultTooltipContent";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DonutChart } from "./donutChart";

type TooltipProps<TValue extends ValueType, TName extends NameType> = Omit<
	DefaultTooltipProps<TValue, TName> & ExtendedTooltipProps<TValue, TName>,
	"accessibilityLayer"
>;

vi.mock("next-intl", () => ({
	useTranslations: () =>
		Object.assign((_key: string) => "", {
			rich: (_key: string, _values?: unknown) => "",
		}),
}));

vi.mock("recharts", () => ({
	Cell: vi.fn(() => null),
	Legend: vi.fn(() => null),
	Pie: vi.fn(({ children }: React.PropsWithChildren) => (
		<div>{children}</div>
	)),
	PieChart: vi.fn(({ children }: React.PropsWithChildren) => (
		<div>{children}</div>
	)),
	ResponsiveContainer: vi.fn(({ children }: React.PropsWithChildren) => (
		<div>{children}</div>
	)),
	Tooltip: vi.fn(() => null),
}));

const mockLegend = vi.mocked(Legend);
const mockTooltip = vi.mocked(Tooltip);

const getLegendContent = () => {
	const { content } = mockLegend.mock.calls[0]?.[0] ?? {};
	invariant(content);

	return dangerouslyCoerceType<React.FC<LegendProps>>(content);
};

const getTooltipContent = () => {
	const { content } = mockTooltip.mock.calls[0]?.[0] ?? {};
	invariant(content);

	return dangerouslyCoerceType<React.FC<TooltipProps<ValueType, NameType>>>(
		content,
	);
};

const defaultData = [
	{ color: "#ff0000", name: "Alpha", value: 100 },
	{ color: "#00ff00", name: "Beta", value: 50 },
	{ color: "#0000ff", name: "Gamma", value: 200 },
];

describe("DonutChart", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("title", () => {
		it("renders title when provided", () => {
			render(<DonutChart data={defaultData} title="My Chart" />);
			expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
				"My Chart",
			);
		});

		it("does not render a heading when title is omitted", () => {
			render(<DonutChart data={defaultData} />);
			expect(screen.queryByRole("heading")).not.toBeInTheDocument();
		});

		it.each([
			["text-2xl", 400],
			["text-2xl", 201],
			["text-xl", 200],
			["text-xl", 100],
		])("applies %s to title when size=%i", (expectedClass, size) => {
			render(<DonutChart data={defaultData} size={size} title="Chart" />);
			expect(screen.getByRole("heading", { level: 2 })).toHaveClass(
				expectedClass,
			);
		});
	});

	describe("tooltip", () => {
		it("renders Tooltip by default", () => {
			render(<DonutChart data={defaultData} />);
			expect(mockTooltip).toHaveBeenCalled();
		});

		it("does not render Tooltip when showTooltip is false", () => {
			render(<DonutChart data={defaultData} showTooltip={false} />);
			expect(mockTooltip).not.toHaveBeenCalled();
		});

		it("returns null when active is false", () => {
			render(<DonutChart data={defaultData} />);
			const TooltipContent = getTooltipContent();
			const { container } = render(
				<TooltipContent active={false} payload={[]} />,
			);
			expect(container).toBeEmptyDOMElement();
		});

		it("returns null when payload does not match the expected schema", () => {
			render(<DonutChart data={defaultData} />);
			const TooltipContent = getTooltipContent();
			const { container } = render(
				<TooltipContent
					active={true}
					payload={[mockIncompleteObject({})]}
				/>,
			);
			expect(container).toBeEmptyDOMElement();
		});

		it("renders name and calls formatValue for valid tooltip data", () => {
			const formatValue = vi.fn((v: number) => `$${v}`);
			render(<DonutChart data={defaultData} formatValue={formatValue} />);
			const TooltipContent = getTooltipContent();

			render(
				<TooltipContent
					active={true}
					payload={[
						{
							color: "#ff0000",
							dataKey: "value",
							fill: "#ff0000",
							graphicalItemId: "",
							hide: false,
							name: "Alpha",
							payload: {
								color: "#ff0000",
								fill: "#ff0000",
								name: "Alpha",
								total: 350,
								value: 100,
							},
							value: 100,
						},
					]}
				/>,
			);

			expect(screen.getByText("Alpha")).toBeInTheDocument();
			expect(formatValue).toHaveBeenCalledWith(100);
		});
	});

	describe("legend", () => {
		it("renders Legend by default", () => {
			render(<DonutChart data={defaultData} />);
			expect(mockLegend).toHaveBeenCalled();
		});

		it("does not render Legend when legend.enabled is false", () => {
			render(
				<DonutChart data={defaultData} legend={{ enabled: false }} />,
			);
			expect(mockLegend).not.toHaveBeenCalled();
		});

		it("returns null for empty payload", () => {
			render(<DonutChart data={defaultData} />);
			const LegendContent = getLegendContent();
			const { container } = render(<LegendContent payload={[]} />);
			expect(container).toBeEmptyDOMElement();
		});

		it.each([
			["value" as const, ["Gamma", "Alpha", "Beta"]],
			["name" as const, ["Alpha", "Beta", "Gamma"]],
			[undefined, ["Gamma", "Alpha", "Beta"]], // original order preserved
		])("orders legend entries correctly with sortBy=%s", (sortBy, expectedOrder) => {
			render(
				<DonutChart
					data={defaultData}
					legend={{ enabled: true, sortBy }}
				/>,
			);
			const LegendContent = getLegendContent();

			const { getAllByRole } = render(
				<LegendContent
					payload={[
						{
							color: "#0000ff",
							payload: { value: 200 },
							value: "Gamma",
						},
						{
							color: "#ff0000",
							payload: { value: 100 },
							value: "Alpha",
						},
						{
							color: "#00ff00",
							payload: { value: 50 },
							value: "Beta",
						},
					]}
				/>,
			);

			const items = getAllByRole("listitem");
			expectedOrder.forEach((name, i) => {
				expect(items[i]).toHaveTextContent(name);
			});
		});

		it("limits legend entries to maxItems", () => {
			render(
				<DonutChart
					data={defaultData}
					legend={{ enabled: true, maxItems: 2 }}
				/>,
			);
			const LegendContent = getLegendContent();

			const { getAllByRole } = render(
				<LegendContent
					payload={[
						{
							color: "#ff0000",
							payload: { value: 100 },
							value: "Alpha",
						},
						{
							color: "#00ff00",
							payload: { value: 50 },
							value: "Beta",
						},
						{
							color: "#0000ff",
							payload: { value: 200 },
							value: "Gamma",
						},
					]}
				/>,
			);

			expect(getAllByRole("listitem")).toHaveLength(2);
		});
	});
});
