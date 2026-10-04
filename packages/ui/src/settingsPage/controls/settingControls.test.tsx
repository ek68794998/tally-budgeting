import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingProviderList } from "./settingProviderList";
import { SettingSegmented } from "./settingSegmented";
import { SettingSwitch } from "./settingSwitch";

vi.mock("../../dataProviderIcons/dataProviderIcon", () => ({
	DataProviderIcon: vi.fn(() => <span data-testid="provider-icon" />),
}));

describe("setting controls", () => {
	it("SettingSwitch reports toggles", () => {
		const onValueChange = vi.fn();

		render(
			<SettingSwitch
				isSelected={false}
				label="Enable"
				onValueChange={onValueChange}
			/>,
		);

		fireEvent.click(screen.getByRole("switch", { name: "Enable" }));

		expect(onValueChange).toHaveBeenCalledWith(true);
	});

	it("SettingSegmented selects the current option and reports a different one", () => {
		const onChange = vi.fn();

		render(
			<SettingSegmented
				label="Theme"
				onChange={onChange}
				options={[
					{ label: "Light", value: "light" },
					{ label: "Dark", value: "dark" },
				]}
				value="light"
			/>,
		);

		expect(screen.getByRole("tab", { name: "Light" })).toHaveAttribute(
			"aria-selected",
			"true",
		);

		fireEvent.click(screen.getByRole("tab", { name: "Dark" }));

		expect(onChange).toHaveBeenCalledWith("dark");
	});

	describe("SettingProviderList", () => {
		it("shows a switch per provider, off for hidden ones", () => {
			render(
				<SettingProviderList
					hiddenProviders={["chase"]}
					onChange={vi.fn()}
				/>,
			);

			expect(
				screen.getByRole("switch", { name: "Chase Bank" }),
			).not.toBeChecked();
			expect(
				screen.getByRole("switch", { name: "Fidelity Investments" }),
			).toBeChecked();
			expect(screen.getAllByTestId("provider-icon")).toHaveLength(8);
		});

		it.each([
			{
				clicked: "Fidelity Investments",
				expected: ["chase", "fidelity"],
			},
			{ clicked: "Chase Bank", expected: [] },
		])("reports $expected after toggling $clicked", ({
			clicked,
			expected,
		}) => {
			const onChange = vi.fn();

			render(
				<SettingProviderList
					hiddenProviders={["chase"]}
					onChange={onChange}
				/>,
			);

			fireEvent.click(screen.getByRole("switch", { name: clicked }));

			expect(onChange).toHaveBeenCalledWith(expected);
		});
	});
});
