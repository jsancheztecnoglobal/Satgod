import type {
  BillingStatus,
  RoleCode,
  WorkOrderPriority,
  WorkOrderStatus,
  WorkOrderType,
} from "@/lib/data/contracts";

export type TechnicianStatus = "available" | "busy" | "off";
export type EquipmentStatus = "active" | "attention" | "stopped";
export type ReportStatus = "draft" | "ready_for_review" | "closed";
export type AssignmentStatus = "planned" | "in_progress" | "completed" | "cancelled";

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: RoleCode;
  technicianId?: string;
  passwordHash: string;
  passwordSalt: string;
  active: boolean;
}

export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface ClientRecordDb {
  id: string;
  name: string;
  taxId: string;
  city: string;
  address: string;
  postalCode: string;
  lat?: number;
  lng?: number;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentRecordDb {
  id: string;
  clientId: string;
  name: string;
  category: "compressor" | "dryer" | "tank" | "filter" | "line";
  serialNumber: string;
  manufacturer: string;
  model: string;
  location: string;
  status: EquipmentStatus;
  lat?: number;
  lng?: number;
  installedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderRecordDb {
  id: string;
  number: string;
  title: string;
  description: string;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  billingStatus: BillingStatus;
  clientId: string;
  equipmentId?: string;
  reportId?: string;
  assignmentId?: string;
  createdByUserId: string;
  actualStart?: string;
  actualEnd?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkReportRecordDb {
  id: string;
  number: string;
  workOrderId: string;
  technicianId: string;
  status: ReportStatus;
  arrivalTime: string;
  departureTime: string;
  workDone: string;
  pendingActions: string;
  clientNameSigned: string;
  signatureAttachmentId?: string;
  signatureSignedAt?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface MaterialUsageRecordDb {
  id: string;
  workReportId: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
}

export interface MaterialCatalogRecordDb {
  id: string;
  sku: string;
  name: string;
  unit: string;
}

export interface AttachmentRecordDb {
  id: string;
  workReportId: string;
  fileName: string;
  mimeType: string;
  kind: "photo" | "document" | "signature";
  path: string;
  sizeBytes: number;
  createdAt: string;
}

export interface AssignmentRecordDb {
  id: string;
  workOrderId: string;
  technicianId: string;
  startAt: string;
  endAt: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRecordDb {
  id: string;
  entityType: "client" | "equipment" | "work_order" | "work_report" | "assignment" | "session";
  entityId: string;
  action: string;
  userId?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface DatabaseState {
  users: UserRecord[];
  sessions: SessionRecord[];
  clients: ClientRecordDb[];
  equipment: EquipmentRecordDb[];
  workOrders: WorkOrderRecordDb[];
  workReports: WorkReportRecordDb[];
  materialCatalog: MaterialCatalogRecordDb[];
  materialUsage: MaterialUsageRecordDb[];
  attachments: AttachmentRecordDb[];
  assignments: AssignmentRecordDb[];
  audit: AuditRecordDb[];
  counters: {
    workOrder: number;
    workReport: number;
  };
}
