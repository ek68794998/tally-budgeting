import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RipplingIcon } from "./ripplingIcon";

vi.mock("../images/ripplingLogo", () => ({
  RipplingLogoSvg: vi.fn(() => "(react:RipplingLogoSvg)"),
}));

describe("RipplingIcon", () => {
  it("renders correctly", () => {
    const { container } = render(
      <RipplingIcon containerSizePx={30} sizePx={24} />,
    );
    expect(container).toMatchSnapshot();
  });
});
