/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ClientRecord,
  DashboardAlert,
  DashboardMetric,
  Equipment,
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
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ReportStatus } from "@/server/db/types";
import type { AuthenticatedUser } from "@/server/services/types";

const technicianColors = ["#2563eb", "#16a34a", "#ea580c", "#9333ea", "#db2777", "#0891b2", "#65a30d", "#dc2626"];

type Snapshot = {
  companies: DbRow[];
  sites: DbRow[];
  assets: DbRow[];
  workOrders: DbRow[];
  assignments: DbRow[];
  reports: DbRow[];
  materials: DbRow[];
  attachments: DbRow[];
  userProfiles: DbRow[];
};

type DbRow = any;

function asNumber(input: unknown) {
  if (typeof input === "number") return input;
  if (typeof input === "string" && input.trim()) return Number(input);
  return undefined;
}

function mapAttachment(attachment: DbRow): ReportAttachment {
  return {
    id: attachment.id,
    fileName: attachment.file_name,
    mimeType: attachment.mime_type ?? "application/octet-stream",
    kind: attachment.file_kind,
    url: `/api/attachments/${attachment.id}`,
    createdAt: attachment.created_at,
  };
}

async function getSupabaseClient() {
  const client = await createSupabaseServerClient();
  if (!client) throw new Error("Supabase no esta configurado.");
  return client;
}

async function loadSnapshot(supabase: SupabaseClient): Promise<Snapshot> {
  const [companies, sites, assets, workOrders, assignments, reports, materials, attachments, userProfiles] =
    await Promise.all([
      supabase.from("companies").select("*").is("deleted_at", null).order("trade_name"),
      supabase.from("company_sites").select("*").is("deleted_at", null).order("created_at"),
      supabase.from("assets").select("*, asset_types(code)").is("deleted_at", null).order("created_at"),
      supabase.from("work_orders").select("*").is("deleted_at", null).order("created_at"),
      supabase.from("work_order_assignments").select("*, user_profiles!inner(technician_code, full_name)").order("scheduled_start"),
      supabase.from("work_reports").select("*").order("created_at"),
      supabase.from("material_usage").select("*, material_catalog(sku, name, unit)").order("created_at"),
      supabase.from("attachments").select("*").is("deleted_at", null).order("created_at"),
      supabase.from("user_profiles").select("user_id, full_name, technician_code, active, roles!inner(code)").is("deleted_at", null).order("full_name"),
    ]);

  for (const result of [companies, sites, assets, workOrders, assignments, reports, materials, attachments, userProfiles]) {
    if (result.error) throw new Error(result.error.message);
  }

  return {
    companies: companies.data ?? [],
    sites: sites.data ?? [],
    assets: (assets.data ?? []).map((asset: DbRow) => ({
      ...asset,
      asset_type_code: Array.isArray(asset.asset_types) ? asset.asset_types[0]?.code : asset.asset_types?.code,
    })),
    workOrders: workOrders.data ?? [],
    assignments: (assignments.data ?? []).map((assignment: DbRow) => ({
      ...assignment,
      technician_code: Array.isArray(assignment.user_profiles) ? assignment.user_profiles[0]?.technician_code : assignment.user_profiles?.technician_code,
      technician_name: Array.isArray(assignment.user_profiles) ? assignment.user_profiles[0]?.full_name : assignment.user_profiles?.full_name,
    })),
    reports: reports.data ?? [],
    materials: materials.data ?? [],
    attachments: attachments.data ?? [],
    userProfiles: (userProfiles.data ?? []).map((profile: DbRow) => ({
      ...profile,
      role_code: Array.isArray(profile.roles) ? profile.roles[0]?.code : profile.roles?.code,
    })),
  };
}

function makeClientRecord(snapshot: Snapshot, company: DbRow): ClientRecord {
  const site = snapshot.sites.find((item) => item.company_id === company.id);
  return {
    id: company.id,
    name: company.trade_name,
    taxId: company.tax_id ?? "",
    city: site?.city ?? "",
    address: site?.address ?? "",
    contactName: site?.name ?? company.trade_name,
    contactPhone: "",
    equipmentCount: snapshot.assets.filter((item) => item.company_id === company.id).length,
    openOrders: snapshot.workOrders.filter((item) => item.company_id === company.id && !["closed", "cancelled"].includes(item.status)).length,
  };
}

