import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HelpLink } from "./helpLink";

vi.mock("@heroui/react", async () => {
	const { useState } = await import("react");

	return {
		Button: vi.fn(
			({
				children,
				onPress,
				...rest
			}: React.PropsWithChildren<{
				"aria-label"?: string;
				onPress: () => void;
			}>) => (
				<button
					aria-label={rest["aria-label"]}
					onClick={onPress}
					type="button"
				>
					{children}
				</button>
			),
		),
		Drawer: vi.fn(
			({
				children,
				isOpen,
			}: React.PropsWithChildren<{ isOpen: boolean }>) =>
				isOpen ? <div data-testid="drawer">{children}</div> : null,
		),
		DrawerBody: vi.fn(({ children }: React.PropsWithChildren) => (
			<div data-testid="drawer-body">{children}</div>
		)),
		DrawerContent: vi.fn(({ children }: React.PropsWithChildren) => (
			<>{children}</>
		)),
		DrawerHeader: vi.fn(({ children }: React.PropsWithChildren) => (
			<h2>{children}</h2>
		)),
		Tooltip: vi.fn(({ children }: React.PropsWithChildren) => (
			<>{children}</>
		)),
		useDisclosure: () => {
			const [isOpen, setIsOpen] = useState(false);
			return {
				isOpen,
				onOpen: () => setIsOpen(true),
				onOpenChange: setIsOpen,
			};
		},
	};
});

vi.mock("@tabler/icons-react", () => ({
	IconHelp: vi.fn(() => null),
}));

const helpTitle = /^About/;

describe("HelpLink", () => {
	it("renders a labeled button and keeps the drawer closed initially", () => {
		render(
			<HelpLink subject="Budget">
				<p>{"Help content"}</p>
			</HelpLink>,
		);

		expect(
			screen.getByRole("button", { name: helpTitle }),
		).toBeInTheDocument();
		expect(screen.queryByTestId("drawer")).not.toBeInTheDocument();
	});

	it("opens a drawer with the subject title and help content when pressed", () => {
		render(
			<HelpLink subject="Budget">
				<p>{"Help content"}</p>
			</HelpLink>,
		);

		fireEvent.click(screen.getByRole("button", { name: helpTitle }));

		expect(
			screen.getByRole("heading", { name: helpTitle }),
		).toBeInTheDocument();
		expect(screen.getByTestId("drawer-body")).toHaveTextContent(
			"Help content",
		);
	});
});
