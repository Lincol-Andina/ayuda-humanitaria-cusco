# Manual de Usuario - Sistema de Logística y Control de Calidad
## Ayuda Humanitaria Cusco

Este manual explica **paso a paso y de forma detallada** cómo funciona la aplicación tal como la usa el usuario. Se describen todas las pantallas, rutas, acciones posibles y qué ocurre al realizar cada paso.

## 1. ¿Cómo se organiza la aplicación?

La aplicación tiene **5 pantallas principales** (rutas) a las que se accede desde el menú superior:

| Ruta | Nombre en el menú | A quién va dirigida |
|---|---|---|
| `/` | Transparencia | Público en general |
| `/inspeccion` | Inspección | Célula 1 y Célula 3 |
| `/inventario` | Inventario | Célula 2 |
| `/despacho` | Despacho | Célula 4 |
| `/admin` | Administración | Personal autorizado |

**Barra superior (Navbar):**
- Logo y título "Ayuda Humanitaria Cusco - Logística y Control de Calidad".
- Menú de navegación con las 5 rutas (se resalta la ruta en la que estás).
- Indicador de conexión: "Conectando", "En vivo" o "Sin conexión". Cuando aparece **"En vivo"**, significa que la información se está actualizando automáticamente.
- Selector de **Rol / Célula** (arriba a la derecha). Este selector sirve para orientar al usuario según su célula de trabajo; **no bloquea ninguna acción**. Puede elegirse entre: Público, Célula 1, Célula 2, Célula 3 o Célula 4.

**Funcionamiento general:**
Todas las pantallas se **actualizan automáticamente** sin recargar. Cuando cualquier usuario registra, aprueba, cambia un estado o despacha, los demás usuarios ven ese cambio casi al instante.

---

## 2. Ruta `/` — Transparencia (Público)

Esta es la pantalla de **inicio**. Cualquier persona puede acceder a ella.

**Pasos para usarla:**
1. Abre la aplicación. Por defecto aparece esta pantalla.
2. Observa los indicadores principales (arriba):
   - **Kilos recolectados:** Total de peso (kg) de todos los lotes aprobados.
   - **Unidades en almacén:** Total de productos aprobados que aún **no han sido entregados**.
   - **Lotes activos:** Cantidad de lotes con estado distinto a "Entregado".
   - **Lotes entregados:** Cantidad de lotes marcados como "Entregado".
   - **Tasa de descarte:** Porcentaje de productos rechazados respecto al total inspeccionado. Debajo muestra cuántos descartes y cuántos despachos hay registrados.
3. Revisa el **gráfico "Unidades por categoría"** (centro-izquierda). Muestra, por cada categoría (Agua, Alimentos no perecibles, EPP, Herramientas), cuántas unidades hay aprobadas. Puedes ver el valor exacto al pasar el cursor sobre cada barra.
4. Revisa las **Metas de la campaña** (centro-derecha). Cada meta muestra su nombre, la unidad (kg, unid, lotes, etc.), el valor alcanzado vs. la meta y una barra de progreso. Las metas **automáticas** se calculan solas (según kilos, unidades o cantidad de lotes). Las metas **manuales** muestran el valor configurado.
5. Revisa la **Galería pública de evidencias** (abajo). Aquí aparecen las fotos de los últimos lotes aprobados. Cada foto muestra su **código de lote** y el **nombre del producto**. Si no hay fotos, aparece un mensaje indicando que aún no hay evidencias.

**Resultado esperado:** Información completa, transparente y actualizada en tiempo real sobre el avance de la campaña.

---

## 3. Ruta `/inspeccion` — Inspección y Control de Calidad (Células 1 y 3)

Esta pantalla sirve para **registrar cada donación al momento de su recepción**. Desde aquí se decide si el producto se **aprueba (pasa a inventario)** o se **rechaza (va al Log de Descartes)**.

### Paso 1: Seleccionar o tomar la foto
1. En la sección **Foto de evidencia (obligatoria)**, haz clic en "Seleccionar imagen" o "Cambiar foto".
2. Puedes tomarla directamente con la cámara del celular (modo trasero recomendado) o seleccionar un archivo desde el equipo.
3. El sistema **comprime la imagen automáticamente** (reduce su peso para agilizar la subida). Aparecerá una vista previa de la foto.
4. **Requisito:** No se puede aprobar un lote sin foto adjunta.

### Paso 2: Completar datos de la donación
En la sección **Datos de recepción**, completa los campos:
1. **Producto** (obligatorio): Nombre del producto (ej. "Agua potable 500 ml").
2. **Categoría** (obligatorio): Elige una de las 4: Agua, Alimentos no perecibles, EPP, Herramientas.
3. **Cantidad (unidades):** Número total de unidades recibidas.
4. **Peso (kg):** Peso total aproximado o exacto.
5. **Fecha de vencimiento:** Solo cuando aplica (alimentos o productos con caducidad). Puede dejarse vacío si no aplica.
6. **Inspector:** Nombre y apellido de quien realiza la inspección.
7. **Observaciones:** Información adicional (opcional).

