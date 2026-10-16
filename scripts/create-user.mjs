#!/usr/bin/env node
// scripts/create-user.mjs
// Uso: node scripts/create-user.mjs <usuario> <password> <rol> [nombre]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith('#')) continue;
    const i = s.indexOf('=');
    if (i === -1) continue;
    const k = s.slice(0, i).trim();
    let v = s.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\''))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadEnv(path.join(process.cwd(), '.env.local'));
loadEnv(path.join(process.cwd(), '.env'));

const [,, usuario, password, rol, nombre] = process.argv;
if (!usuario || !password || !rol) {
  console.error('Uso: node scripts/create-user.mjs <usuario> <password> <rol> [nombre]');
  process.exit(1);
}
if (!['admin','inspeccion','inventario','despacho'].includes(rol)) {
  console.error('Rol debe ser: admin|inspeccion|inventario|despacho');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');
const password_hash = salt + ':' + hash;

const db = createClient(url, key, { auth: { persistSession: false } });
const { error } = await db.from('usuarios').upsert({ usuario, password_hash, rol, nombre, activo: true }, { onConflict: 'usuario' });
if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
console.log('OK usuario=', usuario, 'rol=', rol);
