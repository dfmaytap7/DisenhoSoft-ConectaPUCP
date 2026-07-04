# Auditoría prototipo ↔ Requisitos (RF01–RF38 / RC01–RC20)

**Fecha:** 2026-07-03  
**Alcance:** `Pantallas/Codigo/` — prototipo HTML/CSS/JS para deploy de demostración  
**Objetivo:** Alinear estructura de pantallas con requisitos, eliminar secciones vacías o redundantes, y registrar qué requisitos deben actualizarse en el documento oficial.

---

## 1. Resumen ejecutivo

Tras la auditoría se aplicaron cambios estructurales para que cada pantalla tenga contenido coherente con su RF y no existan hubs inventados (Dashboard) ni páginas casi vacías duplicadas.

| Área | Antes | Después |
|------|-------|---------|
| Landing estudiante | Mezcla `dashboard.html` / `repositorio.html` | **Repositorio** (`repositorio.html`) |
| RF22 Estadísticas | Página suelta con 4 tarjetas + duplicado en perfil | **Pestaña en Mi Perfil** (`perfil.html#estadisticas`) |
| RF03 Notificaciones | Lista in-app sin enlace a preferencias | **Notificaciones** + preferencias en **Perfil → Preferencias de alertas** |
| Admin | Nav con Dashboard, moderación y auditoría rotos (`#`) | Solo **Solicitudes · Usuarios · Configuración** (RF09, RF31, RF19) |
| Evaluador RF22 | Solo números en hero del perfil | **Pestaña Estadísticas** en `evaluador/perfil.html` |
| RF38 al crear publicación | Sin selector de material | Selector de vinculación en `crear-publicacion.html` |

---

## 2. Mapa de pantallas (estructura final)

### Estudiante

| Pantalla | RF/RC principal | Notas |
|----------|-----------------|-------|
| `login.html` | RF12, RF13, RC07 | Post-login → `repositorio.html` |
| `repositorio.html` | RF15, RF18, RF37, RF02 | Landing; filtros locales; favoritos en tab |
| `busqueda.html` | RF01, RF06, RF15 | Entrada: topbar (Enter) + launcher; no sidebar dedicado |
| `material-detalle.html` | RF02, RF07, RF20, RF23, RF25, RF38 | Descarga, compartir, reportar, vínculos foro |
| `subida-material.html` | RF17, RF18, RC11 | Carga con curso/ciclo obligatorio |
| `foros.html` | RF06, RF35, RF07 | Estados Activo/Cerrado/Archivado |
| `foro-detalle.html` | RF06, RF07, RF23, RF25, RF38 | Votos, editar/eliminar, compartir |
| `crear-publicacion.html` | RF06, RF38, RF23 | Vincular material del repositorio |
| `grupos-estudio.html` | RF05, RF11 | Filtros fecha/curso/ciclo/palabras clave |
| `crear-grupo-estudio.html` | RF04 | Curso, tema, horario |
| `ranking.html` | RF34, RF33 | Tabla de posiciones |
| `notificaciones.html` | RF03, RF26, RF36 | Bandeja in-app; enlace a preferencias en perfil |
| `perfil.html` | RF22, RF30, RF02, RF27, RC05 | Tabs: Editar · **Estadísticas** · Favoritos · Preferencias · Privacidad |
| `estadisticas.html` | — | **Redirect** → `perfil.html#estadisticas` |
| `postulacion-evaluador.html` | RF09 (lado estudiante), RF26 | Formulario de postulación |

**Sidebar estudiante unificado**

- **Principal:** Repositorio · Foros · Grupos de Estudio  
- **Yo:** Ranking · Notificaciones · Mi Perfil  
- **CTA:** Postular a Evaluador  

### Evaluador

| Pantalla | RF/RC principal |
|----------|-----------------|
| `panel.html` | RF24, RF25, RF08 (contexto), RF10 |
| `subida-material.html` | RF17, RF28 |
| `perfil.html` | RF22, RF30, RF08 (prefs correo) |

**Sin bandeja in-app** para evaluador (RF08 = solo correo).

