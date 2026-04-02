"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  PlusSquare,
  Users,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/cn";
import type { AppSession } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/access";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crear", label: "Crear", icon: PlusSquare },
  { href: "/ordenes", label: "Partes", icon: ClipboardCheck },
  { href: "/planificacion", label: "Planificacion", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/tecnicos", label: "Tecnicos", icon: Wrench },
] as const;

export function AppShell({
  children,
  session,
  sessionControls,
}: Readonly<{
  children: React.ReactNode;
  session: AppSession | null;
  sessionControls?: React.ReactNode;
}>) {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) {
    return <div className="min-h-screen bg-[#edf2f8]">{children}</div>;
  }

  const visibleNavItems = session
    ? navItems.filter((item) => canAccessPath(session.role, item.href))
    : [];

  if (!session) {
    return <div className="min-h-screen bg-[#edf2f8]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#edf2f8] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[292px] shrink-0 flex-col bg-[linear-gradient(180deg,#173a63_0%,#1f4b7f_100%)] text-white shadow-[8px_0_30px_rgba(15,23,42,0.12)] lg:flex">
          <div className="border-b border-white/10 px-7 py-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/20">
                <Wrench className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-wide">FSM</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">
                  Field Service Management
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition",
                      active
                        ? "bg-white/14 text-white shadow-inner"
                        : "text-white/82 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/10 px-5 py-5">
            {session ? (
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">Sesion</p>
                <p className="mt-2 text-sm font-semibold">{session.fullName}</p>
                <p className="mt-1 text-sm text-white/72">{session.role}</p>
                <div className="mt-4">{sessionControls}</div>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h1 className="text-[18px] font-semibold text-[#1d3557]">
                  Field Service Management
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Operacion diaria, partes y planificacion de tecnicos
                </p>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dbe7f4] text-[#1f4b7f]">
                  {session?.fullName.slice(0, 1) ?? "T"}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-5 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
