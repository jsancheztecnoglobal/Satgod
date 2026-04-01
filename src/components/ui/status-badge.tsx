import type { WorkOrderPriority, WorkOrderStatus, SyncStatus } from "@/lib/data/contracts";
import { cn } from "@/lib/cn";

const statusStyles: Record<WorkOrderStatus, string> = {
  draft: "bg-slate-200 text-slate-700",
  pending_assignment: "bg-stone-200 text-stone-700",
  planned: "bg-sky-100 text-sky-800",
  in_progress: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  pending_material: "bg-orange-100 text-orange-800",
  pending_signature: "bg-violet-100 text-violet-800",
  pending_office_review: "bg-indigo-100 text-indigo-800",
  closed: "bg-teal-100 text-teal-800",
  billable: "bg-lime-100 text-lime-800",
  invoiced: "bg-zinc-900 text-white",
  cancelled: "bg-rose-100 text-rose-800",
  reopened: "bg-cyan-100 text-cyan-800",
};

const priorityStyles: Record<WorkOrderPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-amber-100 text-amber-800",
  critical: "bg-rose-100 text-rose-800",
};

const syncStyles: Record<SyncStatus, string> = {
  synced: "bg-emerald-100 text-emerald-800",
  pending_sync: "bg-amber-100 text-amber-800",
  syncing: "bg-sky-100 text-sky-800",
  conflict: "bg-rose-100 text-rose-800",
  offline_only: "bg-zinc-200 text-zinc-800",
};

interface BadgeProps {
  label: string;
  toneClass: string;
}

function Badge({ label, toneClass }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        toneClass,
      )}
    >
      {label}
    </span>
  );
}

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  return <Badge label={status.replaceAll("_", " ")} toneClass={statusStyles[status]} />;
}

export function PriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  return <Badge label={priority} toneClass={priorityStyles[priority]} />;
}

export function SyncBadge({ status }: { status: SyncStatus }) {
  return <Badge label={status.replaceAll("_", " ")} toneClass={syncStyles[status]} />;
}