function makeEquipment(asset: DbRow): Equipment {
  return {
    id: asset.id,
    clientId: asset.company_id,
    name: asset.name,
    category: (asset.asset_type_code ?? "compressor") as Equipment["category"],
    serialNumber: asset.serial_number ?? "",
    manufacturer: asset.manufacturer,
    model: asset.model,
    location: asset.location ?? "",
    status: (asset.status === "attention" || asset.status === "stopped" ? asset.status : "active") as Equipment["status"],
    lat: undefined,
    lng: undefined,
  };
}

function makeWorkOrderSummary(snapshot: Snapshot, workOrder: DbRow): WorkOrderSummary {
  const company = snapshot.companies.find((item) => item.id === workOrder.company_id);
  const site = snapshot.sites.find((item) => item.id === workOrder.site_id);
  const asset = snapshot.assets.find((item) => item.id === workOrder.primary_asset_id);
  const assignment = snapshot.assignments.find((item) => item.work_order_id === workOrder.id);
  const report = snapshot.reports.find((item) => item.work_order_id === workOrder.id);

  return {
    id: workOrder.id,
    number: workOrder.number,
    title: workOrder.title,
    type: workOrder.type,
    priority: workOrder.priority,
    status: workOrder.status,
    billingStatus: workOrder.billing_status,
    clientId: workOrder.company_id,
    clientName: company?.trade_name ?? "Cliente",
    clientAddress: site?.address,
    equipmentId: asset?.id,
    equipmentLabel: asset?.name,
    reportId: report?.id,
    assignedTechnicianIds: assignment?.technician_code ? [assignment.technician_code] : [],
    plannedStart: workOrder.planned_start ?? assignment?.scheduled_start ?? workOrder.created_at,
    plannedEnd: workOrder.planned_end ?? assignment?.scheduled_end ?? workOrder.created_at,
    estimatedMinutes: workOrder.estimated_minutes ?? 0,
    syncStatus: "synced",
    lat: asNumber(site?.lat),
    lng: asNumber(site?.lng),
  };
}

function makeWorkReport(snapshot: Snapshot, report: DbRow): WorkReport {
  const workOrder = snapshot.workOrders.find((item) => item.id === report.work_order_id);
  const company = snapshot.companies.find((item) => item.id === workOrder?.company_id);
  const asset = snapshot.assets.find((item) => item.id === workOrder?.primary_asset_id);
  const materials = snapshot.materials.filter((item) => item.work_report_id === report.id).map((item) => ({
    id: item.id,
    sku: item.material_catalog?.sku ?? item.sku_snapshot ?? "MAT",
    name: item.material_catalog?.name ?? item.name_snapshot ?? "Material",
    quantity: Number(item.quantity),
    unit: item.unit_snapshot ?? item.material_catalog?.unit ?? "ud",
  }));
  const attachments = snapshot.attachments.filter((item) => item.work_report_id === report.id && item.file_kind !== "signature").map(mapAttachment);
  const signatureAttachment = snapshot.attachments.find((item) => item.id === report.signature_attachment_id);

  return {
    id: report.id,
    workOrderId: report.work_order_id,
    workOrderNumber: workOrder?.number ?? "OT",
    clientName: company?.trade_name ?? "Cliente",
    equipmentLabel: asset?.name,
    technicianId: report.technician_code ?? "tecnico1",
    status: report.status,
    arrivalTime: report.arrival_time,
    departureTime: report.departure_time,
    workDone: report.work_done ?? "",
    pendingActions: report.pending_actions ?? "",
    clientNameSigned: report.client_name_signed ?? "",
    materials,
    attachments,
    signatureUrl: signatureAttachment ? `/api/attachments/${signatureAttachment.id}` : undefined,
    signatureSignedAt: report.signature_signed_at ?? undefined,
  };
}

