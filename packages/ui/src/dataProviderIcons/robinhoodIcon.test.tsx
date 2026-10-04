import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RobinhoodIcon } from "./robinhoodIcon";

vi.mock("../images/robinhoodLogo", () => ({
  RobinhoodLogoSvg: vi.fn(() => "(react:RobinhoodLogoSvg)"),
}));

describe("RobinhoodIcon", () => {
  it("renders correctly", () => {
    const { container } = render(
      <RobinhoodIcon containerSizePx={30} sizePx={24} />,
    );
    expect(container).toMatchSnapshot();
  });
});
