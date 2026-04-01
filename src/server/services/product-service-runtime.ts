import { isSupabaseConfigured } from "@/lib/supabase/server";

async function runtimeModule() {
  if (isSupabaseConfigured()) {
    return import("@/server/services/product-service-supabase");
  }

  return import("@/server/services/product-service");
}

export async function listClients() {
  return (await runtimeModule()).listClients();
}

export async function getClientDetail(clientId: string) {
  return (await runtimeModule()).getClientDetail(clientId);
}

export async function listEquipment() {
  return (await runtimeModule()).listEquipment();
}

export async function getEquipmentDetail(equipmentId: string) {
  return (await runtimeModule()).getEquipmentDetail(equipmentId);
}

export async function listTechnicians() {
  return (await runtimeModule()).listTechnicians();
}

export async function getTechnicianDetail(technicianId: string) {
  return (await runtimeModule()).getTechnicianDetail(technicianId);
}

export async function listWorkOrders() {
  return (await runtimeModule()).listWorkOrders();
}

export async function getWorkOrderDetail(workOrderId: string) {
  return (await runtimeModule()).getWorkOrderDetail(workOrderId);
}

export async function listWorkReports() {
  return (await runtimeModule()).listWorkReports();
}

export async function getWorkReportDetail(reportId: string) {
  return (await runtimeModule()).getWorkReportDetail(reportId);
}

export async function listPlannerEvents() {
  return (await runtimeModule()).listPlannerEvents();
}

export async function getDashboardData() {
  return (await runtimeModule()).getDashboardData();
}

export async function getTechnicianAgenda(...args: Parameters<(typeof import("@/server/services/product-service"))["getTechnicianAgenda"]>) {
  return (await runtimeModule()).getTechnicianAgenda(...args);
}

export async function createClient(...args: Parameters<(typeof import("@/server/services/product-service"))["createClient"]>) {
  return (await runtimeModule()).createClient(...args);
}

export async function createEquipment(...args: Parameters<(typeof import("@/server/services/product-service"))["createEquipment"]>) {
  return (await runtimeModule()).createEquipment(...args);
}

export async function createWorkOrder(...args: Parameters<(typeof import("@/server/services/product-service"))["createWorkOrder"]>) {
  return (await runtimeModule()).createWorkOrder(...args);
}

export async function createWorkReportFromWorkOrder(...args: Parameters<(typeof import("@/server/services/product-service"))["createWorkReportFromWorkOrder"]>) {
  return (await runtimeModule()).createWorkReportFromWorkOrder(...args);
}

export async function updateWorkReport(...args: Parameters<(typeof import("@/server/services/product-service"))["updateWorkReport"]>) {
  return (await runtimeModule()).updateWorkReport(...args);
}

export async function finalizeWorkOrder(...args: Parameters<(typeof import("@/server/services/product-service"))["finalizeWorkOrder"]>) {
  return (await runtimeModule()).finalizeWorkOrder(...args);
}

export async function reassignWorkOrder(...args: Parameters<(typeof import("@/server/services/product-service"))["reassignWorkOrder"]>) {
  return (await runtimeModule()).reassignWorkOrder(...args);
}

export async function adjustWorkOrderDuration(...args: Parameters<(typeof import("@/server/services/product-service"))["adjustWorkOrderDuration"]>) {
  return (await runtimeModule()).adjustWorkOrderDuration(...args);
}

export async function getMapLocationForWorkOrder(workOrderId: string) {
  return (await runtimeModule()).getMapLocationForWorkOrder(workOrderId);
}

export async function getWeeklyPlannerEvents() {
  return (await runtimeModule()).getWeeklyPlannerEvents();
}

export async function saveWorkReportAttachment(...args: Parameters<(typeof import("@/server/services/product-service"))["saveWorkReportAttachment"]>) {
  return (await runtimeModule()).saveWorkReportAttachment(...args);
}

export async function saveWorkReportSignature(...args: Parameters<(typeof import("@/server/services/product-service"))["saveWorkReportSignature"]>) {
  return (await runtimeModule()).saveWorkReportSignature(...args);
}

export async function getAttachmentBinary(attachmentId: string) {
  return (await runtimeModule()).getAttachmentBinary(attachmentId);
}
