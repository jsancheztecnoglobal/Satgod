"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useUiDevice } from "@/components/layout/ui-device-context";
import { cn } from "@/lib/cn";
import type { WorkReport } from "@/lib/data/contracts";

export function WorkReportDetailForm({
  report,
  children,
  showArrivalTime = true,
  showClientNameField = true,
  returnPath,
}: {
  report: WorkReport;
  children?: React.ReactNode;
  showArrivalTime?: boolean;
  showClientNameField?: boolean;
  returnPath?: string;
}) {
  const router = useRouter();
  const { isMobile } = useUiDevice();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(report);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const save = (status?: WorkReport["status"]) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/work-reports/${report.id}`, {
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

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "No se pudo guardar el parte.");
        }

        setError("");
        setFeedback(status === "closed" ? "Parte cerrado." : "Parte guardado.");

        if (returnPath) {
          router.push(returnPath);
          router.refresh();
          return;
        }

        router.refresh();
      } catch (requestError) {
        setFeedback("");
        setError(
          requestError instanceof Error ? requestError.message : "No se pudo guardar el parte.",
        );
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className={cn("grid gap-4", !isMobile && "md:grid-cols-2")}>
        {showArrivalTime ? (
          <Field label="Hora llegada">
            <input
              type="time"
              value={form.arrivalTime}
              onChange={(event) => setForm({ ...form, arrivalTime: event.target.value })}
              className={inputClassName}
            />
          </Field>
        ) : null}
        <Field label="Hora salida">
          <input
            type="time"
            value={form.departureTime}
            onChange={(event) => setForm({ ...form, departureTime: event.target.value })}
            className={inputClassName}
          />
        </Field>
        <Field label="Trabajo realizado" className={!isMobile ? "md:col-span-2" : undefined}>
          <textarea
            value={form.workDone}
            onChange={(event) => setForm({ ...form, workDone: event.target.value })}
            rows={isMobile ? 5 : 6}
            className={inputClassName}
          />
        </Field>
        <Field
          label="Pendientes y observaciones"
          className={!isMobile ? "md:col-span-2" : undefined}
        >
          <textarea
            value={form.pendingActions}
            onChange={(event) => setForm({ ...form, pendingActions: event.target.value })}
            rows={isMobile ? 4 : 5}
            className={inputClassName}
          />
        </Field>
        {showClientNameField ? (
          <Field
            label="Nombre cliente para firma"
            className={!isMobile ? "md:col-span-2" : undefined}
          >
            <input
              value={form.clientNameSigned}
              onChange={(event) => setForm({ ...form, clientNameSigned: event.target.value })}
              className={inputClassName}
            />
          </Field>
        ) : null}
      </div>

      {children}

      <div className={cn("grid gap-3 pt-2", !isMobile && "md:grid-cols-3")}>
        <button
          type="button"
          disabled={pending}
          onClick={() => save("draft")}
          className={actionButtonClassName("bg-[#1f4b7f]")}
        >
          {pending ? "Guardando..." : "Guardar borrador"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => save("ready_for_review")}
          className={actionButtonClassName("bg-[#2aa36b]")}
        >
          {pending ? "Guardando..." : "Marcar listo para revision"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => save("closed")}
          className={actionButtonClassName("bg-[#ef5b6c]")}
        >
          {pending ? "Guardando..." : "Cerrar parte de campo"}
        </button>
      </div>

      {feedback ? <p className="text-sm text-emerald-600">{feedback}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
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

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#2f7ed8]";

function actionButtonClassName(colorClassName: string) {
  return cn(
    "w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
    colorClassName,
  );
}
