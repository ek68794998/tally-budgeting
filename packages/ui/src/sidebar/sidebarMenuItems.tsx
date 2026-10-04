import { Button, type ButtonProps } from "@heroui/react";
import { type Icon } from "@tabler/icons-react";
import NextLink from "next/link";

export interface SidebarMenuLink {
  href: string;
  IconComponent: Icon;
  id: string;
  isSelected: boolean;
  label: string;
}

export interface SidebarAction {
  IconComponent: Icon;
  id: string;
  label: string;
  onPress: () => void;
}

type SidebarMenuItem = SidebarMenuLink | SidebarAction;
type MaybeSidebarMenuItem = SidebarMenuItem | "" | false | undefined | null;

interface Props {
  footerMenuItems?: MaybeSidebarMenuItem[];
  menuItems: MaybeSidebarMenuItem[];
}

const copyrightStartYear = 2025;
const currentYear = new Date().getFullYear();
const copyrightYear =
  currentYear === copyrightStartYear
    ? currentYear
    : `${copyrightStartYear}–${currentYear}`;

const realMenuItems = (
  items: MaybeSidebarMenuItem[] | undefined,
): SidebarMenuItem[] => items?.filter((i): i is SidebarMenuItem => !!i) ?? [];

export const SidebarMenuItems: React.FC<Props> = ({
  footerMenuItems,
  menuItems,
}) => {
  const renderMenuItem = (item: SidebarMenuItem) => {
    const { IconComponent, id, label } = item;

    const commonProps: ButtonProps = {
      className: "justify-start",
      startContent: <IconComponent />,
    };

    if ("onPress" in item) {
      return (
        <Button
          {...commonProps}
          key={id}
          onPress={item.onPress}
          variant="light"
        >
          {label}
        </Button>
      );
    }

    return (
      <Button
        {...commonProps}
        as={NextLink}
        href={item.href}
        key={id}
        variant={item.isSelected ? "flat" : "light"}
      >
        {label}
      </Button>
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2">
        {realMenuItems(menuItems).map(renderMenuItem)}
      </div>
      <div className="flex flex-col gap-2">
        {realMenuItems(footerMenuItems).map(renderMenuItem)}
      </div>
      <div className="text-center text-xs text-stone-500">
        <div className="my-4 h-px bg-stone-200" />
        {`© ${copyrightYear} Eric Kumlin`}
      </div>
    </div>
  );
};
