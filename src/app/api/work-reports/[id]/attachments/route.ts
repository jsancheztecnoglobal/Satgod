import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { saveWorkReportAttachment } from "@/server/services/product-service-runtime";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "photo") as "photo" | "document";

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "No se ha recibido ningun archivo." }, { status: 400 });
    }

    const attachmentId = await saveWorkReportAttachment(
      id,
      {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        bytes: new Uint8Array(await file.arrayBuffer()),
        kind,
      },
      user,
    );

    return NextResponse.json({ ok: true, attachmentId });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo subir el archivo." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
