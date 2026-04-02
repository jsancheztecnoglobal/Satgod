import { TechnicianMobileConsole } from "@/components/tecnico/mobile-console";
import { PageHeader } from "@/components/ui/page-header";
import { getAppSession, requirePageAccess } from "@/lib/auth/session";
import { getTechnicianAgenda } from "@/lib/data/repositories";

export default async function TecnicoPage() {
  const session = await requirePageAccess("/tecnico");
  const resolvedSession = session ?? (await getAppSession());
  const agenda = resolvedSession ? await getTechnicianAgenda(resolvedSession) : [];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl bg-[linear-gradient(135deg,#173a63_0%,#1f4b7f_100%)] px-5 py-5 text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] md:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
          Trabajo de campo
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Mi jornada</h1>
        <p className="mt-2 text-sm text-white/78">
          Consulta tus ordenes, abre el parte y registra el trabajo sin salir del mismo flujo.
        </p>
      </div>
      <PageHeader
        eyebrow="App del tecnico"
        title="Consola movil / PWA"
        description="Primera pantalla operativa orientada a movil, preparada para cola offline, captura rapida y sincronizacion visible."
        className="hidden md:flex"
      />
      <TechnicianMobileConsole agenda={agenda} />
    </div>
  );
}
