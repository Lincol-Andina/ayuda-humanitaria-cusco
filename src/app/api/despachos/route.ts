import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb, nextCode, uploadFoto, errorMessage } from "@/lib/db";
import { str, parseLoteIds } from "@/lib/api-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getAdminDb();
    const { data, error } = await db
      .from("despachos")
      .select("*, despacho_lotes(lote_id)")
      .order("created", { ascending: false });
    if (error) throw error;

    const rows = (data ?? []).map(
      ({ despacho_lotes, ...despacho }: {
        despacho_lotes?: { lote_id: string }[];
      } & Record<string, unknown>) => ({
        ...despacho,
        lotes: (despacho_lotes ?? []).map((rel) => rel.lote_id),
      }),
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const incoming = await request.formData();
    const loteIds = parseLoteIds(incoming.get("lotes"));

    if (loteIds.length === 0) {
      return NextResponse.json(
        { error: "Selecciona al menos un lote para despachar" },
        { status: 400 },
      );
    }

    const folio = await nextCode("despacho", "DESPACHO");
    const fotoFile = incoming.get("foto_acta");
    const fotoActa =
      fotoFile instanceof File && fotoFile.size > 0
        ? await uploadFoto(fotoFile, "despachos")
        : null;

    const db = getAdminDb();
    const { data: despacho, error } = await db
      .from("despachos")
      .insert({
        folio,
        destino: str(incoming.get("destino")),
        responsable: str(incoming.get("responsable")) || null,
        fecha: str(incoming.get("fecha")) || null,
        observaciones: str(incoming.get("observaciones")) || null,
        foto_acta: fotoActa,
      })
      .select("*")
      .single();
    if (error) throw error;

    const { error: relError } = await db
      .from("despacho_lotes")
      .insert(loteIds.map((loteId) => ({ despacho_id: despacho.id, lote_id: loteId })));
    if (relError) throw relError;

    await db
      .from("lotes")
      .update({ estado: "ENTREGADO", updated: new Date().toISOString() })
      .in("id", loteIds);

    return NextResponse.json({ ...despacho, lotes: loteIds }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
