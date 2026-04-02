"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Technician } from "@/lib/data/contracts";

export function ReassignWorkOrderForm({
  workOrderId,
  technicians,
  currentTechnicianId,
  plannedStart,
  plannedEnd,
  buttonClassName,
}: {
  workOrderId: string;
  technicians: Technician[];
  currentTechnicianId?: string;
  plannedStart: string;
  plannedEnd: string;
  buttonClassName?: string;
}) {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(currentTechnicianId ?? technicians[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <div className="grid gap-2">
      <select
        value={selectedTechnicianId}
        onChange={(event) => setSelectedTechnicianId(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      >
        {technicians.map((technician) => (
          <option key={technician.id} value={technician.id}>
            {technician.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              if (!selectedTechnicianId) {
                setError("Debes seleccionar un tecnico.");
                return;
              }
              const response = await fetch(`/api/work-orders/${workOrderId}/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  technicianId: selectedTechnicianId,
                  startAt: plannedStart,
                  endAt: plannedEnd,
                }),
              });
              if (!response.ok) {
                const payload = (await response.json()) as { message?: string };
                throw new Error(payload.message ?? "No se pudo reasignar la orden.");
              }
              setError("");
              router.refresh();
            } catch (requestError) {
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "No se pudo reasignar la orden.",
              );
            }
          })
        }
        className={buttonClassName}
      >
        {pending ? "Guardando..." : "Reasignar tecnico"}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
