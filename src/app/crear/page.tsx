import { CreateWorkspace } from "@/components/forms/create-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { requirePageAccess } from "@/lib/auth/session";
import { getClientsList, getEquipmentList, getTechniciansList } from "@/lib/data/repositories";

export default async function CrearPage() {
  await requirePageAccess("/crear");
  const [clients, equipment, technicians] = await Promise.all([
    getClientsList(),
    getEquipmentList(),
    getTechniciansList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Crear"
        title="Crear entidades operativas"
        description="Desde aqui se crean clientes, equipos y ordenes. Cada guardado persiste y redirige al detalle real creado."
      />
      <Panel>
        <CreateWorkspace clients={clients} equipment={equipment} technicians={technicians} />
      </Panel>
    </div>
  );
}
