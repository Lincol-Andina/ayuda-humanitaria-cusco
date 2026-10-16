import { NextResponse, type NextRequest } from "next/server";

const PROTECTED: { prefix: string; roles: string[] }[] = [
  { prefix: "/inspeccion", roles: ["inspeccion", "admin"] },
  { prefix: "/inventario", roles: ["inventario", "admin"] },
  { prefix: "/despacho", roles: ["despacho", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];

const SESSION_COOKIE = "donacion_session";

function base64urlToBytes(input: string): Uint8Array<ArrayBuffer> {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const buffer = new ArrayBuffer(bin.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verifySession(token: string): Promise<{ r: string; exp: number } | null> {
  if (!token || !token.includes(".")) return null;
  const [b64, sigB64] = token.split(".");
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 16) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlToBytes(sigB64),
      enc.encode(b64),
    );
    if (!ok) return null;
    const json = new TextDecoder().decode(base64urlToBytes(b64));
    const payload = JSON.parse(json);
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { r: payload.r, exp: payload.exp };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rule = PROTECTED.find((p) => pathname === p.prefix || pathname.startsWith(p.prefix + "/"));
  if (!rule) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value || "";
  const session = await verifySession(token);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!rule.roles.includes(session.r)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/inspeccion/:path*", "/inventario/:path*", "/despacho/:path*", "/admin/:path*"],
};
