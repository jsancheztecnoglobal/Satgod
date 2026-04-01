import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { requirePageAccess } from "@/lib/auth/session";
import { getTechniciansList, getWorkOrdersList } from "@/lib/data/repositories";

export default async function TecnicosPage() {
  await requirePageAccess("/tecnicos");
  const [technicians, workOrders] = await Promise.all([
    getTechniciansList(),
    getWorkOrdersList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tecnicos"
        title="Carga y disponibilidad del equipo"
        description="Resumen operativo por tecnico para validar asignaciones, carga del dia y trabajos pendientes."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {technicians.map((technician) => {
          const technicianOrders = workOrders.filter((order) =>
            order.assignedTechnicianIds.includes(technician.id),
          );

          return (
            <Panel key={technician.id}>
              <div className="flex items-center justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: technician.color }}
                >
                  {technician.code.replace("tecnico", "T")}
                </div>
                <span className="rounded-lg bg-[#2aa36b] px-3 py-2 text-xs font-semibold text-white">
                  Activo
                </span>
              </div>
              <h2 className="mt-4 text-[18px] font-semibold text-[#1d3557]">{technician.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{technician.code}</p>
              <Link href={`/tecnicos/${technician.id}`} className="mt-4 inline-flex rounded-xl bg-[#1f4b7f] px-4 py-2 text-sm font-semibold text-white">
                Abrir ficha
              </Link>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-600">Ordenes del dia: {technicianOrders.length}</p>
                {technicianOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/trabajos/${order.id}`}
                    className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {order.number} - {order.plannedStart.slice(11, 16)}
                  </Link>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
