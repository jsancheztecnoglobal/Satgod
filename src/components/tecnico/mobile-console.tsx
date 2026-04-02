"use client";

import { Signal } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Panel } from "@/components/ui/panel";
import { offlineDb } from "@/lib/offline/db";
import type { TechnicianAgendaItem } from "@/lib/data/contracts";

export function TechnicianMobileConsole({
  agenda,
}: {
  agenda: TechnicianAgendaItem[];
}) {
  const [selectedId, setSelectedId] = useState(agenda[0]?.id ?? "");
  const [arrivalTime, setArrivalTime] = useState(currentTimeLabel());
  const [actionPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");
  const router = useRouter();

  const pendingCommands = useLiveQuery(() => offlineDb.syncQueue.count(), []);
  const selectedOrder = useMemo(
    () => agenda.find((item) => item.id === selectedId) ?? agenda[0],
    [agenda, selectedId],
  );

  const openReportFromAgenda = () => {
    if (!selectedOrder) return;

    startTransition(async () => {
      try {
        setActionError("");
        const geo = await captureGeoPosition();
        const openedAt = new Date().toISOString();
        const response = await fetch(`/api/work-orders/${selectedOrder.id}/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            arrivalTime,
            openedAt,
            geoLat: geo?.lat,
            geoLng: geo?.lng,
          }),
        });
        const payload = (await response.json()) as { ok?: boolean; reportId?: string; message?: string };
        if (!response.ok || !payload.reportId) {
          throw new Error(payload.message ?? "No se pudo abrir el parte.");
        }
        router.push(`/ordenes/${payload.reportId}`);
        router.refresh();
      } catch (requestError) {
        setActionError(
          requestError instanceof Error ? requestError.message : "No se pudo abrir el parte.",
        );
      }
    });
  };

  const updateReportStatus = (status: "ready_for_review" | "closed") => {
    if (!selectedOrder?.reportId) return;

    startTransition(async () => {
      try {
        setActionError("");
        const response = await fetch(`/api/work-reports/${selectedOrder.reportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const payload = (await response.json()) as { ok?: boolean; message?: string };
        if (!response.ok) {
          throw new Error(payload.message ?? "No se pudo actualizar el estado del parte.");
        }
        router.refresh();
      } catch (requestError) {
        setActionError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudo actualizar el estado del parte.",
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-2xl font-semibold text-[#1d3557]">Tus trabajos asignados</h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <Panel className="order-1 p-0">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Agenda tecnica</h2>
              <div className="rounded-lg bg-[#dce9f7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f4b7f]">
                {agenda.length} OT
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {agenda.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full px-5 py-4 text-left transition hover:bg-slate-50 ${
                  item.id === selectedId ? "bg-[#f2f7fd]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1d3557]">{item.number}</p>
                    <p className="mt-1 text-sm text-slate-700">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.client}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">{item.windowLabel}</p>
              </button>
            ))}
          </div>
        </Panel>

        {selectedOrder ? (
          <Panel className="order-2 space-y-4">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-sm text-slate-500">{selectedOrder.number}</p>
              <h2 className="mt-1 text-[22px] font-semibold text-[#1d3557]">{selectedOrder.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedOrder.client} - {selectedOrder.equipmentLabel ?? "Sin equipo"}
              </p>
              <div className="mt-4 inline-flex rounded-full bg-[#dce9f7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f4b7f]">
                {formatStatusLabel(selectedOrder.status)}
              </div>
            </div>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Hora de llegada</span>
              <input
                type="time"
                value={arrivalTime}
                onChange={(event) => setArrivalTime(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />
            </label>

            <Panel className="space-y-3 border-[#dbe7f4] bg-[#f7fafe]">
              <button
                type="button"
                disabled={actionPending}
                onClick={openReportFromAgenda}
                className="flex w-full items-center justify-center rounded-2xl bg-[#1f4b7f] px-4 py-3.5 text-sm font-semibold text-white"
              >
                {actionPending ? "Abriendo..." : "Abrir parte"}
              </button>
              <button
                type="button"
                disabled={actionPending || !selectedOrder.reportId}
                onClick={() => updateReportStatus("ready_for_review")}
                className="w-full rounded-2xl bg-[#2aa36b] px-4 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
              >
                Marcar listo para revision
              </button>
              <button
                type="button"
                disabled={actionPending || !selectedOrder.reportId}
                onClick={() => updateReportStatus("closed")}
                className="w-full rounded-2xl bg-[#ef5b6c] px-4 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
              >
                Cerrar parte
              </button>
            </Panel>

            {selectedOrder.notes ? (
              <Panel className="bg-slate-50">
                <h3 className="text-[16px] font-semibold text-[#1d3557]">Notas</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{selectedOrder.notes}</p>
              </Panel>
            ) : null}

            <Panel className="bg-slate-50">
              <h3 className="text-[16px] font-semibold text-[#1d3557]">Estado de sincronizacion</h3>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <Signal className="h-5 w-5 text-[#1f4b7f]" />
                  <div>
                    <p className="font-semibold text-[#1d3557]">Cola local</p>
                    <p className="text-sm text-slate-500">
                      Pendientes: {pendingCommands ?? 0} cambios.
                    </p>
                  </div>
                </div>
              </div>
            </Panel>

            {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}
          </Panel>
        ) : (
          <Panel className="order-2">
            <p className="text-sm text-slate-500">No hay trabajos asignados ahora mismo.</p>
          </Panel>
        )}
      </div>
    </div>
  );
}

async function captureGeoPosition() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null;
  }

  return new Promise<{ lat: number; lng: number } | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => resolve(null),
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 8_000,
      },
    );
  });
}

function currentTimeLabel() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function StatusPill({ status }: { status: TechnicianAgendaItem["status"] }) {
  const classes =
    status === "in_progress"
      ? "bg-[#2aa36b]"
      : status === "planned"
        ? "bg-[#f28b39]"
        : status === "draft"
          ? "bg-[#2f7ed8]"
          : status === "ready_for_review"
            ? "bg-[#1f4b7f]"
            : "bg-slate-600";

  return (
    <span className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${classes}`}>
      {formatStatusLabel(status)}
    </span>
  );
}

function formatStatusLabel(status: TechnicianAgendaItem["status"]) {
  switch (status) {
    case "planned":
      return "Programada";
    case "in_progress":
      return "En curso";
    case "draft":
      return "Borrador";
    case "ready_for_review":
      return "Lista revision";
    case "pending_office_review":
      return "Pendiente oficina";
    case "pending_material":
      return "Pendiente material";
    case "closed":
      return "Cerrada";
    default:
      return status;
  }
}
