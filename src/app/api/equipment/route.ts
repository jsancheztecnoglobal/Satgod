import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { createEquipment, listEquipment } from "@/server/services/product-service-runtime";

export async function GET() {
  const equipment = await listEquipment();
  return NextResponse.json({ data: equipment });
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const equipmentId = await createEquipment(
      {
        clientId: String(body.clientId ?? ""),
        name: String(body.name ?? "").trim(),
        category: body.category,
        serialNumber: String(body.serialNumber ?? "").trim(),
        manufacturer: String(body.manufacturer ?? "").trim(),
        model: String(body.model ?? "").trim(),
        location: String(body.location ?? "").trim(),
      },
      user,
    );

    return NextResponse.json({ ok: true, equipmentId });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo crear el equipo." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
