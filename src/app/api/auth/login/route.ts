import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/db";
import { verifyPassword, setSessionCookie, type UserRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { usuario, password } = (await request.json()) as {
      usuario?: string;
      password?: string;
    };
    if (!usuario || !password) {
      return NextResponse.json({ error: "Usuario y contraseña son obligatorios" }, { status: 400 });
    }
    const db = getAdminDb();
    const { data, error } = await db
      .from("usuarios")
      .select("usuario, password_hash, rol, nombre, activo")
      .eq("usuario", usuario)
      .maybeSingle();
    if (error) throw error;
    if (!data || data.activo === false) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }
    if (!verifyPassword(password, data.password_hash)) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }
    const payload = {
      u: data.usuario,
      r: data.rol as UserRole,
      n: data.nombre ?? null,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    };
    let res: NextResponse = NextResponse.json({ ok: true, usuario: data.usuario, rol: data.rol, nombre: data.nombre });
    res = await setSessionCookie(res, payload);
    return res;
  } catch {
    return NextResponse.json({ error: "Error de autenticación" }, { status: 500 });
  }
}
