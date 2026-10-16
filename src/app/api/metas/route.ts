import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb, errorMessage } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getAdminDb();
    const { data, error } = await db
      .from("metas")
      .select("*")
      .order("created", { ascending: true });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin"]);
    if (auth instanceof NextResponse) return auth;

    const body = (await request.json()) as Record<string, unknown>;
    const db = getAdminDb();
    const { data, error } = await db
      .from("metas")
      .insert({
        nombre: String(body.nombre ?? "Nueva meta"),
        categoria: String(body.categoria ?? "General"),
        unidad: String(body.unidad ?? ""),
        tipo: String(body.tipo ?? "manual"),
        valor_meta: Number(body.valor_meta ?? 0),
        valor_actual: Number(body.valor_actual ?? 0),
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
