import type { Despacho, Lote, Meta } from "./types";

async function handle<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error ?? "Error de servidor");
  }
  // Avisa a todas las pantallas abiertas para que refresquen al instante.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("donacion:data-changed"));
  }
  return data as T;
}

export async function createLote(payload: FormData): Promise<Lote> {
  const response = await fetch("/api/lotes", { method: "POST", body: payload });
  return handle<Lote>(response);
}

export async function createDescarte(
  payload: FormData,
): Promise<{ codigo: string }> {
  const response = await fetch("/api/descartes", {
    method: "POST",
    body: payload,
  });
  return handle<{ codigo: string }>(response);
}

export async function updateLoteEstado(
  id: string,
  estado: string,
): Promise<Lote> {
  const response = await fetch(`/api/lotes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  return handle<Lote>(response);
}

export async function createDespacho(payload: FormData): Promise<Despacho> {
  const response = await fetch("/api/despachos", {
    method: "POST",
    body: payload,
  });
  return handle<Despacho>(response);
}

export async function updateMeta(
  id: string,
  payload: Partial<Pick<Meta, "nombre" | "valor_meta" | "valor_actual">>,
): Promise<Meta> {
  const response = await fetch(`/api/metas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<Meta>(response);
}

export async function createMeta(payload: Partial<Meta>): Promise<Meta> {
  const response = await fetch("/api/metas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<Meta>(response);
}

export async function deleteMeta(id: string): Promise<void> {
  const response = await fetch(`/api/metas/${id}`, { method: "DELETE" });
  await handle<{ ok: boolean }>(response);
}

export async function resetData(): Promise<{ ok: boolean }> {
  const response = await fetch("/api/reset", { method: "POST" });
  return handle<{ ok: boolean }>(response);
}
