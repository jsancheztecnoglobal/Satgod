import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { requirePageAccess } from "@/lib/auth/session";
import { getTechnicianById } from "@/lib/data/repositories";

export default async function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAccess("/tecnicos");
  const { id } = await params;
  const detail = await getTechnicianById(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tecnico"
        title={detail.technician.name}
        description="Ficha real del tecnico con agenda, partes y trabajos asignados."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: detail.technician.color }}
            >
              {detail.technician.code.replace("tecnico", "T")}
            </div>
            <div>
              <p className="text-xl font-semibold text-[#1d3557]">{detail.technician.name}</p>
              <p className="mt-1 text-sm text-slate-500">{detail.technician.code}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InfoRow label="Estado" value={detail.status} />
            <InfoRow label="Asignaciones" value={String(detail.assignments.length)} />
            <InfoRow label="Partes" value={String(detail.reports.length)} />
          </div>
        </Panel>

        <Panel className="p-0">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-[18px] font-semibold text-[#1d3557]">Trabajos asignados</h2>
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

        <Panel className="p-0 xl:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-[18px] font-semibold text-[#1d3557]">Partes del tecnico</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {detail.reports.map((report) => (
              <Link
                key={report.id}
                href={`/ordenes/${report.id}`}
                className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1.5fr_160px]"
              >
                <div>
                  <p className="font-semibold text-[#1d3557]">{report.workOrderNumber}</p>
                  <p className="mt-1 text-sm text-slate-500">{report.clientName}</p>
                </div>
                <div className="md:text-right">
                  <span className="rounded-lg bg-[#2f7ed8] px-3 py-2 text-sm font-semibold text-white">
                    Abrir parte
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
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
