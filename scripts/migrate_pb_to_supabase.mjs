#!/usr/bin/env node
// Migra los datos de PocketBase local (pb_data) a Supabase (Postgres + Storage).
// Uso:
//   1) Levantar PocketBase local:  npm run pb:serve   (terminal 1)
//   2) Definir credenciales en .env.local (NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)
//   3) Ejecutar: npm run db:migrate                   (terminal 2)
// Opciones: --force  borra datos existentes en Supabase antes de migrar.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import PocketBase from "pocketbase";
import { createClient } from "@supabase/supabase-js";

const FORCE = process.argv.includes("--force");
const BUCKET = "evidencias";

loadDotEnv(path.join(process.cwd(), ".env.local"));
loadDotEnv(path.join(process.cwd(), ".env"));

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const PB_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@donacion.local";
const PB_PASSWORD = process.env.PB_ADMIN_PASSWORD || "CambiaEsto123456";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MIMES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function extFromName(name) {
  const ext = path.extname(name || "").replace(".", "").toLowerCase();
  return MIMES[ext] ? ext : "jpg";
}

// PocketBase puede devolver "" en created/updated; si van vacíos se omiten
// para que Postgres aplique el DEFAULT now() (columnas NOT NULL).
function dates(source) {
  const result = {};
  if (source.created) result.created = source.created;
  if (source.updated) result.updated = source.updated;
  return result;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    fail(
      "Faltan credenciales de Supabase. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local",
    );
  }

  const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  // ---- Guardar contra migraciones duplicadas ----
  const { count: existingLotes } = await db
    .from("lotes")
    .select("id", { count: "exact", head: true });
  if ((existingLotes ?? 0) > 0 && !FORCE) {
    fail(
      `Supabase ya tiene ${existingLotes} lotes. Usa --force para borrar los datos actuales y migrar de nuevo (borra lotes, descartes, despachos, metas y contadores).`,
    );
  }
  if (FORCE) {
    console.log("→ --force: borrando datos existentes en Supabase…");
    const deleteFilter = {
      despacho_lotes: "despacho_id",
      despachos: "id",
      lotes: "id",
      descartes: "id",
      metas: "id",
      contadores: "tipo",
    };
    for (const [table, column] of Object.entries(deleteFilter)) {
      const { error } = await db.from(table).delete().not(column, "is", null);
      if (error) fail(`No se pudo vaciar ${table}: ${error.message}`);
    }
  }

  // ---- Conectar a PocketBase local ----
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  try {
    await pb.collection("_superusers").authWithPassword(PB_EMAIL, PB_PASSWORD);
  } catch {
    fail(
      `No se pudo conectar a PocketBase en ${PB_URL}. Levántalo con "npm run pb:serve" y verifica PB_ADMIN_EMAIL/PB_ADMIN_PASSWORD.`,
    );
  }
  console.log(`✓ PocketBase local conectada (${PB_URL})`);
  console.log(`✓ Supabase conectada (${SUPABASE_URL})\n`);

  const counters = await pb.collection("contadores").getFullList();
  const lotes = await pb.collection("lotes").getFullList();
  const descartes = await pb.collection("descartes").getFullList();
  const despachos = await pb.collection("despachos").getFullList();
  const metas = await pb.collection("metas").getFullList();

  // ---- Contadores (la numeración continúa donde quedó) ----
  if (counters.length > 0) {
    const rows = counters.map((c) => ({ tipo: c.tipo, ultimo: Number(c.ultimo ?? 0) }));
    const { error } = await db.from("contadores").upsert(rows, { onConflict: "tipo" });
    if (error) fail(`Error al migrar contadores: ${error.message}`);
  }
  console.log(`✓ contadores: ${counters.length}`);

  // ---- Subir foto a Supabase Storage ----
  async function uploadPhoto(record, filename, folder, label) {
    if (!filename) return null;
    try {
      const url = pb.files.getURL(record, filename);
      const res = await fetch(url, { headers: { Authorization: pb.authStore.token } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const ext = extFromName(filename);
      const objectPath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error } = await db.storage
        .from(BUCKET)
        .upload(objectPath, buffer, { contentType: MIMES[ext], upsert: false });
      if (error) throw new Error(error.message);
      const { data } = db.storage.from(BUCKET).getPublicUrl(objectPath);
      return data.publicUrl;
    } catch (error) {
      console.warn(`  ⚠ foto de ${label} (${filename}) no se pudo migrar: ${error.message}`);
      return null;
    }
  }

  // ---- Lotes ----
  const loteIdMap = new Map();
  let fotosLotes = 0;
  for (const l of lotes) {
    const foto = await uploadPhoto(l, l.foto, "lotes", l.codigo);
    if (foto) fotosLotes++;
    const { data, error } = await db
      .from("lotes")
      .insert({
        codigo: l.codigo,
        producto: l.producto,
        categoria: l.categoria || null,
        cantidad: l.cantidad === null || l.cantidad === undefined ? null : Number(l.cantidad),
        peso_kg: l.peso_kg === null || l.peso_kg === undefined ? null : Number(l.peso_kg),
        fecha_vencimiento: l.fecha_vencimiento || null,
        inspector: l.inspector || null,
        estado: l.estado || "EN ALMACEN",
        empaque_integro: Boolean(l.empaque_integro),
        fecha_visible: Boolean(l.fecha_visible),
        sin_humedad: Boolean(l.sin_humedad),
        observaciones: l.observaciones || null,
        foto,
        ...dates(l),
      })
      .select("id")
      .single();
    if (error) fail(`Error al migrar lote ${l.codigo}: ${error.message}`);
    loteIdMap.set(l.id, data.id);
  }
  console.log(`✓ lotes: ${lotes.length} (${fotosLotes} fotos)`);

  // ---- Descartes ----
  let fotosDescartes = 0;
  for (const d of descartes) {
    const foto = await uploadPhoto(d, d.foto, "descartes", d.codigo);
    if (foto) fotosDescartes++;
    const { error } = await db.from("descartes").insert({
      codigo: d.codigo,
      producto: d.producto,
      categoria: d.categoria || null,
      cantidad: d.cantidad === null || d.cantidad === undefined ? null : Number(d.cantidad),
      peso_kg: d.peso_kg === null || d.peso_kg === undefined ? null : Number(d.peso_kg),
      motivo: d.motivo || "(sin motivo)",
      inspector: d.inspector || null,
      foto,
      ...dates(d),
    });
    if (error) fail(`Error al migrar descarte ${d.codigo}: ${error.message}`);
  }
  console.log(`✓ descartes: ${descartes.length} (${fotosDescartes} fotos)`);

  // ---- Despachos + relación con lotes ----
  let fotosDespachos = 0;
  for (const d of despachos) {
    const fotoActa = await uploadPhoto(d, d.foto_acta, "despachos", d.folio);
    if (fotoActa) fotosDespachos++;
    const { data, error } = await db
      .from("despachos")
      .insert({
        folio: d.folio,
        destino: d.destino,
        responsable: d.responsable || null,
        fecha: d.fecha || null,
        observaciones: d.observaciones || null,
        foto_acta: fotoActa,
        ...dates(d),
      })
      .select("id")
      .single();
    if (error) fail(`Error al migrar despacho ${d.folio}: ${error.message}`);

    const loteIds = Array.isArray(d.lotes) ? d.lotes : [];
    const pairs = loteIds
      .map((oldId) => ({ despacho_id: data.id, lote_id: loteIdMap.get(oldId) }))
      .filter((p) => p.lote_id);
    if (pairs.length > 0) {
      const { error: relError } = await db.from("despacho_lotes").insert(pairs);
      if (relError) fail(`Error al migrar relación del despacho ${d.folio}: ${relError.message}`);
    }
  }
  console.log(`✓ despachos: ${despachos.length} (${fotosDespachos} actas)`);

  // ---- Metas (o seed por defecto) ----
  if (metas.length > 0) {
    const rows = metas.map((m) => ({
      nombre: m.nombre,
      categoria: m.categoria || null,
      unidad: m.unidad || null,
      tipo: m.tipo || "manual",
      valor_meta: Number(m.valor_meta ?? 0),
      valor_actual: Number(m.valor_actual ?? 0),
      ...dates(m),
    }));
    const { error } = await db.from("metas").insert(rows);
    if (error) fail(`Error al migrar metas: ${error.message}`);
    console.log(`✓ metas: ${metas.length}`);
  } else {
    const { error } = await db.from("metas").insert([
      { nombre: "Kilos recolectados", categoria: "General", unidad: "kg", tipo: "auto_kg", valor_meta: 500, valor_actual: 0 },
      { nombre: "Unidades en almacén", categoria: "General", unidad: "unid", tipo: "auto_unidades", valor_meta: 1500, valor_actual: 0 },
      { nombre: "Lotes aprobados", categoria: "General", unidad: "lotes", tipo: "auto_lotes", valor_meta: 100, valor_actual: 0 },
      { nombre: "Agua (botellas)", categoria: "Agua", unidad: "unid", tipo: "manual", valor_meta: 800, valor_actual: 0 },
    ]);
    if (error) fail(`Error al sembrar metas por defecto: ${error.message}`);
    console.log("✓ metas: 4 (semilla por defecto, PocketBase no tenía metas)");
  }

  console.log("\n✔ Migración completada con éxito.");
  process.exit(0);
}

await main();
