import { listLoginUsers as listLocalLoginUsers } from "@/server/services/auth-service";
import { listSupabaseBootstrapUsers } from "@/server/services/supabase-auth-service";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function listLoginUsers() {
  if (isSupabaseConfigured()) {
    return listSupabaseBootstrapUsers();
  }

  return listLocalLoginUsers();
}
