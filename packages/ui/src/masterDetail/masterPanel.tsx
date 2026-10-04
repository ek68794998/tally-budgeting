import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { twMerge } from "tailwind-merge";
import { MasterList } from "./masterList";
import { type MasterProps } from "./types";

interface Props<T>
  extends Pick<
    MasterProps<T>,
    "actions" | "emptyState" | "getItemGroup" | "items" | "renderItem" | "title"
  > {
  className?: string;
  getItemKey: (item: T) => string | number;
  onSelect: (item: T) => void;
  selectedKey: string | number | null;
}

export const MasterPanel = <T,>({
  actions,
  className,
  emptyState,
  getItemGroup,
  getItemKey,
  items,
  onSelect,
  renderItem,
  selectedKey,
  title,
}: Props<T>) => {
  const containerClassName = twMerge("hidden overflow-y-auto", className);
  const headerClassName = "flex items-center justify-between";
  const isItemSelected = !isNullOrUndefined(selectedKey);

  const renderHeader = () => (
    <>
      <h2 className="text-xl font-semibold">{title}</h2>
      {actions && <div>{actions}</div>}
    </>
  );

  const renderBody = () => (
    <MasterList
      emptyState={emptyState}
      getItemGroup={getItemGroup}
      getItemKey={getItemKey}
      items={items}
      onSelect={onSelect}
      renderItem={renderItem}
      selectedKey={selectedKey}
    />
  );

  return (
    <>
      <div
        className={twMerge(
          containerClassName,
          isItemSelected ? "hidden" : "@max-xl:block",
        )}
      >
        <div className={headerClassName}>{renderHeader()}</div>
        <div className="pt-0">{renderBody()}</div>
      </div>
      <Card
        className={twMerge(
          containerClassName,
          isItemSelected
            ? `
              hidden
              @xl:block
            `
            : "@xl:block",
        )}
        isBlurred={true}
      >
        <CardHeader className={headerClassName}>{renderHeader()}</CardHeader>
        <CardBody className="pt-0">{renderBody()}</CardBody>
      </Card>
    </>
  );
};
