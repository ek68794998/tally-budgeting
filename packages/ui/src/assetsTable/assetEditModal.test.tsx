import { addToast, type useDisclosure } from "@heroui/react";
import { buildAsset } from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModalDefaultAsset } from "../common/modalDefault";
import { SelectProvider } from "../common/selectProvider";
import { EditModalFooter } from "../modal/editModalFooter";
import { buildSelection, heroUiCollectionStubs } from "../testing/heroUi";
import { AssetEditModal } from "./assetEditModal";

vi.mock("@heroui/react", async (importOriginal) => {
	const { withHeroUiStubs } = await import("../testing/heroUi.js");
	return { ...(await withHeroUiStubs(importOriginal)), addToast: vi.fn() };
});
vi.mock("../common/selectProvider", () => ({
	SelectProvider: vi.fn(() => <div data-testid="select-provider" />),
}));
vi.mock("../modal/editModalFooter", () => ({
	EditModalFooter: vi.fn(() => <div data-testid="edit-modal-footer" />),
}));

const modalState = mockIncompleteObject<ReturnType<typeof useDisclosure>>({
	isOpen: true,
	onOpenChange: vi.fn(),
});

const lastFooterProps = () => vi.mocked(EditModalFooter).mock.lastCall?.[0];

const renderModal = (asset: Parameters<typeof AssetEditModal>[0]["asset"]) => {
	const onSaveAsync = vi.fn(() => Promise.resolve());

	render(
		<AssetEditModal
			asset={asset}
			modalState={modalState}
			onSaveAsync={onSaveAsync}
		/>,
	);

	return { onSaveAsync };
};

describe("AssetEditModal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("edits and saves every field of an asset", async () => {
		const house = buildAsset({ name: "House", type: "fixed_asset" });
		const { onSaveAsync } = renderModal(house);

		expect(screen.getByText("Edit House")).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "Condo" },
		});
		act(() => {
			vi.mocked(
				heroUiCollectionStubs.Select,
			).mock.lastCall?.[0].onSelectionChange?.(
				buildSelection("personal_asset"),
			);
			vi.mocked(SelectProvider).mock.lastCall?.[0].onChange({
				id: "chase",
				name: "Chase Bank",
			});
		});
		await act(() => lastFooterProps()?.onSave(false) ?? Promise.resolve());

		expect(onSaveAsync).toHaveBeenCalledWith({
			...house,
			name: "Condo",
			provider: "chase",
			type: "personal_asset",
		});

		act(() => {
			lastFooterProps()?.onSaveError(new Error("nope"));
		});

		expect(addToast).toHaveBeenCalledOnce();
	});

	// Known bug: the modal treats `id === -1` as new, but `ModalDefaultAsset` (used for new assets) has `id: 0`.
	it.fails("titles a new asset as such", () => {
		renderModal(ModalDefaultAsset);

		expect(screen.getByText("New Asset")).toBeInTheDocument();
	});

	it("disables saving without a name and stays closed without an asset", () => {
		renderModal(buildAsset({ id: -1, name: "" }));

		expect(screen.getByText("New Asset")).toBeInTheDocument();
		expect(lastFooterProps()?.isSaveDisabled).toBe(true);

		vi.clearAllMocks();
		renderModal(null);

		expect(lastFooterProps()).toBeUndefined();
	});
});