async function nextSequentialNumber(supabase: SupabaseClient, table: string, prefix: string) {
  const { data, error } = await supabase.from(table).select("number, created_at").order("created_at", { ascending: false }).limit(1);
  if (error) throw new Error(error.message);
  const lastNumber = data?.[0]?.number as string | undefined;
  const nextValue = lastNumber ? Number(lastNumber.split("-").at(-1)) + 1 : 1;
  return `${prefix}-${String(nextValue).padStart(4, "0")}`;
}

async function findPrimarySite(supabase: SupabaseClient, companyId: string) {
  const result = await supabase.from("company_sites").select("*").eq("company_id", companyId).is("deleted_at", null).order("created_at").limit(1).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

async function findTechnicianProfile(supabase: SupabaseClient, technicianCode: string) {
  const result = await supabase.from("user_profiles").select("user_id, full_name, technician_code").eq("technician_code", technicianCode).is("deleted_at", null).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) throw new Error(`No existe el tecnico ${technicianCode} en Supabase.`);
  return result.data;
}

async function findAssetTypeId(supabase: SupabaseClient, category: Equipment["category"]) {
  const result = await supabase.from("asset_types").select("id").eq("code", category).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) throw new Error(`No existe el tipo de activo ${category}. Ejecuta el seed de Supabase.`);
  return result.data.id as string;
}

export async function listClients() {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  return snapshot.companies.map((company) => makeClientRecord(snapshot, company));
}

export async function getClientDetail(clientId: string) {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  const company = snapshot.companies.find((item) => item.id === clientId);
  if (!company) return null;
  const site = snapshot.sites.find((item) => item.company_id === clientId);
  return {
    client: makeClientRecord(snapshot, company),
    equipment: snapshot.assets.filter((item) => item.company_id === clientId).map(makeEquipment),
    workOrders: snapshot.workOrders.filter((item) => item.company_id === clientId).map((item) => makeWorkOrderSummary(snapshot, item)),
    reports: snapshot.reports.filter((report) => snapshot.workOrders.find((item) => item.id === report.work_order_id)?.company_id === clientId).map((report) => makeWorkReport(snapshot, report)),
    location: { address: site?.address ?? "", lat: asNumber(site?.lat), lng: asNumber(site?.lng) },
  };
}

export async function listEquipment() {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  return snapshot.assets.map(makeEquipment);
}

export async function getEquipmentDetail(equipmentId: string) {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  const asset = snapshot.assets.find((item) => item.id === equipmentId);
  if (!asset) return null;
  const company = snapshot.companies.find((item) => item.id === asset.company_id);
  const site = snapshot.sites.find((item) => item.id === asset.site_id);
  return {
    equipment: makeEquipment(asset),
    client: company ? makeClientRecord(snapshot, company) : null,
    workOrders: snapshot.workOrders.filter((item) => item.primary_asset_id === equipmentId).map((item) => makeWorkOrderSummary(snapshot, item)),
    location: { address: site?.address ?? "", lat: asNumber(site?.lat), lng: asNumber(site?.lng) },
  };
}

export async function listTechnicians() {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  return snapshot.userProfiles
    .filter((profile) => profile.role_code === "technician" && profile.active)
    .map((profile, index) => ({
      id: profile.technician_code ?? profile.user_id,
      code: profile.technician_code ?? profile.user_id,
      name: profile.full_name,
      color: technicianColors[index % technicianColors.length],
      active: true,
    })) satisfies Technician[];
}

export async function getTechnicianDetail(technicianId: string) {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  const technicians = await listTechnicians();
  const technician = technicians.find((item) => item.id === technicianId);
  if (!technician) return null;
  const assignments = snapshot.assignments.filter((item) => item.technician_code === technicianId);
  const workOrders = assignments.map((assignment) => snapshot.workOrders.find((item) => item.id === assignment.work_order_id)).filter(Boolean).map((item) => makeWorkOrderSummary(snapshot, item));
  const reports = snapshot.reports.filter((item) => item.technician_code === technicianId).map((item) => makeWorkReport(snapshot, item));
  return {
    technician,
    workOrders,
    reports,
    assignments,
    status: assignments.some((item) => item.assignment_status === "in_progress") ? "busy" : assignments.some((item) => item.assignment_status === "planned") ? "available" : "off",
  };
}

