import "server-only";

import path from "node:path";

import type {
  ClientRecord,
  DashboardAlert,
  DashboardMetric,
  Equipment,
  MaterialCatalogItem,
  PlannerEvent,
  ReportAttachment,
  Technician,
  TechnicianAgendaItem,
  WorkOrderDetail,
  WorkOrderPriority,
  WorkOrderStatus,
  WorkOrderSummary,
  WorkReport,
} from "@/lib/data/contracts";
import { createId, readDatabase, updateDatabase } from "@/server/db/store";
import { deleteBinaryFile, readBinaryFile, saveBinaryFile } from "@/server/db/files";
import type {
  AttachmentRecordDb,
  ClientRecordDb,
  EquipmentRecordDb,
  MaterialCatalogRecordDb,
  ReportStatus,
  WorkOrderRecordDb,
  WorkReportRecordDb,
} from "@/server/db/types";
import type { AuthenticatedUser } from "@/server/services/types";

function getTechniciansSeed(): Technician[] {
  return Array.from({ length: 8 }, (_, index) => ({
    id: `tecnico${index + 1}`,
    code: `tecnico${index + 1}`,
    name: `Tecnico ${index + 1}`,
    color: ["#2563eb", "#16a34a", "#ea580c", "#9333ea", "#db2777", "#0891b2", "#65a30d", "#dc2626"][index],
    active: true,
  }));
}

function mapClient(client: ClientRecordDb, equipmentCount: number, openOrders: number): ClientRecord {
  return {
    id: client.id,
    name: client.name,
    taxId: client.taxId,
    city: client.city,
    address: client.address,
    contactName: client.contactName,
    contactPhone: client.contactPhone,
    equipmentCount,
    openOrders,
  };
}

function mapEquipment(equipment: EquipmentRecordDb): Equipment {
  return {
    id: equipment.id,
    clientId: equipment.clientId,
    name: equipment.name,
    category: equipment.category,
    serialNumber: equipment.serialNumber,
    manufacturer: equipment.manufacturer,
    model: equipment.model,
    location: equipment.location,
    status: equipment.status,
    lat: equipment.lat,
    lng: equipment.lng,
  };
}

function getAssignmentForWorkOrder(
  database: Awaited<ReturnType<typeof readDatabase>>,
  workOrder: WorkOrderRecordDb,
) {
  return workOrder.assignmentId
    ? database.assignments.find((item) => item.id === workOrder.assignmentId)
    : database.assignments.find((item) => item.workOrderId === workOrder.id);
}

function getReportForWorkOrder(
  database: Awaited<ReturnType<typeof readDatabase>>,
  workOrder: WorkOrderRecordDb,
) {
  return workOrder.reportId
    ? database.workReports.find((item) => item.id === workOrder.reportId)
    : database.workReports.find((item) => item.workOrderId === workOrder.id);
}

function mapWorkOrder(
  database: Awaited<ReturnType<typeof readDatabase>>,
  workOrder: WorkOrderRecordDb,
): WorkOrderSummary {
  const client = database.clients.find((item) => item.id === workOrder.clientId);
  const equipment = workOrder.equipmentId
    ? database.equipment.find((item) => item.id === workOrder.equipmentId)
    : undefined;
  const assignment = getAssignmentForWorkOrder(database, workOrder);

  return {
    id: workOrder.id,
    number: workOrder.number,
    title: workOrder.title,
    type: workOrder.type,
    priority: workOrder.priority,
    status: workOrder.status,
    billingStatus: workOrder.billingStatus,
    clientId: workOrder.clientId,
    clientName: client?.name ?? "Cliente",
    clientAddress: client?.address,
    equipmentId: equipment?.id,
    equipmentLabel: equipment?.name,
    reportId: workOrder.reportId,
    assignedTechnicianIds: assignment ? [assignment.technicianId] : [],
    plannedStart: assignment?.startAt ?? workOrder.createdAt,
    plannedEnd: assignment?.endAt ?? workOrder.createdAt,
    estimatedMinutes: assignment
      ? Math.max(0, Math.round((new Date(assignment.endAt).getTime() - new Date(assignment.startAt).getTime()) / 60000))
      : 0,
    syncStatus: "synced",
    lat: equipment?.lat ?? client?.lat,
    lng: equipment?.lng ?? client?.lng,
  };
}

