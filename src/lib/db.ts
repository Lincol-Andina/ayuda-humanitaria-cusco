import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "evidencias";
const MAX_FOTO_BYTES = 6 * 1024 * 1024; // 6 MB (igual que PocketBase)
const FOTO_MIMES = ["image/jpeg", "image/png", "image/webp"];

let client: SupabaseClient | null = null;

export function getAdminDb(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan credenciales de Supabase. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local",
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export async function nextCode(
  tipo: string,
  prefix: string,
  pad = 3,
): Promise<string> {
  const db = getAdminDb();
  const { data, error } = await db.rpc("next_code", {
    p_tipo: tipo,
    p_prefix: prefix,
    p_pad: pad,
  });
  if (error) throw error;
  return data as string;
}

export async function uploadFoto(file: File, folder: string): Promise<string> {
  if (!FOTO_MIMES.includes(file.type)) {
    throw new Error("Formato de imagen no permitido (usa JPEG, PNG o WebP)");
  }
  if (file.size > MAX_FOTO_BYTES) {
    throw new Error("La imagen supera el máximo de 6 MB");
  }
  const db = getAdminDb();
  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const objectPath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await db.storage
    .from(BUCKET)
    .upload(objectPath, bytes, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = db.storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function removeFoto(url: string | null | undefined): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const index = url?.indexOf(marker) ?? -1;
  if (index === -1) return;
  const objectPath = url!.slice(index + marker.length);
  if (!objectPath) return;
  try {
    await getAdminDb().storage.from(BUCKET).remove([objectPath]);
  } catch {
    // El borrado de la foto no debe romper el flujo principal.
  }
}

export function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim() !== "") return message;
  }
  return "Ocurrió un error inesperado";
}