export async function listWorkOrders() {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  return snapshot.workOrders.map((item) => makeWorkOrderSummary(snapshot, item));
}

export async function getWorkOrderDetail(workOrderId: string): Promise<WorkOrderDetail | null> {
  const supabase = await getSupabaseClient();
  const snapshot = await loadSnapshot(supabase);
  const workOrder = snapshot.workOrders.find((item) => item.id === workOrderId);
  if (!workOrder) return null;
  const report = snapshot.reports.find((item) => item.work_order_id === workOrderId);
  const statusHistory = await supabase.from("work_order_status_history").select("*").eq("work_order_id", workOrderId).order("changed_at");
  const workLogs = await supabase.from("work_logs").select("*").eq("work_order_id", workOrderId).order("created_at");
  if (statusHistory.error) throw new Error(statusHistory.error.message);
  if (workLogs.error) throw new Error(workLogs.error.message);
  return {
    ...makeWorkOrderSummary(snapshot, workOrder),
    description: workOrder.description,
    checklist: [
      { id: `${workOrder.id}-c1`, label: "Acceso confirmado", done: true },
      { id: `${workOrder.id}-c2`, label: "Trabajo documentado", done: Boolean(report?.work_done) },
      { id: `${workOrder.id}-c3`, label: "Firma cliente registrada", done: Boolean(report?.client_name_signed) },
    ],
    laborEntries: [{ id: `${workOrder.id}-labor`, technician: report?.technician_code ?? "", minutes: workOrder.estimated_minutes ?? 0, laborType: "onsite" }],
    materials: snapshot.materials.filter((item) => item.work_order_id === workOrderId).map((item) => ({
      id: item.id,
      sku: item.material_catalog?.sku ?? item.sku_snapshot ?? "MAT",
      name: item.material_catalog?.name ?? item.name_snapshot ?? "Material",
      quantity: Number(item.quantity),
      unit: item.unit_snapshot ?? item.material_catalog?.unit ?? "ud",
    })),
    logs: [
      { id: `${workOrder.id}-created`, at: workOrder.created_at, author: workOrder.created_by ?? "system", body: "Orden creada", source: "web" },
      ...(statusHistory.data ?? []).map((entry) => ({ id: entry.id, at: entry.changed_at, author: entry.changed_by ?? "system", body: `Estado cambiado a ${entry.to_status}`, source: entry.source ?? "web" })),
      ...(workLogs.data ?? []).map((entry) => ({ id: entry.id, at: entry.created_at, author: entry.created_by ?? "system", body: entry.body, source: entry.source ?? "mobile" })),
    ],
  };
}

export async function listWorkReports() {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  return snapshot.reports.map((item) => makeWorkReport(snapshot, item));
}

export async function getWorkReportDetail(reportId: string) {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  const report = snapshot.reports.find((item) => item.id === reportId);
  if (!report) return null;
  return { report: makeWorkReport(snapshot, report), workOrder: await getWorkOrderDetail(report.work_order_id) };
}

