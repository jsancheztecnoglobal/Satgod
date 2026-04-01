import { DayScheduler } from "@/components/planner/day-scheduler";
import { PageHeader } from "@/components/ui/page-header";
import { requirePageAccess } from "@/lib/auth/session";
import { getPlannerEvents, getTechniciansList } from "@/lib/data/repositories";

export default async function PlanificacionPage() {
  await requirePageAccess("/planificacion");
  const [technicians, events] = await Promise.all([
    getTechniciansList(),
    getPlannerEvents(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Planificacion"
        title="Calendario diario por horas"
        description="Vista principal de despacho: calendario diario y semanal, tecnico individual o general, con calculo manual de rutas separado del dashboard para mantener el consumo de Google Maps bajo control."
      />
      <DayScheduler technicians={technicians} events={events} />
    </div>
  );
}
