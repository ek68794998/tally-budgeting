"use client";

import {
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { useSessionStore } from "@tally/utilities/state/session";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LoginForm } from "./loginForm";

export const SessionExpiredModal: React.FC = () => {
  const t = useTranslations("auth.sessionExpired");
  const { clear, isExpired } = useSessionStore();

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSuccess = () => {
    setIsLoggingIn(false);
    clear();
  };

  return (
    <Modal
      backdrop="blur"
      hideCloseButton={true}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isExpired}
    >
      <ModalContent>
        <ModalHeader>{t("title")}</ModalHeader>
        <ModalBody className="pb-6">
          {isLoggingIn ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <p>
              {t.rich("message", {
                link: (chunks) => (
                  <Link as="button" onPress={() => setIsLoggingIn(true)}>
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
