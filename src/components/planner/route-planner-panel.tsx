"use client";

import { useMemo, useState } from "react";

import { GoogleMapLive } from "@/components/maps/google-maps-live";
import { Panel } from "@/components/ui/panel";
import type { PlannerEvent, Technician } from "@/lib/data/contracts";

export function RoutePlannerPanel({
  technicians,
  events,
  selectedTechnicianId,
}: {
  technicians: Technician[];
  events: PlannerEvent[];
  selectedTechnicianId?: string;
}) {
  const [routeEnabled, setRouteEnabled] = useState(false);

  const technician = technicians.find((item) => item.id === selectedTechnicianId);
  const routeEvents = useMemo(
    () =>
      events
        .filter((event) => event.technicianId === selectedTechnicianId && event.lat != null && event.lng != null)
        .sort((left, right) => left.startAt.localeCompare(right.startAt)),
    [events, selectedTechnicianId],
  );

  const markers = routeEvents.map((event) => ({
    id: event.id,
    label: event.workOrderNumber,
    title: `${event.workOrderNumber} - ${event.clientName}`,
    lat: event.lat as number,
    lng: event.lng as number,
    color: technician?.color ?? "#1f4b7f",
  }));

  if (!selectedTechnicianId) {
    return (
      <Panel>
        <h3 className="text-[18px] font-semibold text-[#1d3557]">Ruta del tecnico</h3>
        <p className="mt-3 text-sm text-slate-500">
          Selecciona un tecnico para calcular manualmente su ruta del dia o de la semana.
        </p>
      </Panel>
    );
  }

  return (
    <Panel className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-[18px] font-semibold text-[#1d3557]">Ruta del tecnico</h3>
          <p className="mt-1 text-sm text-slate-500">
            Calculo manual para {technician?.name ?? selectedTechnicianId}. Solo consume llamadas
            cuando pulsas el boton.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRouteEnabled((current) => !current)}
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            routeEnabled
              ? "bg-[#2f7ed8] text-white"
              : "bg-[#1f4b7f] text-white"
          }`}
          disabled={routeEvents.length < 2}
        >
          {routeEnabled ? "Ocultar ruta" : "Calcular ruta"}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-500">Paradas con coordenadas</p>
          <p className="mt-1 text-2xl font-semibold text-[#1d3557]">{routeEvents.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-500">Ventana visible</p>
          <p className="mt-1 text-2xl font-semibold text-[#1d3557]">
            {routeEvents.length
              ? `${routeEvents[0].startAt.slice(11, 16)} - ${routeEvents[routeEvents.length - 1].endAt.slice(11, 16)}`
              : "--:--"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-500">Estado de ruta</p>
          <p className="mt-1 text-2xl font-semibold text-[#1d3557]">
            {routeEvents.length < 2 ? "No aplica" : routeEnabled ? "Calculada" : "Pendiente"}
          </p>
        </div>
      </div>

      {routeEvents.length < 2 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Hace falta al menos dos intervenciones con coordenadas para calcular una ruta.
        </div>
      ) : routeEnabled ? (
        <GoogleMapLive
          title={`Ruta de ${technician?.name ?? selectedTechnicianId}`}
          markers={markers}
          routeMarkerIds={markers.map((marker) => marker.id)}
          enableRoutes
          height={300}
        />
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="font-semibold text-[#1d3557]">Secuencia prevista</p>
        </div>
        <div className="divide-y divide-slate-100">
          {routeEvents.length ? (
            routeEvents.map((event, index) => (
              <div key={event.id} className="grid gap-3 px-4 py-3 md:grid-cols-[56px_1fr_120px] md:items-center">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: technician?.color ?? "#1f4b7f" }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-[#1d3557]">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {event.clientName}
                    {event.address ? ` · ${event.address}` : ""}
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {event.startAt.slice(11, 16)} - {event.endAt.slice(11, 16)}
                </p>
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-slate-500">
              No hay intervenciones con ubicacion suficiente para la ruta.
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
