import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb, errorMessage } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(request, ["admin"]);
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

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
    const auth = await requireRole(request, ["admin"]);
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    const db = getAdminDb();
    const { error } = await db.from("metas").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
