import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/http/auth";
import { createClient, listClients } from "@/server/services/product-service";

export async function GET() {
  const clients = await listClients();
  return NextResponse.json({ data: clients });
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const clientId = await createClient(
      {
        name: String(body.name ?? "").trim(),
        taxId: String(body.taxId ?? "").trim(),
        city: String(body.city ?? "").trim(),
        address: String(body.address ?? "").trim(),
        postalCode: String(body.postalCode ?? "").trim(),
        contactName: String(body.contactName ?? "").trim(),
        contactPhone: String(body.contactPhone ?? "").trim(),
      },
      user,
    );

    return NextResponse.json({ ok: true, clientId });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "No se pudo crear el cliente." },
      { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
