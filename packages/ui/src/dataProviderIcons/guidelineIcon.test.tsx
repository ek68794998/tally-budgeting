import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GuidelineIcon } from "./guidelineIcon";

vi.mock("../images/guidelineLogo", () => ({
	GuidelineLogoSvg: vi.fn(() => "(react:GuidelineLogoSvg)"),
}));

describe("GuidelineIcon", () => {
	it("renders correctly", () => {
		const { container } = render(
			<GuidelineIcon containerSizePx={30} sizePx={24} />,
		);
		expect(container).toMatchSnapshot();
	});
});
