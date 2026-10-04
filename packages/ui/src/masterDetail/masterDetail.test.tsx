import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DetailPanel } from "./detailPanel";
import { MasterDetail } from "./masterDetail";
import { MasterPanel } from "./masterPanel";

vi.mock("./detailPanel", () => ({
  DetailPanel: vi.fn(() => <div data-testid="detail-panel" />),
}));
vi.mock("./masterPanel", () => ({
  MasterPanel: vi.fn(() => <div data-testid="master-panel" />),
}));

interface Item {
  id: number;
  name: string;
}

const items: Item[] = [
  { id: 1, name: "One" },
  { id: 2, name: "Two" },
];

const renderMasterDetail = (
  props: Partial<React.ComponentProps<typeof MasterDetail<Item>>> = {},
) => {
  const onSelectionChange = vi.fn();

  render(
    <MasterDetail<Item>
      classNames={{ container: "c", detail: "d", master: "m" }}
      detail={{ content: (item) => item?.name }}
      getItemKey={(item) => item.id}
      master={{ items, renderItem: () => null, title: "Items" }}
      onSelectionChange={onSelectionChange}
      {...props}
    />,
  );

  return { onSelectionChange };
};

const lastMasterProps = () => vi.mocked(MasterPanel).mock.lastCall?.[0];
const lastDetailProps = () => vi.mocked(DetailPanel).mock.lastCall?.[0];

describe("MasterDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selects the first item by default and passes class names through", () => {
    renderMasterDetail();

    expect(lastMasterProps()).toMatchObject({
      className: "m",
      selectedKey: 1,
    });
    expect(lastDetailProps()).toMatchObject({
      className: "d",
      masterTitle: "Items",
      selectedItem: items[0],
    });
  });

  it.each([
    { defaultSelectedKey: 2, expected: items[1] },
    { defaultSelectedKey: 99, expected: null },
  ])("honors defaultSelectedKey $defaultSelectedKey", ({
    defaultSelectedKey,
    expected,
  }) => {
    renderMasterDetail({ defaultSelectedKey });

    expect(lastDetailProps()?.selectedItem).toEqual(expected);
  });

  it("selects nothing when there are no items", () => {
    renderMasterDetail({
      master: { items: [], renderItem: () => null, title: "Items" },
    });

    expect(lastMasterProps()?.selectedKey).toBeNull();
  });

  it("tracks selection and going back", () => {
    const { onSelectionChange } = renderMasterDetail();
    const [, second] = items;

    act(() => {
      if (second) {
        lastMasterProps()?.onSelect(second);
      }
    });

    expect(lastDetailProps()?.selectedItem).toBe(second);
    expect(onSelectionChange).toHaveBeenLastCalledWith(second);

    act(() => {
      lastDetailProps()?.onBack();
    });

    expect(lastDetailProps()?.selectedItem).toBeNull();
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
  });
});
