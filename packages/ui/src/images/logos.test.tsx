import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { AppleLogoSvg } from "./appleLogo";
import { ChaseLogoSvg } from "./chaseLogo";
import { FidelityLogoSvg } from "./fidelityLogo";
import { FirstTechLogoSvg } from "./firstTechLogo";
import { GuidelineLogoSvg } from "./guidelineLogo";
import { RipplingLogoSvg } from "./ripplingLogo";
import { RobinhoodLogoSvg } from "./robinhoodLogo";
import { VestwellLogoSvg } from "./vestwellLogo";

const logos = [
  ["AppleLogoSvg", AppleLogoSvg],
  ["ChaseLogoSvg", ChaseLogoSvg],
  ["FidelityLogoSvg", FidelityLogoSvg],
  ["FirstTechLogoSvg", FirstTechLogoSvg],
  ["GuidelineLogoSvg", GuidelineLogoSvg],
  ["RipplingLogoSvg", RipplingLogoSvg],
  ["RobinhoodLogoSvg", RobinhoodLogoSvg],
  ["VestwellLogoSvg", VestwellLogoSvg],
] as const;

const getSvg = (container: HTMLElement) => {
  const svg = container.querySelector("svg");

  if (!svg) {
    throw new Error("No SVG was rendered.");
  }

  return svg;
};

describe("logo SVGs", () => {
  it.each(logos)("%s matches its snapshot", (_name, logo) => {
    const { container } = render(createElement(logo));

    expect(container.firstChild).toMatchSnapshot();
  });

  it.each(logos)("%s scales to fit its container", (_name, logo) => {
    const { container } = render(
      createElement(logo, { containerHeight: 20, containerWidth: 20 }),
    );
    const svg = getSvg(container);

    expect(
      Math.max(
        Number(svg.getAttribute("width")),
        Number(svg.getAttribute("height")),
      ),
    ).toBeCloseTo(20);
  });

  it.each(
    logos,
  )("%s honors explicit dimensions without a container", (_name, logo) => {
    const { container } = render(createElement(logo, { height: 7, width: 9 }));
    const svg = getSvg(container);

    expect(svg.getAttribute("height")).toBe("7");
    expect(svg.getAttribute("width")).toBe("9");
  });
});
