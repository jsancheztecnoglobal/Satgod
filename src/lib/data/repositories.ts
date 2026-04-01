import "server-only";

import type { AppSession } from "@/lib/auth/session";
import {
  getClientDetail,
  getDashboardData as readDashboardData,
  getEquipmentDetail,
  getTechnicianAgenda as readTechnicianAgenda,
  getTechnicianDetail,
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
export const getWorkOrdersList = listWorkOrders;
export const getWorkReportsList = listWorkReports;
export const getPlannerEvents = listPlannerEvents;
export const getDashboardData = readDashboardData;
export const getClientById = getClientDetail;
export const getEquipmentById = getEquipmentDetail;
export const getTechnicianById = getTechnicianDetail;
export const getWorkOrderById = readWorkOrderDetail;
export const getWorkReportById = getWorkReportDetail;

export async function getTechnicianAgenda(session: AppSession) {
  return readTechnicianAgenda(session);
}
