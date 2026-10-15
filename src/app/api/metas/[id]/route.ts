import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb, errorMessage } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validatePin(pin: unknown): boolean {
  const expected = process.env.ADMIN_PIN ?? "1234";
  return typeof pin === "string" && pin.trim() === expected;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    if (!validatePin(body.pin)) {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }

    const data: Record<string, unknown> = { updated: new Date().toISOString() };
    if (body.nombre !== undefined) data.nombre = String(body.nombre);
    if (body.valor_meta !== undefined) data.valor_meta = Number(body.valor_meta);
    if (body.valor_actual !== undefined)
      data.valor_actual = Number(body.valor_actual);

    const db = getAdminDb();
    const { data: record, error } = await db
      .from("metas")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const pin = new URL(request.url).searchParams.get("pin");
    if (!validatePin(pin)) {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }
    const db = getAdminDb();
    const { error } = await db.from("metas").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
