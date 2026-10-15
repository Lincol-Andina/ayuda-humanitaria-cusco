export interface CsvColumn<T> {
  key: keyof T & string;
  label: string;
  format?: (value: unknown, row: T) => string;
}

function escapeValue(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[";\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildCsv<T extends object>(
  rows: T[],
  columns: CsvColumn<T>[],
): string {
  const header = columns.map((c) => escapeValue(c.label)).join(";");
  const body = rows
    .map((row) => {
      const record = row as Record<string, unknown>;
      return columns
        .map((c) =>
          escapeValue(
            c.format ? c.format(record[c.key], row) : record[c.key],
          ),
        )
        .join(";");
    })
    .join("\r\n");
  return `${header}\r\n${body}`;
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
