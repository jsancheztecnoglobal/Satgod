"use client";

import { useState } from "react";
import {
  closestCorners,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Panel } from "@/components/ui/panel";
import { PriorityBadge, WorkOrderStatusBadge } from "@/components/ui/status-badge";
import type { WorkOrderPriority, WorkOrderStatus } from "@/lib/data/contracts";
import { cn } from "@/lib/cn";

type PlannerCard = {
  id: string;
  number: string;
  title: string;
  siteName: string;
  start: string;
  end: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
};

type PlannerLane = {
  technicianId: string;
  technicianName: string;
  zone: string;
  cards: PlannerCard[];
};

export function PlannerBoard({ initialLanes }: { initialLanes: PlannerLane[] }) {
  const [lanes, setLanes] = useState(initialLanes);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeLaneIndex = lanes.findIndex((lane) => lane.cards.some((card) => card.id === activeId));
    const overLaneIndex = lanes.findIndex((lane) => lane.cards.some((card) => card.id === overId));

    if (activeLaneIndex < 0 || overLaneIndex < 0) return;

    const activeCardIndex = lanes[activeLaneIndex].cards.findIndex((card) => card.id === activeId);
    const overCardIndex = lanes[overLaneIndex].cards.findIndex((card) => card.id === overId);

    if (activeCardIndex < 0 || overCardIndex < 0) return;

    setLanes((current) => {
      if (activeLaneIndex === overLaneIndex) {
        const updatedCards = arrayMove(current[activeLaneIndex].cards, activeCardIndex, overCardIndex);

        return current.map((lane, index) =>
          index === activeLaneIndex ? { ...lane, cards: updatedCards } : lane,
        );
      }

      const next = [...current];
      const [movedCard] = next[activeLaneIndex].cards.splice(activeCardIndex, 1);
      next[overLaneIndex].cards.splice(overCardIndex, 0, movedCard);

      return next;
    });
  };

  return (
    <div className="space-y-5">
      <Panel className="grid gap-4 lg:grid-cols-3">
        <InfoPill
          label="Planner manual"
          value="Arrastrar y ordenar"
          helper="Bloques preparados para reorganizar la carga por tecnico."
        />
        <InfoPill
          label="Vista operativa"
          value="Dia completo"
          helper="Pensado para despacho y asignacion rapida de trabajo."
        />
        <InfoPill
          label="Uso recomendado"
          value="Preplan diario"
          helper="Complemento ligero al calendario horario principal."
        />
      </Panel>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-5 xl:grid-cols-3">
          {lanes.map((lane) => (
            <PlannerColumn key={lane.technicianId} lane={lane} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function PlannerColumn({ lane }: { lane: PlannerLane }) {
  return (
    <Panel className="bg-[#173a63] text-white">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{lane.technicianName}</h3>
          <p className="mt-1 text-sm text-white/72">{lane.zone}</p>
        </div>
        <span className="rounded-lg bg-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          {lane.cards.length} OT
        </span>
      </div>

      <SortableContext items={lane.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {lane.cards.map((card) => (
            <PlannerCardItem key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>
    </Panel>
  );
}

function PlannerCardItem({ card }: { card: PlannerCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab rounded-xl border border-white/10 bg-white/8 p-4 transition hover:border-white/30",
        isDragging && "opacity-70 shadow-2xl",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={card.priority} />
        <WorkOrderStatusBadge status={card.status} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#b7d0ef]">
        {card.number}
      </p>
      <h4 className="mt-2 text-lg font-semibold leading-6">{card.title}</h4>
      <p className="mt-2 text-sm text-white/72">{card.siteName}</p>
      <p className="mt-4 text-sm font-medium text-white/90">
        {card.start} - {card.end}
      </p>
    </article>
  );
}

function InfoPill({
  label,
  value,
  helper,
}: Readonly<{ label: string; value: string; helper: string }>) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#1d3557]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}
