import { isString } from "@ekumlin/typescript-toolkit/types";
import { Alert } from "@heroui/react";
import { useTranslations } from "next-intl";

interface Props {
  error: Error | string | null;
}

export const TableLoadError: React.FC<Props> = ({ error }) => {
  const t = useTranslations("common.table");

  const errorMessage = isString(error) ? error : error?.message;

  return (
    <Alert
      classNames={{ mainWrapper: "gap-1 text-left" }}
      color="danger"
      title={t("error")}
    >
      <p className="text-sm">{t("errorBody")}</p>
      {errorMessage ? (
        <p className="font-mono text-xs">{errorMessage}</p>
      ) : null}
    </Alert>
  );
};
