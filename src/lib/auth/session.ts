import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { RoleCode } from "@/lib/data/contracts";
import { canAccessPath } from "@/lib/auth/access";
import { getAuthenticatedUserByToken } from "@/server/services/auth-service";

export const AUTH_COOKIE_NAME = "tecnoglobal_session";

export interface AppSession {
  mode: "local";
  userId: string;
  email: string;
  fullName: string;
  role: RoleCode;
  technicianId?: string;
}

export async function getAppSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUserByToken(token);

  if (!user) {
    return null;
  }

  return {
    mode: "local",
    userId: user.userId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    technicianId: user.technicianId,
  };
}

export async function requirePageAccess(pathname: string) {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  if (!canAccessPath(session.role, pathname)) {
    redirect("/dashboard");
  }

  return session;
}
