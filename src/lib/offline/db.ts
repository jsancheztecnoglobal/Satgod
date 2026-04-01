import Dexie, { type Table } from "dexie";

import type { SyncCommand, PendingAttachment } from "@/lib/offline/sync-contracts";

export interface OfflineWorkOrderSnapshot {
  id: string;
  number: string;
  title: string;
  technicianId: string;
  plannedStart: string;
  plannedEnd: string;
  status: string;
  updatedAt: string;
}

export class TecnoglobalOfflineDb extends Dexie {
  workOrders!: Table<OfflineWorkOrderSnapshot, string>;
  syncQueue!: Table<SyncCommand, string>;
  attachments!: Table<PendingAttachment, string>;

  constructor() {
    super("tecnoglobal-offline");

    this.version(1).stores({
      workOrders: "id, technicianId, status, plannedStart, updatedAt",
      syncQueue: "id, entityType, entityId, status, createdAt",
      attachments: "id, workOrderId, uploadStatus",
    });
  }
}

export const offlineDb = new TecnoglobalOfflineDb();
