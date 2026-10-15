export const CATEGORIAS = [
  "Agua",
  "Alimentos no perecibles",
  "EPP",
  "Herramientas",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const ESTADOS = ["EN ALMACEN", "EN TRANSITO", "ENTREGADO"] as const;

export type EstadoLote = (typeof ESTADOS)[number];

export const ESTADO_LABEL: Record<EstadoLote, string> = {
  "EN ALMACEN": "EN ALMACÉN",
  "EN TRANSITO": "EN TRÁNSITO",
  ENTREGADO: "ENTREGADO",
};

export const CELULAS = [
  { id: "publico", nombre: "Público general", descripcion: "Consulta y transparencia" },
  { id: "celula1", nombre: "Célula 1", descripcion: "Procesos y requisitos" },
  { id: "celula2", nombre: "Célula 2", descripcion: "Inventario y trazabilidad" },
  { id: "celula3", nombre: "Célula 3", descripcion: "Control de calidad (QC)" },
  { id: "celula4", nombre: "Célula 4", descripcion: "Despacho y entrega" },
] as const;

export type CelulaId = (typeof CELULAS)[number]["id"];

export const CATEGORIA_COLORS: Record<string, string> = {
  Agua: "#0ea5e9",
  "Alimentos no perecibles": "#f59e0b",
  EPP: "#8b5cf6",
  Herramientas: "#10b981",
};

export const TIPOS_META = [
  "auto_kg",
  "auto_unidades",
  "auto_lotes",
  "manual",
] as const;

export type TipoMeta = (typeof TIPOS_META)[number];
