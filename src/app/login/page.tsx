import { redirect } from "next/navigation";
import { Bell, CalendarDays, ClipboardCheck, ShieldCheck, Users, Wrench } from "lucide-react";

import { getAppSession } from "@/lib/auth/session";
import { listLoginUsers } from "@/server/services/auth-service";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAppSession();

  if (session) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;
  const loginUsers = await listLoginUsers();

  return (
    <div className="min-h-screen bg-[#e9f0f7]">
      <div className="grid min-h-screen lg:grid-cols-[320px_1fr]">
        <aside className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#143457_0%,#1f4b7f_100%)] text-white lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Wrench className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-wide">FSM</p>
                <p className="text-xs uppercase tracking-[0.22em] text-white/72">
                  Field Service Management
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-8 py-8">
            <h1 className="text-[30px] font-semibold leading-tight">
              Tecnoglobal
              <br />
              Operacion de campo
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/78">
              Acceso a planificacion diaria, partes de trabajo, clientes, tecnicos y seguimiento real.
            </p>

            <div className="mt-8 space-y-4">
              <FeatureRow icon={<CalendarDays className="h-5 w-5" />} title="Planificacion horaria">
                Calendario diario por tecnico y vista general del equipo.
              </FeatureRow>
              <FeatureRow icon={<ClipboardCheck className="h-5 w-5" />} title="Partes operativos">
                Creacion, edicion y cierre ligados a ordenes de trabajo reales.
              </FeatureRow>
              <FeatureRow icon={<Users className="h-5 w-5" />} title="Clientes y equipos">
                Relaciones persistentes entre cliente, equipo, orden y parte.
              </FeatureRow>
            </div>
          </div>

          <div className="border-t border-white/10 px-8 py-8">
            <div className="grid gap-3">
              <MiniStat label="Tecnicos" value="08" />
              <MiniStat label="Backend" value="Persistente" />
              <MiniStat label="Mapa" value="Google Maps" />
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#52729b]">
                  Acceso
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-[#1d3557]">
                  Entrar en Tecnoglobal FSM
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  Login real contra backend local persistente con sesion y control de acceso por rol.
                </p>
              </div>
              <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:flex">
                <Bell className="h-5 w-5 text-[#1f4b7f]" />
                <span className="text-sm font-medium text-slate-700">Producto operativo</span>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#52729b]">
                  Sesion corporativa
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[#1d3557]">Login principal</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Autenticacion real contra el backend de la aplicacion.
                </p>

                {error ? (
                  <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <form action="/api/auth/login" method="post" className="mt-6 grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Email</span>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2f7ed8]"
                      placeholder="usuario@tecnoglobal.local"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Contrasena</span>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2f7ed8]"
                      placeholder="tecnoglobal123"
                    />
                  </label>

                  <button
                    type="submit"
                    className="mt-2 rounded-xl bg-[#1f4b7f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173a63]"
                  >
                    Entrar
                  </button>
                </form>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  <UtilityCard
                    icon={<CalendarDays className="h-5 w-5" />}
                    title="Planner"
                    description="Vista diaria y general por tecnico."
                  />
                  <UtilityCard
                    icon={<ClipboardCheck className="h-5 w-5" />}
                    title="Partes"
                    description="Edicion y seguimiento del trabajo ejecutado."
                  />
                  <UtilityCard
                    icon={<ShieldCheck className="h-5 w-5" />}
                    title="Permisos"
                    description="Acceso segmentado por rol y contexto."
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7fafe_100%)] p-6 shadow-[0_16px_42px_rgba(15,23,42,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#52729b]">
                  Usuarios de prueba
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[#1d3557]">Credenciales disponibles</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Todas las cuentas de arranque usan la contrasena comun <span className="font-semibold">tecnoglobal123</span>.
                </p>

                <div className="mt-6 grid gap-3">
                  {loginUsers.map((user) => (
                    <div
                      key={user.email}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-4"
                    >
                      <p className="font-semibold text-[#1d3557]">{user.fullName}</p>
                      <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f7ed8]">
                        {user.role}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-white/10 bg-white/6 px-4 py-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/72">{children}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-white/62">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function UtilityCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dce9f7] text-[#1f4b7f]">
        {icon}
      </div>
      <p className="mt-4 font-semibold text-[#1d3557]">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
