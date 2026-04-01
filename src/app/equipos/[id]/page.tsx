import Link from "next/link";
import { notFound } from "next/navigation";

import { LocationSummaryPanel } from "@/components/maps/location-summary-panel";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { requirePageAccess } from "@/lib/auth/session";
import { getEquipmentById } from "@/lib/data/repositories";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAccess("/equipos");
  const { id } = await params;
  const detail = await getEquipmentById(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Equipo"
        title={detail.equipment.name}
        description="Ficha de equipo con cliente asociado, mapa real e historial de ordenes."
      />
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Panel>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoRow label="Serie" value={detail.equipment.serialNumber} />
              <InfoRow label="Fabricante" value={detail.equipment.manufacturer} />
              <InfoRow label="Modelo" value={detail.equipment.model} />
              <InfoRow label="Ubicacion" value={detail.equipment.location} />
              <InfoRow label="Categoria" value={detail.equipment.category} />
              <InfoRow label="Estado" value={detail.equipment.status} />
            </div>
          </Panel>

          {detail.client ? (
            <Panel>
              <p className="text-sm text-slate-500">Cliente asociado</p>
              <Link href={`/clientes/${detail.client.id}`} className="mt-2 block text-xl font-semibold text-[#1d3557] hover:underline">
                {detail.client.name}
              </Link>
              <p className="mt-2 text-sm text-slate-600">{detail.client.address}</p>
            </Panel>
          ) : null}

          <Panel className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Ordenes asociadas</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {detail.workOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/trabajos/${order.id}`}
                  className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1.4fr_160px]"
                >
                  <div>
                    <p className="font-semibold text-[#1d3557]">{order.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.number}</p>
                  </div>
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
        <LocationSummaryPanel
          title={`Ubicacion de ${detail.equipment.name}`}
          address={detail.location.address}
          lat={detail.location.lat}
          lng={detail.location.lng}
          helper="Para minimizar costes, el mapa JS solo se monta en dashboard. Desde aqui puedes abrir la ubicacion externa."
        />
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
