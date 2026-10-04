import { Button, Card, CardBody } from "@heroui/react";
import { IconDeviceFloppy, IconFlask } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { useTransactionsUploadContext } from "./transactionsUploadProvider";
import { TransactionsUploadResultDetails } from "./transactionsUploadResultDetails";

export const TransactionsUploadResult: React.FC = () => {
  const {
    selectedFile,
    setSelectedFile,
    uploadResponse: response,
    uploadSelectedFile,
  } = useTransactionsUploadContext();
  const t = useTranslations("transactions.upload");

  const showResults = !!selectedFile && !!response;

  return (
    <Card className={twMerge(!showResults && "opacity-50")} isBlurred={true}>
      <CardBody className="flex flex-col items-center gap-4">
        {showResults ? (
          <TransactionsUploadResultDetails response={response} />
        ) : (
          <p>{t("waitingForFile")}</p>
        )}
        <div className="flex gap-4">
          <Button
            isDisabled={!showResults}
            onPress={() => {
              void uploadSelectedFile(true);
            }}
            startContent={<IconFlask />}
          >
            {t("validateAgain")}
          </Button>
          <Button
            isDisabled={!showResults}
            onPress={() => {
              void (async () => {
                const succeeded = await uploadSelectedFile(false);

                if (succeeded) {
                  setSelectedFile(null);
                }
              })();
            }}
            startContent={<IconDeviceFloppy />}
          >
            {t("confirmUpload")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
