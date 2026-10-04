import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppleIcon } from "./appleIcon";

vi.mock("../images/appleLogo", () => ({
  AppleLogoSvg: vi.fn(() => "(react:AppleLogoSvg)"),
}));

describe("AppleIcon", () => {
  it("renders correctly", () => {
    const { container } = render(
      <AppleIcon containerSizePx={30} sizePx={24} />,
    );
    expect(container).toMatchSnapshot();
  });
});
