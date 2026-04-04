import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FidelityIcon } from "./fidelityIcon";

vi.mock("../images/fidelityLogo", () => ({
	FidelityLogoSvg: vi.fn(() => "(react:FidelityLogoSvg)"),
}));

describe("FidelityIcon", () => {
	it("renders correctly", () => {
		const { container } = render(
			<FidelityIcon containerSizePx={30} sizePx={24} />,
		);
		expect(container).toMatchSnapshot();
	});
});
