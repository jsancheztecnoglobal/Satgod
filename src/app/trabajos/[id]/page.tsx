import Link from "next/link";
import { notFound } from "next/navigation";

import { FinalizeWorkOrderButton } from "@/components/actions/finalize-work-order-button";
import { OpenReportButton } from "@/components/actions/open-report-button";
import { LocationSummaryPanel } from "@/components/maps/location-summary-panel";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { requirePageAccess } from "@/lib/auth/session";
import { getWorkOrderById } from "@/lib/data/repositories";

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAccess("/trabajos");
  const { id } = await params;
  const workOrder = await getWorkOrderById(id);

  if (!workOrder) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Orden"
        title={`${workOrder.number} - ${workOrder.title}`}
        description="Detalle real de la orden con checklist, materiales, tiempos y acciones operativas."
      />
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Panel>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoRow label="Cliente" value={workOrder.clientName} />
              <InfoRow label="Equipo" value={workOrder.equipmentLabel ?? "Sin equipo"} />
              <InfoRow label="Estado" value={workOrder.status} />
              <InfoRow label="Tipo" value={workOrder.type} />
              <InfoRow label="Prioridad" value={workOrder.priority} />
              <InfoRow
                label="Horario"
                value={`${workOrder.plannedStart.slice(11, 16)} - ${workOrder.plannedEnd.slice(11, 16)}`}
              />
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-600">{workOrder.description}</p>
          </Panel>

          <Panel className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Checklist</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {workOrder.checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-4">
                  <p className="font-medium text-slate-700">{item.label}</p>
                  <span className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${item.done ? "bg-[#2aa36b]" : "bg-[#f28b39]"}`}>
                    {item.done ? "OK" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Materiales y tiempos</h2>
            </div>
            <div className="px-5 py-4">
              <div className="space-y-2">
                {workOrder.materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between text-sm text-slate-700">
                    <span>{material.name}</span>
                    <span>{material.quantity} {material.unit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                {workOrder.laborEntries.map((labor) => (
                  <div key={labor.id} className="flex items-center justify-between text-sm text-slate-700">
                    <span>{labor.technician}</span>
                    <span>{labor.minutes} min</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <LocationSummaryPanel
            title={`Ubicacion de ${workOrder.clientName}`}
            address={workOrder.clientAddress}
            lat={workOrder.lat}
            lng={workOrder.lng}
            helper="El mapa interactivo se reserva para dashboard y asi evitamos cargas innecesarias."
          />

          <Panel className="space-y-3">
            <OpenReportButton
              workOrderId={workOrder.id}
              reportId={workOrder.reportId}
              className="flex w-full items-center justify-center rounded-xl bg-[#2f7ed8] px-4 py-3 text-sm font-semibold text-white"
            />
            {workOrder.equipmentId ? (
              <Link
                href={`/equipos/${workOrder.equipmentId}`}
                className="flex w-full items-center justify-center rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white"
              >
                Ver equipo
              </Link>
            ) : null}
            <FinalizeWorkOrderButton
              workOrderId={workOrder.id}
              className="flex w-full items-center justify-center rounded-xl bg-[#ef5b6c] px-4 py-3 text-sm font-semibold text-white"
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-[#1d3557]">{value}</p>
    </div>
  );
}
