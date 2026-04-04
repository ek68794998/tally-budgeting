import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChaseIcon } from "./chaseIcon";

vi.mock("../images/chaseLogo", () => ({
	ChaseLogoSvg: vi.fn(() => "(react:ChaseLogoSvg)"),
}));

describe("ChaseIcon", () => {
	it("renders correctly", () => {
		const { container } = render(
			<ChaseIcon containerSizePx={30} sizePx={24} />,
		);
		expect(container).toMatchSnapshot();
	});
});
