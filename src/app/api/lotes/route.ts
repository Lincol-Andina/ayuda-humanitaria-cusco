import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb, nextCode, uploadFoto, errorMessage } from "@/lib/db";
import { str, num, bool } from "@/lib/api-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getAdminDb();
    const { data, error } = await db
      .from("lotes")
      .select("*")
      .order("created", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    const codigo = await nextCode("lote", "LOTE");
    const fotoFile = form.get("foto");
    const foto =
      fotoFile instanceof File && fotoFile.size > 0
        ? await uploadFoto(fotoFile, "lotes")
        : null;

    const db = getAdminDb();
    const { data, error } = await db
      .from("lotes")
      .insert({
        codigo,
        producto: str(form.get("producto")),
        categoria: str(form.get("categoria")) || null,
        cantidad: num(form.get("cantidad")),
        peso_kg: num(form.get("peso_kg")),
        fecha_vencimiento: str(form.get("fecha_vencimiento")) || null,
        inspector: str(form.get("inspector")) || null,
        estado: str(form.get("estado")) || "EN ALMACEN",
        empaque_integro: bool(form.get("empaque_integro")),
        fecha_visible: bool(form.get("fecha_visible")),
        sin_humedad: bool(form.get("sin_humedad")),
        observaciones: str(form.get("observaciones")) || null,
        foto,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
