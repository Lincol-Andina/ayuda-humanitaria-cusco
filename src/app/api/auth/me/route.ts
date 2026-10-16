import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true, usuario: s.u, rol: s.r, nombre: s.n });
}
