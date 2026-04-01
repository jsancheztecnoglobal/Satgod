import { OperationsDashboard } from "@/components/dashboard/operations-dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { requirePageAccess } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/repositories";

export default async function DashboardPage() {
  await requirePageAccess("/dashboard");
  const { metrics, alerts, workOrders, technicians } = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Field Service Management"
        description="Vista ejecutiva y operativa inspirada en la referencia FSM que has marcado: estado del equipo, orden seleccionada y resumen visual rapido."
      />
      <OperationsDashboard
        metrics={metrics}
        alerts={alerts}
        workOrders={workOrders}
        technicians={technicians}
      />
    </div>
  );
}
