import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { getWorkReportDetail, updateWorkReport } from "@/server/services/product-service-runtime";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireApiUser();
  const { id } = await context.params;
  const report = await getWorkReportDetail(id, user);

  if (!report) {
    return NextResponse.json({ ok: false, message: "Parte no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: report });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await context.params;
    const body = await request.json();
    await updateWorkReport(
      id,
      {
        arrivalTime: String(body.arrivalTime ?? ""),
        departureTime: String(body.departureTime ?? ""),
        workDone: String(body.workDone ?? ""),
        pendingActions: String(body.pendingActions ?? ""),
        clientNameSigned: String(body.clientNameSigned ?? ""),
        status: body.status,
      },
      user,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar el parte." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
