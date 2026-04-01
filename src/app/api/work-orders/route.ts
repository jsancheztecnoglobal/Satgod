import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { createWorkOrder, listWorkOrders } from "@/server/services/product-service-runtime";

export async function GET() {
  const workOrders = await listWorkOrders();
  return NextResponse.json({ data: workOrders });
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const workOrderId = await createWorkOrder(
      {
        title: String(body.title ?? "").trim(),
        description: String(body.description ?? "").trim(),
        type: body.type,
        priority: body.priority,
        clientId: String(body.clientId ?? ""),
        equipmentId: body.equipmentId ? String(body.equipmentId) : undefined,
        technicianId: String(body.technicianId ?? ""),
        plannedStart: String(body.plannedStart ?? ""),
        plannedEnd: String(body.plannedEnd ?? ""),
      },
      user,
    );

    return NextResponse.json({ ok: true, workOrderId });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo crear la orden." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
