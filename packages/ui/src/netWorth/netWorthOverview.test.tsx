import {
	buildAsset,
	buildNetWorthSnapshot,
} from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAssets } from "../hooks/store/useAssets";
import { useNetWorthSnapshots } from "../hooks/store/useNetWorthSnapshots";
import { AssetDistribution } from "./assetDistribution";
import { NetWorthCard } from "./netWorthCard";
import { NetWorthOverview } from "./netWorthOverview";

vi.mock("../hooks/store/useAssets", () => ({ useAssets: vi.fn() }));
vi.mock("../hooks/store/useNetWorthSnapshots", () => ({
	useNetWorthSnapshots: vi.fn(),
}));
vi.mock("./assetDistribution", () => ({
	AssetDistribution: vi.fn(() => <div data-testid="assets" />),
}));
vi.mock("./liabilityDistribution", () => ({
	LiabilityDistribution: vi.fn(() => <div data-testid="liabilities" />),
}));
vi.mock("./netWorthCard", () => ({
	NetWorthCard: vi.fn(() => <div data-testid="net-worth" />),
}));

describe("NetWorthOverview", () => {
	it("uses initial data while loading and nets liabilities against assets", () => {
		const initialAssets = [
			buildAsset({ type: "fixed_asset", valueCents: 500_00 }),
			buildAsset({ type: "liquid_asset", valueCents: 100_00 }),
			buildAsset({ type: "personal_asset", valueCents: 50_00 }),
			buildAsset({ type: "short_term_liability", valueCents: 25_00 }),
		];
		const initialSnapshots = [buildNetWorthSnapshot()];
		vi.mocked(useAssets).mockReturnValue(
			mockIncompleteObject<ReturnType<typeof useAssets>>({
				assets: [],
				isLoading: true,
			}),
		);
		vi.mocked(useNetWorthSnapshots).mockReturnValue(
			mockIncompleteObject<ReturnType<typeof useNetWorthSnapshots>>({
				isLoading: true,
				snapshots: [],
			}),
		);

		render(
			<NetWorthOverview
				initialData={{
					assets: initialAssets,
					netWorthSnapshots: initialSnapshots,
				}}
			/>,
		);

		expect(vi.mocked(NetWorthCard).mock.lastCall?.[0]).toMatchObject({
			netWorth: 625,
			snapshots: initialSnapshots,
		});
		expect(vi.mocked(AssetDistribution).mock.lastCall?.[0].assets).toBe(
			initialAssets,
		);
	});
});
