import Link from "next/link";
import { notFound } from "next/navigation";

import { LocationSummaryPanel } from "@/components/maps/location-summary-panel";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { requirePageAccess } from "@/lib/auth/session";
import { getClientById } from "@/lib/data/repositories";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAccess("/clientes");
  const { id } = await params;
  const detail = await getClientById(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cliente"
        title={detail.client.name}
        description="Ficha operativa real con equipos, ordenes, partes y ubicacion asociados."
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-5">
          <Panel>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoRow label="CIF" value={detail.client.taxId} />
              <InfoRow label="Ciudad" value={detail.client.city} />
              <InfoRow label="Direccion" value={detail.client.address} />
              <InfoRow label="Contacto" value={`${detail.client.contactName} - ${detail.client.contactPhone}`} />
            </div>
          </Panel>

          <Panel className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Equipos</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {detail.equipment.map((item) => (
                <Link
                  key={item.id}
                  href={`/equipos/${item.id}`}
                  className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_140px]"
                >
                  <div>
                    <p className="font-semibold text-[#1d3557]">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.manufacturer} {item.model} - {item.serialNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.location}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                  </div>
                  <div className="md:text-right">
                    <span className="rounded-lg bg-[#2f7ed8] px-3 py-2 text-sm font-semibold text-white">
                      Ver ficha
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Ordenes de trabajo</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {detail.workOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/trabajos/${order.id}`}
                  className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1.3fr_140px_140px]"
                >
                  <div>
                    <p className="font-semibold text-[#1d3557]">{order.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.number}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {order.plannedStart.slice(11, 16)} - {order.plannedEnd.slice(11, 16)}
                  </p>
                  <div className="md:text-right">
                    <span className="rounded-lg bg-[#1f4b7f] px-3 py-2 text-sm font-semibold text-white">
                      Ver orden
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <LocationSummaryPanel
            title={`Ubicacion de ${detail.client.name}`}
            address={detail.location.address}
            lat={detail.location.lat}
            lng={detail.location.lng}
            helper="El mapa interactivo se concentra solo en dashboard para reducir al minimo el consumo de la API."
          />
          <Panel className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Partes relacionados</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {detail.reports.length ? (
                detail.reports.map((report) => (
                  <Link
                    key={report.id}
                    href={`/ordenes/${report.id}`}
                    className="block px-5 py-4 transition hover:bg-slate-50"
                  >
                    <p className="font-semibold text-[#1d3557]">{report.workOrderNumber}</p>
                    <p className="mt-1 text-sm text-slate-500">{report.clientName}</p>
                  </Link>
                ))
              ) : (
                <div className="px-5 py-4 text-sm text-slate-500">No hay partes vinculados.</div>
              )}
            </div>
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
