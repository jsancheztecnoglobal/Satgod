"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  PlusSquare,
  Smartphone,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { cn } from "@/lib/cn";
import type { AppSession } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/access";
import { useUiDevice } from "@/components/layout/ui-device-context";

const appNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crear", label: "Crear", icon: PlusSquare },
  { href: "/ordenes", label: "Partes", icon: ClipboardCheck },
  { href: "/planificacion", label: "Planificacion", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/tecnicos", label: "Tecnicos", icon: Wrench },
  { href: "/tecnico", label: "Mi agenda", icon: Smartphone },
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
  const { isMobile } = useUiDevice();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const visibleNavItems = session
    ? appNavItems.filter((item) => canAccessPath(session.role, item.href))
    : [];
  const activeItem =
    visibleNavItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    visibleNavItems[0];
  const baseQuickNavItems = visibleNavItems.slice(0, 4);
  const quickNavItems =
    !activeItem || baseQuickNavItems.some((item) => item.href === activeItem.href)
      ? baseQuickNavItems
      : !baseQuickNavItems.length
        ? [activeItem]
        : [...baseQuickNavItems.slice(0, 3), activeItem];

  if (pathname.startsWith("/login")) {
    return <div className="min-h-screen bg-[#edf2f8]">{children}</div>;
  }

  if (!session) {
    return <div className="min-h-screen bg-[#edf2f8]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#edf2f8] text-slate-900">
      {drawerOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/35 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-[86vw] max-w-[360px] flex-col bg-white shadow-[-20px_0_40px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#173a63] text-white">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52729b]">
                    Navegacion
                  </p>
                  <p className="font-semibold text-[#1d3557]">Tecnoglobal FSM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600"
                aria-label="Cerrar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-4 text-[15px] font-semibold transition",
                      active
                        ? "bg-[#173a63] text-white"
                        : "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 px-4 py-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#52729b]">
                  Sesion
                </p>
                <p className="mt-2 font-semibold text-[#1d3557]">{session.fullName}</p>
                <p className="mt-1 text-sm text-slate-500">{session.role}</p>
                <div className="mt-4">{sessionControls}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen">
        <aside className="hidden w-[292px] shrink-0 flex-col bg-[linear-gradient(180deg,#173a63_0%,#1f4b7f_100%)] text-white shadow-[8px_0_30px_rgba(15,23,42,0.12)] lg:flex">
          <div className="border-b border-white/10 px-7 py-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/20">
                <Wrench className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-wide">Tecnoglobal FSM</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">
                  Operacion y visitas tecnicas
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">Sesion</p>
              <p className="mt-2 text-sm font-semibold">{session.fullName}</p>
              <p className="mt-1 text-sm text-white/72">{session.role}</p>
              <div className="mt-4">{sessionControls}</div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-700 lg:hidden"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[#dbe7f4] text-[#1f4b7f] sm:flex">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#52729b]">
                    {activeItem?.label ?? "Operacion"}
                  </p>
                  <h1 className="truncate text-[17px] font-semibold text-[#1d3557] md:text-[20px]">
                    Tecnoglobal FSM
                  </h1>
                  {!isMobile ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Mismo flujo de trabajo, adaptado al dispositivo desde el que entras.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dbe7f4] text-[#1f4b7f]">
                  {session.fullName.slice(0, 1)}
                </div>
              </div>
            </div>
            {isMobile ? (
              <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                {session.fullName} / {session.role}
              </div>
            ) : null}
          </header>

          <main className="flex-1 px-4 py-4 pb-24 md:px-6 md:py-5 md:pb-6">{children}</main>
        </div>
      </div>

      {quickNavItems.length ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
          <div className={cn("grid gap-2", quickNavItems.length > 2 ? "grid-cols-4" : "grid-cols-2")}>
            {quickNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center text-[11px] font-semibold transition",
                    active
                      ? "bg-[#1f4b7f] text-white"
                      : "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