function mapWorkReport(
  database: Awaited<ReturnType<typeof readDatabase>>,
  report: WorkReportRecordDb,
): WorkReport {
  const workOrder = database.workOrders.find((item) => item.id === report.workOrderId);
  const client = workOrder ? database.clients.find((item) => item.id === workOrder.clientId) : undefined;
  const equipment = workOrder?.equipmentId
    ? database.equipment.find((item) => item.id === workOrder.equipmentId)
    : undefined;
  const materials = database.materialUsage
    .filter((item) => item.workReportId === report.id)
    .map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    }));
  const attachments = database.attachments
    .filter((item) => item.workReportId === report.id && item.kind !== "signature")
    .map(mapAttachment);
  const signatureAttachment = report.signatureAttachmentId
    ? database.attachments.find((item) => item.id === report.signatureAttachmentId)
    : undefined;

  return {
    id: report.id,
    workOrderId: report.workOrderId,
    workOrderNumber: workOrder?.number ?? "OT",
    clientName: client?.name ?? "Cliente",
    equipmentLabel: equipment?.name,
    technicianId: report.technicianId,
    status: report.status,
    arrivalTime: report.arrivalTime,
    departureTime: report.departureTime,
    workDone: report.workDone,
    pendingActions: report.pendingActions,
    clientNameSigned: report.clientNameSigned,
    materials,
    attachments,
    signatureUrl: signatureAttachment ? `/api/attachments/${signatureAttachment.id}` : undefined,
    signatureSignedAt: report.signatureSignedAt,
  };
}

function mapAttachment(attachment: AttachmentRecordDb): ReportAttachment {
  return {
    id: attachment.id,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    kind: attachment.kind,
    url: `/api/attachments/${attachment.id}`,
    createdAt: attachment.createdAt,
  };
}

function mapMaterialCatalogItem(item: MaterialCatalogRecordDb): MaterialCatalogItem {
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    unit: item.unit,
  };
}

function canTechnicianAccessWorkOrder(
  database: Awaited<ReturnType<typeof readDatabase>>,
  workOrderId: string,
  user?: AuthenticatedUser | null,
) {
  if (!user || user.role !== "technician" || !user.technicianId) {
    return true;
  }

  return database.assignments.some(
    (assignment) =>
      assignment.workOrderId === workOrderId && assignment.technicianId === user.technicianId,
  );
}

function assertCanAccessWorkOrder(
  database: Awaited<ReturnType<typeof readDatabase>>,
  workOrderId: string,
  user?: AuthenticatedUser | null,
) {
  if (!canTechnicianAccessWorkOrder(database, workOrderId, user)) {
    throw new Error("UNAUTHORIZED");
  }
}

function filterWorkOrdersForUser(
  database: Awaited<ReturnType<typeof readDatabase>>,
  workOrders: WorkOrderRecordDb[],
  user?: AuthenticatedUser | null,
) {
  if (!user || user.role !== "technician" || !user.technicianId) {
    return workOrders;
  }

  return workOrders.filter((workOrder) =>
    canTechnicianAccessWorkOrder(database, workOrder.id, user),
  );
}

export async function listClients() {
  const database = await readDatabase();

  return database.clients.map((client) =>
    mapClient(
      client,
      database.equipment.filter((item) => item.clientId === client.id).length,
      database.workOrders.filter((item) => item.clientId === client.id && item.status !== "closed" && item.status !== "cancelled").length,
    ),
  );
}

export async function getClientDetail(clientId: string) {
  const database = await readDatabase();
  const client = database.clients.find((item) => item.id === clientId);
  if (!client) return null;

  const clients = await listClients();
  return {
    client: clients.find((item) => item.id === clientId) ?? mapClient(client, 0, 0),
    equipment: database.equipment.filter((item) => item.clientId === clientId).map(mapEquipment),
    workOrders: database.workOrders
      .filter((item) => item.clientId === clientId)
      .map((item) => mapWorkOrder(database, item)),
    reports: database.workReports
      .filter((report) => {
        const workOrder = database.workOrders.find((item) => item.id === report.workOrderId);
        return workOrder?.clientId === clientId;
      })
      .map((report) => mapWorkReport(database, report)),
    location: {
      address: client.address,
      lat: client.lat,
      lng: client.lng,
    },
  };
}

