import { TechnicianMobileConsole } from "@/components/tecnico/mobile-console";
import { PageHeader } from "@/components/ui/page-header";
import { getAppSession, requirePageAccess } from "@/lib/auth/session";
import { getTechnicianAgenda } from "@/lib/data/repositories";

export default async function TecnicoPage() {
  const session = await requirePageAccess("/tecnico");
  const resolvedSession = session ?? (await getAppSession());
  const agenda = resolvedSession ? await getTechnicianAgenda(resolvedSession) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="App del tecnico"
        title="Consola movil / PWA"
        description="Primera pantalla operativa orientada a movil, preparada para cola offline, captura rapida y sincronizacion visible."
      />
      <TechnicianMobileConsole agenda={agenda} />
    </div>
  );
}