export async function listPlannerEvents() {
  const snapshot = await loadSnapshot(await getSupabaseClient());
  const technicians = await listTechnicians();
  return snapshot.assignments.map((assignment) => {
    const workOrder = snapshot.workOrders.find((item) => item.id === assignment.work_order_id);
    const company = snapshot.companies.find((item) => item.id === workOrder?.company_id);
    const site = snapshot.sites.find((item) => item.id === workOrder?.site_id);
    const asset = snapshot.assets.find((item) => item.id === workOrder?.primary_asset_id);
    const start = new Date(assignment.scheduled_start);
    const end = new Date(assignment.scheduled_end);
    return {
      id: assignment.id,
      workOrderId: assignment.work_order_id,
      workOrderNumber: workOrder?.number ?? "OT",
      reportId: snapshot.reports.find((item) => item.work_order_id === assignment.work_order_id)?.id,
      equipmentId: asset?.id,
      title: workOrder?.title ?? "Trabajo",
      clientName: company?.trade_name ?? "Cliente",
      technicianId: assignment.technician_code ?? assignment.user_id,
      address: site?.address,
      lat: asNumber(site?.lat),
      lng: asNumber(site?.lng),
      startAt: assignment.scheduled_start,
      endAt: assignment.scheduled_end,
      startHour: start.getHours(),
      startMinute: start.getMinutes(),
      durationMinutes: Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000)),
      status: (workOrder?.status ?? "planned") as WorkOrderStatus,
      priority: (workOrder?.priority ?? "normal") as WorkOrderPriority,
      color: technicians.find((tech) => tech.id === (assignment.technician_code ?? assignment.user_id))?.color ?? "#2563eb",
    };
  }) satisfies PlannerEvent[];
}

export async function getDashboardData() {
  const workOrders = await listWorkOrders();
  const technicians = await listTechnicians();
  const todayKey = new Date().toISOString().slice(0, 10);
  const metrics: DashboardMetric[] = [
    { id: "m1", label: "Ordenes abiertas", value: String(workOrders.filter((item) => !["closed", "cancelled"].includes(item.status)).length).padStart(2, "0"), helper: "Pendientes de ejecucion o cierre.", tone: "orange" },
    { id: "m2", label: "Tecnicos activos", value: String(new Set(workOrders.flatMap((item) => item.assignedTechnicianIds)).size).padStart(2, "0"), helper: "Equipo con carga visible en agenda.", tone: "green" },
    { id: "m3", label: "Ordenes hoy", value: String(workOrders.filter((item) => item.plannedStart.slice(0, 10) === todayKey).length).padStart(2, "0"), helper: "Intervenciones planificadas para hoy.", tone: "blue" },
    { id: "m4", label: "Ordenes pendientes", value: String(workOrders.filter((item) => ["pending_office_review", "pending_signature"].includes(item.status)).length).padStart(2, "0"), helper: "Pendientes de firma o revision.", tone: "red" },
  ];
  const alerts: DashboardAlert[] = workOrders.slice(0, 4).map((order) => ({ id: `alert-${order.id}`, title: `${order.number} - ${order.title}`, description: `${order.clientName} - ${order.status}`, severity: order.priority === "critical" ? "critical" : order.status === "in_progress" ? "warning" : "info" }));
  return { metrics, alerts, workOrders, technicians };
}

export async function getTechnicianAgenda(user: AuthenticatedUser) {
  const workOrders = await listWorkOrders();
  const technicianId = user.technicianId;
  const relevant = user.role === "technician" && technicianId ? workOrders.filter((item) => item.assignedTechnicianIds.includes(technicianId)) : workOrders;
  return relevant.map((order) => ({ id: order.id, number: order.number, title: order.title, client: order.clientName, equipmentLabel: order.equipmentLabel, windowLabel: `${order.plannedStart.slice(11, 16)} - ${order.plannedEnd.slice(11, 16)}`, status: order.status, syncStatus: "synced" })) satisfies TechnicianAgendaItem[];
}

export async function createClient(input: { name: string; taxId: string; city: string; address: string; postalCode: string; contactName: string; contactPhone: string }, user: AuthenticatedUser) {
  void user;
  const supabase = await getSupabaseClient();
  const company = await supabase.from("companies").insert({ legal_name: input.name, trade_name: input.name, tax_id: input.taxId || null }).select("id").single();
  if (company.error) throw new Error(company.error.message);
  const site = await supabase.from("company_sites").insert({ company_id: company.data.id, code: input.city ? `${input.city.slice(0, 3).toUpperCase()}-01` : "SITE-01", name: `Centro ${input.name}`, address: input.address, city: input.city, postal_code: input.postalCode }).select("id").single();
  if (site.error) throw new Error(site.error.message);
  const contact = await supabase.from("contacts").insert({ company_id: company.data.id, site_id: site.data.id, name: input.contactName, phone: input.contactPhone, is_primary: true });
  if (contact.error) throw new Error(contact.error.message);
  return company.data.id as string;
}

