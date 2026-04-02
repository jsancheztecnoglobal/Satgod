"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Users } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

import { AdjustDurationForm } from "@/components/actions/adjust-duration-form";
import { OpenReportButton } from "@/components/actions/open-report-button";
import { ReassignWorkOrderForm } from "@/components/actions/reassign-work-order-form";
import { useUiDevice } from "@/components/layout/ui-device-context";
import { RoutePlannerPanel } from "@/components/planner/route-planner-panel";
import { Panel } from "@/components/ui/panel";
import type { PlannerEvent, Technician } from "@/lib/data/contracts";

const START_HOUR = 7;
const END_HOUR = 20;
const HOUR_HEIGHT = 78;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;
const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, index) => START_HOUR + index);

export function DayScheduler({
  technicians,
  events,
  canEditSchedule,
}: {
  technicians: Technician[];
  events: PlannerEvent[];
  canEditSchedule: boolean;
}) {
  const router = useRouter();
  const { isMobile } = useUiDevice();
  const [scope, setScope] = useState<"day" | "week">("day");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedView, setSelectedView] = useState<"general" | string>("general");
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const [scheduleError, setScheduleError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const allowDrag = canEditSchedule && !isMobile;

  const visibleTechnicians =
    selectedView === "general"
      ? technicians
      : technicians.filter((technician) => technician.id === selectedView);

  const visibleEvents = useMemo(
    () =>
      events.filter((event) =>
        selectedView === "general" ? true : event.technicianId === selectedView,
      ),
    [events, selectedView],
  );

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0];
  const routeTechnicianId =
    selectedView === "general" ? selectedEvent?.technicianId : selectedView;
  const busyTechnicians = new Set(visibleEvents.map((event) => event.technicianId));
  const freeTechnicians = visibleTechnicians.filter((technician) => !busyTechnicians.has(technician.id));
  const referenceDayLabel = selectedEvent
    ? formatPlannerDate(selectedEvent.startAt)
    : "Sin fecha";
  const referenceWeekLabel = formatPlannerWeekRange(visibleEvents, weekOffset);

  const handleScheduleUpdate = async (
    eventToUpdate: PlannerEvent,
    nextTechnicianId: string,
    nextStartAt: string,
    nextEndAt: string,
  ) => {
    const response = await fetch(`/api/work-orders/${eventToUpdate.workOrderId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        technicianId: nextTechnicianId,
        startAt: nextStartAt,
        endAt: nextEndAt,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      throw new Error(payload.message ?? "No se pudo actualizar la planificacion.");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta } = event;
    if (!over) return;

    const draggedEvent = events.find((entry) => entry.id === String(active.id));
    if (!draggedEvent) return;

    const overId = String(over.id);
    const targetEvent = events.find((entry) => entry.id === overId);
    const nextTechnicianId =
      overId.startsWith("column:")
        ? overId.replace("column:", "")
        : targetEvent?.technicianId ?? draggedEvent.technicianId;

    const minuteDelta = Math.round(delta.y / (HOUR_HEIGHT / 2)) * 30;
    const startDate = new Date(draggedEvent.startAt);
    const endDate = new Date(draggedEvent.endAt);
    const nextStartDate = new Date(startDate.getTime() + minuteDelta * 60_000);
    const nextEndDate = new Date(endDate.getTime() + minuteDelta * 60_000);

    setScheduleError("");

    try {
      await handleScheduleUpdate(
        draggedEvent,
        nextTechnicianId,
        nextStartDate.toISOString(),
        nextEndDate.toISOString(),
      );
      router.refresh();
    } catch (saveError) {
      setScheduleError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la planificacion.",
      );
    }
  };

  return (
    <div className="space-y-5">
      <Panel className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-[#1d3557]">Planificacion diaria</h2>
          <p className="mt-1 text-sm text-slate-500">
            Calendario de dia completo, por horas y medias horas, con vista general y vista por
            tecnico.
          </p>
          {allowDrag ? (
            <p className="mt-2 text-sm text-[#1f4b7f]">
              Arrastra bloques en vista diaria para mover hora o reasignar tecnico.
            </p>
          ) : canEditSchedule ? (
            <p className="mt-2 text-sm text-[#1f4b7f]">
              En movil priorizamos lectura y ajuste explicito del horario en lugar de drag.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setScope("day")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              scope === "day"
                ? "bg-[#173a63] text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            Dia
          </button>
          <button
            type="button"
            onClick={() => setScope("week")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              scope === "week"
                ? "bg-[#173a63] text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setSelectedView("general")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              selectedView === "general"
                ? "bg-[#1f4b7f] text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            General
          </button>
          {technicians.map((technician) => (
            <button
              key={technician.id}
              type="button"
              onClick={() => setSelectedView(technician.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                selectedView === technician.id
                  ? "text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
              style={{
                backgroundColor: selectedView === technician.id ? technician.color : undefined,
              }}
            >
              {technician.code}
            </button>
          ))}
        </div>
      </Panel>

      {scope === "week" ? (
        <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setWeekOffset((current) => current - 1)}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1f4b7f] ring-1 ring-slate-200"
          >
            Semana anterior
          </button>
          <p className="text-sm font-medium text-slate-600">
            Navegando semanas relativas al bloque visible
          </p>
          <button
            type="button"
            onClick={() => setWeekOffset((current) => current + 1)}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1f4b7f] ring-1 ring-slate-200"
          >
            Semana siguiente
          </button>
        </Panel>
      ) : null}

      {scheduleError ? <p className="text-sm text-rose-600">{scheduleError}</p> : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Bloques planificados"
          value={String(visibleEvents.length).padStart(2, "0")}
          helper="Intervenciones visibles en el calendario actual."
        />
        <SummaryCard
          icon={<Users className="h-5 w-5" />}
          label="Tecnicos libres"
          value={String(freeTechnicians.length).padStart(2, "0")}
          helper={
            freeTechnicians.length
              ? freeTechnicians.map((technician) => technician.code).join(", ")
              : "Todos los tecnicos visibles tienen ocupacion."
          }
        />
        <SummaryCard
          icon={<Clock3 className="h-5 w-5" />}
          label="Carga visible"
          value={`${visibleEvents.reduce((sum, event) => sum + event.durationMinutes, 0)} min`}
          helper="Suma total de duracion para la vista seleccionada."
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.65fr_0.85fr]">
        <Panel className="overflow-hidden p-0">
          <div className="border-b border-slate-200 bg-white px-5 py-4">
            <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-[18px] font-semibold text-[#1d3557]">
                  {scope === "day" ? "Agenda del dia" : "Vista semanal"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {scope === "day"
                    ? "Referencia visual directa para despacho: horas del dia y carga por tecnico."
                    : "Plan semanal por fechas con bloques clicables y colores por tecnico."}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                {scope === "day" ? referenceDayLabel : referenceWeekLabel}
              </div>
            </div>
          </div>

          {scope === "day" ? (
            isMobile ? (
              <MobileDayAgenda events={visibleEvents} technicians={technicians} onSelectEvent={setSelectedEventId} />
            ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={allowDrag ? handleDragEnd : undefined}
            >
              <div className="overflow-x-auto bg-[#f7fafe]">
                <div
                  className="grid min-w-[980px] border-t border-slate-200"
                  style={{
                    gridTemplateColumns: `84px repeat(${visibleTechnicians.length}, minmax(220px, 1fr))`,
                  }}
                >
                  <div className="border-r border-slate-200 bg-white" />
                  {visibleTechnicians.map((technician) => (
                    <div
                      key={technician.id}
                      className="border-r border-slate-200 bg-white px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: technician.color }}
                        />
                        <div>
                          <p className="font-semibold text-[#1d3557]">{technician.name}</p>
                          <p className="text-sm text-slate-500">{technician.code}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <HourRail />

                  {visibleTechnicians.map((technician) => (
                    <TechnicianColumn
                      key={technician.id}
                      technician={technician}
                      events={visibleEvents.filter((plannerEvent) => plannerEvent.technicianId === technician.id)}
                      onSelectEvent={setSelectedEventId}
                      canEditSchedule={allowDrag}
                    />
                  ))}
                </div>
              </div>
            </DndContext>
            )
          ) : (
            <WeeklyPlannerGrid
              technicians={visibleTechnicians}
              events={visibleEvents}
              onSelectEvent={setSelectedEventId}
              weekOffset={weekOffset}
            />
          )}
        </Panel>

        <div className="space-y-5">
          <Panel>
            <h3 className="text-[18px] font-semibold text-[#1d3557]">Detalle de planificacion</h3>

            {selectedEvent ? (
              <div className="mt-5 space-y-4">
                <PlanningRow label="OT" value={selectedEvent.workOrderNumber} />
                <PlanningRow label="Trabajo" value={selectedEvent.title} />
                <PlanningRow label="Cliente" value={selectedEvent.clientName} />
                <PlanningRow
                  label="Tecnico"
                  value={
                    technicians.find((technician) => technician.id === selectedEvent.technicianId)?.name ??
                    "Sin asignar"
                  }
                />
                <PlanningRow
                  label="Horario"
                  value={`${formatTime(selectedEvent.startHour, selectedEvent.startMinute)} - ${formatEndTime(selectedEvent)}`}
                />
                <PlanningRow
                  label="Duracion"
                  value={`${selectedEvent.durationMinutes} minutos`}
                />
                <PlanningRow label="Estado" value={formatStatus(selectedEvent.status)} />
                <PlanningRow label="Prioridad" value={formatPriority(selectedEvent.priority)} />

                <div className="grid gap-3 pt-2">
                  <ReassignWorkOrderForm
                    workOrderId={selectedEvent.workOrderId}
                    technicians={technicians}
                    currentTechnicianId={selectedEvent.technicianId}
                    plannedStart={selectedEvent.startAt}
                    plannedEnd={selectedEvent.endAt}
                    buttonClassName="rounded-xl bg-[#2f7ed8] px-4 py-3 text-sm font-semibold text-white"
                  />
                  <AdjustDurationForm
                    workOrderId={selectedEvent.workOrderId}
                    plannedStart={selectedEvent.startAt}
                    plannedEnd={selectedEvent.endAt}
                    technicianId={selectedEvent.technicianId}
                    buttonClassName="rounded-xl bg-[#f28b39] px-4 py-3 text-sm font-semibold text-white"
                  />
                  <OpenReportButton
                    workOrderId={selectedEvent.workOrderId}
                    reportId={selectedEvent.reportId}
                    className="rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white"
                    label="Abrir parte asociado"
                  />
                  <Link
                    href={`/trabajos/${selectedEvent.workOrderId}`}
                    className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-[#1f4b7f] ring-1 ring-slate-200"
                  >
                    Abrir orden
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Selecciona un bloque del calendario.</p>
            )}

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#52729b]">
                Disponibilidad inmediata
              </h4>
              <div className="mt-4 space-y-3">
                {freeTechnicians.length ? (
                  freeTechnicians.map((technician) => (
                    <div key={technician.id} className="flex items-center gap-3">
                      <div
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: technician.color }}
                      />
                      <p className="text-sm font-medium text-slate-700">{technician.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No hay tecnicos libres en esta vista del dia.
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <RoutePlannerPanel
            technicians={technicians}
            events={visibleEvents}
            selectedTechnicianId={routeTechnicianId}
          />
        </div>
      </div>
    </div>
  );
}

function HourRail() {
  return (
    <div
      className="relative border-r border-slate-200 bg-white"
      style={{ height: TOTAL_HEIGHT }}
    >
      {HOURS.slice(0, -1).map((hour, index) => (
        <div
          key={hour}
          className="absolute inset-x-0 border-t border-slate-200 px-3"
          style={{ top: index * HOUR_HEIGHT }}
        >
          <span className="-translate-y-1/2 bg-white pr-2 text-sm font-medium text-slate-500">
            {String(hour).padStart(2, "0")}:00
          </span>
        </div>
      ))}
    </div>
  );
}

function TechnicianColumn({
  technician,
  events,
  onSelectEvent,
  canEditSchedule,
}: {
  technician: Technician;
  events: PlannerEvent[];
  onSelectEvent: (id: string) => void;
  canEditSchedule: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: `column:${technician.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className="relative border-r border-slate-200 bg-white"
      style={{
        height: TOTAL_HEIGHT,
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0, transparent 38px, rgba(148,163,184,0.14) 38px, rgba(148,163,184,0.14) 39px, transparent 39px, transparent 78px), repeating-linear-gradient(to bottom, rgba(203,213,225,0.7) 0, rgba(203,213,225,0.7) 1px, transparent 1px, transparent 78px)",
      }}
    >
      {events.map((event) => {
        const top =
          (((event.startHour - START_HOUR) * 60 + event.startMinute) / 60) * HOUR_HEIGHT;
        const height = Math.max((event.durationMinutes / 60) * HOUR_HEIGHT, 52);

        return (
          <PlannerEventButton
            key={event.id}
            event={event}
            technicianColor={technician.color}
            top={top}
            height={height}
            onSelectEvent={onSelectEvent}
            canEditSchedule={canEditSchedule}
          />
        );
      })}
    </div>
  );
}

