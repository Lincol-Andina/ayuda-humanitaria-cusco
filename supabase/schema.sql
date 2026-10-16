-- ============================================================
-- web-donacion — Esquema para Supabase (Postgres)
-- Ejecutar completo en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ---------- Tabla de contadores (correlativos LOTE-001, etc.) ----------
create table if not exists contadores (
  tipo   text primary key,
  ultimo integer not null default 0
);

-- ---------- Lotes ----------
create table if not exists lotes (
  id                uuid primary key default gen_random_uuid(),
  codigo            text not null,
  producto          text not null,
  categoria         text,
  cantidad          integer,
  peso_kg           numeric,
  fecha_vencimiento text,
  inspector         text,
  estado            text not null default 'EN ALMACEN',
  empaque_integro   boolean not null default false,
  fecha_visible     boolean not null default false,
  sin_humedad       boolean not null default false,
  observaciones     text,
  foto              text, -- URL pública en Supabase Storage
  created           timestamptz not null default now(),
  updated           timestamptz not null default now()
);

-- ---------- Descartes ----------
create table if not exists descartes (
  id        uuid primary key default gen_random_uuid(),
  codigo    text not null,
  producto  text not null,
  categoria text,
  cantidad  integer,
  peso_kg   numeric,
  motivo    text not null,
  inspector text,
  foto      text, -- URL pública
  created   timestamptz not null default now(),
  updated   timestamptz not null default now()
);

-- ---------- Despachos ----------
create table if not exists despachos (
  id            uuid primary key default gen_random_uuid(),
  folio         text not null,
  destino       text not null,
  responsable   text,
  fecha         text,
  observaciones text,
  foto_acta     text, -- URL pública
  created       timestamptz not null default now(),
  updated       timestamptz not null default now()
);

-- Relación muchos-a-muchos despacho <-> lote
create table if not exists despacho_lotes (
  despacho_id uuid not null references despachos (id) on delete cascade,
  lote_id     uuid not null references lotes (id) on delete cascade,
  primary key (despacho_id, lote_id)
);

-- ---------- Metas ----------
create table if not exists metas (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  categoria    text,
  unidad       text,
  tipo         text not null default 'manual',
  valor_meta   numeric not null default 0,
  valor_actual numeric not null default 0,
  created      timestamptz not null default now(),
  updated      timestamptz not null default now()
);

-- ---------- Índices ----------
create index if not exists idx_lotes_created       on lotes (created desc);
create index if not exists idx_descartes_created   on descartes (created desc);
create index if not exists idx_despachos_created   on despachos (created desc);
create index if not exists idx_metas_created       on metas (created asc);
create index if not exists idx_despacho_lotes_lote on despacho_lotes (lote_id);

-- ---------- Función atómica de correlativos ----------
-- Reemplaza nextCode()+withLock de PocketBase: genera LOTE-001, DESC-001, DESPACHO-001...
create or replace function next_code(p_tipo text, p_prefix text, p_pad integer default 3)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  insert into contadores (tipo, ultimo)
  values (p_tipo, 1)
  on conflict (tipo) do update set ultimo = contadores.ultimo + 1
  returning ultimo into n;
  return p_prefix || '-' || lpad(n::text, p_pad, '0');
end;
$$;

-- ---------- RLS: activado sin políticas públicas ----------
-- Solo el servidor (service_role) accede; el navegador nunca toca la BD.
alter table contadores       enable row level security;
alter table lotes            enable row level security;
alter table descartes        enable row level security;
alter table despachos        enable row level security;
alter table despacho_lotes   enable row level security;
alter table metas            enable row level security;

-- ---------- Storage: bucket público para evidencias ----------
insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', true)
on conflict (id) do nothing;

-- Usuarios para autenticaci�n con cookie firmada
create table if not exists usuarios (
  id            uuid primary key default gen_random_uuid(),
  usuario       text unique not null,
  password_hash text not null,
  rol           text not null check (rol in ('admin','inspeccion','inventario','despacho')),
  nombre        text,
  activo        boolean not null default true,
  created       timestamptz not null default now()
);
alter table usuarios enable row level security;
