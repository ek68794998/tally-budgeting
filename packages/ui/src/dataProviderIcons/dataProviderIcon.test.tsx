import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataProviderIcon } from "./dataProviderIcon";
import { type DataProviderIconProps } from "./types";

const MockIconComponent: React.FC<DataProviderIconProps & { id: string }> = ({
  containerSizePx,
  id,
  sizePx,
}) => (
  <div
    data-container-size={containerSizePx}
    data-size={sizePx}
    data-testid={`${id.toLowerCase()}-icon`}
  />
);

vi.mock("./appleIcon", () => ({
  AppleIcon: vi.fn((props: DataProviderIconProps) =>
    MockIconComponent({ ...props, id: "Apple" }),
  ),
}));

vi.mock("./chaseIcon", () => ({
  ChaseIcon: vi.fn((props: DataProviderIconProps) =>
    MockIconComponent({ ...props, id: "Chase" }),
  ),
}));

vi.mock("./fidelityIcon", () => ({
  FidelityIcon: vi.fn((props: DataProviderIconProps) =>
    MockIconComponent({ ...props, id: "Fidelity" }),
  ),
}));

vi.mock("./firstTechIcon", () => ({
  FirstTechIcon: vi.fn((props: DataProviderIconProps) =>
    MockIconComponent({ ...props, id: "FirstTech" }),
  ),
}));

vi.mock("./guidelineIcon", () => ({
  GuidelineIcon: vi.fn((props: DataProviderIconProps) =>
    MockIconComponent({ ...props, id: "Guideline" }),
  ),
}));

vi.mock("./robinhoodIcon", () => ({
  RobinhoodIcon: vi.fn((props: DataProviderIconProps) =>
    MockIconComponent({ ...props, id: "Robinhood" }),
  ),
}));

vi.mock("./noDataProviderIcon", () => ({
  NoDataProviderIcon: vi.fn((props: DataProviderIconProps) =>
    MockIconComponent({ ...props, id: "NoDataProvider" }),
  ),
}));

describe("DataProviderIcon", () => {
  describe("provider routing", () => {
    it.each([
      ["apple", "apple-icon"],
      ["chase", "chase-icon"],
      ["fidelity", "fidelity-icon"],
      ["firstTechFederal", "firsttech-icon"],
      ["guideline", "guideline-icon"],
      ["robinhood", "robinhood-icon"],
    ] as const)("renders %s icon for provider '%s'", (provider, testId) => {
      render(<DataProviderIcon provider={provider} />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it("renders NoDataProviderIcon for null provider", () => {
      render(<DataProviderIcon provider={null} />);
      expect(screen.getByTestId("nodataprovider-icon")).toBeInTheDocument();
    });
  });

  describe("size prop", () => {
    it.each([
      ["sm", 16, 20],
      ["md", 24, 30],
      ["lg", 32, 40],
    ] as const)("passes correct sizePx and containerSizePx for size '%s'", (size, expectedSizePx, expectedContainerSizePx) => {
      render(<DataProviderIcon provider="chase" size={size} />);
      const icon = screen.getByTestId("chase-icon");
      expect(icon).toHaveAttribute("data-size", String(expectedSizePx));
      expect(icon).toHaveAttribute(
        "data-container-size",
        String(expectedContainerSizePx),
      );
    });

    it("defaults to md size when size is not provided", () => {
      render(<DataProviderIcon provider="chase" />);
      const icon = screen.getByTestId("chase-icon");
      expect(icon).toHaveAttribute("data-size", "24");
      expect(icon).toHaveAttribute("data-container-size", "30");
    });
  });
});
