"use client";

import { useMemo, useState } from "react";
import { Eye, PackageSearch, Search } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import type { Lote } from "@/lib/types";
import {
  CATEGORIAS,
  ESTADOS,
  ESTADO_LABEL,
  type EstadoLote,
} from "@/lib/constants";
import { formatKg, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Badge, estadoTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { LoteDetail } from "@/components/inventario/LoteDetail";

export default function InventarioPage() {
  const { records, loading, error } = useCollection<Lote>("lotes");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("TODOS");
  const [categoria, setCategoria] = useState("TODAS");
  const [selected, setSelected] = useState<Lote | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((lote) => {
      const matchQuery =
        q === "" ||
        lote.codigo.toLowerCase().includes(q) ||
        lote.producto.toLowerCase().includes(q) ||
        (lote.inspector ?? "").toLowerCase().includes(q);
      const matchEstado = estado === "TODOS" || lote.estado === estado;
      const matchCategoria =
        categoria === "TODAS" || lote.categoria === categoria;
      return matchQuery && matchEstado && matchCategoria;
    });
  }, [records, query, estado, categoria]);

  const counts = useMemo(() => {
    return {
      total: records.length,
      almacen: records.filter((l) => l.estado === "EN ALMACEN").length,
      transito: records.filter((l) => l.estado === "EN TRANSITO").length,
      entregado: records.filter((l) => l.estado === "ENTREGADO").length,
    };
  }, [records]);

  const current = selected
    ? records.find((l) => l.id === selected.id) ?? selected
    : null;

  return (
    <div>
      <PageHeader
        title="Control de Lotes y Trazabilidad"
        description="Célula 2 — Inventario sincronizado en tiempo real con control manual de estados."
        badge={<Badge tone="brand">Célula 2</Badge>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total lotes", value: counts.total, tone: "neutral" as const },
          { label: "En almacén", value: counts.almacen, tone: "success" as const },
          { label: "En tránsito", value: counts.transito, tone: "warning" as const },
          { label: "Entregados", value: counts.entregado, tone: "info" as const },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-[11px] text-slate-500">{item.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Lotes aprobados"
          subtitle={`${filtered.length} de ${records.length} lotes`}
          icon={<PackageSearch className="h-4 w-4" />}
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar producto, lote…"
                  className="h-9 w-full pl-8 text-xs sm:w-52"
                />
              </div>
              <Select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="TODOS">Todos los estados</option>
                {ESTADOS.map((item) => (
                  <option key={item} value={item}>
                    {ESTADO_LABEL[item]}
                  </option>
                ))}
              </Select>
              <Select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="TODAS">Todas las categorías</option>
                {CATEGORIAS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>
          }
        />

        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center gap-2 px-5 py-10 text-sm text-slate-500">
              <Spinner /> Cargando inventario…
            </div>
          ) : error ? (
            <div className="px-5 py-10 text-sm text-rose-600">{error}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No hay lotes que coincidan"
              description="Aprueba productos desde la sección de Inspección."
              icon={<PackageSearch className="h-5 w-5" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Código</th>
                    <th className="px-5 py-3 font-medium">Producto</th>
                    <th className="px-5 py-3 font-medium">Categoría</th>
                    <th className="px-5 py-3 text-right font-medium">Cant.</th>
                    <th className="px-5 py-3 text-right font-medium">Peso</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 text-right font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((lote) => (
                    <tr
                      key={lote.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                      onClick={() => setSelected(lote)}
                    >
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-brand-700">
                        {lote.codigo}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">
                          {lote.producto}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {lote.inspector || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {lote.categoria}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700">
                        {formatNumber(lote.cantidad)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700">
                        {formatKg(lote.peso_kg)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={estadoTone(lote.estado)}>
                          {ESTADO_LABEL[lote.estado as EstadoLote] ?? lote.estado}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Eye className="h-3.5 w-3.5" />}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <LoteDetail lote={current} onClose={() => setSelected(null)} />
    </div>
  );
}
