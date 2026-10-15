# Ayuda Humanitaria Cusco — Sistema de Logística y Control de Calidad

Aplicación web colaborativa **en tiempo real** para la gestión logística, control de
calidad y trazabilidad de ayuda humanitaria (campaña ante incendios forestales en
Cusco). Múltiples laptops y celulares de las 4 células y el público general ven y
actualizan **la misma información al instante, sin recargar la página**.

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + `lucide-react` + `recharts`
- **Base de datos:** [Supabase](https://supabase.com) (Postgres en la nube + Storage de archivos)
- **Tiempo real:** refresco automático (polling cada 8 s + foco de pestaña + evento tras cada escritura), sin F5
- **Despliegue:** [Vercel](https://vercel.com) (frontend + API routes)

> Sin códigos QR ni impresoras: los lotes se rotulan con **códigos alfanuméricos
> cortos** (ej. `LOTE-001`, `DESC-001`, `DESPACHO-001`).

---

## 1. Requisitos

- **Node.js 20+** (probado con 24) y npm
- Cuenta gratuita en [Supabase](https://supabase.com)
- Cuenta gratuita en [Vercel](https://vercel.com) (para desplegar)
- Windows / macOS / Linux

---

## 2. Puesta en marcha

### 2.1 Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project** (guarda la contraseña de la BD).
2. Abre **SQL Editor** → pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   Esto crea las tablas `lotes`, `descartes`, `despachos`, `despacho_lotes`, `metas`,
   `contadores`, la función atómica `next_code()` y el bucket público `evidencias`.
3. En **Project Settings → API** copia el **Project URL** y la **service_role key**.

### 2.2 Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y ajusta los valores:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...      # nunca se expone al navegador
ADMIN_PIN=1234
```

> Las variables `POCKETBASE_*` / `PB_ADMIN_*` solo se usan una vez, para el script de
> migración de datos (sección 2.4).

### 2.3 Instalar dependencias e iniciar la aplicación

```powershell
npm install
npm run dev     # desarrollo  -> http://localhost:3000
# o
npm run build; npm run start   # producción
```

### 2.4 (Opcional) Migrar datos desde una instalación previa de PocketBase

Si ya usabas la versión anterior con PocketBase local:

```powershell
npm run pb:serve     # terminal 1: levanta PocketBase local
npm run db:migrate   # terminal 2: copia lotes, descartes, despachos, metas y fotos
```

El script rellena Supabase y, si PocketBase no tiene metas, siembra las 4 metas
iniciales. También copia los contadores para que la numeración continúe.

Tras migrar puedes **borrar la carpeta `pocketbase/`** (ya no es necesaria).

---

## 3. Módulos

| Ruta | Célula | Descripción |
|------|--------|-------------|
| `/` | Público | Dashboard de transparencia: KPIs en tiempo real (kg totales, unidades, lotes activos, tasa de descarte), metas con barras de progreso y galería pública de evidencias. |
| `/inspeccion` | 1 y 3 | Registro de entrada + selector de foto (con **compresión automática**), checklist físico obligatorio y dictamen **Aprobar** (genera `LOTE-XXX`) o **Rechazar** (genera `DESC-XXX` con motivo y foto). Exporta el **Log de Descartes a CSV**. |
| `/inventario` | 2 | Tabla sincronizada de lotes con modal de detalle (checklist + foto) y control de estados `EN ALMACÉN → EN TRÁNSITO → ENTREGADO`. |
| `/despacho` | 4 | Selección de lotes en almacén, registro de destino/responsable/fecha, generación de folio `DESPACHO-XXX` y foto del **acta firmada**; los lotes pasan a `ENTREGADO` para todos los usuarios. |
| `/admin` | Admin | Acceso con **PIN**, **limpieza/reset centralizado** de datos de prueba y edición de metas. |

---

## 4. Arquitectura y seguridad

- **El navegador nunca habla con la base de datos.** Todas las lecturas/escrituras
  pasan por las **API routes de Next.js**, que usan la `service_role` key en el servidor.
- Las tablas tienen **RLS activado sin políticas públicas**: solo el servidor accede.
- **Trazabilidad:** cada lote/descarte/despacho recibe un código correlativo generado
  de forma atómica en Postgres (`next_code()`).
- **Gestión de fotos:** se comprimen en el navegador (~0.8 MB, máx. 1280 px) y se suben
  al bucket **público `evidencias`** de Supabase Storage (JPEG/PNG/WebP, máx. 6 MB).
- **Reset:** el panel de administración borra lotes/descartes/despachos, elimina sus
  fotos y reinicia la numeración (las metas se conservan).

---

## 5. Estructura del proyecto

```
src/
  app/
    layout.tsx              # Layout raíz + AppShell
    page.tsx                # Dashboard público
    inspeccion/page.tsx     # Células 1 y 3
    inventario/page.tsx     # Célula 2
    despacho/page.tsx       # Célula 4
    admin/page.tsx          # Panel de administración (PIN)
    api/                    # Route handlers (Supabase + Storage, PIN, reset)
  components/
    layout/ ui/ inspeccion/ inventario/ kpi/
  hooks/
    useCollection.ts        # Carga + refresco automático (polling)
    useHealth.ts            # Estado de conexión
  lib/
    db.ts                   # Cliente Supabase (server), nextCode, uploadFoto
    api-form.ts             # Helpers de FormData
    api-client.ts           # Llamadas a las rutas /api
    compress.ts             # Compresión de imágenes
    csv.ts                  # Exportación CSV
    constants.ts, types.ts, utils.ts
supabase/
  schema.sql                # Esquema Postgres + función next_code + bucket
scripts/
  migrate_pb_to_supabase.mjs # Migración desde PocketBase local
pocketbase/                 # Solo para migrar; se puede borrar tras la migración
```

---

## 6. Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Next.js) |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run db:migrate` | Migra datos/fotos de PocketBase local a Supabase |
| `npm run pb:serve` | (Solo migración) inicia PocketBase local en `0.0.0.0:8090` |

---

## 7. Despliegue en Vercel

1. Sube el proyecto a un repositorio de GitHub (`.env.local` no se sube).
2. En Vercel: **Add New → Project** → importa el repo.
3. Añade las **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PIN`.
4. **Deploy** → la app queda en `https://<proyecto>.vercel.app`.

> Gratis: Supabase pausa el proyecto tras ~1 semana sin uso (botón **Restore**, no se
> pierden datos). Vercel duerme el backend en inactividad.

---

## 8. Solución de problemas

- **“Faltan credenciales de Supabase”** → revisa `NEXT_PUBLIC_SUPABASE_URL` y
  `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.
- **La app carga pero no hay datos / health en rojo** → confirma que ejecutaste
  `supabase/schema.sql` completo en el SQL Editor.
- **La numeración de códigos no avanza** → verifica que existe la función `next_code`
  (incluida en `schema.sql`).
- **El reset no borra las fotos** → comprueba que el bucket `evidencias` existe y es público.

## URL de producci�n

[ayuda-humanitaria-cusco.vercel.app](https://ayuda-humanitaria-cusco.vercel.app)
Desplegado en Vercel (Next.js + Supabase).
