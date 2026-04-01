import { WorkReportWorkbench } from "@/components/forms/work-report-workbench";
import { PageHeader } from "@/components/ui/page-header";
import { requirePageAccess } from "@/lib/auth/session";
import { getWorkOrdersList, getWorkReportsList } from "@/lib/data/repositories";

export default async function OrdenesPage() {
  await requirePageAccess("/ordenes");
  const [workOrders, workReports] = await Promise.all([
    getWorkOrdersList(),
    getWorkReportsList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Partes"
        title="Partes de trabajo"
        description="Aqui no se muestra un payload tecnico: aqui se crean, editan y revisan partes reales asociados a ordenes de trabajo."
      />
      <WorkReportWorkbench workOrders={workOrders} initialReports={workReports} />
    </div>
  );
}
