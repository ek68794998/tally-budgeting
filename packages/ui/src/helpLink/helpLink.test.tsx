import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HelpLink } from "./helpLink";

vi.mock("next/navigation", () => ({
	useRouter: vi.fn(),
}));

vi.mock("@heroui/react", () => ({
	Button: vi.fn(
		({
			children,
			onPress,
		}: {
			children: React.ReactNode;
			onPress: () => void;
		}) => (
			<button onClick={onPress} type="button">
				{children}
			</button>
		),
	),
	Tooltip: vi.fn(({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	)),
}));

vi.mock("@tabler/icons-react", () => ({
	IconHelp: vi.fn(() => null),
}));

const mockUseRouter = vi.mocked(useRouter);

describe("HelpLink", () => {
	const mockPush = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseRouter.mockReturnValue(
			mockIncompleteObject<ReturnType<typeof useRouter>>({
				push: mockPush,
			}),
		);
	});

	it("renders a button", () => {
		render(<HelpLink linkPath="/help/budget" subject="Budget" />);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("calls router.push with linkPath when pressed", () => {
		render(<HelpLink linkPath="/help/budget" subject="Budget" />);
		fireEvent.click(screen.getByRole("button"));
		expect(mockPush).toHaveBeenCalledWith("/help/budget");
	});

	it("navigates to the correct path for different linkPaths", () => {
		render(
			<HelpLink linkPath="/help/transactions" subject="Transactions" />,
		);
		fireEvent.click(screen.getByRole("button"));
		expect(mockPush).toHaveBeenCalledWith("/help/transactions");
	});
});
