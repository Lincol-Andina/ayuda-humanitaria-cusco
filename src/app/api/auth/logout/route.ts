import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  let res: NextResponse = NextResponse.json({ ok: true });
  res = clearSessionCookie(res);
  return res;
}