### Administrador

| Pantalla | RF/RC principal |
|----------|-----------------|
| `solicitudes.html` | RF09, RF32, RC14 (log backend) |
| `usuarios.html` | RF31 |
| `configuracion.html` | RF19, RC11 |

**Entrada admin:** `solicitudes.html` (no existe dashboard admin).

---

## 3. Cambios realizados en el prototipo

1. Eliminadas todas las referencias a `dashboard.html` (estudiante y admin).
2. Unificado sidebar estudiante en 16 archivos.
3. RF22 fusionado en `perfil.html` (estudiante y evaluador) con historial de puntos (RF21/RF10).
4. `estadisticas.html` convertido en redirect.
5. Admin: sidebar alineado con `solicitudes.html`; eliminados ítems muertos (Moderación, Reportes, Auditoría, Dashboard).
6. `notificaciones.html`: banner RF03 y enlace a preferencias (RF27).
7. `crear-publicacion.html`: selector RF38.
8. `evaluador/subida-material.html`: icono campana sin enlace roto (RF08).
9. `admin/usuarios.html` y `configuracion.html`: `global.js` + nav coherente.

---

## 4. Requisitos a MODIFICAR en el documento oficial

Estos cambios de redacción alinean el catálogo RF con lo que el prototipo implementa de forma coherente.

### RF03 — **MODIFICAR** (prioridad alta)

**Texto actual (proporcionado):**  
> enviar notificaciones mediante alertas en la plataforma y a través de correo electrónico institucional…

**Acción:** Adoptar este texto como definitivo si el repo interno aún dice “exclusivamente correo”. El prototipo implementa **ambos canales** para estudiantes; evaluadores reciben materiales pendientes **solo por correo** (RF08).

**Redacción sugerida:**

> El sistema enviará notificaciones mediante **alertas en la plataforma** y, según las preferencias del usuario, **correo electrónico institucional**, para informar sobre nueva actividad en publicaciones o consultas. *Excepción:* los avisos de materiales pendientes a evaluadores se rigen por RF08 (solo correo).

---

### RF17 y RF28 — **CONSOLIDAR / ACLARAR** (prioridad alta)

**Conflicto:** RF17 menciona solo estudiantes; RF28 incluye estudiantes y evaluadores.

**Acción:** Unificar en un solo RF o referenciar explícitamente:

> RF17: …permitir a **estudiantes y evaluadores** cargar archivos… (ver también RF28, mismo alcance).

O marcar RF28 como *alias* de RF17 y eliminar duplicidad.

---

### RF22 — **ACLARAR ubicación en UI** (prioridad media)

**Acción:** Añadir nota de implementación:

> Las estadísticas personales se muestran en la sección **Mi Perfil → Estadísticas**, actualizadas en tiempo real. No se requiere una pantalla independiente “Dashboard”.

Métricas por rol:
- **Estudiante:** subidos, validados (propios), foros, puntos.
- **Evaluador:** subidos, validados (como evaluador), foros, puntos.

---

### RF27 — **ACLARAR alcance** (prioridad media)

**Texto actual:** solo Estudiante.

**Opciones:**
1. **Mantener** solo estudiante → documentar que evaluador solo configura canal correo en su perfil (sin categorías).
2. **Extender** a Evaluador: “Estudiante y Evaluador podrán gestionar preferencias de alertas…”

El prototipo usa la opción 1 con prefs mínimas para evaluador.

---

### RF25 — **ACLARAR moderación admin** (prioridad media)

El RF exige moderación automática y manual, pero **no define pantalla admin**. El prototipo cubre:
- Reportar (estudiante/evaluador) en foro y material.
- Acciones del evaluador en panel (validar/rechazar/reportar).

**Acción:** Añadir nota:

> La cola de moderación administrativa (contenido reportado) puede implementarse como vista futura o proceso backend; no es obligatoria en el prototipo de pantallas del curso si RF25 se cumple vía flujos de reporte + evaluador.

*Alternativa:* agregar **RF25-A** “El administrador dispondrá de una vista para revisar contenido reportado en foros y materiales.”

