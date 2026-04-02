import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { createWorkReportFromWorkOrder } from "@/server/services/product-service-runtime";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reportId = await createWorkReportFromWorkOrder(id, user, {
      arrivalTime: typeof body.arrivalTime === "string" ? body.arrivalTime : undefined,
      openedAt: typeof body.openedAt === "string" ? body.openedAt : undefined,
      geoLat: typeof body.geoLat === "number" ? body.geoLat : undefined,
      geoLng: typeof body.geoLng === "number" ? body.geoLng : undefined,
    });
    return NextResponse.json({ ok: true, reportId });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo crear el parte." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
