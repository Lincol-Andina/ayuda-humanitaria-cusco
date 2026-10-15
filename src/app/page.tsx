"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Boxes,
  Droplets,
  PackageCheck,
  Target,
  TrendingDown,
  Weight,
} from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import type { Descarte, Despacho, Lote, Meta } from "@/lib/types";
import { CATEGORIAS, CATEGORIA_COLORS } from "@/lib/constants";
import { formatKg, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/kpi/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const lotes = useCollection<Lote>("lotes");
  const descartes = useCollection<Descarte>("descartes");
  const despachos = useCollection<Despacho>("despachos");
  const metas = useCollection<Meta>("metas", { sort: "created" });

  const stats = useMemo(() => {
    const totalKg = lotes.records.reduce(
      (sum, l) => sum + (Number(l.peso_kg) || 0),
      0,
    );
    const totalUnidades = lotes.records.reduce(
      (sum, l) => sum + (Number(l.cantidad) || 0),
      0,
    );
    const porCategoria = CATEGORIAS.map((categoria) => ({
      categoria,
      unidades: lotes.records
        .filter((l) => l.categoria === categoria)
        .reduce((sum, l) => sum + (Number(l.cantidad) || 0), 0),
      lotes: lotes.records.filter((l) => l.categoria === categoria).length,
      color: CATEGORIA_COLORS[categoria] ?? "#64748b",
    }));

    const activos = lotes.records.filter((l) => l.estado !== "ENTREGADO").length;
    const entregados = lotes.records.filter(
      (l) => l.estado === "ENTREGADO",
    ).length;
    const totalInspeccionados = lotes.records.length + descartes.records.length;
    const tasaDescarte =
      totalInspeccionados === 0
        ? 0
        : (descartes.records.length / totalInspeccionados) * 100;

    return {
      totalKg,
      totalUnidades,
      totalLotes: lotes.records.length,
      porCategoria,
      activos,
      entregados,
      tasaDescarte,
      despachos: despachos.records.length,
    };
  }, [lotes.records, descartes.records, despachos.records]);

  const galeria = useMemo(
    () => lotes.records.filter((l) => l.foto).slice(0, 6),
    [lotes.records],
  );

  const loading =
    lotes.loading && descartes.loading && despachos.loading && metas.loading;

  function metaActual(meta: Meta): number {
    switch (meta.tipo) {
      case "auto_kg":
        return stats.totalKg;
      case "auto_unidades":
        return stats.totalUnidades;
      case "auto_lotes":
        return stats.totalLotes;
      default:
        return Number(meta.valor_actual) || 0;
    }
  }

  return (
    <div>
      <PageHeader
        title="Panel de Transparencia"
        description="Tablero público en tiempo real con los indicadores de la campaña de ayuda humanitaria."
        badge={
          <Badge tone="brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            En vivo
          </Badge>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
          <Spinner /> Cargando indicadores…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Kilos recolectados"
              value={formatKg(stats.totalKg)}
              hint="Peso total de lotes aprobados"
              icon={Weight}
              tone="brand"
            />
            <StatCard
              label="Unidades en almacén"
              value={formatNumber(stats.totalUnidades)}
              hint={`${stats.totalLotes} lotes aprobados`}
              icon={Boxes}
              tone="sky"
            />
            <StatCard
              label="Lotes activos"
              value={formatNumber(stats.activos)}
              hint={`${stats.entregados} entregados`}
              icon={PackageCheck}
              tone="violet"
            />
            <StatCard
              label="Tasa de descarte"
              value={`${formatNumber(stats.tasaDescarte, 1)}%`}
              hint={`${descartes.records.length} descartes / ${stats.despachos} despachos`}
              icon={TrendingDown}
              tone="rose"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Unidades por categoría"
                subtitle="Distribución del inventario aprobado"
                icon={<Droplets className="h-4 w-4" />}
              />
              <CardBody>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.porCategoria}
                      margin={{ top: 8, right: 8, bottom: 8, left: -12 }}
                    >
                      <XAxis
                        dataKey="categoria"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        tickFormatter={(value: string) =>
                          value.length > 12
                            ? `${value.slice(0, 11)}…`
                            : value
                        }
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                        formatter={(value) => [
                          `${formatNumber(Number(value))} unidades`,
                          "Cantidad",
                        ]}
                      />
                      <Bar dataKey="unidades" radius={[6, 6, 0, 0]}>
                        {stats.porCategoria.map((entry) => (
                          <Cell key={entry.categoria} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Metas de la campaña"
                subtitle="Progreso editable desde administración"
                icon={<Target className="h-4 w-4" />}
              />
              <CardBody className="space-y-4">
                {metas.records.length === 0 ? (
                  <EmptyState
                    title="Sin metas configuradas"
                    description="Agrega metas desde el panel de administración."
                    icon={<Target className="h-5 w-5" />}
                  />
                ) : (
                  metas.records.map((meta) => {
                    const actual = metaActual(meta);
                    const total = Number(meta.valor_meta) || 0;
                    return (
                      <div key={meta.id}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">
                            {meta.nombre}
                          </span>
                          <span className="text-slate-500">
                            {formatNumber(actual, meta.unidad === "kg" ? 1 : 0)} /{" "}
                            {formatNumber(total)} {meta.unidad}
                          </span>
                        </div>
                        <Progress value={actual} max={total} />
                      </div>
                    );
                  })
                )}
              </CardBody>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader
              title="Galería pública de evidencias"
              subtitle="Fotos registradas por el equipo de control de calidad"
            />
            <CardBody>
              {galeria.length === 0 ? (
                <EmptyState
                  title="Aún no hay evidencias fotográficas"
                  description="Las fotos de inspección aparecerán aquí automáticamente."
                />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {galeria.map((lote) => (
                    <figure
                      key={lote.id}
                      className="overflow-hidden rounded-xl border border-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={lote.foto}
                        alt={`Evidencia ${lote.codigo}`}
                        className="h-28 w-full object-cover"
                        loading="lazy"
                      />
                      <figcaption className="bg-white px-2 py-1.5">
                        <span className="block text-[11px] font-semibold text-slate-700">
                          {lote.codigo}
                        </span>
                        <span className="block truncate text-[10px] text-slate-400">
                          {lote.producto}
                        </span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
