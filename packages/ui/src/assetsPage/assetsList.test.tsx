import { type Asset } from "@tally/data-models/contracts/asset";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../hooks/store/useAssets", () => ({
	useAssets: vi.fn(),
}));

vi.mock("../hooks/useLatestData", () => ({
	useLatestData: vi.fn(),
}));

vi.mock("../assetsTable/assetsTable", () => ({
	AssetsTable: vi.fn(({ assets }: { assets: Asset[] }) => (
		<div data-testid="assets-table">
			{assets.map((asset) => (
				<div data-testid={`asset-${asset.id}`} key={asset.id}>
					{asset.name}
				</div>
			))}
		</div>
	)),
}));

import { useAssets } from "../hooks/store/useAssets";
import { useLatestData } from "../hooks/useLatestData";
import { AssetsList } from "./assetsList";

const mockUseAssets = vi.mocked(useAssets);
const mockUseLatestData = vi.mocked(useLatestData);

const createMockAsset = (overrides?: Partial<Asset>): Asset => ({
	active: true,
	id: 1,
	name: "Test Asset",
	provider: "chase",
	type: "short_term_liability",
	valueCents: 100000,
	...overrides,
});

describe("AssetsList", () => {
	const defaultUseAssetsProps = {
		assets: [],
		error: null,
		isLoading: false,
		refetch: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the list title", () => {
		const mockAssets = [createMockAsset()];
		mockUseAssets.mockReturnValue({
			...defaultUseAssetsProps,
			assets: mockAssets,
		});
		mockUseLatestData.mockReturnValue(mockAssets);

		render(<AssetsList initialData={{ assets: mockAssets }} />);

		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"listTitle",
		);
	});

	it("calls useTranslations with correct namespace", () => {
		const mockAssets = [createMockAsset()];
		mockUseAssets.mockReturnValue({
			...defaultUseAssetsProps,
			assets: mockAssets,
		});
		mockUseLatestData.mockReturnValue(mockAssets);

		render(<AssetsList initialData={{ assets: mockAssets }} />);
	});

	it("calls useAssets hook", () => {
		const mockAssets = [createMockAsset()];
		mockUseAssets.mockReturnValue({
			...defaultUseAssetsProps,
			assets: mockAssets,
		});
		mockUseLatestData.mockReturnValue(mockAssets);

		render(<AssetsList initialData={{ assets: mockAssets }} />);

		expect(mockUseAssets).toHaveBeenCalled();
	});

	it("calls useLatestData with correct arguments when loading", () => {
		const initialAssets = [
			createMockAsset({ id: 1, name: "Initial Asset" }),
		];
		const loadedAssets = [createMockAsset({ id: 2, name: "Loaded Asset" })];

		mockUseAssets.mockReturnValue({
			...defaultUseAssetsProps,
			assets: loadedAssets,
			isLoading: true,
		});
		mockUseLatestData.mockReturnValue(initialAssets);

		render(<AssetsList initialData={{ assets: initialAssets }} />);

		expect(mockUseLatestData).toHaveBeenCalledWith({
			initial: initialAssets,
			isLoading: true,
			latest: loadedAssets,
		});
	});

	it("calls useLatestData with correct arguments when not loading", () => {
		const initialAssets = [
			createMockAsset({ id: 1, name: "Initial Asset" }),
		];
		const loadedAssets = [createMockAsset({ id: 2, name: "Loaded Asset" })];

		mockUseAssets.mockReturnValue({
			...defaultUseAssetsProps,
			assets: loadedAssets,
		});
		mockUseLatestData.mockReturnValue(loadedAssets);

		render(<AssetsList initialData={{ assets: initialAssets }} />);

		expect(mockUseLatestData).toHaveBeenCalledWith({
			initial: initialAssets,
			isLoading: false,
			latest: loadedAssets,
		});
	});

	it("renders AssetsTable component", () => {
		const mockAssets = [createMockAsset()];
		mockUseAssets.mockReturnValue({
			...defaultUseAssetsProps,
			assets: mockAssets,
		});
		mockUseLatestData.mockReturnValue(mockAssets);

		render(<AssetsList initialData={{ assets: mockAssets }} />);

		expect(screen.getByTestId("assets-table")).toBeInTheDocument();
	});

	it("handles empty assets array", () => {
		mockUseAssets.mockReturnValue(defaultUseAssetsProps);
		mockUseLatestData.mockReturnValue([]);

		render(<AssetsList initialData={{ assets: [] }} />);

		expect(screen.getByTestId("assets-table")).toBeInTheDocument();
		expect(screen.queryByTestId(/^asset-/)).not.toBeInTheDocument();
	});

	it("handles multiple assets", () => {
		const mockAssets = [
			createMockAsset({ id: 1, name: "Asset 1" }),
			createMockAsset({ id: 2, name: "Asset 2" }),
			createMockAsset({ id: 3, name: "Asset 3" }),
		];

		mockUseAssets.mockReturnValue({
			...defaultUseAssetsProps,
			assets: mockAssets,
		});
		mockUseLatestData.mockReturnValue(mockAssets);

		render(<AssetsList initialData={{ assets: mockAssets }} />);

		expect(screen.getByTestId("asset-1")).toHaveTextContent("Asset 1");
		expect(screen.getByTestId("asset-2")).toHaveTextContent("Asset 2");
		expect(screen.getByTestId("asset-3")).toHaveTextContent("Asset 3");
	});

	it("uses initial data when useLatestData returns it during loading", () => {
		const initialAssets = [createMockAsset({ id: 1, name: "Initial" })];

		mockUseAssets.mockReturnValue({
			...defaultUseAssetsProps,
			assets: [],
			isLoading: true,
		});
		mockUseLatestData.mockReturnValue(initialAssets);

		render(<AssetsList initialData={{ assets: initialAssets }} />);

		expect(screen.getByTestId("asset-1")).toHaveTextContent("Initial");
	});
});
