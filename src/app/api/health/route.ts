import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "tecnoglobal-fsm",
    timestamp: new Date().toISOString(),
  });
}
