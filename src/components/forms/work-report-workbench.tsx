"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Panel } from "@/components/ui/panel";
import type { WorkOrderSummary, WorkReport } from "@/lib/data/contracts";

export function WorkReportWorkbench({
  workOrders,
  initialReports,
}: {
  workOrders: WorkOrderSummary[];
  initialReports: WorkReport[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const ordersWithoutReport = workOrders.filter(
    (order) => !initialReports.some((report) => report.workOrderId === order.id),
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.25fr]">
      <Panel className="p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Partes existentes</h2>
              <p className="mt-1 text-sm text-slate-500">Cada parte abre su detalle real.</p>
            </div>
            <span className="rounded-lg bg-[#dce9f7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f4b7f]">
              {initialReports.length} partes
            </span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {initialReports.map((report) => (
            <Link
              key={report.id}
              href={`/ordenes/${report.id}`}
              className="block px-5 py-4 transition hover:bg-slate-50"
            >
              <p className="font-semibold text-[#1d3557]">{report.workOrderNumber}</p>
              <p className="mt-1 text-sm text-slate-500">{report.clientName}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-600">{report.technicianId}</span>
                <span className="rounded-lg bg-[#2f7ed8] px-3 py-1 text-xs font-semibold text-white">
                  {report.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel className="p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[18px] font-semibold text-[#1d3557]">Crear parte desde orden</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {ordersWithoutReport.length ? (
            ordersWithoutReport.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-[#1d3557]">{order.number}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.title}</p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const response = await fetch(`/api/work-orders/${order.id}/report`, {
                        method: "POST",
                      });
                      const payload = await response.json();
                      if (response.ok && payload.reportId) {
                        router.push(`/ordenes/${payload.reportId}`);
                        router.refresh();
                      }
                    })
                  }
                  className="rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white"
                >
                  {pending ? "Creando..." : "Crear parte"}
                </button>
              </div>
            ))
          ) : (
            <div className="px-5 py-4 text-sm text-slate-500">
              Todas las ordenes visibles ya tienen parte asociado.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
