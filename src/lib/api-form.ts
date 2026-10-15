export function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export function num(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function bool(value: FormDataEntryValue | null): boolean {
  return value === "true";
}

export function parseLoteIds(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === "string");
    }
  } catch {
    return [];
  }
  return [];
}
