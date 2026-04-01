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
    const reportId = await createWorkReportFromWorkOrder(id, user);
    return NextResponse.json({ ok: true, reportId });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo crear el parte." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