function PlannerEventButton({
  event,
  technicianColor,
  top,
  height,
  onSelectEvent,
  canEditSchedule,
}: {
  event: PlannerEvent;
  technicianColor: string;
  top: number;
  height: number;
  onSelectEvent: (id: string) => void;
  canEditSchedule: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    disabled: !canEditSchedule,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onSelectEvent(event.id)}
      className="absolute left-2 right-2 rounded-xl px-3 py-3 text-left text-white shadow-[0_10px_24px_rgba(15,23,42,0.2)]"
      style={{
        top,
        height,
        backgroundColor: event.color ?? technicianColor,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.8 : 1,
        cursor: canEditSchedule ? "grab" : "pointer",
      }}
      {...listeners}
      {...attributes}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
        {event.workOrderNumber}
      </p>
      <p className="mt-1 text-sm font-semibold leading-5">{event.title}</p>
      <p className="mt-1 text-xs text-white/85">{event.clientName}</p>
      <p className="mt-2 text-xs font-medium text-white/90">
        {formatTime(event.startHour, event.startMinute)} - {formatEndTime(event)}
      </p>
    </button>
  );
}

function WeeklyPlannerGrid({
  technicians,
  events,
  onSelectEvent,
  weekOffset,
}: {
  technicians: Technician[];
  events: PlannerEvent[];
  onSelectEvent: (id: string) => void;
  weekOffset: number;
}) {
  const baseDate = events[0] ? new Date(events[0].startAt) : new Date("2026-04-01T00:00:00.000Z");
  const dayOfWeek = baseDate.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() + mondayOffset + index + weekOffset * 7);
    return date;
  });

  return (
    <div className="overflow-x-auto bg-[#f7fafe]">
      <div className="grid min-w-[1120px] grid-cols-7 gap-px bg-slate-200">
        {weekDays.map((date) => {
          const dayKey = date.toISOString().slice(0, 10);
          const dayEvents = events
            .filter((event) => event.startAt.slice(0, 10) === dayKey)
            .sort((left, right) => left.startAt.localeCompare(right.startAt));

          return (
            <div key={dayKey} className="min-h-[420px] bg-white">
              <div className="border-b border-slate-200 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#52729b]">
                  {date.toLocaleDateString("es-ES", { weekday: "short" })}
                </p>
                <p className="mt-1 font-semibold text-[#1d3557]">
                  {date.toLocaleDateString("es-ES")}
                </p>
              </div>
              <div className="space-y-3 p-4">
                {dayEvents.length ? (
                  dayEvents.map((event) => {
                    const technician = technicians.find((item) => item.id === event.technicianId);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onSelectEvent(event.id)}
                        className="w-full rounded-xl px-3 py-3 text-left text-white shadow-[0_8px_18px_rgba(15,23,42,0.14)]"
                        style={{ backgroundColor: event.color }}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                          {event.workOrderNumber}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{event.title}</p>
                        <p className="mt-1 text-xs text-white/85">{event.clientName}</p>
                        <p className="mt-2 text-xs text-white/90">
                          {formatTime(event.startHour, event.startMinute)} - {formatEndTime(event)}
                        </p>
                        <p className="mt-1 text-xs text-white/90">
                          {technician?.name ?? event.technicianId}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-sm text-slate-500">
                    Sin intervenciones planificadas.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileDayAgenda({
  technicians,
  events,
  onSelectEvent,
}: {
  technicians: Technician[];
  events: PlannerEvent[];
  onSelectEvent: (id: string) => void;
}) {
  const sortedEvents = [...events].sort((left, right) => left.startAt.localeCompare(right.startAt));

  return (
    <div className="space-y-3 bg-[#f7fafe] p-4">
      {sortedEvents.length ? (
        sortedEvents.map((event) => {
          const technician = technicians.find((item) => item.id === event.technicianId);

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelectEvent(event.id)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#52729b]">
                    {event.workOrderNumber}
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#1d3557]">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{event.clientName}</p>
                </div>
                <span className="rounded-full bg-[#dce9f7] px-3 py-1 text-xs font-semibold text-[#1f4b7f]">
                  {formatTime(event.startHour, event.startMinute)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>{formatTime(event.startHour, event.startMinute)} - {formatEndTime(event)}</span>
                <span>/</span>
                <span>{technician?.name ?? event.technicianId}</span>
                <span>/</span>
                <span>{formatStatus(event.status)}</span>
              </div>
            </button>
          );
        })
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
          No hay intervenciones visibles para este dia.
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Panel className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dce9f7] text-[#1f4b7f]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-[#1d3557]">{value}</p>
        <p className="mt-2 text-sm text-slate-600">{helper}</p>
      </div>
    </Panel>
  );
}

function PlanningRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 pb-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-[#1d3557]">{value}</p>
    </div>
  );
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatEndTime(event: PlannerEvent) {
  const totalMinutes = event.startHour * 60 + event.startMinute + event.durationMinutes;
  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;
  return formatTime(endHour, endMinute);
}

function formatStatus(status: PlannerEvent["status"]) {
  switch (status) {
    case "planned":
      return "Programada";
    case "in_progress":
      return "En proceso";
    case "pending_office_review":
      return "Pendiente oficina";
    case "pending_material":
      return "Pendiente material";
    default:
      return status;
  }
}

function formatPlannerDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatPlannerWeekRange(events: PlannerEvent[], weekOffset: number) {
  const baseDate = events[0] ? new Date(events[0].startAt) : new Date();
  const dayOfWeek = baseDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(baseDate);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() + mondayOffset + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return `${formatPlannerDate(weekStart.toISOString())} - ${formatPlannerDate(weekEnd.toISOString())}`;
}

function formatPriority(priority: PlannerEvent["priority"]) {
  switch (priority) {
    case "critical":
      return "Critica";
    case "high":
      return "Alta";
    case "normal":
      return "Normal";
    case "low":
      return "Baja";
    default:
      return priority;
  }
}
