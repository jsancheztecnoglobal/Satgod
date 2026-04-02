import { Bell, Wrench } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
        </aside>

        <main className="flex min-h-screen items-start justify-center px-4 py-6 sm:px-6 sm:py-10 lg:items-center lg:px-12">
          <div className="w-full max-w-5xl">
            <div className="mb-5 rounded-2xl bg-[linear-gradient(135deg,#173a63_0%,#1f4b7f_100%)] px-5 py-5 text-white shadow-[0_16px_36px_rgba(15,23,42,0.16)] lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                    Acceso
                  </p>
                  <p className="mt-1 text-lg font-semibold">Tecnoglobal FSM</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/78">
                El mismo acceso sirve para escritorio y movil. La interfaz se adapta despues segun el dispositivo.
              </p>
            </div>

            <div className="mb-6 flex items-center justify-end">
              <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:flex">
                <Bell className="h-5 w-5 text-[#1f4b7f]" />
                <span className="text-sm font-medium text-slate-700">Producto operativo</span>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.08)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#52729b]">
                  Sesion corporativa
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[#1d3557]">Login principal</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Autenticacion real contra Supabase Auth cuando esta configurado.
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
                    className="mt-2 w-full rounded-2xl bg-[#1f4b7f] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173a63]"
                  >
                    Entrar
                  </button>
                </form>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7fafe_100%)] p-5 shadow-[0_16px_42px_rgba(15,23,42,0.08)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#52729b]">
                  Entorno
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[#1d3557]">Acceso corporativo</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  La autenticacion se resuelve contra el entorno activo de la aplicacion. Si el acceso falla, el sistema mostrara el motivo exacto en esta misma pantalla.
                </p>

                <div className="mt-6 grid gap-3">
                  <SecurityRow title="Roles" description="Acceso segmentado para oficina, tecnicos, ingenieria y administracion." />
                  <SecurityRow title="Sesion" description="Persistencia segura y proteccion de rutas privadas." />
                  <SecurityRow title="Datos" description="Operativa conectada a base de datos y backend reales." />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SecurityRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
      <p className="font-semibold text-[#1d3557]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
