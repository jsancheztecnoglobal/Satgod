import { logoutAction } from "@/app/login/actions";
import type { AppSession } from "@/lib/auth/session";

export function SessionControls({ session }: { session: AppSession | null }) {
  if (!session) {
    return null;
  }

  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/15"
      >
        Cerrar sesion
      </button>
    </form>
  );
}
