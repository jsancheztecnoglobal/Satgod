import type { RoleCode, WorkOrderStatus } from "@/lib/data/contracts";

export const roleLabels: Record<RoleCode, string> = {
  admin: "Administrador",
  office_planner: "Oficina / Planificacion",
  engineer: "Ingenieria",
  sales: "Comercial",
  technician: "Tecnico",
  management_readonly: "Gerencia / Lectura",
};

export const roleCapabilities: Record<
  RoleCode,
  {
    seesCosts: boolean;
    canPlan: boolean;
    canCloseBillable: boolean;
  }
> = {
  admin: { seesCosts: true, canPlan: true, canCloseBillable: true },
  office_planner: { seesCosts: true, canPlan: true, canCloseBillable: true },
  engineer: { seesCosts: true, canPlan: true, canCloseBillable: false },
  sales: { seesCosts: false, canPlan: false, canCloseBillable: false },
  technician: { seesCosts: false, canPlan: false, canCloseBillable: false },
  management_readonly: { seesCosts: true, canPlan: false, canCloseBillable: false },
};

const baseTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  draft: ["pending_assignment", "cancelled"],
  pending_assignment: ["planned", "cancelled"],
  planned: ["in_progress", "paused", "cancelled", "reopened"],
  in_progress: ["paused", "pending_material", "pending_signature", "pending_office_review"],
  paused: ["in_progress", "pending_material", "cancelled"],
  pending_material: ["planned", "in_progress", "cancelled"],
  pending_signature: ["pending_office_review", "closed"],
  pending_office_review: ["closed", "reopened"],
  closed: ["billable", "reopened"],
  billable: ["invoiced", "reopened"],
  invoiced: [],
  cancelled: [],
  reopened: ["planned", "in_progress", "pending_office_review"],
};

export function getAllowedTransitions(
  role: RoleCode,
  currentStatus: WorkOrderStatus,
): WorkOrderStatus[] {
  const allowed = baseTransitions[currentStatus];

  if (role === "admin" || role === "engineer" || role === "office_planner") {
    return allowed;
  }

  if (role === "technician") {
    return allowed.filter((status) =>
      ["paused", "pending_material", "pending_signature", "pending_office_review"].includes(
        status,
      ),
    );
  }

  return [];
}

export function canTransitionWorkOrder(
  role: RoleCode,
  currentStatus: WorkOrderStatus,
  nextStatus: WorkOrderStatus,
) {
  return getAllowedTransitions(role, currentStatus).includes(nextStatus);
}
