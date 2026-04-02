import type { AppSession } from "@/lib/auth/session";

export function SessionControls({ session }: { session: AppSession | null }) {
  if (!session) {
    return null;
  }

  return (
    <form action="/api/auth/logout" method="post">
      <button
        type="submit"
        className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f4b7f] transition hover:bg-slate-50"
      >
        Cerrar sesion
      </button>
    </form>
  );
}
