export const roleCodes = [
  "admin",
  "office_planner",
  "engineer",
  "sales",
  "technician",
  "management_readonly",
] as const;

export type RoleCode = (typeof roleCodes)[number];

export const workOrderTypes = [
  "maintenance",
  "breakdown",
  "installation",
  "commissioning",
  "technical_visit",
] as const;

export type WorkOrderType = (typeof workOrderTypes)[number];

export const workOrderPriorities = ["low", "normal", "high", "critical"] as const;
export type WorkOrderPriority = (typeof workOrderPriorities)[number];

export const workOrderStatuses = [
  "draft",
  "pending_assignment",
  "planned",
  "in_progress",
  "paused",
  "pending_material",
  "pending_signature",
  "pending_office_review",
  "closed",
  "billable",
  "invoiced",
  "cancelled",
  "reopened",
] as const;

export type WorkOrderStatus = (typeof workOrderStatuses)[number];

export const billingStatuses = ["not_ready", "billable", "invoiced", "exported"] as const;
export type BillingStatus = (typeof billingStatuses)[number];

export const syncStatuses = [
  "synced",
  "pending_sync",
  "syncing",
  "conflict",
  "offline_only",
] as const;

export type SyncStatus = (typeof syncStatuses)[number];

export interface Technician {
  id: string;
  code: string;
  name: string;
  color: string;
  active: boolean;
}

export interface Equipment {
  id: string;
  clientId: string;
  name: string;
  category: "compressor" | "dryer" | "tank" | "filter" | "line";
  serialNumber: string;
  manufacturer: string;
  model: string;
  location: string;
  status: "active" | "attention" | "stopped";
  lat?: number;
  lng?: number;
}

export interface ClientRecord {
  id: string;
  name: string;
  taxId: string;
  city: string;
  address: string;
  contactName: string;
  contactPhone: string;
  equipmentCount: number;
  openOrders: number;
}

export interface WorkOrderSummary {
  id: string;
  number: string;
  title: string;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  billingStatus: BillingStatus;
  clientId: string;
  clientName: string;
  clientAddress?: string;
  equipmentId?: string;
  equipmentLabel?: string;
  reportId?: string;
  assignedTechnicianIds: string[];
  plannedStart: string;
  plannedEnd: string;
  estimatedMinutes: number;
  syncStatus: SyncStatus;
  lat?: number;
  lng?: number;
}

export interface WorkOrderChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface LaborEntry {
  id: string;
  technician: string;
  minutes: number;
  laborType: "onsite" | "travel" | "remote";
}

export interface MaterialUsage {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface ReportAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  kind: "photo" | "document" | "signature";
  url: string;
  createdAt: string;
}

export interface WorkLogEntry {
  id: string;
  at: string;
  author: string;
  body: string;
  source: "web" | "mobile" | "offline_sync";
}

export interface WorkOrderDetail extends WorkOrderSummary {
  description: string;
  checklist: WorkOrderChecklistItem[];
  laborEntries: LaborEntry[];
  materials: MaterialUsage[];
  logs: WorkLogEntry[];
}

export interface WorkReport {
  id: string;
  workOrderId: string;
  workOrderNumber: string;
  clientName: string;
  equipmentLabel?: string;
  technicianId: string;
  status: "draft" | "ready_for_review" | "closed";
  arrivalTime: string;
  departureTime: string;
  workDone: string;
  pendingActions: string;
  clientNameSigned: string;
  materials: MaterialUsage[];
  attachments: ReportAttachment[];
  signatureUrl?: string;
  signatureSignedAt?: string;
}

export interface PlannerEvent {
  id: string;
  workOrderId: string;
  workOrderNumber: string;
  reportId?: string;
  equipmentId?: string;
  title: string;
  clientName: string;
  technicianId: string;
  address?: string;
  lat?: number;
  lng?: number;
  startAt: string;
  endAt: string;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  color: string;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: "navy" | "blue" | "green" | "orange" | "red";
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

export interface TechnicianAgendaItem {
  id: string;
  number: string;
  title: string;
  client: string;
  equipmentLabel?: string;
  windowLabel: string;
  status: WorkOrderStatus;
  syncStatus: SyncStatus;
}
