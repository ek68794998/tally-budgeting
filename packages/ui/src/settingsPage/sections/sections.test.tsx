import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSetting } from "../../hooks/useSetting";
import { GeneralSection } from "./generalSection";
import { ProvidersSection } from "./providersSection";

vi.mock("../../hooks/useSetting", () => ({ useSetting: vi.fn() }));
vi.mock("../../dataProviderIcons/dataProviderIcon", () => ({
	DataProviderIcon: vi.fn(() => <span />),
}));

const mockSetting = (
	value: unknown,
	scope: "database" | "local",
	isLoading = false,
) => {
	const setValue = vi.fn();

	vi.mocked(useSetting).mockReturnValue([
		dangerouslyCoerceType<never>(value),
		setValue,
		{ isLoading, scope },
	]);

	return setValue;
};

describe("settings sections", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GeneralSection saves the chosen theme and labels it as browser-only", () => {
		const setValue = mockSetting("system", "local");

		render(<GeneralSection />);

		expect(screen.getByText("This browser")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("tab", { name: "Dark" }));

		expect(setValue).toHaveBeenCalledWith("dark");
	});

	it("ProvidersSection saves hidden providers and labels them as server-side", () => {
		const setValue = mockSetting([], "database");

		render(<ProvidersSection />);

		expect(screen.getByText("Saved to server")).toBeInTheDocument();
		expect(
			screen.getByText(
				/Existing accounts and transactions are unaffected/,
			),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("switch", { name: "Apple Wallet" }));

		expect(setValue).toHaveBeenCalledWith(["apple"]);
	});

	it("ProvidersSection shows a spinner instead of switches while loading", () => {
		mockSetting([], "database", true);

		render(<ProvidersSection />);

		expect(screen.queryByRole("switch")).not.toBeInTheDocument();
	});
});