export async function createEquipment(input: { clientId: string; name: string; category: Equipment["category"]; serialNumber: string; manufacturer: string; model: string; location: string }, user: AuthenticatedUser) {
  void user;
  const supabase = await getSupabaseClient();
  const site = await findPrimarySite(supabase, input.clientId);
  if (!site) throw new Error("El cliente no tiene centro de trabajo.");
  const assetTypeId = await findAssetTypeId(supabase, input.category);
  const result = await supabase.from("assets").insert({ company_id: input.clientId, site_id: site.id, asset_type_id: assetTypeId, name: input.name, location: input.location, serial_number: input.serialNumber, manufacturer: input.manufacturer, model: input.model, status: "active" }).select("id").single();
  if (result.error) throw new Error(result.error.message);
  return result.data.id as string;
}

export async function createWorkOrder(input: { title: string; description: string; type: string; priority: WorkOrderPriority; clientId: string; equipmentId?: string; technicianId: string; plannedStart: string; plannedEnd: string }, user: AuthenticatedUser) {
  void user;
  const supabase = await getSupabaseClient();
  const siteResult = input.equipmentId ? await supabase.from("assets").select("site_id").eq("id", input.equipmentId).maybeSingle() : { data: await findPrimarySite(supabase, input.clientId), error: null };
  if (siteResult.error) throw new Error(siteResult.error.message);
  const siteData = (siteResult.data ?? {}) as { site_id?: string; id?: string };
  const siteId = siteData.site_id ?? siteData.id;
  if (!siteId) throw new Error("No se ha encontrado un centro para la orden.");
  const technician = await findTechnicianProfile(supabase, input.technicianId);
  const number = await nextSequentialNumber(supabase, "work_orders", "OT");
  const estimatedMinutes = Math.max(15, Math.round((new Date(input.plannedEnd).getTime() - new Date(input.plannedStart).getTime()) / 60000));
  const order = await supabase.from("work_orders").insert({ number, title: input.title, description: input.description, type: input.type, priority: input.priority, status: "planned", billing_status: "not_ready", company_id: input.clientId, site_id: siteId, primary_asset_id: input.equipmentId ?? null, planned_start: input.plannedStart, planned_end: input.plannedEnd, estimated_minutes: estimatedMinutes }).select("id").single();
  if (order.error) throw new Error(order.error.message);
  const assignment = await supabase.from("work_order_assignments").insert({ work_order_id: order.data.id, user_id: technician.user_id, scheduled_start: input.plannedStart, scheduled_end: input.plannedEnd, assignment_status: "planned", is_primary: true });
  if (assignment.error) throw new Error(assignment.error.message);
  await supabase.from("work_order_status_history").insert({ work_order_id: order.data.id, to_status: "planned", reason: "Orden creada", source: "web" });
  return order.data.id as string;
}

export async function createWorkReportFromWorkOrder(workOrderId: string, user: AuthenticatedUser) {
  const supabase = await getSupabaseClient();
  const existing = await supabase.from("work_reports").select("id").eq("work_order_id", workOrderId).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data?.id) return existing.data.id as string;
  const assignment = await supabase.from("work_order_assignments").select("scheduled_start, scheduled_end, user_profiles!inner(technician_code)").eq("work_order_id", workOrderId).limit(1).maybeSingle();
  if (assignment.error) throw new Error(assignment.error.message);
  const assignmentData = (assignment.data ?? {}) as {
    scheduled_start?: string;
    scheduled_end?: string;
    user_profiles?: { technician_code?: string } | Array<{ technician_code?: string }>;
  };
  const technicianCode = Array.isArray(assignmentData.user_profiles) ? assignmentData.user_profiles[0]?.technician_code : assignmentData.user_profiles?.technician_code;
  const number = await nextSequentialNumber(supabase, "work_reports", "PARTE");
  const report = await supabase.from("work_reports").insert({ number, work_order_id: workOrderId, technician_user_id: user.userId, technician_code: technicianCode ?? user.technicianId ?? "tecnico1", status: "draft", arrival_time: (assignmentData.scheduled_start ?? "08:00").slice(11, 16), departure_time: (assignmentData.scheduled_end ?? "09:00").slice(11, 16), work_done: "", pending_actions: "", client_name_signed: "" }).select("id").single();
  if (report.error) throw new Error(report.error.message);
  return report.data.id as string;
}

