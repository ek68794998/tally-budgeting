import { type SubpageMap } from "@tally/utilities/routing/pageData";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { PageTitle } from "./pageTitle";

vi.mock("next/navigation", () => ({
	usePathname: vi.fn(),
}));

vi.mock("next/link", () => ({
	default: vi.fn(
		({ children, href }: { children: React.ReactNode; href: string }) => (
			<a href={href}>{children}</a>
		),
	),
}));

vi.mock("@heroui/react", () => ({
	Link: vi.fn(
		({ children, href }: { children: React.ReactNode; href: string }) => (
			<a href={href}>{children}</a>
		),
	),
}));

vi.mock("@tabler/icons-react", () => ({
	IconChevronsRight: vi.fn(() => <span data-testid="chevron" />),
}));

const mockUsePathname = vi.mocked(usePathname);

describe("PageTitle", () => {
	describe("title rendering", () => {
		it.each([
			["Dashboard", "/dashboard"],
			["Budget", "/budget"],
			["Settings", "/settings"],
		])("renders %s as the last breadcrumb", (title, path) => {
			mockUsePathname.mockReturnValue(path);

			render(<PageTitle title={title} />);

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveTextContent(title);
		});

		it("renders the title as a bold div (not a link) when it is the only breadcrumb", () => {
			mockUsePathname.mockReturnValue("/dashboard");

			render(<PageTitle title="Dashboard" />);

			expect(screen.queryByRole("link")).not.toBeInTheDocument();
			expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
				"Dashboard",
			);
		});
	});

	describe("breadcrumb links", () => {
		const knownSubpages: SubpageMap = {
			details: { href: "/budget/details", title: "Details" },
			settings: { href: "/dashboard/settings", title: "Settings" },
		};

		it("renders root as a link when a known subpage is active", () => {
			mockUsePathname.mockReturnValue("/dashboard/settings");

			render(
				<PageTitle knownSubpages={knownSubpages} title="Dashboard" />,
			);

			const links = screen.getAllByRole("link");
			expect(links).toHaveLength(1);
			expect(links[0]).toHaveTextContent("Dashboard");
			expect(links[0]).toHaveAttribute("href", "/dashboard");
		});

		it("renders the subpage title as the last (non-link) breadcrumb", () => {
			mockUsePathname.mockReturnValue("/dashboard/settings");

			render(
				<PageTitle knownSubpages={knownSubpages} title="Dashboard" />,
			);

			expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
				"Settings",
			);
			const links = screen.getAllByRole("link");
			expect(links.every((l) => l.textContent !== "Settings")).toBe(true);
		});

		it("renders a chevron separator between breadcrumbs", () => {
			mockUsePathname.mockReturnValue("/dashboard/settings");

			render(
				<PageTitle knownSubpages={knownSubpages} title="Dashboard" />,
			);

			expect(screen.getByTestId("chevron")).toBeInTheDocument();
		});

		it("skips path segments not present in knownSubpages", () => {
			mockUsePathname.mockReturnValue("/dashboard/unknown");

			render(
				<PageTitle knownSubpages={knownSubpages} title="Dashboard" />,
			);

			expect(screen.queryByRole("link")).not.toBeInTheDocument();
			expect(screen.queryByTestId("chevron")).not.toBeInTheDocument();
		});

		it.each([
			["/budget/details", "Details"],
			["/dashboard/settings", "Settings"],
		])("renders the correct subpage title for path %s", (path, expectedSubpageTitle) => {
			mockUsePathname.mockReturnValue(path);

			render(<PageTitle knownSubpages={knownSubpages} title="Root" />);

			const links = screen.getAllByRole("link");
			expect(links).toHaveLength(1);
			expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
				expectedSubpageTitle,
			);
		});

		it("renders multiple breadcrumb links for a deep path", () => {
			const deepSubpages: SubpageMap = {
				child: { href: "/root/parent/child", title: "Child" },
				parent: { href: "/root/parent", title: "Parent" },
			};

			mockUsePathname.mockReturnValue("/root/parent/child");

			render(<PageTitle knownSubpages={deepSubpages} title="Root" />);

			const links = screen.getAllByRole("link");
			expect(links).toHaveLength(2);
			expect(links[0]).toHaveTextContent("Root");
			expect(links[1]).toHaveTextContent("Parent");
			expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
				"Child",
			);
			expect(screen.getAllByTestId("chevron")).toHaveLength(2);
		});
	});

	describe("base href construction", () => {
		it.each([
			["/dashboard", "/dashboard"],
			["/budget/details", "/budget"],
			["/settings/profile", "/settings"],
		])("links to the correct base href for path %s", (path, expectedBaseHref) => {
			const subpages: SubpageMap = {
				details: { href: "/budget/details", title: "Details" },
				profile: { href: "/settings/profile", title: "Profile" },
			};

			mockUsePathname.mockReturnValue(path);

			render(<PageTitle knownSubpages={subpages} title="Root" />);

			const links = screen.queryAllByRole("link");

			if (links.length > 0) {
				expect(links[0]).toHaveAttribute("href", expectedBaseHref);
			}
		});
	});
});
