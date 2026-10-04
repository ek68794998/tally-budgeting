import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { fireEvent, render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsMasterDetail } from "./settingsMasterDetail";

vi.mock("next/navigation", () => ({ useSearchParams: vi.fn() }));
vi.mock("./settingsSectionListItem", () => ({
  SettingsSectionListItem: vi.fn(
    ({
      onClick,
      section,
    }: {
      onClick: () => void;
      section: { id: string };
    }) => (
      <button data-testid="section-item" onClick={onClick} type="button">
        {section.id}
      </button>
    ),
  ),
}));
vi.mock("./settingsSectionContent", () => ({
  SettingsSectionContent: vi.fn(({ sectionId }: { sectionId: string }) => (
    <div data-testid="section-content">{sectionId}</div>
  )),
}));

const mockSection = (section: string | null) =>
  vi
    .mocked(useSearchParams)
    .mockReturnValue(
      dangerouslyCoerceType<ReturnType<typeof useSearchParams>>(
        new URLSearchParams(section ? { section } : {}),
      ),
    );

describe("SettingsMasterDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSection(null);
  });

  it("lists the sections under their group headings and opens the first by default", () => {
    render(<SettingsMasterDetail />);

    // The master panel renders once for narrow and once for wide layouts.
    expect(
      screen
        .getAllByRole("listitem")
        .slice(0, 5)
        .map((li) => li.textContent),
    ).toEqual(["Preferences", "general", "providers", "System", "data"]);
    expect(screen.getByTestId("section-content")).toHaveTextContent("general");
  });

  it.each([
    { expected: "data", param: "data" },
    { expected: "general", param: "bogus" },
  ])("opens $expected for ?section=$param", ({ expected, param }) => {
    mockSection(param);

    render(<SettingsMasterDetail />);

    expect(screen.getByTestId("section-content")).toHaveTextContent(expected);
  });

  it("mirrors the selected section into the URL", () => {
    const replaceState = vi.spyOn(window.history, "replaceState");

    render(<SettingsMasterDetail />);
    const [providersItem] = screen.getAllByText("providers");

    if (!providersItem) {
      throw new Error("Expected the providers section to be listed");
    }

    fireEvent.click(providersItem);

    expect(replaceState).toHaveBeenCalledWith(
      null,
      "",
      expect.stringContaining("?section=providers"),
    );
    expect(screen.getByTestId("section-content")).toHaveTextContent(
      "providers",
    );
  });
});
