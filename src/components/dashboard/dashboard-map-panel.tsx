"use client";

import { useMemo, useState } from "react";

import { GoogleMapLive } from "@/components/maps/google-maps-live";
import { Panel } from "@/components/ui/panel";
import type { Technician, WorkOrderSummary } from "@/lib/data/contracts";

export function DashboardMapPanel({
  workOrders,
  technicians,
}: {
  workOrders: WorkOrderSummary[];
  technicians: Technician[];
}) {
  const [mapEnabled, setMapEnabled] = useState(false);

  const visibleMarkers = useMemo(
    () =>
      workOrders
        .filter((order) => order.lat != null && order.lng != null)
        .map((order) => ({
          id: order.id,
          label: order.number,
          title: `${order.number} - ${order.clientName}`,
          lat: order.lat as number,
          lng: order.lng as number,
          color:
            technicians.find((tech) => order.assignedTechnicianIds.includes(tech.id))?.color ??
            "#1f4b7f",
        })),
    [technicians, workOrders],
  );

  if (!mapEnabled) {
    return (
      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-[#1d3557]">Mapa operativo del dia</h2>
            <p className="mt-1 text-sm text-slate-500">
              El mapa de Google solo se carga cuando lo pides para minimizar consumo y mantener el
              uso dentro del tramo gratuito.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMapEnabled(true)}
            className="rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white"
          >
            Cargar mapa
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-500">Ordenes con ubicacion</p>
            <p className="mt-1 text-2xl font-semibold text-[#1d3557]">{visibleMarkers.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-500">Tecnico seleccionado</p>
            <p className="mt-1 text-2xl font-semibold text-[#1d3557]">
              {new Set(
                workOrders.flatMap((order) => order.assignedTechnicianIds),
              ).size || "Sin tecnico"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-500">Modo de mapa</p>
            <p className="mt-1 text-2xl font-semibold text-[#1d3557]">
              Seguimiento
            </p>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setMapEnabled(false)}
          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
        >
          Descargar mapa
        </button>
        <p className="text-sm text-slate-500">
          El dashboard queda reservado para seguimiento. El calculo de rutas se hace desde
          planificacion.
        </p>
      </div>

      <GoogleMapLive
        title="Mapa operativo del dia"
        markers={visibleMarkers}
        enableRoutes={false}
        height={320}
        defaultView={{
          lat: 41.8205,
          lng: 1.86768,
          zoom: 8,
          description: "Sin tecnicos ni ordenes geolocalizados ahora mismo. Mostrando Catalunya como area operativa base.",
        }}
      />
    </div>
  );
}