---

### RF08 — **Sin cambio** (confirmar)

Evaluador: notificación de pendientes **solo correo**, sin bandeja in-app. Coherente con prototipo.

---

## 5. Requisitos que NO requieren cambio

| ID | Motivo |
|----|--------|
| RF01 | `busqueda.html` + topbar global |
| RF04–RF07 | Grupos, foros, votos implementados |
| RF09, RF31, RF32 | Admin solicitudes y usuarios |
| RF12, RF13, RF14 | Login, sesión, roles |
| RF15, RF18, RF37 | Repositorio con filtros y organización |
| RF19 | Configuración extensiones admin |
| RF20, RF29 | Descarga en detalle material |
| RF21, RF33, RF34 | Gamificación, ranking, actividad en perfil |
| RF23 | `shareContent()` global |
| RF24 | Panel evaluador |
| RF26 | Notificaciones de postulación en bandeja |
| RF30 | Edición contacto en perfil |
| RF35 | Estados de hilos en foros |
| RF36 | Toggle calendario en preferencias + ítem en notificaciones |
| RF38 | Vínculos en detalle, búsqueda y crear publicación |
| RF16, RC01 | `global.js` loading + menú móvil |
| RC05 | Tab privacidad en perfil |
| RC07 | SSO CAS en login |
| RC11 | Validación MIME en subida (UI) |
| RC14, RC15 | Mencionados en admin; log es backend |

---

## 6. Requisitos / pantallas ELIMINADOS del diseño (nunca existieron en RF)

| Elemento eliminado | Razón |
|--------------------|-------|
| `dashboard.html` (estudiante) | No hay RF para hub principal con KPIs extra |
| `dashboard.html` (admin) | No hay RF; entrada = Solicitudes |
| Sidebar “Estadísticas” independiente | Redundante; RF22 cubierto en Perfil |
| Admin: Moderación materiales/foros | Nav sin RF ni pantalla |
| Admin: Reportes y estadísticas | Sin RF dedicado |
| Admin: Registro de auditoría (UI) | RC14 es requisito de backend/log, no de pantalla obligatoria |

---

## 7. Requisitos a AGREGAR (opcional, si el curso exige cobertura explícita)

| ID propuesto | Descripción | Prioridad sugerida |
|--------------|-------------|-------------------|
| **RF39** *(opcional)* | El sistema mostrará un **punto de entrada único post-login** por rol: Estudiante/Evaluador → Repositorio; Administrador → Solicitudes de evaluador. | Media |
| **RF25-A** *(opcional)* | El administrador dispondrá de una interfaz para revisar y resolver reportes de moderación en foros y materiales. | Media |
| **RC14-A** *(opcional)* | El administrador podrá consultar un registro de auditoría de cambios de privilegios desde la interfaz web. | Baja |

Si no se agregan, el prototipo actual sigue siendo válido documentando RF25/RC14 como capacidades de **sistema/backend**.

---

## 8. Checklist deploy del prototipo

- [x] Sin enlaces rotos a `dashboard.html`
- [x] Sidebar consistente por rol
- [x] RF22 con contenido útil (KPIs + actividad reciente)
- [x] RF03 bandeja + RF27 preferencias enlazadas
- [x] RF01 accesible vía topbar
- [x] Admin solo pantallas con RF
- [x] `index.html` launcher actualizado
- [x] `global.js` en pantallas admin
- [ ] **Pendiente producción real:** APIs, CAS, SMTP, Hazelcast, Kafka (no aplica al HTML estático)

---

## 9. Cómo abrir el prototipo

1. Abrir `Pantallas/Codigo/index.html` en navegador.  
2. Flujo estudiante: Login → Repositorio → explorar secciones del sidebar.  
3. Estadísticas: Mi Perfil → pestaña Estadísticas (o `perfil.html#estadisticas`).  
4. Admin: `admin/solicitudes.html`.

---

*Documento generado tras auditoría y reestructuración del prototipo ConectaPUCP — INF50 Grupo 24.*
