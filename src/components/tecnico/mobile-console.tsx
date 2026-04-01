"use client";

import { useMemo, useState } from "react";
import { Save, Signal } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";

import { FinalizeWorkOrderButton } from "@/components/actions/finalize-work-order-button";
import { OpenReportButton } from "@/components/actions/open-report-button";
import { Panel } from "@/components/ui/panel";
import { offlineDb } from "@/lib/offline/db";
import type { TechnicianAgendaItem } from "@/lib/data/contracts";

export function TechnicianMobileConsole({
  agenda,
}: {
  agenda: TechnicianAgendaItem[];
}) {
  const [selectedId, setSelectedId] = useState(agenda[0]?.id ?? "");
  const [notes, setNotes] = useState("Revision iniciada. Equipo accesible y sin incidencias previas visibles.");
  const [arrivalTime, setArrivalTime] = useState("08:05");
  const [departureTime, setDepartureTime] = useState("09:55");
  const [customerName, setCustomerName] = useState("");
  const [checklist, setChecklist] = useState([
    { id: "c1", label: "Llegada confirmada", done: true },
    { id: "c2", label: "Equipo revisado visualmente", done: false },
    { id: "c3", label: "Fotos finales pendientes", done: false },
  ]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const pendingCommands = useLiveQuery(() => offlineDb.syncQueue.count(), []);
  const selectedOrder = useMemo(
    () => agenda.find((item) => item.id === selectedId) ?? agenda[0],
    [agenda, selectedId],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
      <Panel className="p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Agenda tecnico</h2>
              <p className="mt-1 text-sm text-slate-500">Vista operativa para movil y PWA.</p>
            </div>
            <div className="rounded-lg bg-[#dce9f7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f4b7f]">
              Sync {pendingCommands ?? 0}
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
        <Panel>
          <div className="border-b border-slate-200 pb-4">
            <p className="text-sm text-slate-500">{selectedOrder.number}</p>
            <h2 className="mt-1 text-[22px] font-semibold text-[#1d3557]">{selectedOrder.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedOrder.client} - {selectedOrder.equipmentLabel ?? "Sin equipo"}
            </p>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="space-y-4">
              <Panel className="bg-slate-50">
                <h3 className="text-[16px] font-semibold text-[#1d3557]">Checklist</h3>
                <div className="mt-4 space-y-3">
                  {checklist.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() =>
                          setChecklist((current) =>
                            current.map((entry) =>
                              entry.id === item.id ? { ...entry, done: !entry.done } : entry,
                            ),
                          )
                        }
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </Panel>

              <Panel className="bg-slate-50">
                <h3 className="text-[16px] font-semibold text-[#1d3557]">Acciones rapidas</h3>
                <div className="mt-4 grid gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      if (!selectedOrder) return;
                      setSaving(true);
                      try {
                        const createResponse = await fetch(`/api/work-orders/${selectedOrder.id}/report`, {
                          method: "POST",
                        });
                        const createPayload = await createResponse.json();
                        if (!createResponse.ok || !createPayload.reportId) return;
                        await fetch(`/api/work-reports/${createPayload.reportId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            arrivalTime,
                            departureTime,
                            workDone: notes,
                            pendingActions: "",
                            clientNameSigned: customerName,
                            status: "draft",
                          }),
                        });
                        router.refresh();
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar progreso"}
                  </button>
                  <OpenReportButton
                    workOrderId={selectedOrder.id}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#2f7ed8] px-4 py-3 text-sm font-semibold text-white"
                    label="Abrir parte"
                  />
                  <FinalizeWorkOrderButton
                    workOrderId={selectedOrder.id}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#2aa36b] px-4 py-3 text-sm font-semibold text-white"
                    label="Finalizar trabajo"
                  />
                </div>
              </Panel>
            </div>

            <div className="space-y-4">
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Observaciones tecnicas</span>
                <textarea
                  rows={7}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Hora llegada" value={arrivalTime} onChange={setArrivalTime} />
                <Field label="Hora salida" value={departureTime} onChange={setDepartureTime} />
              </div>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Nombre cliente para firma</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                />
              </label>

              <div className="rounded-xl border border-slate-200 bg-[#f7fafe] px-4 py-4">
                <div className="flex items-center gap-3">
                  <Signal className="h-5 w-5 text-[#1f4b7f]" />
                  <div>
                    <p className="font-semibold text-[#1d3557]">Estado de sincronizacion</p>
                    <p className="text-sm text-slate-500">
                      Cola pendiente: {pendingCommands ?? 0} cambios.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      />
    </label>
  );
}

function StatusPill({ status }: { status: TechnicianAgendaItem["status"] }) {
  const classes =
    status === "in_progress"
      ? "bg-[#2aa36b]"
      : status === "planned"
        ? "bg-[#f28b39]"
        : "bg-[#2f7ed8]";

  return (
    <span className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${classes}`}>
      {status}
    </span>
  );
}