export async function updateWorkReport(reportId: string, input: Pick<WorkReport, "arrivalTime" | "departureTime" | "workDone" | "pendingActions" | "clientNameSigned"> & { status?: ReportStatus }, user: AuthenticatedUser) {
  void user;
  const supabase = await getSupabaseClient();
  const result = await supabase.from("work_reports").update({ arrival_time: input.arrivalTime, departure_time: input.departureTime, work_done: input.workDone, pending_actions: input.pendingActions, client_name_signed: input.clientNameSigned, status: input.status, closed_at: input.status === "closed" ? new Date().toISOString() : null }).eq("id", reportId);
  if (result.error) throw new Error(result.error.message);
}

export async function finalizeWorkOrder(workOrderId: string, user: AuthenticatedUser) {
  void user;
  const supabase = await getSupabaseClient();
  const now = new Date().toISOString();
  const order = await supabase.from("work_orders").update({ status: "closed", actual_end: now, status_changed_at: now }).eq("id", workOrderId);
  if (order.error) throw new Error(order.error.message);
  const assignments = await supabase.from("work_order_assignments").update({ assignment_status: "completed" }).eq("work_order_id", workOrderId);
  if (assignments.error) throw new Error(assignments.error.message);
  const reports = await supabase.from("work_reports").update({ status: "closed", closed_at: now }).eq("work_order_id", workOrderId);
  if (reports.error) throw new Error(reports.error.message);
  await supabase.from("work_order_status_history").insert({ work_order_id: workOrderId, to_status: "closed", reason: "Trabajo finalizado", source: "web" });
}

export async function reassignWorkOrder(workOrderId: string, technicianId: string, user: AuthenticatedUser) {
  void user;
  const supabase = await getSupabaseClient();
  const technician = await findTechnicianProfile(supabase, technicianId);
  const assignment = await supabase.from("work_order_assignments").update({ user_id: technician.user_id }).eq("work_order_id", workOrderId);
  if (assignment.error) throw new Error(assignment.error.message);
  const report = await supabase.from("work_reports").update({ technician_user_id: technician.user_id, technician_code: technician.technician_code }).eq("work_order_id", workOrderId);
  if (report.error) throw new Error(report.error.message);
}

export async function adjustWorkOrderDuration(workOrderId: string, endAt: string, user: AuthenticatedUser) {
  void user;
  const supabase = await getSupabaseClient();
  const assignment = await supabase.from("work_order_assignments").select("scheduled_start").eq("work_order_id", workOrderId).limit(1).maybeSingle();
  if (assignment.error) throw new Error(assignment.error.message);
  const estimatedMinutes = assignment.data?.scheduled_start ? Math.max(15, Math.round((new Date(endAt).getTime() - new Date(assignment.data.scheduled_start).getTime()) / 60000)) : 0;
  const updateAssignments = await supabase.from("work_order_assignments").update({ scheduled_end: endAt }).eq("work_order_id", workOrderId);
  if (updateAssignments.error) throw new Error(updateAssignments.error.message);
  const updateOrder = await supabase.from("work_orders").update({ planned_end: endAt, estimated_minutes: estimatedMinutes }).eq("id", workOrderId);
  if (updateOrder.error) throw new Error(updateOrder.error.message);
}

export async function getMapLocationForWorkOrder(workOrderId: string) {
  const detail = await getWorkOrderDetail(workOrderId);
  if (!detail) return null;
  return { address: detail.clientAddress ?? "", lat: detail.lat, lng: detail.lng, clientName: detail.clientName, equipmentName: detail.equipmentLabel };
}

export async function getWeeklyPlannerEvents() {
  return listPlannerEvents();
}

