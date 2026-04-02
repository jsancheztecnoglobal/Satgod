import "server-only";

import type { AppSession } from "@/lib/auth/session";
import {
  getClientDetail,
  getDashboardData as readDashboardData,
  getEquipmentDetail,
  getTechnicianAgenda as readTechnicianAgenda,
  getTechnicianDetail,
  listMaterialCatalog,
  getWorkOrderDetail as readWorkOrderDetail,
  getWorkReportDetail,
  listClients,
  listEquipment,
  listPlannerEvents,
  listTechnicians,
  listWorkOrders,
  listWorkReports,
} from "@/server/services/product-service-runtime";
export const getClientsList = listClients;
export const getEquipmentList = listEquipment;
export const getTechniciansList = listTechnicians;
export const getMaterialCatalog = listMaterialCatalog;
export const getPlannerEvents = listPlannerEvents;
export const getDashboardData = readDashboardData;
export const getClientById = getClientDetail;
export const getEquipmentById = getEquipmentDetail;
export const getTechnicianById = getTechnicianDetail;

export async function getWorkOrdersList(session?: AppSession | null) {
  return listWorkOrders(session);
}

export async function getWorkReportsList(session?: AppSession | null) {
  return listWorkReports(session);
}

export async function getWorkOrderById(workOrderId: string, session?: AppSession | null) {
  return readWorkOrderDetail(workOrderId, session);
}

export async function getWorkReportById(reportId: string, session?: AppSession | null) {
  return getWorkReportDetail(reportId, session);
}

export async function getTechnicianAgenda(session: AppSession) {
  return readTechnicianAgenda(session);
}
