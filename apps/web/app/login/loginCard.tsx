"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { LoginForm } from "@tally/ui/auth/loginForm";
import { SidebarLogo } from "@tally/ui/sidebar/sidebarLogo";
import { getSafeRedirectPath } from "@tally/utilities/routing/redirect";
import { useRouter } from "next/navigation";

interface Props {
  next: string | undefined;
}

export const LoginCard: React.FC<Props> = ({ next }) => {
  const router = useRouter();

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm p-4">
        <CardHeader>
          <div className="flex-1">
            <SidebarLogo />
          </div>
        </CardHeader>
        <CardBody>
          <LoginForm
            onSuccess={() => {
              router.replace(getSafeRedirectPath(next));
              router.refresh();
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
};
