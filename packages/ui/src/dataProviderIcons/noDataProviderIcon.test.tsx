import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NoDataProviderIcon } from "./noDataProviderIcon";

vi.mock("@tabler/icons-react", () => ({
	IconCash: vi.fn(() => "(react:IconCash)"),
}));

describe("NoDataProviderIcon", () => {
	it("renders correctly", () => {
		const { container } = render(
			<NoDataProviderIcon containerSizePx={30} sizePx={24} />,
		);
		expect(container).toMatchSnapshot();
	});
});
