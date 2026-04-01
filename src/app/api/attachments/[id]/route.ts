import { NextResponse } from "next/server";

import { getAttachmentBinary } from "@/server/services/product-service-runtime";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = await getAttachmentBinary(id);

  if (!result) {
    return NextResponse.json({ ok: false, message: "Adjunto no encontrado." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(result.bytes), {
    headers: {
      "Content-Type": result.attachment.mimeType,
      "Content-Disposition": `inline; filename="${result.attachment.fileName}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
