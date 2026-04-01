import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { adjustWorkOrderDuration } from "@/server/services/product-service-runtime";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await context.params;
    const body = await request.json();
    await adjustWorkOrderDuration(id, String(body.endAt ?? ""), user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo ajustar la duracion." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
