import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsSectionContent } from "./settingsSectionContent";

vi.mock("./sections/dataSection", () => ({
	DataSection: vi.fn(() => <div data-testid="data-section" />),
}));
vi.mock("./sections/generalSection", () => ({
	GeneralSection: vi.fn(() => <div data-testid="general-section" />),
}));
vi.mock("./sections/providersSection", () => ({
	ProvidersSection: vi.fn(() => <div data-testid="providers-section" />),
}));

describe("SettingsSectionContent", () => {
	it.each([
		{ hasNote: true, id: "general" as const, testId: "general-section" },
		{
			hasNote: false,
			id: "providers" as const,
			testId: "providers-section",
		},
		{ hasNote: false, id: "data" as const, testId: "data-section" },
	])("renders the $id section, with the local-settings note only where needed", ({
		hasNote,
		id,
		testId,
	}) => {
		render(<SettingsSectionContent sectionId={id} />);

		expect(screen.getByTestId(testId)).toBeInTheDocument();
		expect(
			Boolean(screen.queryByText(/aren't shared with other devices/)),
		).toBe(hasNote);
	});
});
