import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FirstTechIcon } from "./firstTechIcon";

vi.mock("../images/firstTechLogo", () => ({
  FirstTechLogoSvg: vi.fn(() => "(react:FirstTechLogoSvg)"),
}));

describe("FirstTechIcon", () => {
  it("renders correctly", () => {
    const { container } = render(
      <FirstTechIcon containerSizePx={30} sizePx={24} />,
    );
    expect(container).toMatchSnapshot();
  });
});
