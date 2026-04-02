"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  isoToLocalDateTimeInput,
  localDateTimeInputToIso,
} from "@/lib/datetime-local";

export function AdjustDurationForm({
  workOrderId,
  plannedStart,
  plannedEnd,
  technicianId,
  buttonClassName,
}: {
  workOrderId: string;
  plannedStart: string;
  plannedEnd: string;
  technicianId: string;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initialStartValue = useMemo(() => isoToLocalDateTimeInput(plannedStart), [plannedStart]);
  const initialEndValue = useMemo(() => isoToLocalDateTimeInput(plannedEnd), [plannedEnd]);
  const [startValue, setStartValue] = useState(initialStartValue);
  const [endValue, setEndValue] = useState(initialEndValue);
  const [error, setError] = useState("");

  return (
    <div className="grid gap-2">
      <input
        type="datetime-local"
        value={startValue}
        onChange={(event) => setStartValue(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      />
      <input
        type="datetime-local"
        value={endValue}
        onChange={(event) => setEndValue(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              if (!startValue || !endValue) {
                setError("Debes indicar fecha y hora de inicio y fin.");
                return;
              }
              const response = await fetch(`/api/work-orders/${workOrderId}/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  startAt: localDateTimeInputToIso(startValue),
                  endAt: localDateTimeInputToIso(endValue),
                  technicianId,
                }),
              });
              if (!response.ok) {
                const payload = (await response.json()) as { message?: string };
                throw new Error(payload.message ?? "No se pudo actualizar la planificacion.");
              }
              setError("");
              router.refresh();
            } catch (requestError) {
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "No se pudo actualizar la planificacion.",
              );
            }
          })
        }
        className={buttonClassName}
      >
        {pending ? "Guardando..." : "Actualizar horario"}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
