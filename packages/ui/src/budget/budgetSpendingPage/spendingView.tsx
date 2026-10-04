"use client";

import { Card, CardBody } from "@heroui/react";
import { type DateTime } from "luxon";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { getDateWindow } from "./helpers";
import { SpendingAreas } from "./spendingAreas";
import { SpendingChart } from "./spendingChart";
import { SpendingTableControls } from "./spendingTableControls";
import { useSpendingData } from "./useSpendingData";

const searchParamsSchema = z.object({
  end: z.iso.date().optional(),
  start: z.iso.date().optional(),
});

type SearchParams = z.infer<typeof searchParamsSchema>;

export const SpendingView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParamsObject = Object.fromEntries(searchParams.entries());
  const parsedSearchParams = searchParamsSchema.safeParse(searchParamsObject);

  let startDate: DateTime<true> | undefined;
  let endDate: DateTime<true> | undefined;

  if (parsedSearchParams.success) {
    [startDate, endDate] = getDateWindow(
      parsedSearchParams.data.start,
      parsedSearchParams.data.end,
    );
  }

  const { data, error, isFetching } = useSpendingData(startDate, endDate);

  const updateSearchParam = (
    paramKey: keyof SearchParams,
    value: DateTime<true>,
  ) => {
    const params = new URLSearchParams(searchParams);
    params.set(paramKey, value.toISODate());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <SpendingTableControls
          endDate={endDate}
          onChangeEndDate={(v) => updateSearchParam("end", v)}
          onChangeStartDate={(v) => updateSearchParam("start", v)}
          startDate={startDate}
        />
      </div>
      <Card isBlurred={true}>
        <CardBody className="p-8">
          <SpendingAreas
            error={error}
            isLoading={isFetching}
            spendingData={data}
          />
        </CardBody>
      </Card>
      <Card isBlurred={true}>
        <CardBody className="p-8">
          <SpendingChart
            error={error}
            isLoading={isFetching}
            spendingData={data}
          />
        </CardBody>
      </Card>
    </div>
  );
};