export async function listEquipment() {
  const database = await readDatabase();
  return database.equipment.map(mapEquipment);
}

export async function getEquipmentDetail(equipmentId: string) {
  const database = await readDatabase();
  const equipment = database.equipment.find((item) => item.id === equipmentId);
  if (!equipment) return null;
  const client = database.clients.find((item) => item.id === equipment.clientId);
  const workOrders = database.workOrders
    .filter((item) => item.equipmentId === equipmentId)
    .map((item) => mapWorkOrder(database, item));

  return {
    equipment: mapEquipment(equipment),
    client: client
      ? mapClient(
          client,
          database.equipment.filter((item) => item.clientId === client.id).length,
          database.workOrders.filter((item) => item.clientId === client.id && item.status !== "closed" && item.status !== "cancelled").length,
        )
      : null,
    workOrders,
    location: {
      address: client?.address ?? "",
      lat: equipment.lat ?? client?.lat,
      lng: equipment.lng ?? client?.lng,
    },
  };
}

export async function listTechnicians() {
  return getTechniciansSeed();
}

export async function listMaterialCatalog() {
  const database = await readDatabase();
  return database.materialCatalog.map(mapMaterialCatalogItem);
}

export async function getTechnicianDetail(technicianId: string) {
  const database = await readDatabase();
  const technician = getTechniciansSeed().find((item) => item.id === technicianId);
  if (!technician) return null;

  const assignments = database.assignments.filter((item) => item.technicianId === technicianId);
  const workOrders = assignments
    .map((assignment) => database.workOrders.find((item) => item.id === assignment.workOrderId))
    .filter((item): item is WorkOrderRecordDb => Boolean(item))
    .map((item) => mapWorkOrder(database, item));
  const reports = database.workReports
    .filter((item) => item.technicianId === technicianId)
    .map((item) => mapWorkReport(database, item));

  return {
    technician,
    workOrders,
    reports,
    assignments,
    status: assignments.some((item) => item.status === "in_progress")
      ? "busy"
      : assignments.some((item) => item.status === "planned")
        ? "available"
        : "off",
  };
}

export async function listWorkOrders(user?: AuthenticatedUser | null) {
  const database = await readDatabase();
  return filterWorkOrdersForUser(database, database.workOrders, user).map((item) =>
    mapWorkOrder(database, item),
  );
}

export async function getWorkOrderDetail(
  workOrderId: string,
  user?: AuthenticatedUser | null,
): Promise<WorkOrderDetail | null> {
  const database = await readDatabase();
  const workOrder = database.workOrders.find((item) => item.id === workOrderId);
  if (!workOrder) return null;
  if (!canTechnicianAccessWorkOrder(database, workOrderId, user)) return null;

  const report = getReportForWorkOrder(database, workOrder);
  const mapped = mapWorkOrder(database, workOrder);
  const materials = report
    ? database.materialUsage.filter((item) => item.workReportId === report.id).map((item) => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      }))
    : [];

  return {
    ...mapped,
    description: workOrder.description,
    checklist: [
      { id: `${workOrder.id}-c1`, label: "Acceso confirmado", done: true },
      { id: `${workOrder.id}-c2`, label: "Trabajo documentado", done: Boolean(report?.workDone) },
      { id: `${workOrder.id}-c3`, label: "Firma cliente registrada", done: Boolean(report?.clientNameSigned) },
    ],
    laborEntries: report
      ? [
          {
            id: `${report.id}-labor`,
            technician: report.technicianId,
            minutes: mapped.estimatedMinutes,
            laborType: "onsite",
          },
        ]
      : [],
    materials,
    logs: [
      {
        id: `${workOrder.id}-created`,
        at: workOrder.createdAt,
        author: workOrder.createdByUserId,
        body: "Orden creada",
        source: "web",
      },
      ...(workOrder.actualStart
        ? [
            {
              id: `${workOrder.id}-start`,
              at: workOrder.actualStart,
              author: report?.technicianId ?? "system",
              body: "Trabajo iniciado",
              source: "mobile" as const,
            },
          ]
        : []),
    ],
  };
}

