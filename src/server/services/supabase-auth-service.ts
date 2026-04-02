import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { RoleCode } from "@/lib/data/contracts";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  bootstrapAccounts,
  defaultBootstrapPassword,
  type BootstrapAccount,
} from "@/server/services/bootstrap-accounts";
import type { AuthenticatedUser } from "@/server/services/types";

type ProfileRow = {
  full_name: string;
  technician_code: string | null;
  active: boolean;
  roles: { code: RoleCode } | { code: RoleCode }[] | null;
};

type BasicProfileRow = {
  full_name: string;
  technician_code: string | null;
  active: boolean;
  role_id: string | null;
};

function extractRoleCode(rolePayload: ProfileRow["roles"]): RoleCode | null {
  if (Array.isArray(rolePayload)) {
    return rolePayload[0]?.code ?? null;
  }

  return rolePayload?.code ?? null;
}

export async function getSupabaseAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return null;
    }

    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData.user;

    if (!authUser) {
      return null;
    }

    const joinedProfileResult = await supabase
      .from("user_profiles")
      .select("full_name, technician_code, active, roles!inner(code)")
      .eq("user_id", authUser.id)
      .is("deleted_at", null)
      .maybeSingle<ProfileRow>();

    let profile = joinedProfileResult.data;
    let role = extractRoleCode(joinedProfileResult.data?.roles ?? null);

    if (!profile || !role) {
      const basicProfileResult = await supabase
        .from("user_profiles")
        .select("full_name, technician_code, active, role_id")
        .eq("user_id", authUser.id)
        .is("deleted_at", null)
        .maybeSingle<BasicProfileRow>();

      const basicProfile = basicProfileResult.data;
      const bootstrapAccount = authUser.email
        ? findBootstrapAccountByEmail(authUser.email)
        : null;

      if (!basicProfile || !basicProfile.active) {
        return null;
      }

      profile = {
        full_name: basicProfile.full_name,
        technician_code: basicProfile.technician_code,
        active: basicProfile.active,
        roles: bootstrapAccount ? { code: bootstrapAccount.role } : null,
      };
      role = bootstrapAccount?.role ?? null;
    }

    if (!profile || !profile.active || !role) {
      return null;
    }

    return {
      userId: authUser.id,
      email: authUser.email ?? "",
      fullName: profile.full_name,
      role,
      technicianId: profile.technician_code ?? undefined,
    };
  } catch (error) {
    console.error("[supabase-auth] failed to resolve server session", error);
    return null;
  }
}

export async function listSupabaseBootstrapUsers() {
  return bootstrapAccounts.map((account) => ({
    email: account.email,
    role: account.role,
    fullName: account.fullName,
  }));
}

export function canBootstrapAccount(email: string, password: string) {
  return password === defaultBootstrapPassword && Boolean(findBootstrapAccountByEmail(email));
}

export function findBootstrapAccountByEmail(email: string): BootstrapAccount | null {
  const normalizedEmail = email.trim().toLowerCase();
  return bootstrapAccounts.find((account) => account.email.toLowerCase() === normalizedEmail) ?? null;
}

export async function ensureBootstrapAccountsRegistered() {
  if (!isSupabaseConfigured()) {
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  for (const account of bootstrapAccounts) {
    const result = await supabase.auth.signUp({
      email: account.email,
      password: defaultBootstrapPassword,
      options: {
        data: {
          full_name: account.fullName,
        },
      },
    });

    if (
      result.error &&
      !result.error.message.toLowerCase().includes("already") &&
      !result.error.message.toLowerCase().includes("registered")
    ) {
      throw new Error(result.error.message);
    }
  }
}
