"use client";

import { Button } from "@heroui/react";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { telemetry } from "@tally/utilities/telemetry/telemetry";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { type ErrorProps } from "./types";

const ErrorPage: React.FC<ErrorProps> = ({ error, reset }) => {
  const t = useTranslations("error.fullPage");

  // Server-rendered errors arrive without their message in production, so ask the server
  // whether the database is the cause; `apiFetch` raises the banner if so.
  useEffect(() => {
    apiFetch(buildApiRoute(api.health)).catch((healthError: unknown) => {
      telemetry().error("DATABASE_HEALTH_CHECK_FAILED", {
        error: healthError,
      });
    });
  }, []);

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-4xl font-black">{t("title")}</h1>
      <p>{t("description")}</p>
      <pre className="max-w-96 rounded-xl border border-(--accent) p-2 text-sm">
        <div className="max-w-[inherit] overflow-auto p-2">{error.stack}</div>
      </pre>
      <div className="flex gap-4">
        <Button onPress={() => reset()}>{t("ctaReset")}</Button>
        <Button onPress={() => window.location.reload()}>
          {t("ctaReload")}
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
