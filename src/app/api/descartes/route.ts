import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb, nextCode, uploadFoto, errorMessage } from "@/lib/db";
import { str, num } from "@/lib/api-form";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getAdminDb();
    const { data, error } = await db
      .from("descartes")
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
    const auth = await requireRole(request, ["inspeccion", "admin"]);
    if (auth instanceof NextResponse) return auth;

    const form = await request.formData();

    const codigo = await nextCode("descarte", "DESC");
    const fotoFile = form.get("foto");
    const foto =
      fotoFile instanceof File && fotoFile.size > 0
        ? await uploadFoto(fotoFile, "descartes")
        : null;

    const db = getAdminDb();
    const { data, error } = await db
      .from("descartes")
      .insert({
        codigo,
        producto: str(form.get("producto")),
        categoria: str(form.get("categoria")) || null,
        cantidad: num(form.get("cantidad")),
        peso_kg: num(form.get("peso_kg")),
        motivo: str(form.get("motivo")) || "(sin motivo)",
        inspector: str(form.get("inspector")) || null,
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
