import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { scheduleWorkOrder } from "@/server/services/product-service-runtime";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await context.params;
    const body = await request.json();

    await scheduleWorkOrder(
      id,
      {
        startAt: String(body.startAt ?? ""),
        endAt: String(body.endAt ?? ""),
        technicianId: String(body.technicianId ?? ""),
      },
      user,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo replanificar la orden.",
      },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
