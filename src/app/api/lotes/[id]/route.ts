import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb, removeFoto, errorMessage } from "@/lib/db";
import { ESTADOS } from "@/lib/constants";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(request, ["inspeccion", "inventario", "despacho", "admin"]);
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    const body = (await request.json()) as { estado?: string };

    if (!body.estado || !ESTADOS.includes(body.estado as (typeof ESTADOS)[number])) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const db = getAdminDb();
    const { data, error } = await db
      .from("lotes")
      .update({ estado: body.estado, updated: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json(data);
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
    const { data } = await db
      .from("lotes")
      .select("foto")
      .eq("id", id)
      .maybeSingle();
    const { error } = await db.from("lotes").delete().eq("id", id);
    if (error) throw error;
    if (data?.foto) await removeFoto(data.foto);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