### Paso 3: Completar checklist de control de calidad (obligatorio)
En la sección **Checklist de control de calidad** **debes marcar las 3 casillas** para poder aprobar:
1. **Empaque íntegro:** Marca si el embalaje está completo, sin roturas ni daños.
2. **Fecha visible:** Marca si la fecha de vencimiento se lee claramente (cuando aplica).
3. **Sin humedad:** Marca si el producto está seco, sin mojaduras o deterioro.

**Importante:** Hasta que las 3 casillas estén marcadas, el botón "Aprobar lote" permanece deshabilitado.

### Paso 4: Tomar una decisión (Aprobar o Rechazar)

#### Opción A: Aprobar lote (pasa a Inventario)
1. Verifica que la foto esté adjunta, todos los datos necesarios estén completos y el checklist tenga las 3 casillas marcadas.
2. Haz clic en **"Aprobar lote"**. Mientras procesa, el botón muestra "Aprobando...".
3. **Qué ocurre:** Se crea un lote aprobado con código **LOTE-XXX** (ej. LOTE-001), se guarda con la foto y pasa a estado **"En almacén"**. Aparecerá inmediatamente en `/inventario` y en la galería de `/`.
4. El formulario se **limpia automáticamente** para registrar el siguiente lote.
5. Aparece un mensaje verde de confirmación con el código generado.

#### Opción B: Rechazar lote (ir a Log de Descartes)
1. Haz clic en **"Rechazar lote"**.
2. Aparecerá un cuadro **"Motivo del rechazo"**. Debes escribir **obligatoriamente** por qué se rechaza (ej. "Empaque roto", "Fecha ilegible", "Humedad").
3. Haz clic en **"Confirmar rechazo"**. Mientras procesa, muestra "Rechazando...".
4. **Qué ocurre:** Se registra el descarte con código **DESC-XXX** (ej. DESC-001), guardando producto, categoría, cantidad, peso, motivo, inspector y foto. Este registro queda en el **Log de Descartes**.
5. El formulario se limpia. Aparece un mensaje con el código de descarte generado.

### Sección: Log de Descartes (Historial de rechazos)
Abajo aparece la tabla **"Log de Descartes"** con todos los productos rechazados:
- Código, Producto, Categoría, Cantidad, Peso (kg), Motivo, Inspector y Fecha de registro.

**Exportar a CSV:**
1. Haz clic en **"Exportar CSV"** (botón a la derecha).
2. Se descarga un archivo `log-descartes-AAAA-MM-DD.csv` con todos los rechazos, listo para abrir en Excel/Hoja de cálculo.

---

## 4. Ruta `/inventario` — Inventario (Célula 2)

Esta pantalla muestra **todos los lotes aprobados** y permite hacer seguimiento de su estado físico (dónde se encuentran).

### Paso 1: Explorar la tabla de lotes
La tabla muestra: **Código, Producto, Categoría, Cantidad, Peso (kg), Estado, Inspector, Fecha de registro**.

### Paso 2: Buscar y filtrar
Arriba hay 3 herramientas para encontrar lotes rápidamente:

1. **Buscar** (campo de texto): Escribe código (LOTE-XXX), nombre del producto o nombre del inspector. La tabla se filtra mientras escribes.
2. **Filtrar por estado** (desplegable): Puedes ver solo "Todos", "En almacén", "En tránsito" o "Entregado".
3. **Filtrar por categoría** (desplegable): Filtra por Agua, Alimentos no perecibles, EPP, Herramientas o "Todas".

### Paso 3: Ver detalle completo de un lote
1. Haz clic en **cualquier fila** de la tabla para abrir el detalle del lote.
2. Se abre una ventana ("Detalle del lote") con toda la información:
   - Datos generales (código, producto, categoría, cantidad, peso, vencimiento, inspector, estado, fecha de registro)
   - **Checklist de control de calidad** (muestra qué se marcó al aprobarlo)
   - **Foto de evidencia** (ampliada). Puedes verla directamente ahí.
   - Sección **"Cambiar estado del lote"** con los 3 botones de estado.

### Paso 4: Cambiar estado del lote
Dentro del detalle del lote, puedes moverlo entre estados:

1. **"Marcar en almacén"** — Coloca el lote en `EN ALMACEN` (apenas fue aprobado o volvió a almacén).
2. **"Marcar en tránsito"** — Coloca el lote en `EN TRANSITO` (está siendo trasladado/preparado para despacho).
3. **"Marcar entregado"** — Coloca el lote en `ENTREGADO` (ya fue entregado).

