import { PageLayout } from "@tally/ui/common/pageLayout";
import { HelpLink } from "@tally/ui/helpLink/helpLink";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AssetsLayout from "./assets/layout";
import BudgetLayout from "./budget/layout";
import { HelpContent } from "./help/helpContent";
import RetirementLayout from "./retirement/layout";
import SettingsLayout from "./settings/layout";
import TransactionsLayout from "./transactions/layout";

vi.mock("@tally/ui/budget/budgetPage/budgetMenuDropdown", () => ({
	BudgetMenuDropdown: vi.fn(() => <div data-testid="budget-menu" />),
}));
vi.mock("@tally/ui/common/pageLayout", () => ({
	PageLayout: vi.fn(
		({
			actions,
			children,
		}: React.PropsWithChildren<{ actions?: React.ReactNode }>) => (
			<div data-testid="page-layout">
				{actions}
				{children}
			</div>
		),
	),
}));
vi.mock("@tally/ui/helpLink/helpLink", () => ({
	HelpLink: vi.fn(({ children }: React.PropsWithChildren) => (
		<div data-testid="help-link">{children}</div>
	)),
}));
vi.mock("./help/helpContent", () => ({
	HelpContent: vi.fn(() => <div data-testid="help-content" />),
}));

describe("app layouts", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each([
		{ layout: AssetsLayout, title: "Net Worth & Assets", topic: "assets" },
		{ layout: BudgetLayout, title: "Budget", topic: "budget" },
		{ layout: RetirementLayout, title: "Retirement", topic: "retirement" },
		{
			layout: TransactionsLayout,
			title: "Transactions",
			topic: "transactions",
		},
	])("titles the $topic section and links to its help", ({
		layout,
		title,
		topic,
	}) => {
		render(createElement(layout, null, <div data-testid="child" />));

		expect(vi.mocked(PageLayout).mock.lastCall?.[0].title).toBe(title);
		expect(vi.mocked(HelpLink).mock.lastCall?.[0].subject).toBe(title);
		expect(vi.mocked(HelpContent).mock.lastCall?.[0]).toEqual({ topic });
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	it.each([
		{
			layout: BudgetLayout,
			subpages: ["/budget/categories", "/budget/spending"],
		},
		{
			layout: TransactionsLayout,
			subpages: ["/transactions/rules", "/transactions/upload"],
		},
	])("names known subpages for $subpages", ({ layout, subpages }) => {
		render(createElement(layout));

		expect(
			Object.values(
				vi.mocked(PageLayout).mock.lastCall?.[0].knownSubpages ?? {},
			).map(({ href }) => href),
		).toEqual(subpages);
	});

	it("renders the budget menu and a settings layout without help", () => {
		render(<BudgetLayout />);

		expect(screen.getByTestId("budget-menu")).toBeInTheDocument();

		vi.clearAllMocks();
		render(<SettingsLayout />);

		expect(vi.mocked(PageLayout).mock.lastCall?.[0].title).toBe("Settings");
		expect(HelpLink).not.toHaveBeenCalled();
	});
});
