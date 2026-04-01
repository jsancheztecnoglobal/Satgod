import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getAuthenticatedUserByToken, loginWithPassword } from "@/server/services/auth-service";
import {
  adjustWorkOrderDuration,
  createClient,
  createEquipment,
  createWorkOrder,
  createWorkReportFromWorkOrder,
  finalizeWorkOrder,
  getClientDetail,
  getTechnicianDetail,
  getWorkOrderDetail,
  getWorkReportDetail,
  reassignWorkOrder,
  saveWorkReportAttachment,
  saveWorkReportSignature,
  updateWorkReport,
} from "@/server/services/product-service";

let tempDir = "";

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "tecnoglobal-flow-"));
  process.env.TECNOGLOBAL_DB_FILE = path.join(tempDir, "db.json");
});

afterEach(async () => {
  delete process.env.TECNOGLOBAL_DB_FILE;
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
  }
});

describe("product-service end-to-end flows", () => {
  it("creates and links client, equipment, work order and work report with persistence", async () => {
    const login = await loginWithPassword("oficina@tecnoglobal.local", "tecnoglobal123");
    expect(login.ok).toBe(true);
    if (!login.ok) {
      throw new Error("expected valid login");
    }

    const user = await getAuthenticatedUserByToken(login.token);
    if (!user) {
      throw new Error("expected authenticated user");
    }

    const clientId = await createClient(
      {
        name: "Cliente Industrial Nuevo",
        taxId: "B10000999",
        city: "Sevilla",
        address: "Avenida Real 10, Sevilla",
        postalCode: "41001",
        contactName: "Responsable Nuevo",
        contactPhone: "611000999",
      },
      user,
    );

    const equipmentId = await createEquipment(
      {
        clientId,
        name: "Compresor nuevo",
        category: "compressor",
        serialNumber: "SER-0999",
        manufacturer: "Fabricante X",
        model: "Modelo X1",
        location: "Sala tecnica principal",
      },
      user,
    );

    const workOrderId = await createWorkOrder(
      {
        title: "Instalacion inicial",
        description: "Montaje y puesta en marcha del nuevo compresor.",
        type: "installation",
        priority: "high",
        clientId,
        equipmentId,
        technicianId: "tecnico1",
        plannedStart: "2026-04-03T08:00:00.000Z",
        plannedEnd: "2026-04-03T11:00:00.000Z",
      },
      user,
    );

    const reportId = await createWorkReportFromWorkOrder(workOrderId, user);
    await saveWorkReportAttachment(
      reportId,
      {
        fileName: "foto-instalacion.jpg",
        mimeType: "image/jpeg",
        bytes: new Uint8Array([1, 2, 3, 4]),
        kind: "photo",
      },
      user,
    );
    await saveWorkReportSignature(
      reportId,
      {
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sW7xQAAAABJRU5ErkJggg==",
        signerName: "Responsable Nuevo",
      },
      user,
    );
    await updateWorkReport(
      reportId,
      {
        arrivalTime: "08:10",
        departureTime: "10:55",
        workDone: "Montaje completado y pruebas iniciales correctas.",
        pendingActions: "Programar revision a las 48 horas.",
        clientNameSigned: "Responsable Nuevo",
        status: "ready_for_review",
      },
      user,
    );

    await reassignWorkOrder(workOrderId, "tecnico2", user);
    await adjustWorkOrderDuration(workOrderId, "2026-04-03T12:00:00.000Z", user);
    await finalizeWorkOrder(workOrderId, user);

    const clientDetail = await getClientDetail(clientId);
    const workOrderDetail = await getWorkOrderDetail(workOrderId);
    const workReportDetail = await getWorkReportDetail(reportId);
    const technicianDetail = await getTechnicianDetail("tecnico2");

    expect(clientDetail?.equipment.some((item) => item.id === equipmentId)).toBe(true);
    expect(workOrderDetail?.reportId).toBe(reportId);
    expect(workOrderDetail?.status).toBe("closed");
    expect(workOrderDetail?.plannedEnd).toBe("2026-04-03T12:00:00.000Z");
    expect(workOrderDetail?.assignedTechnicianIds).toContain("tecnico2");
    expect(workReportDetail?.report.status).toBe("closed");
    expect(workReportDetail?.report.clientNameSigned).toBe("Responsable Nuevo");
    expect(workReportDetail?.report.attachments.length).toBe(1);
    expect(workReportDetail?.report.signatureUrl).toBeTruthy();
    expect(technicianDetail?.workOrders.some((item) => item.id === workOrderId)).toBe(true);
  });
});