export async function listWorkReports(user?: AuthenticatedUser | null) {
  const database = await readDatabase();
  return database.workReports
    .filter((item) => canTechnicianAccessWorkOrder(database, item.workOrderId, user))
    .map((item) => mapWorkReport(database, item));
}

export async function getWorkReportDetail(reportId: string, user?: AuthenticatedUser | null) {
  const database = await readDatabase();
  const report = database.workReports.find((item) => item.id === reportId);
  if (!report) return null;
  if (!canTechnicianAccessWorkOrder(database, report.workOrderId, user)) return null;
  const workReport = mapWorkReport(database, report);
  const workOrder = database.workOrders.find((item) => item.id === report.workOrderId);
  const workOrderDetail = workOrder ? await getWorkOrderDetail(workOrder.id, user) : null;

  return {
    report: workReport,
    workOrder: workOrderDetail,
  };
}

export async function listPlannerEvents() {
  const database = await readDatabase();
  const events: PlannerEvent[] = [];

  database.assignments.forEach((assignment) => {
    const workOrder = database.workOrders.find((item) => item.id === assignment.workOrderId);
    if (!workOrder) return;
    const client = database.clients.find((item) => item.id === workOrder.clientId);
    const equipment = workOrder.equipmentId
      ? database.equipment.find((item) => item.id === workOrder.equipmentId)
      : undefined;
    const start = new Date(assignment.startAt);
    const end = new Date(assignment.endAt);
    const durationMinutes = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));

    events.push({
      id: assignment.id,
      workOrderId: workOrder.id,
      workOrderNumber: workOrder.number,
      reportId: workOrder.reportId,
      equipmentId: workOrder.equipmentId,
      title: workOrder.title,
      clientName: client?.name ?? "Cliente",
      technicianId: assignment.technicianId,
      address: client?.address,
      lat: equipment?.lat ?? client?.lat,
      lng: equipment?.lng ?? client?.lng,
      startAt: assignment.startAt,
      endAt: assignment.endAt,
      startHour: start.getHours(),
      startMinute: start.getMinutes(),
      durationMinutes,
      status: workOrder.status,
      priority: workOrder.priority,
      color: getTechniciansSeed().find((item) => item.id === assignment.technicianId)?.color ?? "#2563eb",
    });
  });

  return events;
}

export async function getDashboardData() {
  const database = await readDatabase();
  const workOrders = await listWorkOrders();
  const technicians = await listTechnicians();
  const openOrders = workOrders.filter((item) => !["closed", "cancelled"].includes(item.status)).length;
  const activeTechs = new Set(database.assignments.filter((item) => item.status !== "cancelled").map((item) => item.technicianId)).size;
  const todayOrders = workOrders.filter((item) => item.plannedStart.startsWith("2026-04-01")).length;
  const pendingOrders = workOrders.filter((item) => item.status === "pending_office_review" || item.status === "pending_signature").length;

  const metrics: DashboardMetric[] = [
    { id: "m1", label: "Ordenes abiertas", value: String(openOrders).padStart(2, "0"), helper: "Pendientes de ejecucion o cierre.", tone: "orange" },
    { id: "m2", label: "Tecnicos activos", value: String(activeTechs).padStart(2, "0"), helper: "Equipo con carga visible en agenda.", tone: "green" },
    { id: "m3", label: "Ordenes hoy", value: String(todayOrders).padStart(2, "0"), helper: "Intervenciones planificadas para hoy.", tone: "blue" },
    { id: "m4", label: "Ordenes pendientes", value: String(pendingOrders).padStart(2, "0"), helper: "Pendientes de firma o revision.", tone: "red" },
  ];

  const alerts: DashboardAlert[] = workOrders.slice(0, 4).map((order) => ({
    id: `alert-${order.id}`,
    title: `${order.number} - ${order.title}`,
    description: `${order.clientName} - ${formatStatusLabel(order.status)}`,
    severity: order.priority === "critical" ? "critical" : order.status === "in_progress" ? "warning" : "info",
  }));

  return { metrics, alerts, workOrders, technicians };
}

