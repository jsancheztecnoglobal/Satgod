import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { saveWorkReportSignature } from "@/server/services/product-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await context.params;
    const body = await request.json();
    const attachmentId = await saveWorkReportSignature(
      id,
      {
        dataUrl: String(body.dataUrl ?? ""),
        signerName: String(body.signerName ?? ""),
      },
      user,
    );

    return NextResponse.json({ ok: true, attachmentId });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo guardar la firma." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
