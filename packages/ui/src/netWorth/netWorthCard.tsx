"use client";

import { toError } from "@ekumlin/typescript-toolkit/error";
import { addToast, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { IconCameraPlus } from "@tabler/icons-react";
import { type NetWorthSnapshot } from "@tally/data-models/contracts/netWorthSnapshot";
import { Dollars } from "@tally/utilities/financial/dollars";
import { DateTime } from "luxon";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../format";
import { usePostNetWorthSnapshot } from "../hooks/api/usePostNetWorthSnapshot";
import { useNetWorthSnapshots } from "../hooks/store/useNetWorthSnapshots";
import { NetWorthCardDelta } from "./netWorthCardDelta";
import { NetWorthOverTimeCard } from "./netWorthOverTimeCard";

interface Props {
  className?: string;
  netWorth: number;
  snapshots: Omit<NetWorthSnapshot, "id">[];
}

export const NetWorthCard: React.FC<Props> = ({
  className,
  netWorth,
  snapshots,
}) => {
  const { refetch } = useNetWorthSnapshots();
  const { postSnapshotAsync } = usePostNetWorthSnapshot();
  const t = useTranslations("assets.netWorth");

  const today = DateTime.now().startOf("day");

  const snapshotsSorted = snapshots
    .filter((s) => {
      const snapshotDate = DateTime.fromISO(s.date);

      if (!snapshotDate.isValid) {
        return false;
      }

      return snapshotDate < today;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const previousNetWorthSnapshot = snapshotsSorted[snapshotsSorted.length - 1];

  const { date, valueCents: previousNetWorthCents } =
    previousNetWorthSnapshot || {};

  const previousNetWorth = Dollars.fromCents(previousNetWorthCents ?? 0);

  const currentSnapshot: (typeof snapshots)[number] = {
    date: new Date().toISOString(),
    valueCents: Dollars.toCents(netWorth),
  };

  const chartData: typeof snapshots = [...snapshotsSorted, currentSnapshot];

  const handleAddSnapshot = async () => {
    try {
      await postSnapshotAsync(currentSnapshot);
      await refetch();
      addToast({
        color: "success",
        title: t("addSnapshotSuccess"),
      });
    } catch (e) {
      const error = toError(e);
      addToast({
        color: "danger",
        description: error.message,
        title: t("addSnapshotFailure"),
      });
    }
  };

  return (
    <Card className={className} isBlurred={true}>
      <CardHeader className="flex items-start justify-between p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl">
            <span className="mr-2 opacity-70">{`${t("title")}:`}</span>
            <span className="font-black">{formatCurrency(netWorth)}</span>
          </h2>
          {date ? (
            <h3 className="text-xl font-semibold">
              <NetWorthCardDelta
                currentDollars={netWorth}
                previousDateIso={date}
                previousDollars={previousNetWorth}
              />
            </h3>
          ) : null}
        </div>
        <div>
          <Button onPress={() => void handleAddSnapshot()}>
            <IconCameraPlus />
            {t("addSnapshot")}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col items-center gap-4 p-8">
        <NetWorthOverTimeCard data={chartData} />
      </CardBody>
    </Card>
  );
};
