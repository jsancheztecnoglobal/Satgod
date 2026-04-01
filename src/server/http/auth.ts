import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { getAuthenticatedUserByToken } from "@/server/services/auth-service";

export async function requireApiUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUserByToken(token);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}