**Nota:** Los lotes que pasan a **"Entregado"** también lo hacen automáticamente cuando se genera un despacho en `/despacho`. Cualquier cambio de estado se ve **al instante** en todas las pantallas.

Para cerrar el detalle, pulsa la **X** o haz clic fuera de la ventana.

---

## 5. Ruta `/despacho` — Despacho y Entrega (Célula 4)

Esta pantalla sirve para **registrar la entrega final** de lotes a su destino. Al generar un despacho, los lotes seleccionados pasan **automáticamente a "Entregado"**.

### Paso 1: Seleccionar lotes para despachar
En la sección **"Lotes disponibles para despachar"** aparece el listado **únicamente de lotes con estado "En almacén"**.

1. Marca la casilla de cada lote que deseas incluir en este despacho (puedes seleccionar **uno o varios**).
2. Debajo del listado aparece el **resumen**: cuántos lotes seleccionados, total de unidades y total de kg.
3. **Requisito mínimo:** Debes seleccionar **al menos 1 lote** para poder generar el despacho.

### Paso 2: Completar datos de la entrega
En la sección **"Datos del despacho"**, completa:

1. **Destino** (obligatorio): Lugar de entrega (ej. "Comunidad X", "Albergue Y", "Institución Z").
2. **Responsable** (opcional): Nombre de quien recibe o responsable de la recepción.
3. **Fecha de despacho** (obligatorio): Fecha de la entrega. Por defecto aparece la fecha de hoy.
4. **Observaciones** (opcional): Detalles de la entrega.

### Paso 3: Adjuntar foto del acta firmada (obligatorio)
En **"Foto del acta firmada"**:
1. Pulsa "Seleccionar imagen" / "Cambiar foto".
2. Adjunta la **foto del acta de entrega firmada** (o evidencia de la entrega).
3. Aparecerá la vista previa. Esta foto queda guardada junto al despacho.

### Paso 4: Generar el despacho
1. Verifica que hayas seleccionado ≥1 lote, completado Destino y Fecha, y adjuntado la foto del acta.
2. Pulsa **"Generar despacho"**. Mientras procesa, muestra "Generando...".
3. **Qué ocurre:**
   - Se crea el despacho con **folio DESPACHO-XXX** (ej. DESPACHO-001).
   - **Todos los lotes seleccionados cambian automáticamente a "Entregado"**.
   - El despacho queda guardado con su foto de acta y los lotes que incluía.
   - El formulario se limpia (quedan desmarcados los lotes, se borra la foto y se resetean los campos).
4. Aparece un mensaje verde de confirmación con el folio generado.

### Sección: Historial de despachos
Abajo aparece **"Historial de despachos"** con todas las entregas realizadas. Cada despacho muestra: Folio, Destino, Responsable, Fecha, Cantidad de lotes, Observaciones y la miniatura de la foto del acta.

**Ver detalle de un despacho:**
1. Haz clic en cualquier despacho del historial.
2. Se abre una ventana con:
   - Datos completos del despacho (folio, destino, responsable, fecha, observaciones, fecha de registro)
   - **Foto del acta firmada** (ampliada)
   - **Lista de lotes despachados**: Código, Producto, Categoría, Cantidad, Peso (kg), Estado (aparecerán como "Entregado")

Para cerrar, pulsa la X.

---

## 6. Ruta `/admin` — Administración (Personal autorizado)

Esta pantalla requiere **iniciar sesión con un usuario de rol administrador**. Solo debe usarse por personal responsable del sistema.

### Paso 1: Iniciar sesión
1. Al abrir `/admin` sin sesión, el sistema redirige a la página de **Inicio de sesión** (`/login`).
2. Escribe tu **usuario** y **contraseña**, y pulsa **"Ingresar"**.
3. Si las credenciales son correctas y tu usuario es administrador, accedes al panel. Si no, aparece un mensaje de error.

### Paso 2: Gestionar Metas
Una vez dentro, aparece la sección **"Gestión de metas"**. Aquí se configuran las metas que aparecen en la Pantalla de Transparencia (`/`).

#### Crear una nueva meta
1. Haz clic en **"Nueva meta"**. Se abre un formulario.
2. Completa los campos:
   - **Nombre:** Descripción de la meta (ej. "Kilos recolectados", "Botellas de agua").
   - **Categoría:** General, Agua, Alimentos no perecibles, EPP o Herramientas.
   - **Unidad:** Símbolo/unidad (ej. `kg`, `unid`, `lotes`, `botellas`).
   - **Tipo:** Selecciona uno:
     - `auto_kg` — Se calcula automáticamente sumando **peso (kg)** de todos los lotes aprobados.
     - `auto_unidades` — Se calcula automáticamente sumando **cantidad** de todos los lotes aprobados.
     - `auto_lotes` — Se calcula automáticamente contando **cantidad de lotes aprobados**.
     - `manual` — El valor actual se ingresa manualmente (útil para metas externas).
   - **Meta a alcanzar:** Número objetivo (valor al que se quiere llegar).
   - **Valor actual:** Solo aparece para tipo `manual`. Para tipos automáticos se ignora (se calcula solo).
