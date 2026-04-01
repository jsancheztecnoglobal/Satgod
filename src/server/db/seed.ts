import { randomUUID, scryptSync } from "node:crypto";

import type { DatabaseState } from "@/server/db/types";

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function createUser(
  email: string,
  fullName: string,
  role: DatabaseState["users"][number]["role"],
  options?: { technicianId?: string },
) {
  const salt = randomUUID();
  return {
    id: randomUUID(),
    email,
    fullName,
    role,
    technicianId: options?.technicianId,
    passwordSalt: salt,
    passwordHash: hashPassword("tecnoglobal123", salt),
    active: true,
  };
}

export function createSeedDatabase(): DatabaseState {
  const now = "2026-04-01T08:00:00.000Z";

  const tecnico1Id = "tecnico1";
  const tecnico2Id = "tecnico2";
  const tecnico3Id = "tecnico3";
  const tecnico4Id = "tecnico4";

  const userAdmin = createUser("admin@tecnoglobal.local", "Administrador Tecnoglobal", "admin");
  const userOffice = createUser("oficina@tecnoglobal.local", "Oficina Planificacion", "office_planner");
  const userTech1 = createUser("tecnico1@tecnoglobal.local", "Tecnico 1", "technician", {
    technicianId: tecnico1Id,
  });
  const userTech2 = createUser("tecnico2@tecnoglobal.local", "Tecnico 2", "technician", {
    technicianId: tecnico2Id,
  });
  const userEngineer = createUser("ingenieria@tecnoglobal.local", "Ingenieria Tecnoglobal", "engineer");

  const client1Id = "cliente1";
  const client2Id = "cliente2";
  const client3Id = "cliente3";

  const equipment1Id = "equipo1";
  const equipment2Id = "equipo2";
  const equipment3Id = "equipo3";
  const equipment4Id = "equipo4";
  const equipment5Id = "equipo5";

  const workOrder1Id = "ot1";
  const workOrder2Id = "ot2";
  const workOrder3Id = "ot3";
  const workOrder4Id = "ot4";

  const assignment1Id = "asg1";
  const assignment2Id = "asg2";
  const assignment3Id = "asg3";
  const assignment4Id = "asg4";

  const report1Id = "parte1";
  const report2Id = "parte2";

  return {
    users: [userAdmin, userOffice, userEngineer, userTech1, userTech2],
    sessions: [],
    clients: [
      {
        id: client1Id,
        name: "Cliente Industrial 1",
        taxId: "B10000001",
        city: "Madrid",
        address: "Calle Tecnica 101, Madrid",
        postalCode: "28021",
        lat: 40.37091,
        lng: -3.69988,
        contactName: "Responsable 1",
        contactPhone: "600000001",
        contactEmail: "cliente1@industrial.local",
        notes: "Acceso por puerta lateral de mantenimiento.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: client2Id,
        name: "Cliente Industrial 2",
        taxId: "B10000002",
        city: "Valencia",
        address: "Avenida Servicio 22, Valencia",
        postalCode: "46012",
        lat: 39.45051,
        lng: -0.33463,
        contactName: "Responsable 2",
        contactPhone: "600000002",
        contactEmail: "cliente2@industrial.local",
        notes: "Llamar antes de entrar al recinto.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: client3Id,
        name: "Cliente Industrial 3",
        taxId: "B10000003",
        city: "Barcelona",
        address: "Poligono Norte 8, Barcelona",
        postalCode: "08038",
        lat: 41.34761,
        lng: 2.15189,
        contactName: "Responsable 3",
        contactPhone: "600000003",
        contactEmail: "cliente3@industrial.local",
        notes: "Sala de compresores en planta baja.",
        createdAt: now,
        updatedAt: now,
      },
    ],
    equipment: [
      {
        id: equipment1Id,
        clientId: client1Id,
        name: "Compresor principal",
        category: "compressor",
        serialNumber: "SER-0001",
        manufacturer: "Fabricante A",
        model: "Modelo A1",
        location: "Sala de compresores",
        status: "active",
        lat: 40.37091,
        lng: -3.69988,
        installedAt: "2022-06-12T00:00:00.000Z",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: equipment2Id,
        clientId: client1Id,
        name: "Secador linea 1",
        category: "dryer",
        serialNumber: "SER-0002",
        manufacturer: "Fabricante B",
        model: "Modelo D2",
        location: "Linea 1",
        status: "active",
        lat: 40.37095,
        lng: -3.6997,
        installedAt: "2023-01-05T00:00:00.000Z",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: equipment3Id,
        clientId: client2Id,
        name: "Deposito vertical",
        category: "tank",
        serialNumber: "SER-0003",
        manufacturer: "Fabricante C",
        model: "Modelo T1",
        location: "Patio tecnico",
        status: "attention",
        lat: 39.45051,
        lng: -0.33463,
        installedAt: "2021-09-20T00:00:00.000Z",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: equipment4Id,
        clientId: client3Id,
        name: "Filtro principal",
        category: "filter",
        serialNumber: "SER-0004",
        manufacturer: "Fabricante D",
        model: "Modelo F9",
        location: "Cabecera red",
        status: "active",
        lat: 41.34761,
        lng: 2.15189,
        installedAt: "2020-04-14T00:00:00.000Z",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: equipment5Id,
        clientId: client3Id,
        name: "Compresor respaldo",
        category: "compressor",
        serialNumber: "SER-0005",
        manufacturer: "Fabricante A",
        model: "Modelo A2",
        location: "Sala secundaria",
        status: "stopped",
        lat: 41.34775,
        lng: 2.15195,
        installedAt: "2024-03-10T00:00:00.000Z",
        createdAt: now,
        updatedAt: now,
      },
    ],
    workOrders: [
      {
        id: workOrder1Id,
        number: "OT-0001",
        title: "Mantenimiento preventivo trimestral",
        description: "Revision preventiva general del compresor principal.",
        type: "maintenance",
        priority: "normal",
        status: "planned",
        billingStatus: "not_ready",
        clientId: client1Id,
        equipmentId: equipment1Id,
        reportId: report1Id,
        assignmentId: assignment1Id,
        createdByUserId: userOffice.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: workOrder2Id,
        number: "OT-0002",
        title: "Averia por fuga en red secundaria",
        description: "Intervencion urgente para localizar y reparar una fuga.",
        type: "breakdown",
        priority: "critical",
        status: "in_progress",
        billingStatus: "not_ready",
        clientId: client2Id,
        equipmentId: equipment3Id,
        reportId: report2Id,
        assignmentId: assignment2Id,
        createdByUserId: userOffice.id,
        actualStart: "2026-04-01T09:40:00.000Z",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: workOrder3Id,
        number: "OT-0003",
        title: "Puesta en marcha tras cambio de repuesto",
        description: "Comprobacion y arranque tras sustitucion de componente principal.",
        type: "commissioning",
        priority: "high",
        status: "planned",
        billingStatus: "not_ready",
        clientId: client3Id,
        equipmentId: equipment5Id,
        assignmentId: assignment3Id,
        createdByUserId: userEngineer.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: workOrder4Id,
        number: "OT-0004",
        title: "Visita tecnica y revision general",
        description: "Visita de inspeccion tecnica y comprobacion de estado general.",
        type: "technical_visit",
        priority: "normal",
        status: "planned",
        billingStatus: "not_ready",
        clientId: client3Id,
        equipmentId: equipment4Id,
        assignmentId: assignment4Id,
        createdByUserId: userOffice.id,
        createdAt: now,
        updatedAt: now,
      },
    ],
    workReports: [
      {
        id: report1Id,
        number: "PARTE-0001",
        workOrderId: workOrder1Id,
        technicianId: tecnico1Id,
        status: "draft",
        arrivalTime: "08:05",
        departureTime: "09:55",
        workDone: "Revision preventiva general y comprobacion visual.",
        pendingActions: "Revisar vibracion en la siguiente visita programada.",
        clientNameSigned: "",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: report2Id,
        number: "PARTE-0002",
        workOrderId: workOrder2Id,
        technicianId: tecnico2Id,
        status: "ready_for_review",
        arrivalTime: "09:40",
        departureTime: "11:50",
        workDone: "Localizada fuga y reparada conexion en derivacion secundaria.",
        pendingActions: "Comprobar estabilidad de presion en 7 dias.",
        clientNameSigned: "Responsable 2",
        createdAt: now,
        updatedAt: now,
      },
    ],
    materialUsage: [
      {
        id: "mat1",
        workReportId: report1Id,
        name: "Filtro separador",
        sku: "MAT-001",
        quantity: 1,
        unit: "ud",
      },
      {
        id: "mat2",
        workReportId: report2Id,
        name: "Racor 1/2",
        sku: "MAT-002",
        quantity: 2,
        unit: "ud",
      },
    ],
    attachments: [],
    assignments: [
      {
        id: assignment1Id,
        workOrderId: workOrder1Id,
        technicianId: tecnico1Id,
        startAt: "2026-04-01T08:00:00.000Z",
        endAt: "2026-04-01T10:00:00.000Z",
        status: "planned",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: assignment2Id,
        workOrderId: workOrder2Id,
        technicianId: tecnico2Id,
        startAt: "2026-04-01T09:30:00.000Z",
        endAt: "2026-04-01T12:00:00.000Z",
        status: "in_progress",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: assignment3Id,
        workOrderId: workOrder3Id,
        technicianId: tecnico3Id,
        startAt: "2026-04-01T11:00:00.000Z",
        endAt: "2026-04-01T13:00:00.000Z",
        status: "planned",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: assignment4Id,
        workOrderId: workOrder4Id,
        technicianId: tecnico4Id,
        startAt: "2026-04-01T15:00:00.000Z",
        endAt: "2026-04-01T16:30:00.000Z",
        status: "planned",
        createdAt: now,
        updatedAt: now,
      },
    ],
    audit: [],
    counters: {
      workOrder: 5,
      workReport: 3,
    },
  };
}
