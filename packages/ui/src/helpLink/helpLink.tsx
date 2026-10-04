"use client";

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { IconHelp } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface Props extends React.PropsWithChildren {
  subject: string;
}

export const HelpLink: React.FC<Props> = ({ children, subject }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const t = useTranslations();

  const title = t("help.title", { subject });

  return (
    <>
      <Tooltip content={title}>
        <Button
          aria-label={title}
          isIconOnly={true}
          onPress={onOpen}
          size="sm"
          variant="light"
        >
          <IconHelp />
        </Button>
      </Tooltip>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <DrawerContent>
          <DrawerHeader>{title}</DrawerHeader>
          <DrawerBody className="pb-6">{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
