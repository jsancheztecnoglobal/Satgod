import { z } from "zod";

import {
  billingStatuses,
  syncStatuses,
  workOrderPriorities,
  workOrderStatuses,
  workOrderTypes,
} from "@/lib/data/contracts";

export const workOrderFormSchema = z
  .object({
    title: z.string().min(8, "El titulo debe describir claramente el trabajo."),
    type: z.enum(workOrderTypes),
    priority: z.enum(workOrderPriorities),
    clientId: z.string().min(1, "Selecciona un cliente valido."),
    equipmentId: z.string().optional().or(z.literal("")),
    plannedStart: z.string().datetime(),
    plannedEnd: z.string().datetime(),
    description: z.string().min(20, "Anade una descripcion tecnica minima."),
  })
  .refine((value) => new Date(value.plannedEnd) > new Date(value.plannedStart), {
    message: "La fecha/hora fin debe ser posterior al inicio.",
    path: ["plannedEnd"],
  });

export const workOrderSummarySchema = z.object({
  id: z.string(),
  number: z.string(),
  title: z.string(),
  type: z.enum(workOrderTypes),
  priority: z.enum(workOrderPriorities),
  status: z.enum(workOrderStatuses),
  billingStatus: z.enum(billingStatuses),
  clientId: z.string(),
  clientName: z.string(),
  equipmentId: z.string().optional(),
  equipmentLabel: z.string().optional(),
  plannedStart: z.string().datetime(),
  plannedEnd: z.string().datetime(),
  assignedTechnicianIds: z.array(z.string()),
  estimatedMinutes: z.number().int().positive(),
  syncStatus: z.enum(syncStatuses),
});

export const workOrderTransitionSchema = z.object({
  workOrderId: z.string().min(1),
  fromStatus: z.enum(workOrderStatuses),
  toStatus: z.enum(workOrderStatuses),
  reason: z.string().min(4).max(280),
});

export type WorkOrderFormInput = z.infer<typeof workOrderFormSchema>;
