"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { WorkReport } from "@/lib/data/contracts";

export function WorkReportDetailForm({
  report,
}: {
  report: WorkReport;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(report);

  const save = (status?: WorkReport["status"]) => {
    startTransition(async () => {
      await fetch(`/api/work-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arrivalTime: form.arrivalTime,
          departureTime: form.departureTime,
          workDone: form.workDone,
          pendingActions: form.pendingActions,
          clientNameSigned: form.clientNameSigned,
          status: status ?? form.status,
        }),
      });
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Hora llegada">
          <input value={form.arrivalTime} onChange={(event) => setForm({ ...form, arrivalTime: event.target.value })} className={inputClassName} />
        </Field>
        <Field label="Hora salida">
          <input value={form.departureTime} onChange={(event) => setForm({ ...form, departureTime: event.target.value })} className={inputClassName} />
        </Field>
        <Field label="Trabajo realizado" className="md:col-span-2">
          <textarea value={form.workDone} onChange={(event) => setForm({ ...form, workDone: event.target.value })} rows={6} className={inputClassName} />
        </Field>
        <Field label="Pendientes y observaciones" className="md:col-span-2">
          <textarea value={form.pendingActions} onChange={(event) => setForm({ ...form, pendingActions: event.target.value })} rows={5} className={inputClassName} />
        </Field>
        <Field label="Nombre cliente para firma" className="md:col-span-2">
          <input value={form.clientNameSigned} onChange={(event) => setForm({ ...form, clientNameSigned: event.target.value })} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <button type="button" disabled={pending} onClick={() => save("draft")} className="rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white">
          {pending ? "Guardando..." : "Guardar borrador"}
        </button>
        <button type="button" disabled={pending} onClick={() => save("ready_for_review")} className="rounded-xl bg-[#2aa36b] px-4 py-3 text-sm font-semibold text-white">
          {pending ? "Guardando..." : "Listo para revision"}
        </button>
        <button type="button" disabled={pending} onClick={() => save("closed")} className="rounded-xl bg-[#ef5b6c] px-4 py-3 text-sm font-semibold text-white">
          {pending ? "Guardando..." : "Cerrar parte"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClassName = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm";
