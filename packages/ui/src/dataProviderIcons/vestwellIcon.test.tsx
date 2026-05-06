import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VestwellIcon } from "./vestwellIcon";

vi.mock("../images/vestwellLogo", () => ({
	VestwellLogoSvg: vi.fn(() => "(react:VestwellLogoSvg)"),
}));

describe("VestwellIcon", () => {
	it("renders correctly", () => {
		const { container } = render(
			<VestwellIcon containerSizePx={30} sizePx={24} />,
		);
		expect(container).toMatchSnapshot();
	});
});