export async function saveWorkReportAttachment(workReportId: string, input: { fileName: string; mimeType: string; bytes: Uint8Array; kind: "photo" | "document" }, user: AuthenticatedUser) {
  void user;
  const supabase = await getSupabaseClient();
  const report = await supabase.from("work_reports").select("work_order_id").eq("id", workReportId).maybeSingle();
  if (report.error) throw new Error(report.error.message);
  if (!report.data) throw new Error("Parte no encontrado.");
  const result = await supabase.from("attachments").insert({ entity_type: "work_report", entity_id: workReportId, work_order_id: report.data.work_order_id, work_report_id: workReportId, bucket: "inline", path: `inline/${workReportId}/${Date.now()}-${input.fileName}`, file_name: input.fileName, file_kind: input.kind, mime_type: input.mimeType, size_bytes: input.bytes.byteLength, upload_status: "uploaded", inline_base64: Buffer.from(input.bytes).toString("base64") }).select("id").single();
  if (result.error) throw new Error(result.error.message);
  return result.data.id as string;
}

export async function saveWorkReportSignature(workReportId: string, input: { dataUrl: string; signerName: string }, user: AuthenticatedUser) {
  const supabase = await getSupabaseClient();
  const match = input.dataUrl.match(/^data:(image\/png|image\/jpeg);base64,(.+)$/);
  if (!match) throw new Error("Firma invalida.");
  const report = await supabase.from("work_reports").select("work_order_id, signature_attachment_id").eq("id", workReportId).maybeSingle();
  if (report.error) throw new Error(report.error.message);
  if (!report.data) throw new Error("Parte no encontrado.");
  if (report.data.signature_attachment_id) {
    const previous = await supabase.from("attachments").delete().eq("id", report.data.signature_attachment_id);
    if (previous.error) throw new Error(previous.error.message);
  }
  const attachment = await supabase.from("attachments").insert({ entity_type: "work_report", entity_id: workReportId, work_order_id: report.data.work_order_id, work_report_id: workReportId, bucket: "inline", path: `inline/${workReportId}/signature-${Date.now()}`, file_name: `firma-${workReportId}.png`, file_kind: "signature", mime_type: match[1], size_bytes: Math.round((match[2].length * 3) / 4), upload_status: "uploaded", inline_base64: match[2] }).select("id").single();
  if (attachment.error) throw new Error(attachment.error.message);
  const now = new Date().toISOString();
  const updateReport = await supabase.from("work_reports").update({ client_name_signed: input.signerName, signature_attachment_id: attachment.data.id, signature_signed_at: now, technician_user_id: user.userId, technician_code: user.technicianId ?? null }).eq("id", workReportId);
  if (updateReport.error) throw new Error(updateReport.error.message);
  const existingSignature = await supabase.from("signatures").select("id").eq("work_order_id", report.data.work_order_id).maybeSingle();
  if (existingSignature.error) throw new Error(existingSignature.error.message);
  if (existingSignature.data?.id) {
    const updateSignature = await supabase.from("signatures").update({ signer_name: input.signerName, signed_at: now, image_path: attachment.data.id }).eq("id", existingSignature.data.id);
    if (updateSignature.error) throw new Error(updateSignature.error.message);
  } else {
    const insertSignature = await supabase.from("signatures").insert({ work_order_id: report.data.work_order_id, signer_name: input.signerName, signed_at: now, image_path: attachment.data.id });
    if (insertSignature.error) throw new Error(insertSignature.error.message);
  }
  return attachment.data.id as string;
}

export async function getAttachmentBinary(attachmentId: string) {
  const supabase = await getSupabaseClient();
  const result = await supabase.from("attachments").select("id, file_kind, file_name, mime_type, created_at, inline_base64").eq("id", attachmentId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data?.inline_base64) return null;
  return {
    attachment: { id: result.data.id, kind: result.data.file_kind, fileName: result.data.file_name ?? "adjunto", mimeType: result.data.mime_type ?? "application/octet-stream", createdAt: result.data.created_at },
    bytes: Uint8Array.from(Buffer.from(result.data.inline_base64, "base64")),
  };
}
