import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb, removeFoto, errorMessage } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESET_TABLES = [
  { table: "despacho_lotes", column: "despacho_id" },
  { table: "despachos", column: "id" },
  { table: "lotes", column: "id" },
  { table: "descartes", column: "id" },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { pin?: string };
    const expected = process.env.ADMIN_PIN ?? "1234";
    if (typeof body.pin !== "string" || body.pin.trim() !== expected) {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }

    const db = getAdminDb();
    const deleted: Record<string, number> = {};

    // Recolectar fotos antes de borrar las filas.
    const fotoColumns = [
      { table: "lotes", column: "foto" },
      { table: "descartes", column: "foto" },
      { table: "despachos", column: "foto_acta" },
    ] as const;
    const fotos: string[] = [];
    for (const { table, column } of fotoColumns) {
      const { data } = await db.from(table).select(column).not(column, "is", null);
      for (const row of data ?? []) {
        const url = (row as Record<string, string | null>)[column];
        if (url) fotos.push(url);
      }
    }

    for (const { table, column } of RESET_TABLES) {
      const { count, error } = await db
        .from(table)
        .delete({ count: "exact" })
        .not(column, "is", null);
      if (error) throw error;
      deleted[table] = count ?? 0;
    }

    const { count: counterCount, error: counterError } = await db
      .from("contadores")
      .delete({ count: "exact" })
      .not("tipo", "is", null);
    if (counterError) throw counterError;
    deleted.contadores = counterCount ?? 0;

    await Promise.all(fotos.map((url) => removeFoto(url)));

    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
