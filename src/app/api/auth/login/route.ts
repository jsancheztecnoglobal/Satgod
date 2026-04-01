import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { loginWithPassword } from "@/server/services/auth-service";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await loginWithPassword(email, password);

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(result.message)}`, request.url),
    );
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(AUTH_COOKIE_NAME, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(result.expiresAt),
  });
  return response;
}
