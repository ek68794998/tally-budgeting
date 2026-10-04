import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RuleEditMerchantMatchAlert } from "./ruleEditMerchantMatchAlert";

const mismatchText =
  "The expression you've provided does not match this description.";

describe("RuleEditMerchantMatchAlert", () => {
  it.each([
    { isRegexMismatch: true, mismatchCount: 1 },
    { isRegexMismatch: false, mismatchCount: 0 },
  ])("shows the merchant (mismatch=$isRegexMismatch)", ({
    isRegexMismatch,
    mismatchCount,
  }) => {
    render(
      <RuleEditMerchantMatchAlert
        isRegexMismatch={isRegexMismatch}
        merchantToMatch="SQ *COFFEE 123"
      />,
    );

    expect(screen.getByText("SQ *COFFEE 123")).toBeInTheDocument();
    expect(screen.queryAllByText(mismatchText)).toHaveLength(mismatchCount);
  });

  it("renders nothing without a merchant", () => {
    const { container } = render(
      <RuleEditMerchantMatchAlert
        isRegexMismatch={false}
        merchantToMatch={undefined}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
