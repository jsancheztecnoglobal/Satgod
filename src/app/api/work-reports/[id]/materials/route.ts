import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { addWorkReportMaterial } from "@/server/services/product-service-runtime";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await context.params;
    const body = await request.json();

    await addWorkReportMaterial(
      id,
      {
        materialId: String(body.materialId ?? ""),
        quantity: Number(body.quantity ?? 0),
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
            : "No se pudo registrar el material.",
      },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
