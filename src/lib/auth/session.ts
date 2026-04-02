import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { RoleCode } from "@/lib/data/contracts";
import { canAccessPath, getDefaultPathForRole } from "@/lib/auth/access";
import { getAuthenticatedUserByToken } from "@/server/services/auth-service";
import { getSupabaseAuthenticatedUser } from "@/server/services/supabase-auth-service";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const AUTH_COOKIE_NAME = "tecnoglobal_session";

export interface AppSession {
  mode: "local" | "supabase";
  userId: string;
  email: string;
  fullName: string;
  role: RoleCode;
  technicianId?: string;
}

export async function getAppSession(): Promise<AppSession | null> {
  if (isSupabaseConfigured()) {
    const user = await getSupabaseAuthenticatedUser();

    if (!user) {
      return null;
    }

    return {
      mode: "supabase",
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      technicianId: user.technicianId,
    };
  }

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
    redirect(getDefaultPathForRole(session.role));
  }

  return session;
}
