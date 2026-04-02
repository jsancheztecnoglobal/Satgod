import { NextRequest, NextResponse } from "next/server";

import type { RoleCode } from "@/lib/data/contracts";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { getDefaultPathForRole } from "@/lib/auth/access";
import { loginWithPassword } from "@/server/services/auth-service";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  canBootstrapAccount,
  ensureBootstrapAccountsRegistered,
  findBootstrapAccountByEmail,
} from "@/server/services/supabase-auth-service";

function extractRoleCode(rolePayload: { code?: string } | Array<{ code?: string }> | null | undefined) {
  if (Array.isArray(rolePayload)) {
    return rolePayload[0]?.code ?? null;
  }

  return rolePayload?.code ?? null;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (isSupabaseConfigured()) {
    const routeClient = createSupabaseRouteHandlerClient(request);
    if (!routeClient) {
      return NextResponse.redirect(
        new URL("/login?error=Supabase%20no%20esta%20configurado.", request.url),
      );
    }

    const { supabase, applyCookies } = routeClient;
    let loginAttempt = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    const bootstrapAccount = findBootstrapAccountByEmail(email);

    if (loginAttempt.error && canBootstrapAccount(email, password)) {
      try {
        await ensureBootstrapAccountsRegistered();
      } catch (error) {
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(
              error instanceof Error ? error.message : "No se han podido crear las cuentas de arranque.",
            )}`,
            request.url,
          ),
        );
      }

      loginAttempt = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }

    if (loginAttempt.error) {
      const message =
        bootstrapAccount && canBootstrapAccount(email, password)
          ? "No se ha podido abrir la sesion. Revisa que en Supabase este desactivada la confirmacion obligatoria de email o confirma el usuario manualmente."
          : loginAttempt.error.message;
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(message)}`, request.url),
      );
    }

    const authUser = await supabase.auth.getUser();
    const userId = authUser.data.user?.id;
    if (!userId) {
      return NextResponse.redirect(
        new URL("/login?error=No%20se%20ha%20podido%20resolver%20la%20sesion%20de%20Supabase.", request.url),
      );
    }

    const profileCheck = await supabase
      .from("user_profiles")
      .select("full_name, technician_code, active, role_id, roles(code)")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    let resolvedRoleCode =
      bootstrapAccount?.role ??
      (extractRoleCode(
        (profileCheck.data as { roles?: { code?: string } | Array<{ code?: string }> } | null)?.roles,
      ) as RoleCode | null);

    if (!resolvedRoleCode && profileCheck.data?.role_id) {
      const roleCheck = await supabase
        .from("roles")
        .select("code")
        .eq("id", profileCheck.data.role_id)
        .maybeSingle<{ code: string }>();

      resolvedRoleCode = (roleCheck.data?.code as RoleCode | undefined) ?? null;
    }

    if (profileCheck.error || !profileCheck.data || !profileCheck.data.active || !resolvedRoleCode) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            "No se ha encontrado un perfil activo valido para este usuario en Supabase.",
          )}`,
          request.url,
        ),
      );
    }

    const roleCode = resolvedRoleCode;
    const response = NextResponse.redirect(new URL(getDefaultPathForRole(roleCode), request.url));
    return applyCookies(response);
  }

  const result = await loginWithPassword(email, password);

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(result.message)}`, request.url),
    );
  }

  const response = NextResponse.redirect(new URL(getDefaultPathForRole(result.user.role), request.url));
  response.cookies.set(AUTH_COOKIE_NAME, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(result.expiresAt),
  });
  return response;
}
