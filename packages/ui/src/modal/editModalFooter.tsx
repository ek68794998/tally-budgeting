import { toError } from "@ekumlin/typescript-toolkit/error";
import { Button, Checkbox, ModalFooter } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
  isSaveDisabled: boolean;
  onClose: () => void;
  onSave: (createMore: boolean) => Promise<void>;
  onSaveError: (error: Error) => void;
  showCreateMore?: boolean;
}

export const EditModalFooter: React.FC<Props> = ({
  isSaveDisabled,
  onClose,
  onSave,
  onSaveError,
  showCreateMore,
}) => {
  const t = useTranslations();

  const [isCreateMore, setIsCreateMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setIsSaving(false);
    onClose();
  };

  return (
    <ModalFooter>
      {showCreateMore ? (
        <Checkbox
          isSelected={isCreateMore}
          onValueChange={setIsCreateMore}
          size="sm"
        >
          {t("common.actions.createMore")}
        </Checkbox>
      ) : null}
      <div className="flex-1" />
      <Button disabled={isSaving} onPress={handleClose} variant="light">
        {t("common.actions.cancel")}
      </Button>
      <Button
        color={isSaveDisabled ? undefined : "primary"}
        disabled={isSaveDisabled}
        isLoading={isSaving}
        onPress={() => {
          const callbackAsync = async () => {
            try {
              setIsSaving(true);
              await onSave(isCreateMore);

              if (!isCreateMore) {
                handleClose();
              }
            } catch (error) {
              onSaveError(toError(error));
            } finally {
              setIsSaving(false);
            }
          };

          void callbackAsync();
        }}
        variant="solid"
      >
        {t("common.actions.save")}
      </Button>
    </ModalFooter>
  );
};
