import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
// import { getAdminDb } from "@/lib/db";

export type UserRole = "admin" | "inspeccion" | "inventario" | "despacho";

export interface SessionPayload {
  u: string;
  r: UserRole;
  n?: string | null;
  exp: number;
}

const SESSION_COOKIE = "donacion_session";
const DEFAULT_TTL_SECONDS = 60 * 60 * 8; // 8h

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(input: string): Buffer {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function getSecret(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("Falta SESSION_SECRET en .env.local");
  }
  return Buffer.from(secret, "utf8");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return salt.toString("hex") + ":" + derived.toString("hex");
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [saltHex, hashHex] = stored.split(":");
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const b64 = base64url(json);
  const sig = createHmac("sha256", getSecret())
    .update(b64)
    .digest();
  return b64 + "." + base64url(sig);
}

export async function verifySession(token: string | null | undefined): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [b64, sigB64] = token.split(".");
  try {
    const expected = createHmac("sha256", getSecret())
      .update(b64)
      .digest();
    const given = base64urlDecode(sigB64);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    const json = base64urlDecode(b64).toString("utf8");
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export async function setSessionCookie(res: NextResponse, payload: SessionPayload): Promise<NextResponse> {
  const token = await signSession(payload);
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: DEFAULT_TTL_SECONDS,
  });
  return res;
}

export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return res;
}

export interface AuthError {
  status: number;
  message: string;
}

export async function requireRole(req: NextRequest, roles: UserRole[]): Promise<SessionPayload | NextResponse> {
  const s = await getSessionFromRequest(req);
  if (!s) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!roles.includes(s.r)) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  return s;
}
