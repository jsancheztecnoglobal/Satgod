import type { SyncStatus } from "@/lib/data/contracts";

export type SyncEntityType =
  | "work_log"
  | "labor_entry"
  | "material_usage"
  | "attachment"
  | "signature"
  | "work_order";

export type SyncCommandAction = "upsert" | "transition" | "delete";

export interface SyncCommand<TPayload = unknown> {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncCommandAction;
  payload: TPayload;
  attemptCount: number;
  status: SyncStatus;
  createdAt: string;
}

export interface SyncAck {
  commandId: string;
  entityId: string;
  accepted: boolean;
  serverVersion?: number;
  conflictReason?: string;
}

export interface PendingAttachment {
  id: string;
  workOrderId: string;
  fileName: string;
  mimeType: string;
  uploadStatus: SyncStatus;
  blobKey: string;
}
