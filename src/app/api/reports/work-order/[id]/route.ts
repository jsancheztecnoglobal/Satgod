import { NextResponse } from "next/server";

import { getWorkOrderById } from "@/lib/data/repositories";
import { renderWorkOrderPdf } from "@/server/pdf/work-order-report";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const workOrder = await getWorkOrderById(id);

  if (!workOrder) {
    return NextResponse.json({ error: "Work order not found" }, { status: 404 });
  }

  const pdfBuffer = await renderWorkOrderPdf(workOrder);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${workOrder.number}.pdf"`,
    },
  });
}
