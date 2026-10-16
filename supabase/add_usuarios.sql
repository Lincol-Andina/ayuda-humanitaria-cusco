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
