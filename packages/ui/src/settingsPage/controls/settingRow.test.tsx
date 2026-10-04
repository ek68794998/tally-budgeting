import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingRow } from "./settingRow";

describe("SettingRow", () => {
	it.each([
		{ expected: "This browser", scope: "local" as const },
		{ expected: "Saved to server", scope: "database" as const },
	])("shows the $expected chip for $scope settings", ({
		expected,
		scope,
	}) => {
		render(
			<SettingRow description="Helpful text" label="Theme" scope={scope}>
				<button type="button">{"control"}</button>
			</SettingRow>,
		);

		expect(screen.getByText(expected)).toBeInTheDocument();
		expect(screen.getByText("Theme")).toBeInTheDocument();
		expect(screen.getByText("Helpful text")).toBeInTheDocument();
		expect(screen.getByText("control")).toBeInTheDocument();
	});

	it("omits the description when none is given", () => {
		render(
			<SettingRow label="Theme" scope="local">
				<span />
			</SettingRow>,
		);

		expect(screen.queryByText("Helpful text")).not.toBeInTheDocument();
	});
});
