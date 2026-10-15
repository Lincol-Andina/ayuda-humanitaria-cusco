# Manual de Usuario - Sistema de Logística y Control de Calidad
## Ayuda Humanitaria Cusco

Este documento explica, de manera clara y sencilla, cómo usar la aplicación web para registrar, controlar y despachar las donaciones de ayuda humanitaria. 

## 1. Pantalla de Inicio (Público)

Al ingresar a la aplicación, el usuario llega a la **Pantalla de Transparencia**. 

### ¿Para qué sirve?
Permite a cualquier persona visualizar, en tiempo real, el avance de la campaña sin necesidad de iniciar sesión. 

### ¿Qué se puede ver aquí?
- **Kilos recolectados:** Suma total de peso (kg) de todos los lotes aprobados.
- **Unidades en almacén:** Cantidad total de productos que aún no han sido entregados.
- **Lotes activos:** Cantidad de lotes que se encuentran en almacén o en tránsito.
- **Lotes entregados y tasa de descarte:** Muestra cuántas unidades han sido entregadas y el porcentaje de productos rechazados.
- **Gráfico por categoría:** Distribución de las donaciones según su categoría (Agua, Alimentos no perecibles, EPP y Herramientas).
- **Metas de la campaña:** Barras de progreso que muestran el avance frente a las metas establecidas.
- **Galería de evidencias:** Fotos de los lotes aprobados, visibles para todo el público.

> En la parte superior, el sistema muestra "En vivo" cuando la información se encuentra actualizada. 

---

## 2. Inspección y Control de Calidad (/inspeccion)

Esta pantalla está destinada a las **Células 1 y 3**. Aquí es donde se registra cada donación al momento de su recepción y se decide si es aceptada o rechazada. 

### Paso 1: Tomar fotografía
Antes de registrar, se debe adjuntar una **foto de la donación**. El sistema comprime la imagen automáticamente para que sea rápida de subir desde cualquier dispositivo móvil o laptop. 

### Paso 2: Llenar los datos
Se completa el siguiente formulario:
- **Producto:** Nombre de lo que se está recepcionando.
- **Categoría:** Seleccionar entre Agua, Alimentos no perecibles, EPP o Herramientas.
- **Cantidad:** Número de unidades.
- **Peso (kg):** Peso total del lote.
- **Fecha de vencimiento:** Solo si aplica (en caso de alimentos).
- **Inspector:** Nombre de la persona que realiza la inspección.
- **Observaciones:** Notas adicionales (opcional).

### Paso 3: Verificar el checklist físico
Es obligatorio marcar las tres casillas para poder aprobar el lote:
- **Empaque íntegro:** El embalaje no presenta roturas.
- **Fecha visible:** La fecha de vencimiento es legible.
- **Sin humedad:** El producto se encuentra seco y en buen estado.

### Paso 4: Aprobar o Rechazar

- **Aprobar:** Al presionar este botón, el sistema crea un **lote aprobado** y lo envía directamente al inventario con estado "En almacén". Aparecerá con su código (ej. LOTE-001) en todas las pantallas.
- **Rechazar:** Al presionar este botón, se debe ingresar el **motivo del rechazo** y contar con la foto ya adjunta. El sistema registrará este rechazo en el **Log de Descartes**. 

### Exportar Log de Descartes
En la parte inferior de esta pantalla, existe el botón **"Exportar CSV"** para descargar un archivo con todos los rechazos (código, producto, categoría, cantidad, peso, motivo, inspector y fecha). 

--- 

## 3. Inventario (/inventario)

Esta pantalla está destinada a la **Célula 2**. Su función es llevar el control de todos los lotes aprobados que se encuentran dentro del almacén. 

### ¿Qué se visualiza?
Se muestra una tabla con la siguiente información de cada lote: Código, Producto, Categoría, Cantidad, Peso (kg), Estado, Inspector y Fecha de registro. 

### Filtros y búsqueda
- **Buscar:** Permite buscar por código, producto o inspector.
- **Filtrar por estado:** Muestra solo lotes "En almacén", "En tránsito" o "Entregado".
- **Filtrar por categoría:** Filtra según el tipo de donación.

### Ver detalles de un lote
Al hacer clic en cualquier fila, se abrirá una ventana con toda la información del lote, incluyendo: 
- Los datos de recepción e inspección.
- El checklist físico que fue marcado.
- La **foto de evidencia** tomada en el momento de la inspección.
- La opción para **cambiar el estado** del lote. 

