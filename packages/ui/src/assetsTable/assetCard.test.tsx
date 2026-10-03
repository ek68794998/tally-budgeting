import { buildAsset } from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AssetCard } from "./assetCard";
import { AssetCardDropdown } from "./assetCardDropdown";

vi.mock("../dataProviderIcons/dataProviderIcon", () => ({
	DataProviderIcon: vi.fn(() => <div data-testid="provider-icon" />),
}));
vi.mock("./assetCardDropdown", () => ({
	AssetCardDropdown: vi.fn(() => <div data-testid="dropdown" />),
}));

describe("AssetCard", () => {
	it.each([
		{
			active: true,
			dangerCount: 0,
			status: "Active",
			type: "liquid_asset" as const,
		},
		{
			active: false,
			dangerCount: 1,
			status: "Inactive",
			type: "long_term_liability" as const,
		},
	])("renders a $status $type", ({ active, dangerCount, status, type }) => {
		const handlers = {
			onDelete: vi.fn(),
			onEdit: vi.fn(),
			onSetActive: vi.fn(),
		};

		const { container } = render(
			<AssetCard
				asset={buildAsset({
					active,
					name: "Mortgage",
					type,
					valueCents: 100_00,
				})}
				{...handlers}
			/>,
		);

		expect(screen.getByText("Mortgage")).toBeInTheDocument();
		expect(screen.getByText("$100")).toBeInTheDocument();
		expect(screen.getByText(status)).toBeInTheDocument();
		expect(container.querySelectorAll(".text-danger-600")).toHaveLength(
			dangerCount,
		);
		expect(vi.mocked(AssetCardDropdown).mock.lastCall?.[0]).toEqual({
			isActive: active,
			...handlers,
		});
	});
});
