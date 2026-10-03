import { IconHome } from "@tabler/icons-react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarLogo } from "./sidebarLogo";
import { SidebarMenuItems } from "./sidebarMenuItems";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
	}: React.PropsWithChildren<{ href: string }>) => (
		<a href={href}>{children}</a>
	),
}));

describe("SidebarMenuItems", () => {
	it("renders links and actions, skipping empty entries", () => {
		const onPress = vi.fn();

		render(
			<SidebarMenuItems
				footerMenuItems={[
					{
						IconComponent: IconHome,
						id: "logout",
						label: "Log out",
						onPress,
					},
					false,
				]}
				menuItems={[
					{
						href: "/budget",
						IconComponent: IconHome,
						id: "budget",
						isSelected: true,
						label: "Budget",
					},
					{
						href: "/assets",
						IconComponent: IconHome,
						id: "assets",
						isSelected: false,
						label: "Assets",
					},
					null,
				]}
			/>,
		);

		fireEvent.click(screen.getByText("Log out"));

		expect(screen.getByText("Budget").closest("a")).toHaveAttribute(
			"href",
			"/budget",
		);
		expect(screen.getByText("Assets")).toBeInTheDocument();
		expect(onPress).toHaveBeenCalledOnce();
		expect(screen.getByText(/© 2025/)).toBeInTheDocument();
	});

	it("renders without footer items", () => {
		render(<SidebarMenuItems menuItems={[]} />);

		expect(screen.getByText(/Eric Kumlin/)).toBeInTheDocument();
	});
});

describe("SidebarLogo", () => {
	it("renders the app name", () => {
		render(<SidebarLogo />);

		expect(screen.getByText("tally")).toBeInTheDocument();
	});
});
