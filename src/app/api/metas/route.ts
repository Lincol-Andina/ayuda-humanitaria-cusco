import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb, errorMessage } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validatePin(pin: unknown): boolean {
  const expected = process.env.ADMIN_PIN ?? "1234";
  return typeof pin === "string" && pin.trim() === expected;
}

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
    const body = (await request.json()) as Record<string, unknown>;
    if (!validatePin(body.pin)) {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }
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
