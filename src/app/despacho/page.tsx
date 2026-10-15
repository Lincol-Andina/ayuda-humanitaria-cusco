"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileImage,
  PackageCheck,
  Truck,
  User,
} from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import type { Despacho, Lote } from "@/lib/types";
import { ESTADO_LABEL } from "@/lib/constants";
import { createDespacho } from "@/lib/api-client";
import { formatDate, formatDateTime, formatKg, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, Spinner } from "@/components/ui/EmptyState";
import { PhotoPicker, type PhotoValue } from "@/components/inspeccion/PhotoPicker";

export default function DespachoPage() {
  const lotes = useCollection<Lote>("lotes");
  const despachos = useCollection<Despacho>("despachos");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [destino, setDestino] = useState("");
  const [responsable, setResponsable] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [observaciones, setObservaciones] = useState("");
  const [photo, setPhoto] = useState<PhotoValue>({ file: null, preview: null });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<
    { tone: "success" | "error"; message: string } | null
  >(null);

  const disponibles = useMemo(
    () => lotes.records.filter((l) => l.estado === "EN ALMACEN"),
    [lotes.records],
  );

  const selected = useMemo(
    () => disponibles.filter((l) => selectedIds.includes(l.id)),
    [disponibles, selectedIds],
  );

  const totalKg = selected.reduce((sum, l) => sum + (Number(l.peso_kg) || 0), 0);
  const totalUnidades = selected.reduce(
    (sum, l) => sum + (Number(l.cantidad) || 0),
    0,
  );

  const canSubmit =
    selectedIds.length > 0 &&
    destino.trim() !== "" &&
    responsable.trim() !== "" &&
    fecha !== "" &&
    photo.file !== null &&
    !busy;

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    setBusy(true);
    setFeedback(null);
    try {
      const data = new FormData();
      data.append("destino", destino.trim());
      data.append("responsable", responsable.trim());
      data.append("fecha", fecha);
      data.append("observaciones", observaciones.trim());
      data.append("lotes", JSON.stringify(selectedIds));
      if (photo.file) data.append("foto_acta", photo.file);

      const despacho = await createDespacho(data);
      setFeedback({
        tone: "success",
        message: `Folio ${despacho.folio} generado. ${selectedIds.length} lote(s) marcados como ENTREGADO.`,
      });
      setSelectedIds([]);
      setDestino("");
      setResponsable("");
      setObservaciones("");
      setPhoto({ file: null, preview: null });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Error al despachar",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Despacho y Entrega"
        description="Célula 4 — Generación de folio de despacho, registro de destino y acta firmada por el receptor."
        badge={<Badge tone="brand">Célula 4</Badge>}
      />

      {feedback ? (
        <div className="mb-4">
          <Alert tone={feedback.tone}>{feedback.message}</Alert>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader
              title="Lotes disponibles en almacén"
              subtitle={`${disponibles.length} lotes listos para despacho`}
              icon={<PackageCheck className="h-4 w-4" />}
            />
            <CardBody className="p-0">
              {lotes.loading ? (
                <div className="flex items-center gap-2 px-5 py-10 text-sm text-slate-500">
                  <Spinner /> Cargando lotes…
                </div>
              ) : disponibles.length === 0 ? (
                <EmptyState
                  title="No hay lotes en almacén"
                  description="Los lotes aprobados aparecerán aquí para su despacho."
                  icon={<PackageCheck className="h-5 w-5" />}
                />
              ) : (
                <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
                  {disponibles.map((lote) => {
                    const active = selectedIds.includes(lote.id);
                    return (
                      <li key={lote.id}>
                        <button
                          type="button"
                          onClick={() => toggle(lote.id)}
                          className={
                            "flex w-full items-center gap-3 px-5 py-3 text-left transition-colors " +
                            (active ? "bg-brand-50/60" : "hover:bg-slate-50")
                          }
                        >
                          <span
                            className={
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded border " +
                              (active
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-slate-300 bg-white")
                            }
                          >
                            {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-brand-700">
                                {lote.codigo}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {lote.categoria}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-800">
                              {lote.producto}
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p>{formatNumber(lote.cantidad)} unid</p>
                            <p>{formatKg(lote.peso_kg)}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Datos de entrega"
              subtitle="Generación de folio DESPACHO-XXX"
              icon={<Truck className="h-4 w-4" />}
            />
            <CardBody className="space-y-4">
              <Field label="Destino / Institución" htmlFor="destino" required>
                <Input
                  id="destino"
                  placeholder="Ej. Compañía de Bomberos Cusco"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                />
              </Field>
              <Field label="Responsable receptor" htmlFor="responsable" required>
                <Input
                  id="responsable"
                  placeholder="Nombre del receptor"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                />
              </Field>
              <Field label="Fecha de entrega" htmlFor="fecha" required>
                <Input
                  id="fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </Field>
              <Field label="Observaciones">
                <Textarea
                  placeholder="Notas del despacho (opcional)"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </Field>

              <PhotoPicker
                required
                label="Foto del acta firmada por el receptor"
                onReady={setPhoto}
              />

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Lotes seleccionados</span>
                  <span className="font-semibold text-slate-800">
                    {selectedIds.length}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-slate-500">Unidades</span>
                  <span className="font-semibold text-slate-800">
                    {formatNumber(totalUnidades)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-slate-500">Peso total</span>
                  <span className="font-semibold text-slate-800">
                    {formatKg(totalKg)}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                icon={<Truck className="h-4 w-4" />}
                className="w-full"
              >
                {busy ? "Generando folio…" : "Registrar despacho"}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Despachos registrados"
          subtitle={`${despachos.records.length} folios en tiempo real`}
          icon={<FileImage className="h-4 w-4" />}
        />
        <CardBody className="p-0">
          {despachos.records.length === 0 ? (
            <EmptyState
              title="Sin despachos registrados"
              description="Cada entrega generará un folio con su acta firmada."
              icon={<Truck className="h-5 w-5" />}
            />
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {despachos.records.map((despacho) => (
                <div
                  key={despacho.id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  {despacho.foto_acta ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={despacho.foto_acta}
                      alt={`Acta ${despacho.folio}`}
                      className="h-32 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-slate-50 text-xs text-slate-400">
                      Sin acta
                    </div>
                  )}
                  <div className="space-y-1.5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-brand-700">
                        {despacho.folio}
                      </span>
                      <Badge tone="info">
                        {despacho.lotes?.length ?? 0} lote(s)
                      </Badge>
                    </div>
                    <p className="flex items-center gap-1 text-sm font-medium text-slate-800">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {despacho.destino}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-500">
                      <User className="h-3 w-3" /> {despacho.responsable || "—"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(despacho.fecha)} · registrado{" "}
                      {formatDateTime(despacho.created)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="mt-4 text-[11px] text-slate-400">
        Los lotes despachados cambian automáticamente a{" "}
        {ESTADO_LABEL.ENTREGADO} para todos los usuarios conectados.
      </div>
    </div>
  );
}
