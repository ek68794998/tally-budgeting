"use client";

import {
  Accordion,
  AccordionItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconEditOff,
} from "@tabler/icons-react";
import { type PostTransactionsUploadResponse } from "@tally/data-models/contracts/api/postTransactionsUpload";
import { type TransactionFields } from "@tally/data-models/contracts/transaction";
import { withoutId } from "@tally/utilities/object/withoutId";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ModalDefaultTransactionRule } from "../common/modalDefault";
import { usePostTransactionRule } from "../hooks/api/usePostTransactionRule";
import { RuleEditModal } from "../rulesTable/ruleEditModal";
import {
  countTransactionsByMerchant,
  getUnprocessedItemHeaders,
  groupUploadResults,
  type UnprocessedItem,
} from "./helpers";
import { TransactionsUploadResultTransactionRow } from "./transactionsUploadResultTransactionRow";

interface Props {
  response: PostTransactionsUploadResponse;
}

const chipIconSize = 16;

const IconCategorized = IconCheck;
const IconUncategorized = IconAlertTriangle;
const IconIgnored = IconEditOff;
const IconFailed = IconAlertCircle;

export const TransactionsUploadResultDetails: React.FC<Props> = ({
  response,
}) => {
  const ruleEditModalState = useDisclosure();
  const { postTransactionRuleAsync } = usePostTransactionRule();
  const t = useTranslations("transactions");

  const [merchantToCategorize, setMerchantToCategorize] = useState<
    string | null
  >(null);

  const {
    rowsFailed,
    rowsIgnored,
    transactionsCategorized,
    transactionsUncategorized,
  } = useMemo(
    () => groupUploadResults(response, t("upload.resultCard.errorColumn")),
    [response, t],
  );

  const renderUnprocessedItemTable = (
    items: UnprocessedItem[],
    ariaLabel: string,
  ) => {
    const unprocessedItemHeaders = getUnprocessedItemHeaders(items).map(
      (header) => ({ header }),
    );

    return (
      <Table
        aria-label={ariaLabel}
        classNames={{
          wrapper:
            "bg-background/80 dark:bg-background/20 backdrop-blur-md backdrop-saturate-150",
        }}
      >
        <TableHeader columns={unprocessedItemHeaders}>
          {({ header }) => <TableColumn key={header}>{header}</TableColumn>}
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={JSON.stringify(item)}>
              {(columnKey) => (
                <TableCell
                  className="font-mono whitespace-nowrap"
                  key={columnKey}
                >
                  {item[columnKey]}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  const renderTransactions = (transactions: TransactionFields[]) => (
    <div className="mb-2 flex flex-col gap-2">
      {countTransactionsByMerchant(transactions).map((item) => (
        <TransactionsUploadResultTransactionRow
          count={item.count}
          key={item.merchant}
          onCreateRule={() => {
            setMerchantToCategorize(item.merchant);
            ruleEditModalState.onOpen();
          }}
          transaction={item}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="flex gap-6">
        <Chip
          color="success"
          startContent={<IconCategorized size={chipIconSize} />}
          variant="flat"
        >
          {t("upload.resultCard.countCategorized", {
            count: transactionsCategorized.length,
          })}
        </Chip>
        <Chip
          color="warning"
          startContent={<IconUncategorized size={chipIconSize} />}
          variant="flat"
        >
          {t("upload.resultCard.countUncategorized", {
            count: transactionsUncategorized.length,
          })}
        </Chip>
        <Chip
          color="default"
          startContent={<IconIgnored size={chipIconSize} />}
          variant="flat"
        >
          {t("upload.resultCard.countIgnored", {
            count: rowsIgnored.length,
          })}
        </Chip>
        <Chip
          color="danger"
          startContent={<IconFailed size={chipIconSize} />}
          variant="flat"
        >
          {t("upload.resultCard.countFailed", {
            count: rowsFailed.length,
          })}
        </Chip>
      </div>
      <Accordion selectionMode="multiple">
        <AccordionItem
          isDisabled={transactionsUncategorized.length === 0}
          key="uncategorized"
          startContent={<IconUncategorized />}
          title={t("upload.resultCard.titleUncategorized")}
        >
          {renderTransactions(transactionsUncategorized)}
        </AccordionItem>
        <AccordionItem
          isDisabled={rowsIgnored.length === 0}
          key="ignored"
          startContent={<IconIgnored />}
          title={t("upload.resultCard.titleIgnored")}
        >
          <div className="mb-4 text-xs text-stone-500">
            {t("upload.resultCard.descriptionUnprocessed")}
          </div>
          {renderUnprocessedItemTable(
            rowsIgnored,
            t("upload.resultCard.titleIgnored"),
          )}
        </AccordionItem>
        <AccordionItem
          isDisabled={rowsFailed.length === 0}
          key="failed"
          startContent={<IconFailed />}
          title={t("upload.resultCard.titleFailed")}
        >
          <div className="mb-4 text-xs text-stone-500">
            {t("upload.resultCard.descriptionUnprocessed")}
          </div>
          {renderUnprocessedItemTable(
            rowsFailed,
            t("upload.resultCard.titleFailed"),
          )}
        </AccordionItem>
      </Accordion>
      <RuleEditModal
        merchantToMatch={merchantToCategorize ?? undefined}
        modalState={ruleEditModalState}
        onSaveAsync={async (rule) => {
          await postTransactionRuleAsync(withoutId(rule));
        }}
        rule={ModalDefaultTransactionRule}
      />
    </>
  );
};
