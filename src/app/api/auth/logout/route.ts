import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { logoutByToken } from "@/server/services/auth-service";

export async function POST(request: Request) {
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
