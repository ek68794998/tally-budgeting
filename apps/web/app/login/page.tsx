import { getSafeRedirectPath } from "@tally/utilities/routing/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionCookieName } from "../auth/cookie";
import { isAuthenticatedAsync } from "../auth/verifyRequest";
import { LoginCard } from "./loginCard";

interface Props {
  searchParams: Promise<{ next?: string | string[] }>;
}

const LoginPage: React.FC<Props> = async ({ searchParams }) => {
  const { next } = await searchParams;
  const nextPath = Array.isArray(next) ? next[0] : next;

  const cookieStore = await cookies();
  const isAuthenticated = await isAuthenticatedAsync(
    cookieStore.get(SessionCookieName)?.value,
  );

  if (isAuthenticated) {
    redirect(getSafeRedirectPath(nextPath));
  }

  return <LoginCard next={nextPath} />;
};

export default LoginPage;