export async function getTechnicianAgenda(user: AuthenticatedUser) {
  const workOrders = await listWorkOrders();
  const relevant =
    user.role === "technician" && user.technicianId
      ? workOrders.filter((item) => item.assignedTechnicianIds.includes(user.technicianId!))
      : workOrders;

  return relevant.map((order) => ({
    id: order.id,
    number: order.number,
    title: order.title,
    client: order.clientName,
    equipmentLabel: order.equipmentLabel,
    windowLabel: `${order.plannedStart.slice(11, 16)} - ${order.plannedEnd.slice(11, 16)}`,
    status: order.status,
    syncStatus: "synced",
  })) satisfies TechnicianAgendaItem[];
}

export async function createClient(
  input: Pick<ClientRecordDb, "name" | "taxId" | "city" | "address" | "postalCode" | "contactName" | "contactPhone">,
  user: AuthenticatedUser,
) {
  const now = new Date().toISOString();
  const id = createId("client");

  await updateDatabase((current) => ({
    ...current,
    clients: [
      ...current.clients,
      {
        id,
        ...input,
        createdAt: now,
        updatedAt: now,
      },
    ],
    audit: [
      ...current.audit,
      {
        id: createId("audit"),
        entityType: "client",
        entityId: id,
        action: "create",
        userId: user.userId,
        createdAt: now,
      },
    ],
  }));

  return id;
}

