"use client";

import { useState } from "react";
import {
  KeyRound,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Target,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import type { Meta } from "@/lib/types";
import { TIPOS_META } from "@/lib/constants";
import { createMeta, deleteMeta, resetData, updateMeta } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const TIPO_LABEL: Record<string, string> = {
  auto_kg: "Automática: kilos",
  auto_unidades: "Automática: unidades",
  auto_lotes: "Automática: n.° lotes",
  manual: "Manual",
};

export default function AdminPage() {
  const metas = useCollection<Meta>("metas", { sort: "created" });
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<
    { tone: "success" | "error"; text: string } | null
  >(null);
  const [resetting, setResetting] = useState(false);

  const [nueva, setNueva] = useState({
    nombre: "",
    unidad: "unidades",
    tipo: "manual",
    valor_meta: "",
    valor_actual: "",
  });

  async function handleUnlock() {
    setChecking(true);
    setAuthError(null);
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!response.ok) {
        setAuthError("PIN incorrecto");
        return;
      }
      setUnlocked(true);
    } catch {
      setAuthError("No se pudo verificar el PIN");
    } finally {
      setChecking(false);
    }
  }

  async function handleReset() {
    if (
      !window.confirm(
        "Se eliminarán TODOS los lotes, descartes y despachos, y se reiniciarán los códigos. ¿Continuar?",
      )
    ) {
      return;
    }
    setResetting(true);
    setMessage(null);
    try {
      await resetData(pin);
      setMessage({ tone: "success", text: "Datos de prueba reiniciados correctamente." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Error al reiniciar",
      });
    } finally {
      setResetting(false);
    }
  }

  async function handleAddMeta() {
    setMessage(null);
    try {
      await createMeta({
        pin,
        nombre: nueva.nombre.trim() || "Nueva meta",
        unidad: nueva.unidad.trim(),
        tipo: nueva.tipo,
        valor_meta: Number(nueva.valor_meta) || 0,
        valor_actual: Number(nueva.valor_actual) || 0,
      });
      setNueva({
        nombre: "",
        unidad: "unidades",
        tipo: "manual",
        valor_meta: "",
        valor_actual: "",
      });
      setMessage({ tone: "success", text: "Meta agregada." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Error al agregar meta",
      });
    }
  }

  if (!unlocked) {
    return (
      <div>
        <PageHeader
          title="Administración"
          description="Acceso restringido para tareas de mantenimiento y limpieza de datos."
        />
        <Card className="mx-auto max-w-md">
          <CardBody className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Lock className="h-5 w-5" />
              </span>
              <h2 className="text-sm font-semibold text-slate-800">
                Ingresa el PIN de administración
              </h2>
              <p className="text-xs text-slate-500">
                Configurado por defecto como <code>1234</code> en el archivo
                .env.local.
              </p>
            </div>
            {authError ? <Alert tone="error">{authError}</Alert> : null}
            <Field label="PIN" htmlFor="pin">
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleUnlock();
                }}
                placeholder="••••"
              />
            </Field>
            <Button
              type="button"
              onClick={handleUnlock}
              disabled={checking || pin.trim() === ""}
              icon={<KeyRound className="h-4 w-4" />}
              className="w-full"
            >
              {checking ? "Verificando…" : "Ingresar"}
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Administración"
        description="Limpieza centralizada de datos de prueba y gestión de metas de la campaña."
        badge={<Badge tone="warning">Panel restringido</Badge>}
      />

      {message ? (
        <div className="mb-4">
          <Alert tone={message.tone}>{message.text}</Alert>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader
            title="Limpieza de datos"
            subtitle="Reinicia la información de prueba"
            icon={<RotateCcw className="h-4 w-4" />}
          />
          <CardBody className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Elimina todos los lotes, descartes y despachos, y reinicia la
                numeración de códigos (LOTE-001, DESC-001, DESPACHO-001).
              </span>
            </div>
            <Button
              type="button"
              variant="danger"
              onClick={handleReset}
              disabled={resetting}
              icon={<Trash2 className="h-4 w-4" />}
              className="w-full"
            >
              {resetting ? "Reiniciando…" : "Reiniciar datos de prueba"}
            </Button>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Metas de la campaña"
            subtitle="Edita el objetivo y el avance mostrado en el panel público"
            icon={<Target className="h-4 w-4" />}
          />
          <CardBody className="space-y-4">
            {metas.records.length === 0 ? (
              <EmptyState
                title="Sin metas configuradas"
                description="Agrega la primera meta de la campaña."
                icon={<Target className="h-5 w-5" />}
              />
            ) : (
              <div className="space-y-3">
                {metas.records.map((meta) => (
                  <MetaRow
                    key={meta.id}
                    meta={meta}
                    pin={pin}
                    onMessage={setMessage}
                  />
                ))}
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="mb-3 text-xs font-semibold text-slate-700">
                Agregar meta
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre">
                  <Input
                    value={nueva.nombre}
                    onChange={(e) =>
                      setNueva((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                    placeholder="Ej. Kilos recolectados"
                  />
                </Field>
                <Field label="Unidad">
                  <Input
                    value={nueva.unidad}
                    onChange={(e) =>
                      setNueva((prev) => ({ ...prev, unidad: e.target.value }))
                    }
                    placeholder="Ej. kg"
                  />
                </Field>
                <Field label="Tipo de cálculo">
                  <Select
                    value={nueva.tipo}
                    onChange={(e) =>
                      setNueva((prev) => ({ ...prev, tipo: e.target.value }))
                    }
                  >
                    {TIPOS_META.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {TIPO_LABEL[tipo]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Valor objetivo">
                  <Input
                    type="number"
                    value={nueva.valor_meta}
                    onChange={(e) =>
                      setNueva((prev) => ({
                        ...prev,
                        valor_meta: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </Field>
                {nueva.tipo === "manual" ? (
                  <Field label="Valor actual">
                    <Input
                      type="number"
                      value={nueva.valor_actual}
                      onChange={(e) =>
                        setNueva((prev) => ({
                          ...prev,
                          valor_actual: e.target.value,
                        }))
                      }
                      placeholder="0"
                    />
                  </Field>
                ) : null}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddMeta}
                disabled={nueva.nombre.trim() === ""}
                icon={<Plus className="h-3.5 w-3.5" />}
                className="mt-3"
              >
                Agregar meta
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function MetaRow({
  meta,
  pin,
  onMessage,
}: {
  meta: Meta;
  pin: string;
  onMessage: (value: { tone: "success" | "error"; text: string } | null) => void;
}) {
  const [nombre, setNombre] = useState(meta.nombre);
  const [valorMeta, setValorMeta] = useState(String(meta.valor_meta));
  const [valorActual, setValorActual] = useState(String(meta.valor_actual));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const auto = meta.tipo !== "manual";

  async function save() {
    setSaving(true);
    onMessage(null);
    try {
      await updateMeta(meta.id, {
        pin,
        nombre: nombre.trim(),
        valor_meta: Number(valorMeta) || 0,
        valor_actual: Number(valorActual) || 0,
      });
      onMessage({ tone: "success", text: `Meta "${nombre}" actualizada.` });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`¿Eliminar la meta "${meta.nombre}"?`)) return;
    setDeleting(true);
    onMessage(null);
    try {
      await deleteMeta(meta.id, pin);
      onMessage({ tone: "success", text: "Meta eliminada." });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Error al eliminar",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_auto]">
      <div className="space-y-2">
        <Field label="Nombre">
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="h-9 text-xs"
          />
        </Field>
        <Badge tone={auto ? "info" : "neutral"}>
          {TIPO_LABEL[meta.tipo] ?? meta.tipo} · {meta.unidad}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Objetivo">
          <Input
            type="number"
            value={valorMeta}
            onChange={(e) => setValorMeta(e.target.value)}
            className="h-9 text-xs"
          />
        </Field>
        <Field label={auto ? "Actual (auto)" : "Actual"}>
          <Input
            type="number"
            value={valorActual}
            onChange={(e) => setValorActual(e.target.value)}
            disabled={auto}
            className="h-9 text-xs"
          />
        </Field>
        {auto ? (
          <p className="col-span-2 -mt-1 text-[10px] text-slate-400">
            El valor actual se calcula automáticamente ({formatNumber(meta.valor_actual)}).
          </p>
        ) : null}
      </div>
      <div className="flex items-start gap-2 sm:flex-col">
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={saving}
          icon={<Save className="h-3.5 w-3.5" />}
          className="flex-1 sm:flex-none"
        >
          Guardar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={remove}
          disabled={deleting}
          icon={<Trash2 className="h-3.5 w-3.5" />}
          className="flex-1 sm:flex-none"
        >
          Borrar
        </Button>
      </div>
    </div>
  );
}
