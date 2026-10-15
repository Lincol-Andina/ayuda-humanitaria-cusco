import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { pin?: string };
  const expected = process.env.ADMIN_PIN ?? "1234";
  if (typeof body.pin === "string" && body.pin.trim() === expected) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "PIN incorrecto" }, { status: 401 });
}
