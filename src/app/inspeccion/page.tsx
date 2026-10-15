"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Download,
  ListChecks,
  Package,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import type { Descarte, Lote } from "@/lib/types";
import { CATEGORIAS } from "@/lib/constants";
import { createDescarte, createLote } from "@/lib/api-client";
import { buildCsv, downloadCsv } from "@/lib/csv";
import { formatDateTime, formatKg } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhotoPicker, type PhotoValue } from "@/components/inspeccion/PhotoPicker";

interface Checklist {
  empaque_integro: boolean;
  fecha_visible: boolean;
  sin_humedad: boolean;
}

const CHECKLIST_ITEMS: { key: keyof Checklist; label: string }[] = [
  { key: "empaque_integro", label: "Empaque íntegro y sin roturas" },
  { key: "fecha_visible", label: "Fecha de vencimiento visible y vigente" },
  { key: "sin_humedad", label: "Sin humedad ni contaminación" },
];

const emptyForm = {
  producto: "",
  categoria: CATEGORIAS[0] as string,
  cantidad: "",
  peso_kg: "",
  fecha_vencimiento: "",
  inspector: "",
  observaciones: "",
};

export default function InspeccionPage() {
  const descartes = useCollection<Descarte>("descartes");
  const lotes = useCollection<Lote>("lotes");

  const [form, setForm] = useState({ ...emptyForm });
  const [checklist, setChecklist] = useState<Checklist>({
    empaque_integro: false,
    fecha_visible: false,
    sin_humedad: false,
  });
  const [motivo, setMotivo] = useState("");
  const [photo, setPhoto] = useState<PhotoValue>({ file: null, preview: null });
  const [busy, setBusy] = useState<"aprobar" | "rechazar" | null>(null);
  const [feedback, setFeedback] = useState<
    { tone: "success" | "error"; message: string } | null
  >(null);

  const checklistOk = Object.values(checklist).every(Boolean);

  const baseFieldsOk = useMemo(
    () =>
      form.producto.trim() !== "" &&
      Number(form.cantidad) > 0 &&
      Number(form.peso_kg) >= 0 &&
      form.inspector.trim() !== "",
    [form],
  );

  const canApprove =
    baseFieldsOk && checklistOk && photo.file !== null && busy === null;
  const canReject =
    form.producto.trim() !== "" &&
    motivo.trim() !== "" &&
    photo.file !== null &&
    busy === null;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildBaseFormData(): FormData {
    const data = new FormData();
    data.append("producto", form.producto.trim());
    data.append("categoria", form.categoria);
    data.append("cantidad", String(Number(form.cantidad) || 0));
    data.append("peso_kg", String(Number(form.peso_kg) || 0));
    data.append("fecha_vencimiento", form.fecha_vencimiento);
    data.append("inspector", form.inspector.trim());
    data.append("observaciones", form.observaciones.trim());
    if (photo.file) data.append("foto", photo.file);
    return data;
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setChecklist({
      empaque_integro: false,
      fecha_visible: false,
      sin_humedad: false,
    });
    setMotivo("");
    setPhoto({ file: null, preview: null });
  }

  async function handleApprove() {
    setBusy("aprobar");
    setFeedback(null);
    try {
      const data = buildBaseFormData();
      data.append("empaque_integro", String(checklist.empaque_integro));
      data.append("fecha_visible", String(checklist.fecha_visible));
      data.append("sin_humedad", String(checklist.sin_humedad));
      data.append("estado", "EN ALMACEN");
      const lote = await createLote(data);
      setFeedback({
        tone: "success",
        message: `Lote ${lote.codigo} aprobado y enviado a almacén.`,
      });
      resetForm();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Error al aprobar",
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleReject() {
    setBusy("rechazar");
    setFeedback(null);
    try {
      const data = buildBaseFormData();
      data.append("motivo", motivo.trim());
      const descarte = await createDescarte(data);
      setFeedback({
        tone: "success",
        message: `Producto rechazado y registrado como ${descarte.codigo} en el Log de Descartes.`,
      });
      resetForm();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Error al rechazar",
      });
    } finally {
      setBusy(null);
    }
  }

  function exportCsv() {
    const csv = buildCsv(descartes.records, [
      { key: "codigo", label: "Código" },
      { key: "producto", label: "Producto" },
      { key: "categoria", label: "Categoría" },
      { key: "cantidad", label: "Cantidad" },
      { key: "peso_kg", label: "Peso (kg)" },
      { key: "motivo", label: "Motivo" },
      { key: "inspector", label: "Inspector" },
      {
        key: "created",
        label: "Fecha de registro",
        format: (value) => formatDateTime(String(value)),
      },
    ]);
    downloadCsv(`log-descartes-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div>
      <PageHeader
        title="Inspección y Control de Calidad"
        description="Células 1 y 3 — Registro de entrada, checklist físico de aceptación y dictamen (aprobar o rechazar)."
        badge={<Badge tone="brand">Células 1 y 3</Badge>}
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
              title="Formulario de entrada"
              subtitle="Datos del producto donado"
              icon={<Package className="h-4 w-4" />}
            />
            <CardBody className="space-y-4">
              <Field label="Producto" htmlFor="producto" required>
                <Input
                  id="producto"
                  placeholder="Ej. Agua embotellada 500 ml"
                  value={form.producto}
                  onChange={(e) => update("producto", e.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Categoría" htmlFor="categoria" required>
                  <Select
                    id="categoria"
                    value={form.categoria}
                    onChange={(e) => update("categoria", e.target.value)}
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Inspector" htmlFor="inspector" required>
                  <Input
                    id="inspector"
                    placeholder="Nombre y apellido"
                    value={form.inspector}
                    onChange={(e) => update("inspector", e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Cantidad (unid.)" htmlFor="cantidad" required>
                  <Input
                    id="cantidad"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={form.cantidad}
                    onChange={(e) => update("cantidad", e.target.value)}
                  />
                </Field>
                <Field label="Peso (kg)" htmlFor="peso" required>
                  <Input
                    id="peso"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={form.peso_kg}
                    onChange={(e) => update("peso_kg", e.target.value)}
                  />
                </Field>
                <Field label="Vencimiento" htmlFor="vencimiento">
                  <Input
                    id="vencimiento"
                    type="date"
                    value={form.fecha_vencimiento}
                    onChange={(e) => update("fecha_vencimiento", e.target.value)}
                  />
                </Field>
              </div>

              <PhotoPicker
                required
                label="Foto de evidencia del producto/lote"
                onReady={setPhoto}
              />

              <div>
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <ListChecks className="h-3.5 w-3.5" /> Checklist de verificación
                  física
                </span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {CHECKLIST_ITEMS.map((item) => {
                    const active = checklist[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setChecklist((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key],
                          }))
                        }
                        className={
                          "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors " +
                          (active
                            ? "border-brand-300 bg-brand-50 text-brand-800"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                        }
                      >
                        {active ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        ) : (
                          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-slate-300" />
                        )}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label="Motivo de rechazo (solo si rechaza)">
                <Textarea
                  placeholder="Ej. Producto vencido, empaque roto, presencia de humedad…"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              </Field>

              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                <Button
                  type="button"
                  onClick={handleApprove}
                  disabled={!canApprove}
                  icon={<ShieldCheck className="h-4 w-4" />}
                  className="sm:flex-1"
                >
                  {busy === "aprobar" ? "Aprobando…" : "Aprobar → Almacén"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleReject}
                  disabled={!canReject}
                  icon={<XCircle className="h-4 w-4" />}
                  className="sm:flex-1"
                >
                  {busy === "rechazar" ? "Registrando…" : "Rechazar → Descartes"}
                </Button>
              </div>
              {!checklistOk ? (
                <p className="text-[11px] text-amber-600">
                  Completa el checklist físico para habilitar la aprobación.
                </p>
              ) : null}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Log de Descartes"
              subtitle={`${descartes.records.length} registros en tiempo real`}
              icon={<ShieldAlert className="h-4 w-4" />}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportCsv}
                  disabled={descartes.records.length === 0}
                  icon={<Download className="h-3.5 w-3.5" />}
                >
                  CSV
                </Button>
              }
            />
            <CardBody className="max-h-[420px] overflow-y-auto p-0">
              {descartes.records.length === 0 ? (
                <EmptyState
                  title="Sin descartes"
                  description="Los productos rechazados aparecerán aquí."
                  icon={<ShieldAlert className="h-5 w-5" />}
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {descartes.records.map((item) => (
                    <li key={item.id} className="flex gap-3 px-5 py-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-rose-600">
                            {item.codigo}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDateTime(item.created)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-slate-800">
                          {item.producto}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.categoria} · {item.cantidad} unid ·{" "}
                          {formatKg(item.peso_kg)}
                        </p>
                        <p className="mt-1 text-[11px] text-rose-600">
                          {item.motivo}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Aprobaciones recientes"
              subtitle="Generación de lotes en tiempo real"
              icon={<ClipboardCheck className="h-4 w-4" />}
            />
            <CardBody className="p-0">
              {lotes.records.length === 0 ? (
                <EmptyState
                  title="Sin lotes aprobados"
                  description="Aprueba un producto para generar un LOTE-XXX."
                  icon={<ClipboardCheck className="h-5 w-5" />}
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {lotes.records.slice(0, 6).map((lote) => (
                    <li
                      key={lote.id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div>
                        <span className="font-mono text-xs font-semibold text-brand-700">
                          {lote.codigo}
                        </span>
                        <p className="text-sm text-slate-800">
                          {lote.producto}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {lote.categoria} · {lote.cantidad} unid
                        </p>
                      </div>
                      <Badge tone="success">
                        <CheckCircle2 className="h-3 w-3" /> OK
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
