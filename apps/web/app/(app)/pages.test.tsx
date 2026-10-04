import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import BudgetCategoriesPage from "./budget/categories/page";
import BudgetPage from "./budget/page";
import BudgetSpendingPage from "./budget/spending/page";
import HomePage from "./page";
import RetirementPage from "./retirement/page";
import SettingsPage from "./settings/page";
import RootTemplate from "./template";
import TransactionsPage from "./transactions/page";
import TransactionsRulesPage from "./transactions/rules/page";
import TransactionsUploadPage from "./transactions/upload/page";

vi.mock("@tally/ui/budget/budgetCategoriesPage/categoriesMasterDetail", () => ({
	CategoriesMasterDetail: vi.fn(() => <div data-testid="categories" />),
}));
vi.mock("@tally/ui/budget/budgetPage/budgetDetails", () => ({
	BudgetDetails: vi.fn(() => <div data-testid="budget-details" />),
}));
vi.mock("@tally/ui/budget/budgetSpendingPage/spendingView", () => ({
	SpendingView: vi.fn(() => <div data-testid="spending" />),
}));
vi.mock("@tally/ui/settingsPage/settingsMasterDetail", () => ({
	SettingsMasterDetail: vi.fn(() => <div data-testid="settings" />),
}));
vi.mock("@tally/ui/retirementPage/retirementCalculator", () => ({
	RetirementCalculator: vi.fn(() => <div data-testid="retirement" />),
}));
vi.mock("@tally/ui/rulesTable/rulesTable", () => ({
	RulesTable: vi.fn(() => <div data-testid="rules" />),
}));
vi.mock("@tally/ui/common/databaseUnavailableBanner", () => ({
	DatabaseUnavailableBanner: vi.fn(() => (
		<div data-testid="database-unavailable" />
	)),
}));
vi.mock("@tally/ui/sidebar/sidebar", () => ({
	Sidebar: vi.fn(() => <div data-testid="sidebar" />),
}));
vi.mock("@tally/ui/transactionsTable/transactionsTable", () => ({
	TransactionsTable: vi.fn(() => <div data-testid="transactions" />),
}));
vi.mock("@tally/ui/transactionsUpload/transactionsUploadForm", () => ({
	TransactionsUploadForm: vi.fn(() => <div data-testid="upload" />),
}));
vi.mock("./budget/layout", () => ({
	default: vi.fn(({ children }: React.PropsWithChildren) => (
		<div data-testid="budget-layout">{children}</div>
	)),
}));

describe("app pages", () => {
	it.each([
		{ page: BudgetCategoriesPage, testId: "categories" },
		{ page: BudgetPage, testId: "budget-details" },
		{ page: BudgetSpendingPage, testId: "spending" },
		{ page: RetirementPage, testId: "retirement" },
		{ page: TransactionsPage, testId: "transactions" },
		{ page: TransactionsRulesPage, testId: "rules" },
		{ page: TransactionsUploadPage, testId: "upload" },
	])("renders the $testId view", ({ page, testId }) => {
		render(createElement(page));

		expect(screen.getByTestId(testId)).toBeInTheDocument();
	});

	it("shows the budget inside the budget layout on the home page", () => {
		render(<HomePage />);

		expect(screen.getByTestId("budget-layout")).toContainElement(
			screen.getByTestId("budget-details"),
		);
	});

	it("renders settings and wraps pages with the sidebar and database banner", () => {
		render(
			<RootTemplate>
				<SettingsPage />
			</RootTemplate>,
		);

		expect(screen.getByTestId("sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("database-unavailable")).toBeInTheDocument();
		expect(screen.getByTestId("settings")).toBeInTheDocument();
	});
});
