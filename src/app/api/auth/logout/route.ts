import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { logoutByToken } from "@/server/services/auth-service";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    const routeClient = createSupabaseRouteHandlerClient(request);
    if (routeClient) {
      await routeClient.supabase.auth.signOut();
      const response = NextResponse.redirect(new URL("/login", request.url));
      return routeClient.applyCookies(response);
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  await logoutByToken(token);

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

export async function GET(request: Request) {
  return POST(request);
}
