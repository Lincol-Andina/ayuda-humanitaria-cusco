export interface BaseRecord {
  id: string;
  created: string;
  updated: string;
}

export interface Lote extends BaseRecord {
  codigo: string;
  producto: string;
  categoria: string;
  cantidad: number;
  peso_kg: number;
  fecha_vencimiento: string;
  inspector: string;
  estado: string;
  empaque_integro: boolean;
  fecha_visible: boolean;
  sin_humedad: boolean;
  observaciones: string;
  foto: string;
}

export interface Descarte extends BaseRecord {
  codigo: string;
  producto: string;
  categoria: string;
  cantidad: number;
  peso_kg: number;
  motivo: string;
  inspector: string;
  foto: string;
}

export interface Despacho extends BaseRecord {
  folio: string;
  destino: string;
  responsable: string;
  fecha: string;
  lotes: string[];
  foto_acta: string;
  observaciones: string;
}

export interface Meta extends BaseRecord {
  nombre: string;
  categoria: string;
  unidad: string;
  tipo: string;
  valor_meta: number;
  valor_actual: number;
}

export type CollectionName = "lotes" | "descartes" | "despachos" | "metas";
