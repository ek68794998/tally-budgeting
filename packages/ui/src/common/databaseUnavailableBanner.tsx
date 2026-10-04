"use client";

import { Alert } from "@heroui/react";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { useDatabaseStatusStore } from "@tally/utilities/state/databaseStatus";
import { telemetry } from "@tally/utilities/telemetry/telemetry";
import { useQueryClient } from "@tanstack/react-query";
import { Duration } from "luxon";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export const healthPollIntervalMs = Duration.fromObject({
  seconds: 5,
}).toMillis();

export const DatabaseUnavailableBanner: React.FC = () => {
  const t = useTranslations("error.databaseUnavailable");
  const queryClient = useQueryClient();
  const { clear, isUnavailable } = useDatabaseStatusStore();

  useEffect(() => {
    if (!isUnavailable) {
      return;
    }

    const checkHealthAsync = async () => {
      try {
        const response = await apiFetch(buildApiRoute(api.health));

        if (response.ok) {
          clear();
          await queryClient.invalidateQueries();
        }
      } catch (error) {
        telemetry().error("DATABASE_HEALTH_CHECK_FAILED", { error });
      }
    };

    const intervalId = setInterval(
      () => void checkHealthAsync(),
      healthPollIntervalMs,
    );

    return () => clearInterval(intervalId);
  }, [clear, isUnavailable, queryClient]);

  if (!isUnavailable) {
    return null;
  }

  return (
    <div className="pb-2">
      <Alert color="danger" description={t("body")} title={t("title")} />
    </div>
  );
};
