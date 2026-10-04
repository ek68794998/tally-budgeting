import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataCard } from "./dataCard";

describe("DataCard", () => {
  it.each([
    "md",
    "lg",
    "xl",
  ] as const)("renders every data point at size %s", (size) => {
    render(
      <DataCard
        centered={true}
        data={[
          { title: "Income", value: "$10" },
          { title: "Spent", value: "$5" },
        ]}
        size={size}
      />,
    );

    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("$5")).toBeInTheDocument();
  });

  it("accepts a single data point", () => {
    render(<DataCard data={{ title: "Net", value: 0 }} />);

    expect(screen.getByText("Net")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