3. Haz clic en **"Crear meta"**. La meta aparece en la lista y, al instante, en la Pantalla de Transparencia.

#### Editar una meta existente
1. En la lista de metas, haz clic en **"Editar"** en la meta que deseas modificar.
2. Modifica nombre, categoría, unidad, tipo, meta a alcanzar o valor actual (según tipo).
3. Haz clic en **"Guardar cambios"**. Los cambios se reflejan inmediatamente en `/`.

#### Eliminar una meta
1. Haz clic en **"Eliminar"** en la meta correspondiente.
2. El sistema pide confirmar la acción.
3. Al confirmar, la meta se elimina. Aparece al instante en `/`.

### Paso 3: Reiniciar datos (Reset)
En la sección **"Reiniciar datos"** puedes borrar los registros operativos para empezar una nueva campaña.

**¿Qué se borra?**
- **Lotes** (todos)
- **Descartes** (todo el Log de Descartes)
- **Despachos** (todo el historial de despachos)

**¿Qué NO se borra?**
- **Metas** (se conservan, para no tener que volver a crearlas).

**Cómo hacerlo (con confirmación de seguridad):**
1. Haz clic en **"Reiniciar datos de prueba"**.
2. Aparece un cuadro de confirmación en el navegador. Confirma la acción.
3. **Qué ocurre:** Se eliminan lotes, descartes, despachos y se reinicia la numeración de códigos (LOTE/DESC/DESPACHO volverán a empezar desde 001). Las metas permanecen intactas.
4. Aparece un mensaje con el conteo de registros eliminados.

> **Uso recomendado:** Usar esta opción solo al iniciar una nueva campaña o para limpiar datos de prueba.

### Cerrar sesión
Pulsa **"Cerrar sesión"** (arriba a la derecha de la barra de navegación) para salir y volver a la pantalla de Inicio de sesión.

---

## 7. Cómo funciona la sincronización (para entenderlo)

- **Automática:** Cada pantalla detecta cambios cada ~8 segundos y también al volver a enfocar la pestaña (cambiar de ventana y volver). Además, al guardar cualquier dato (aprobar, rechazar, cambiar estado, crear despacho, editar meta...), **todas las demás pantallas se actualizan al instante**.
- **Indicador "En vivo":** En la barra superior aparece cuando la conexión está activa y los datos están sincronizados.
- **Móvil y varios dispositivos:** Si abres la app en varios celulares/laptops al mismo tiempo, **todos ven lo mismo al instante**.

---

## 8. Recorrido rápido (flujo típico de trabajo)

Un flujo completo de principio a fin, paso a paso:

1. **Abrir `/inspeccion` (Células 1–3):** Registrar donación → tomar foto → llenar datos → marcar checklist → **Aprobar** → Se crea `LOTE-001` (va a almacén).
2. **Abrir `/inventario` (Célula 2):** Ver lote en "En almacén". Si se traslada, cambiar a "En tránsito". Si ya está listo para entregar, puede dejarse en "En almacén".
3. **Abrir `/despacho` (Célula 4):** Seleccionar lotes "En almacén" → Completar destino/fecha → Adjuntar **acta firmada** → **Generar despacho** → Se crea `DESPACHO-001` y los lotes pasan a **"Entregado"**.
4. **Abrir `/` (Público):** Ver KPIs actualizados, metas con progreso y galería con fotos. Todo visible al instante.
5. **Abrir `/admin` (Autorizado):** Ajustar metas o reiniciar datos al terminar la campaña.

---

## 9. Notas importantes para el usuario

- **Fotos obligatorias:** Inspección (para aprobar) y Despacho (acta firmada). Se comprimen automáticamente para funcionar bien en celular.
- **Checklist obligatorio:** Para aprobar un lote, deben marcarse las 3 casillas.
- **Selección múltiple en despacho:** Puedes despachar varios lotes juntos en **un solo folio**.
- **Transparencia total:** La pantalla `/` es pública y no requiere permisos.
- **Los rechazos no van al inventario:** Un producto rechazado queda únicamente en el **Log de Descartes** (exportable a CSV).
- **Las metas automáticas se actualizan solas:** No necesitas editarlas manualmente; cambian conforme se aprueban lotes.