### Cambiar estado de un lote
Desde el detalle, se puede actualizar el estado según el movimiento que esté realizando el equipo:
- **En almacén:** Acaba de ser aprobado y se encuentra guardado.
- **En tránsito:** Se está preparando para su entrega o trasladando.
- **Entregado:** Ya fue despachado a su destino.

Este cambio se actualiza **automáticamente para todas las pantallas** al instante. 

---

## 4. Despacho (/despacho)

Esta pantalla está destinada a la **Célula 4**. Aquí se registra la entrega de los lotes hacia su destino final.

### Paso 1: Seleccionar los lotes a despachar
Se mostrará un listado únicamente con los lotes que se encuentran **"En almacén"**. Se pueden seleccionar uno o varios para incluirlos en el mismo despacho.

### Paso 2: Completar los datos de la entrega
- **Destino:** Lugar al que se entregarán los productos (obligatorio).
- **Responsable:** Persona o institución receptora (opcional).
- **Fecha de despacho:** Se completa con la fecha en la que se realiza la entrega.
- **Observaciones:** Notas sobre la entrega (opcional).

### Paso 3: Adjuntar foto del acta
Es obligatorio adjuntar una **foto del acta firmada** o del documento de entrega. Al igual que en inspección, la imagen se comprime automáticamente.

### Paso 4: Generar el despacho
Al presionar "Generar despacho", el sistema creará un **folio de despacho** (ej. DESPACHO-001). 

**Importante:** Al generar este despacho, **todos los lotes seleccionados pasarán automáticamente a estado "Entregado"**. Este cambio será visible para todo el equipo y para el público de inmediato.

### Historial de despachos
En la parte inferior, se muestra el historial con todos los despachos realizados. Al hacer clic en uno de ellos, se puede visualizar: folio, destino, responsable, fecha, lotes incluidos, observaciones y la foto del acta. 

---

## 5. Administración (/admin)

Esta pantalla está destinada únicamente al **personal autorizado** para realizar tareas de mantenimiento. Para ingresar, se solicita un **PIN de administración**.

### ¿Qué se puede hacer aquí?

#### A) Gestionar metas
Desde esta sección se pueden crear, editar o eliminar las metas que aparecen en la pantalla de transparencia. 

Para cada meta se define:
- **Nombre:** Descripción de la meta (ej. "Kilos recolectados").
- **Categoría:** General, Agua, Alimentos no perecibles, EPP o Herramientas.
- **Unidad:** kg, unid, lotes, entre otros.
- **Tipo:** 
  - *Automáticas* (se calculan solas): kilos totales, unidades totales o cantidad de lotes.
  - *Manuales*: el valor actual se actualiza desde esta pantalla.
- **Meta a alcanzar:** Cantidad objetivo.

Las metas creadas se mostrarán de inmediato en el **Panel de Transparencia**. 

#### B) Limpieza de datos (Reset)
Existe la opción **"Reiniciar datos"**. Al utilizarla, se borrarán únicamente: **lotes, descartes y despachos**, junto a su historial. 

**Las metas NO se eliminan** con esta acción, por lo que el esquema de objetivos se mantiene intacto.

> Esta acción requiere ingresar el PIN de administración para confirmar que es intencional.

---

## 6. Consejos prácticos para el uso diario

- **Todo se actualiza solo:** Al aprobar, rechazar, cambiar estado o despachar, todas las pantallas se refrescan automáticamente. No es necesario recargar la página.
- **Trabaja desde el celular:** La aplicación está optimizada para móviles. Al abrir desde el celular, podrás tomar fotos directamente con la cámara.
- **Prioriza la foto:** En inspección y en despacho, la foto es obligatoria. Esto garantiza la trazabilidad de la donación.
- **Usa los filtros:** En inventario, los filtros por estado y categoría ahorran tiempo al buscar lotes.
- **Exporta el CSV:** Cada vez que termines un turno, puedes exportar el Log de Descartes para respaldarlo.
- **El PIN es personal:** No lo compartas con personas ajenas a la administración del sistema. 

---

## 7. Flujo resumido en 4 pasos

1. **Recepción (Inspección):** Foto + datos + checklist → Aprobar (Lote) o Rechazar (Descarte).
2. **Almacenamiento (Inventario):** Los lotes aprobados aparecen "En almacén". Se puede mover a "En tránsito" según su traslado.
3. **Despacho (Despacho):** Seleccionar lotes + datos de entrega + acta firmada → Se genera el folio y pasan a "Entregado".
4. **Transparencia (/Inicio):** Todo el avance queda visible al público en tiempo real.
