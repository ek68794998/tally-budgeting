"use client";

import {
  ContentType,
  InternalServerError,
  Post,
  TooManyRequests,
  Unauthorized,
} from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import { Button, Input } from "@heroui/react";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { telemetry } from "@tally/utilities/telemetry/telemetry";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
  onSuccess: () => void;
}

type LoginError =
  | "invalidPassword"
  | "serverError"
  | "tooManyAttempts"
  | "unknown";

export const LoginForm: React.FC<Props> = ({ onSuccess }) => {
  const t = useTranslations("auth.login");

  const [error, setError] = useState<LoginError>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  const submitAsync = async () => {
    setIsSubmitting(true);
    setError(undefined);

    try {
      // Raw fetch: a wrong password's 401 must not mark the session expired.
      const response = await fetch(buildApiRoute(api.auth.login), {
        body: JSON.stringify({ password }),
        headers: { [ContentType]: ApplicationJson },
        method: Post,
      });

      if (response.ok) {
        onSuccess();
      } else if (response.status === Unauthorized) {
        setError("invalidPassword");
      } else if (response.status === TooManyRequests) {
        setError("tooManyAttempts");
      } else if (response.status >= InternalServerError) {
        setError("serverError");
      } else {
        setError("unknown");
      }
    } catch (submitError) {
      telemetry().error("LOGIN_FAILED", { error: submitError });
      setError("unknown");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submitAsync();
      }}
    >
      <Input
        autoFocus={true}
        errorMessage={error ? t(`error.${error}`) : undefined}
        isInvalid={Boolean(error)}
        label={t("passwordLabel")}
        onValueChange={setPassword}
        type="password"
        validationBehavior="aria"
        value={password}
      />
      <Button
        color="primary"
        isDisabled={!password}
        isLoading={isSubmitting}
        type="submit"
      >
        {t("submit")}
      </Button>
    </form>
  );
};
