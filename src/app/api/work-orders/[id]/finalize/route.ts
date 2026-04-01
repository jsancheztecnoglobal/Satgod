import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { finalizeWorkOrder } from "@/server/services/product-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await context.params;
    await finalizeWorkOrder(id, user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo finalizar la orden." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
