"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useUiDevice } from "@/components/layout/ui-device-context";
import { cn } from "@/lib/cn";
import type { MaterialCatalogItem, MaterialUsage } from "@/lib/data/contracts";

export function MaterialUsageEditor({
  workReportId,
  materials,
  catalog,
}: {
  workReportId: string;
  materials: MaterialUsage[];
  catalog: MaterialCatalogItem[];
}) {
  const router = useRouter();
  const { isMobile } = useUiDevice();
  const [pending, startTransition] = useTransition();
  const [materialId, setMaterialId] = useState(catalog[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div className="space-y-4">
      <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "md:grid-cols-[1.3fr_120px_auto]")}>
        <select
          value={materialId}
          onChange={(event) => setMaterialId(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm"
        >
          {catalog.length ? (
            catalog.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.sku}
              </option>
            ))
          ) : (
            <option value="">No hay materiales disponibles</option>
          )}
        </select>

        <input
          type="number"
          min="0.001"
          step="0.001"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm"
          placeholder="Cantidad"
        />

        <button
          type="button"
          disabled={pending || !catalog.length}
          onClick={() =>
            startTransition(async () => {
              try {
                const parsedQuantity = Number(quantity);
                if (!materialId) {
                  setError("Debes seleccionar un material.");
                  setSuccess("");
                  return;
                }
                if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
                  setError("Debes indicar una cantidad valida.");
                  setSuccess("");
                  return;
                }

                const response = await fetch(`/api/work-reports/${workReportId}/materials`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ materialId, quantity: parsedQuantity }),
                });

                if (!response.ok) {
                  const payload = (await response.json()) as { message?: string };
                  throw new Error(payload.message ?? "No se pudo registrar el material.");
                }

                setError("");
                setSuccess("Material guardado.");
                setQuantity("1");
                router.refresh();
              } catch (saveError) {
                setSuccess("");
                setError(
                  saveError instanceof Error
                    ? saveError.message
                    : "No se pudo registrar el material.",
                );
              }
            })
          }
          className="w-full rounded-2xl bg-[#1f4b7f] px-4 py-3.5 text-sm font-semibold text-white"
        >
          {pending ? "Guardando..." : "Anadir"}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="rounded-2xl border border-slate-200">
        {materials.length ? (
          materials.map((material) => (
            <div
              key={material.id}
              className={cn(
                "gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0",
                isMobile ? "space-y-1" : "grid grid-cols-[1.5fr_100px_80px]",
              )}
            >
              <p className="font-medium text-slate-700">{material.name}</p>
              <p className="text-slate-600">{material.quantity}</p>
              <p className="text-slate-600">{material.unit}</p>
            </div>
          ))
        ) : (
          <div className="px-4 py-4 text-sm text-slate-500">
            No hay materiales registrados.
          </div>
        )}
      </div>
    </div>
  );
}
