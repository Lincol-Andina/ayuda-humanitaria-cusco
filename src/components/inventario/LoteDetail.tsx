"use client";

import { useState } from "react";
import {
  CalendarClock,
  Check,
  Package,
  ShieldCheck,
  User,
  Weight,
  X,
} from "lucide-react";
import type { Lote } from "@/lib/types";
import { ESTADOS, ESTADO_LABEL, type EstadoLote } from "@/lib/constants";
import { formatDateTime, formatKg, formatNumber } from "@/lib/utils";
import { updateLoteEstado } from "@/lib/api-client";
import { Modal } from "@/components/ui/Modal";
import { Badge, estadoTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const CHECKLIST_LABELS: { key: keyof Lote; label: string }[] = [
  { key: "empaque_integro", label: "Empaque íntegro" },
  { key: "fecha_visible", label: "Fecha visible" },
  { key: "sin_humedad", label: "Sin humedad" },
];

export function LoteDetail({
  lote,
  onClose,
}: {
  lote: Lote | null;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const changeEstado = async (estado: EstadoLote) => {
    if (!lote) return;
    setBusy(estado);
    setError(null);
    try {
      await updateLoteEstado(lote.id, estado);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setBusy(null);
    }
  };

  if (!lote) return null;

  return (
    <Modal
      open={Boolean(lote)}
      onClose={onClose}
      size="lg"
      title={`Lote ${lote.codigo}`}
      subtitle={lote.producto}
      footer={
        <Button variant="outline" onClick={onClose} icon={<X className="h-4 w-4" />}>
          Cerrar
        </Button>
      }
    >
      {error ? (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={estadoTone(lote.estado)}>
              {ESTADO_LABEL[lote.estado as EstadoLote] ?? lote.estado}
            </Badge>
            <Badge tone="neutral">{lote.categoria}</Badge>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Detail icon={Package} label="Cantidad">
              {formatNumber(lote.cantidad)} unidades
            </Detail>
            <Detail icon={Weight} label="Peso">
              {formatKg(lote.peso_kg)}
            </Detail>
            <Detail icon={CalendarClock} label="Vencimiento">
              {lote.fecha_vencimiento || "—"}
            </Detail>
            <Detail icon={User} label="Inspector">
              {lote.inspector || "—"}
            </Detail>
          </dl>

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-600">
              Checklist físico
            </p>
            <div className="flex flex-wrap gap-2">
              {CHECKLIST_LABELS.map((item) => {
                const ok = Boolean(lote[item.key]);
                return (
                  <span
                    key={item.key}
                    className={
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium " +
                      (ok
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-600")
                    }
                  >
                    {ok ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>

          {lote.observaciones ? (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-600">
                Observaciones
              </p>
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {lote.observaciones}
              </p>
            </div>
          ) : null}

          <p className="text-[11px] text-slate-400">
            Registrado: {formatDateTime(lote.created)}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5" /> Foto de evidencia
            </p>
            {lote.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lote.foto}
                alt={`Evidencia ${lote.codigo}`}
                className="w-full rounded-xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                Sin foto adjunta
              </div>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-600">
              Actualizar estado del lote
            </p>
            <div className="grid gap-2">
              {ESTADOS.map((estado) => {
                const active = lote.estado === estado;
                return (
                  <Button
                    key={estado}
                    size="sm"
                    variant={active ? "primary" : "outline"}
                    disabled={busy !== null || active}
                    onClick={() => changeEstado(estado)}
                    className="justify-start"
                  >
                    {busy === estado ? "Actualizando…" : ESTADO_LABEL[estado]}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Package;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <dt className="flex items-center gap-1 text-[11px] text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{children}</dd>
    </div>
  );
}
