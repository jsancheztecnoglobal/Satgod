"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

export function AdjustDurationForm({
  workOrderId,
  plannedEnd,
  buttonClassName,
}: {
  workOrderId: string;
  plannedEnd: string;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initialValue = useMemo(() => plannedEnd.slice(0, 16), [plannedEnd]);
  const [endValue, setEndValue] = useState(initialValue);
  const [error, setError] = useState("");

  return (
    <div className="grid gap-2">
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
              if (!endValue) {
                setError("Debes indicar una fecha y hora de fin.");
                return;
              }
              const response = await fetch(`/api/work-orders/${workOrderId}/duration`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ endAt: new Date(endValue).toISOString() }),
              });
              if (!response.ok) {
                const payload = (await response.json()) as { message?: string };
                throw new Error(payload.message ?? "No se pudo ajustar la duracion.");
              }
              setError("");
              router.refresh();
            } catch (requestError) {
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "No se pudo ajustar la duracion.",
              );
            }
          })
        }
        className={buttonClassName}
      >
        {pending ? "Guardando..." : "Ajustar duracion"}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
