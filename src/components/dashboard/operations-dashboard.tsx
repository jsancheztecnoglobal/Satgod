"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, CalendarClock, Users, Wrench } from "lucide-react";

import { FinalizeWorkOrderButton } from "@/components/actions/finalize-work-order-button";
import { DashboardMapPanel } from "@/components/dashboard/dashboard-map-panel";
import { OpenReportButton } from "@/components/actions/open-report-button";
import { DashboardMetricCard } from "@/components/ui/metric-card";
import { Panel } from "@/components/ui/panel";
import type {
  DashboardAlert,
  DashboardMetric,
  Technician,
  WorkOrderSummary,
} from "@/lib/data/contracts";

export function OperationsDashboard({
  metrics,
  alerts,
  workOrders,
  technicians,
}: {
  metrics: DashboardMetric[];
  alerts: DashboardAlert[];
  workOrders: WorkOrderSummary[];
  technicians: Technician[];
}) {
  const [selectedOrderId, setSelectedOrderId] = useState(workOrders[0]?.id ?? "");

  const selectedOrder = useMemo(
    () => workOrders.find((order) => order.id === selectedOrderId) ?? workOrders[0],
    [selectedOrderId, workOrders],
  );

  const selectedTechnician = technicians.find((tech) =>
    selectedOrder?.assignedTechnicianIds.includes(tech.id),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.8fr_0.95fr]">
        <div className="space-y-5">
          <DashboardMapPanel
            workOrders={workOrders}
            technicians={technicians}
          />

          <Panel className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1d3557]">Proximas ordenes</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Cada fila selecciona la orden y abre su detalle real.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">{alerts.length} avisos</span>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {workOrders.map((order) => (
                <div
                  key={order.id}
                  className={`grid grid-cols-[1.7fr_1fr_120px_140px_120px] items-center gap-4 px-5 py-4 transition ${
                    selectedOrderId === order.id ? "bg-[#f2f7fd]" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(order.id)}
                    className="min-w-0 text-left"
                  >
                    <p className="font-semibold text-[#1d3557]">{order.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.clientName}</p>
                  </button>
                  <p className="text-sm text-slate-600">{order.clientName}</p>
                  <p className="text-sm font-medium text-slate-700">
                    {order.plannedStart.slice(11, 16)}
                  </p>
                  <StatusPill status={order.status} />
                  <Link
                    href={`/trabajos/${order.id}`}
                    className="rounded-lg bg-[#1f4b7f] px-3 py-2 text-center text-sm font-semibold text-white"
                  >
                    Detalle
                  </Link>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Detalle de orden</h2>
            </div>
            {selectedOrder ? (
              <div className="space-y-5 px-5 py-5">
                <div>
                  <p className="text-3xl font-semibold text-[#1d3557]">{selectedOrder.number}</p>
                </div>
                <DetailRow label="Cliente" value={selectedOrder.clientName} />
                <DetailRow label="Equipo" value={selectedOrder.equipmentLabel ?? "Sin equipo"} />
                <DetailRow label="Trabajo" value={selectedOrder.title} />
                <DetailRow label="Tecnico" value={selectedTechnician?.name ?? "Sin asignar"} />
                <DetailRow
                  label="Hora"
                  value={`${selectedOrder.plannedStart.slice(11, 16)} - ${selectedOrder.plannedEnd.slice(11, 16)}`}
                />
                <div>
                  <p className="mb-2 text-sm text-slate-500">Estado</p>
                  <StatusPill status={selectedOrder.status} />
                </div>
                <div className="grid gap-3">
                  <OpenReportButton
                    workOrderId={selectedOrder.id}
                    reportId={selectedOrder.reportId}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#2f7ed8] px-4 py-3 text-sm font-semibold text-white"
                  />
                  {selectedOrder.equipmentId ? (
                    <Link
                      href={`/equipos/${selectedOrder.equipmentId}`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white"
                    >
                      <Wrench className="h-4 w-4" />
                      Ver equipo
                    </Link>
                  ) : null}
                  <FinalizeWorkOrderButton
                    workOrderId={selectedOrder.id}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#ef5b6c] px-4 py-3 text-sm font-semibold text-white"
                  />
                  <Link
                    href={`/trabajos/${selectedOrder.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1f4b7f] ring-1 ring-slate-200"
                  >
                    <CalendarClock className="h-4 w-4" />
                    Abrir orden
                  </Link>
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#1f4b7f]" />
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Estado rapido del equipo</h2>
            </div>
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-[#1d3557]">{alert.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 pb-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-[17px] font-semibold text-[#1d3557]">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const classes =
    status === "in_progress"
      ? "bg-[#2aa36b]"
      : status === "planned"
        ? "bg-[#f28b39]"
        : status === "pending_office_review"
          ? "bg-[#2f7ed8]"
          : status === "closed"
            ? "bg-[#1f4b7f]"
            : "bg-[#64748b]";

  const label =
    status === "in_progress"
      ? "En proceso"
      : status === "planned"
        ? "Programada"
        : status === "pending_office_review"
          ? "Pendiente"
          : status === "closed"
            ? "Cerrada"
            : status;

  return <span className={`inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white ${classes}`}>{label}</span>;
}