export async function createEquipment(
  input: Pick<EquipmentRecordDb, "clientId" | "name" | "category" | "serialNumber" | "manufacturer" | "model" | "location">,
  user: AuthenticatedUser,
) {
  const now = new Date().toISOString();
  const id = createId("equipment");

  await updateDatabase((current) => ({
    ...current,
    equipment: [
      ...current.equipment,
      {
        id,
        ...input,
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
    ],
    audit: [
      ...current.audit,
      {
        id: createId("audit"),
        entityType: "equipment",
        entityId: id,
        action: "create",
        userId: user.userId,
        createdAt: now,
      },
    ],
  }));

  return id;
}

export async function createWorkOrder(
  input: {
    title: string;
    description: string;
    type: WorkOrderRecordDb["type"];
    priority: WorkOrderPriority;
    clientId: string;
    equipmentId?: string;
    technicianId: string;
    plannedStart: string;
    plannedEnd: string;
  },
  user: AuthenticatedUser,
) {
  const now = new Date().toISOString();
  const next = await updateDatabase((current) => {
    const workOrderId = createId("work-order");
    const assignmentId = createId("assignment");
    const number = `OT-${String(current.counters.workOrder).padStart(4, "0")}`;

    return {
      ...current,
      workOrders: [
        ...current.workOrders,
        {
          id: workOrderId,
          number,
          title: input.title,
          description: input.description,
          type: input.type,
          priority: input.priority,
          status: "planned",
          billingStatus: "not_ready",
          clientId: input.clientId,
          equipmentId: input.equipmentId,
          assignmentId,
          createdByUserId: user.userId,
          createdAt: now,
          updatedAt: now,
        },
      ],
      assignments: [
        ...current.assignments,
        {
          id: assignmentId,
          workOrderId,
          technicianId: input.technicianId,
          startAt: input.plannedStart,
          endAt: input.plannedEnd,
          status: "planned",
          createdAt: now,
          updatedAt: now,
        },
      ],
      audit: [
        ...current.audit,
        {
          id: createId("audit"),
          entityType: "work_order",
          entityId: workOrderId,
          action: "create",
          userId: user.userId,
          createdAt: now,
        },
      ],
      counters: {
        ...current.counters,
        workOrder: current.counters.workOrder + 1,
      },
    };
  });

  return next.workOrders[next.workOrders.length - 1].id;
}

export async function createWorkReportFromWorkOrder(workOrderId: string, user: AuthenticatedUser) {
  const now = new Date().toISOString();

  const next = await updateDatabase((current) => {
    const workOrder = current.workOrders.find((item) => item.id === workOrderId);
    if (!workOrder) {
      throw new Error("Orden no encontrada.");
    }
    if (workOrder.reportId) {
      return current;
    }
    assertCanAccessWorkOrder(current, workOrderId, user);
    const assignment = getAssignmentForWorkOrder(current, workOrder);
    const reportId = createId("report");
    const reportNumber = `PARTE-${String(current.counters.workReport).padStart(4, "0")}`;

    return {
      ...current,
      workReports: [
        ...current.workReports,
        {
          id: reportId,
          number: reportNumber,
          workOrderId,
          technicianId: assignment?.technicianId ?? user.technicianId ?? "tecnico1",
          status: "draft",
          arrivalTime: assignment?.startAt.slice(11, 16) ?? "08:00",
          departureTime: assignment?.endAt.slice(11, 16) ?? "09:00",
          workDone: "",
          pendingActions: "",
          clientNameSigned: "",
          createdAt: now,
          updatedAt: now,
        },
      ],
      workOrders: current.workOrders.map((item) =>
        item.id === workOrderId ? { ...item, reportId, updatedAt: now } : item,
      ),
      audit: [
        ...current.audit,
        {
          id: createId("audit"),
          entityType: "work_report",
          entityId: reportId,
          action: "create",
          userId: user.userId,
          createdAt: now,
        },
      ],
      counters: {
        ...current.counters,
        workReport: current.counters.workReport + 1,
      },
    };
  });

  const report = next.workOrders.find((item) => item.id === workOrderId)?.reportId;
  if (!report) {
    const existing = next.workReports.find((item) => item.workOrderId === workOrderId);
    if (!existing) throw new Error("No se ha podido crear el parte.");
    return existing.id;
  }
  return report;
}

export async function updateWorkReport(
  reportId: string,
  input: Pick<WorkReport, "arrivalTime" | "departureTime" | "workDone" | "pendingActions" | "clientNameSigned"> & {
    status?: ReportStatus;
  },
  user: AuthenticatedUser,
) {
  const now = new Date().toISOString();
  await updateDatabase((current) => {
    const report = current.workReports.find((item) => item.id === reportId);
    if (!report) {
      throw new Error("Parte no encontrado.");
    }
    assertCanAccessWorkOrder(current, report.workOrderId, user);

    const nextStatus = input.status ?? report.status;

    return {
      ...current,
      workReports: current.workReports.map((item) =>
        item.id === reportId
          ? {
              ...item,
              arrivalTime: input.arrivalTime,
              departureTime: input.departureTime,
              workDone: input.workDone,
              pendingActions: input.pendingActions,
              clientNameSigned: input.clientNameSigned,
              status: nextStatus,
              closedAt: nextStatus === "closed" ? now : undefined,
              updatedAt: now,
            }
          : item,
      ),
      workOrders: current.workOrders.map((item) =>
        item.id === report.workOrderId && nextStatus === "closed" && item.status !== "closed"
          ? { ...item, status: "pending_office_review", updatedAt: now }
          : item,
      ),
      audit: [
        ...current.audit,
        {
          id: createId("audit"),
          entityType: "work_report",
          entityId: reportId,
          action: "update",
          userId: user.userId,
          createdAt: now,
        },
      ],
    };
  });
}

export async function finalizeWorkOrder(workOrderId: string, user: AuthenticatedUser) {
  const now = new Date().toISOString();
  await updateDatabase((current) => {
    const workOrder = current.workOrders.find((item) => item.id === workOrderId);
    if (!workOrder) {
      throw new Error("Orden no encontrada.");
    }

    return {
      ...current,
      workOrders: current.workOrders.map((item) =>
        item.id === workOrderId
          ? {
              ...item,
              status: "closed",
              actualEnd: now,
              closedAt: now,
              updatedAt: now,
            }
          : item,
      ),
      assignments: current.assignments.map((assignment) =>
        assignment.workOrderId === workOrderId
          ? { ...assignment, status: "completed", updatedAt: now }
          : assignment,
      ),
      workReports: current.workReports.map((report) =>
        report.workOrderId === workOrderId
          ? { ...report, status: "closed", closedAt: now, updatedAt: now }
          : report,
      ),
      audit: [
        ...current.audit,
        {
          id: createId("audit"),
          entityType: "work_order",
          entityId: workOrderId,
          action: "finalize",
          userId: user.userId,
          createdAt: now,
        },
      ],
    };
  });
}

export async function reassignWorkOrder(workOrderId: string, technicianId: string, user: AuthenticatedUser) {
  const now = new Date().toISOString();
  await updateDatabase((current) => ({
    ...current,
    assignments: current.assignments.map((assignment) =>
      assignment.workOrderId === workOrderId
        ? { ...assignment, technicianId, updatedAt: now }
        : assignment,
    ),
    workReports: current.workReports.map((report) =>
      report.workOrderId === workOrderId ? { ...report, technicianId, updatedAt: now } : report,
    ),
    audit: [
      ...current.audit,
      {
        id: createId("audit"),
        entityType: "assignment",
        entityId: workOrderId,
        action: "reassign",
        userId: user.userId,
        payload: { technicianId },
        createdAt: now,
      },
    ],
  }));
}

export async function adjustWorkOrderDuration(workOrderId: string, endAt: string, user: AuthenticatedUser) {
  const now = new Date().toISOString();
  await updateDatabase((current) => ({
    ...current,
    assignments: current.assignments.map((assignment) =>
      assignment.workOrderId === workOrderId ? { ...assignment, endAt, updatedAt: now } : assignment,
    ),
    audit: [
      ...current.audit,
      {
        id: createId("audit"),
        entityType: "assignment",
        entityId: workOrderId,
        action: "adjust_duration",
        userId: user.userId,
        payload: { endAt },
        createdAt: now,
      },
    ],
  }));
}

export async function scheduleWorkOrder(
  workOrderId: string,
  input: { startAt: string; endAt: string; technicianId: string },
  user: AuthenticatedUser,
) {
  const now = new Date().toISOString();

  await updateDatabase((current) => {
    const workOrder = current.workOrders.find((item) => item.id === workOrderId);
    if (!workOrder) {
      throw new Error("Orden no encontrada.");
    }

    return {
      ...current,
      assignments: current.assignments.map((assignment) =>
        assignment.workOrderId === workOrderId
          ? {
              ...assignment,
              technicianId: input.technicianId,
              startAt: input.startAt,
              endAt: input.endAt,
              updatedAt: now,
            }
          : assignment,
      ),
      workOrders: current.workOrders.map((item) =>
        item.id === workOrderId
          ? {
              ...item,
              status: item.status === "draft" ? "planned" : item.status,
              updatedAt: now,
            }
          : item,
      ),
      workReports: current.workReports.map((report) =>
        report.workOrderId === workOrderId
          ? {
              ...report,
              technicianId: input.technicianId,
              updatedAt: now,
            }
          : report,
      ),
      audit: [
        ...current.audit,
        {
          id: createId("audit"),
          entityType: "assignment",
          entityId: workOrderId,
          action: "schedule",
          userId: user.userId,
          payload: input,
          createdAt: now,
        },
      ],
    };
  });
}

export async function getMapLocationForWorkOrder(workOrderId: string) {
  const database = await readDatabase();
  const workOrder = database.workOrders.find((item) => item.id === workOrderId);
  if (!workOrder) return null;
  const client = database.clients.find((item) => item.id === workOrder.clientId);
  const equipment = workOrder.equipmentId
    ? database.equipment.find((item) => item.id === workOrder.equipmentId)
    : undefined;

  return {
    address: client?.address ?? "",
    lat: equipment?.lat ?? client?.lat,
    lng: equipment?.lng ?? client?.lng,
    clientName: client?.name ?? "",
    equipmentName: equipment?.name,
  };
}

export async function getWeeklyPlannerEvents() {
  return listPlannerEvents();
}

export async function saveWorkReportAttachment(
  workReportId: string,
  input: {
    fileName: string;
    mimeType: string;
    bytes: Uint8Array;
    kind: "photo" | "document";
  },
  user: AuthenticatedUser,
) {
  const now = new Date().toISOString();
  const attachmentId = createId("attachment");
  const extension = input.fileName.includes(".") ? input.fileName.split(".").pop() : "bin";
  const relativePath = path.join(workReportId, `${attachmentId}.${extension}`);
  await saveBinaryFile(relativePath, input.bytes);

  await updateDatabase((current) => {
    const report = current.workReports.find((item) => item.id === workReportId);
    if (!report) {
      throw new Error("Parte no encontrado.");
    }
    assertCanAccessWorkOrder(current, report.workOrderId, user);

    return {
      ...current,
      attachments: [
        ...current.attachments,
        {
          id: attachmentId,
          workReportId,
          fileName: input.fileName,
          mimeType: input.mimeType,
          kind: input.kind,
          path: relativePath,
          sizeBytes: input.bytes.byteLength,
          createdAt: now,
        },
      ],
      audit: [
        ...current.audit,
        {
          id: createId("audit"),
          entityType: "work_report",
          entityId: workReportId,
          action: "attachment_upload",
          userId: user.userId,
          createdAt: now,
        },
      ],
    };
  });

  return attachmentId;
}

export async function saveWorkReportSignature(
  workReportId: string,
  input: {
    dataUrl: string;
    signerName: string;
  },
  user: AuthenticatedUser,
) {
  const now = new Date().toISOString();
  const match = input.dataUrl.match(/^data:(image\/png|image\/jpeg);base64,(.+)$/);
  if (!match) {
    throw new Error("Firma invalida.");
  }

  const mimeType = match[1];
  const base64Content = match[2];
  const bytes = Uint8Array.from(Buffer.from(base64Content, "base64"));
  const attachmentId = createId("signature");
  const extension = mimeType === "image/png" ? "png" : "jpg";
  const relativePath = path.join(workReportId, `${attachmentId}.${extension}`);
  await saveBinaryFile(relativePath, bytes);

  await updateDatabase((current) => {
    const report = current.workReports.find((item) => item.id === workReportId);
    if (!report) {
      throw new Error("Parte no encontrado.");
    }
    assertCanAccessWorkOrder(current, report.workOrderId, user);
    const previousAttachmentId = report?.signatureAttachmentId;
    const previousAttachment = previousAttachmentId
      ? current.attachments.find((item) => item.id === previousAttachmentId)
      : undefined;

    if (previousAttachment) {
      void deleteBinaryFile(previousAttachment.path);
    }

    return {
      ...current,
      attachments: [
        ...current.attachments.filter((item) => item.id !== previousAttachmentId),
        {
          id: attachmentId,
          workReportId,
          fileName: `firma-${workReportId}.${extension}`,
          mimeType,
          kind: "signature",
          path: relativePath,
          sizeBytes: bytes.byteLength,
          createdAt: now,
        },
      ],
      workReports: current.workReports.map((item) =>
        item.id === workReportId
          ? {
              ...item,
              clientNameSigned: input.signerName,
              signatureAttachmentId: attachmentId,
              signatureSignedAt: now,
              updatedAt: now,
            }
          : item,
      ),
      audit: [
        ...current.audit,
        {
          id: createId("audit"),
          entityType: "work_report",
          entityId: workReportId,
          action: "signature_save",
          userId: user.userId,
          createdAt: now,
        },
      ],
    };
  });

  return attachmentId;
}

export async function addWorkReportMaterial(
  workReportId: string,
  input: { materialId: string; quantity: number },
  user: AuthenticatedUser,
) {
  const now = new Date().toISOString();
  const quantity = Number(input.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Debes indicar una cantidad valida.");
  }

  const materialUsageId = createId("material");

  await updateDatabase((current) => {
    const report = current.workReports.find((item) => item.id === workReportId);
    if (!report) {
      throw new Error("Parte no encontrado.");
    }
    assertCanAccessWorkOrder(current, report.workOrderId, user);

    const material = current.materialCatalog.find((item) => item.id === input.materialId);
    if (!material) {
      throw new Error("Material no encontrado.");
    }

    return {
      ...current,
      materialUsage: [
        ...current.materialUsage,
        {
          id: materialUsageId,
          workReportId,
          name: material.name,
          sku: material.sku,
          quantity,
          unit: material.unit,
        },
      ],
      audit: [
        ...current.audit,
        {
          id: createId("audit"),
          entityType: "work_report",
          entityId: workReportId,
          action: "material_add",
          userId: user.userId,
          payload: { materialId: input.materialId, quantity },
          createdAt: now,
        },
      ],
    };
  });
}

export async function getAttachmentBinary(attachmentId: string) {
  const database = await readDatabase();
  const attachment = database.attachments.find((item) => item.id === attachmentId);
  if (!attachment) {
    return null;
  }

  const bytes = await readBinaryFile(attachment.path);
  return {
    attachment,
    bytes,
  };
}

function formatStatusLabel(status: WorkOrderStatus) {
  switch (status) {
    case "planned":
      return "Programada";
    case "in_progress":
      return "En proceso";
    case "closed":
      return "Cerrada";
    case "pending_office_review":
      return "Pendiente oficina";
    default:
      return status;
  }
}
