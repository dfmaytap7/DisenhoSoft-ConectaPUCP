# CHANGELOG — ConectaPUCP

Registro de cambios aplicados en los archivos MD del vault que aún **no han sido trasladados al documento oficial** (`Laboratorio 05 - grupo 24.docx`). Una vez que apliques un bloque en el docx, elimínalo de esta sección y anota la fecha en el historial al final.

> **Instrucciones:** Cada bloque indica exactamente qué texto cambió en el MD y qué debe cambiarse en el `.docx`. Sigue el orden de sección del documento.

---

## Cambios pendientes de aplicar en el .docx

---

### [2026-06-05] Diagramas de Interacción — Subida de Archivo (C1)

**Tipo:** Corrección crítica  
**Sección del .docx:** 4.8 Diagramas de Interacción → "Subida de un Archivo Académico (UP Archivos)"  
**Qué cambió en MD:** Se eliminó la frase *"La Grilla aplica el patrón Write-Behind delegando la inserción final a un DataWriter mediante evento asíncrono."* Se reemplazó por: *"El repositorio realiza dos operaciones independientes: (1) `put(metadata, objectKey)` en la Grilla de Datos (Hazelcast) para disponibilidad inmediata en el Space; (2) publica el evento `ARCHIVO_SUBIDO` directamente en la Grilla de Mensajería (Kafka). El DataWriter consume ese evento y persiste los metadatos en PostgreSQL. La Grilla de Datos no dispara este evento."*  
**Diagrama:** En el diagrama de secuencia, se añadió `Grilla Mensajería` como participante, se eliminó la flecha `Hazelcast → DataWriter` y se añadió la flecha `Repositorio Archivos → Kafka: publish(ARCHIVO_SUBIDO)`.  
**Archivo MD:** [[Diagramas de Interacción#Subida de un Archivo Académico]]

---

### [2026-06-05] Código — Data Reader (C2)

**Tipo:** Corrección crítica  
**Sección del .docx:** 4.4.10 Vista de Código del Componente Data Reader  
**Qué cambió en MD:** En el sustento de decisiones de diseño, se eliminó la referencia vaga a `CacheMissListener`. Se añadió la sección *"Mecanismo de activación: interfaz MapLoader de Hazelcast"*: el DataReader implementa `MapLoader<K,V>`; cuando una UP hace `map.get(key)` y el resultado es null, Hazelcast llama automáticamente a `MapLoader.load(key)`. El proceso es transparente para la UP; ella nunca sabe si hubo miss. `GridReloadPort` queda exclusivo para recarga proactiva (`preload()`).  
**Diagrama:** Se añadió `<<interface>> MapLoader` con relación `implements` desde `DataReader`. Se eliminó `CacheMissListener`. Se añadió `MapperRegistry`.  
**Archivo MD:** [[Código - Data Reader]]

---

### [2026-06-05] Patrones de Diseño — Observer y Diagramas de Interacción (C3)

**Tipo:** Corrección crítica  
**Sección del .docx:** 4.5.5 Patrón Observer y 4.8 Diagramas de Interacción → "Crear Publicación"  
**Qué cambió en MD:**  
- Se eliminó el Observer en-proceso (`IForoObserver`, `NotificacionForoObserver`, `GamificacionObserver`) que notificaba síncronamente antes de retornar HTTP 201, violando RC03.  
- Camino único: `PublicacionService` guarda la publicación → publica `PUBLICACION_CREADA` a Kafka → retorna HTTP 201 inmediatamente. Los consumidores (`GamificacionConsumer`, `NotificacionConsumer`, `ModeradoConsumer`) reaccionan de forma asíncrona.  
- En el diagrama de secuencia: `Gamificación` → `GamificacionConsumer`; `UP Notificaciones` → `NotificacionConsumer`; `Grilla Mensajería` añadida como participante; bloque `opt` eliminado; `publish(PUBLICACION_CREADA)` a Kafka antes de HTTP 201.  
**Archivos MD:** [[Diagramas de Interacción#Crear Publicación]] · [[Patrones de Diseño#4.5.5 Patrón Observer]] · [[Código - Publicaciones y Foros]]

---

### [2026-06-06] Código — Gamificación (C4)

**Tipo:** Corrección crítica  
**Sección del .docx:** 4.4.8 Vista de Código del Componente Gamificación  
**Qué cambió en MD:** Se eliminó `ICuentasAPI` (llamada HTTP directa del Servicio Social al Servicio de Cuentas, que viola la independencia de UPs en SBA). Se reemplazó por `IRangoEventPublisher`: cuando el usuario sube de rango, `CalculadoraPuntosService` publica el evento `RANGO_ACTUALIZADO { userId, nuevoRango, timestamp }` a Kafka vía `IRangoEventPublisher`. El Servicio de Cuentas tiene un consumer que escucha ese tópico y actualiza Hazelcast + PostgreSQL.  
**Diagrama:** Se eliminó la interfaz `ICuentasAPI` y la relación de llamada HTTP directa. Se añadió `IRangoEventPublisher <<interface>>` con relación `..> IRangoEventPublisher : publica a Kafka` desde `CalculadoraPuntosService`.  
**Archivo MD:** [[Código - Gamificación]]

---

### [2026-06-14] Requerimientos Funcionales — RF23

**Tipo:** Corrección de inconsistencia (RC07 vs RF23)  
**Sección del .docx:** 3.1 Requerimientos → RF23  
**Qué cambió en MD:** RF23 anterior: *"…para generar enlaces y ser enviados a otras plataformas sociales."* RF23 actualizado: *"…para generar enlaces compartibles que puedan ser enviados a otras plataformas. El acceso mediante dichos enlaces siempre requerirá autenticación institucional PUCP (SSO CAS); si el destinatario no está autenticado, será redirigido al inicio de sesión antes de ver el contenido."*  
**Por qué:** La descripción anterior dejaba abierta la posibilidad de contenido público sin login, contradiciendo RC07 ("solo estudiantes/profesores/evaluadores PUCP pueden acceder a la plataforma"). La nueva redacción garantiza que compartir un enlace no bypasea la autenticación institucional.  
**Archivo MD:** [[Requerimientos Funcionales#RF23]]

---

### [2026-06-14] Vista de Contexto — Sistema de Correo (m2)

**Tipo:** Corrección de deploy blocker  
**Sección del .docx:** 3.3 Vista de Contexto → tabla Sistemas Externos  
**Qué cambió en MD:** La descripción del "Sistema de Correo Electrónico" decía "Gestionado vía Postfix." PUCP usa Google Workspace (Gmail institucional). Postfix es un servidor SMTP auto-hosteado, no el sistema real de PUCP. Se actualizó a: *"Servicio de correo institucional PUCP (Google Workspace). La comunicación se realiza mediante SMTP relay hacia smtp.gmail.com con credenciales institucionales OAuth2 o credenciales de aplicación. El cliente SMTP del sistema (SmtpMailSender / Nodemailer) se configura apuntando a este host."*  
**Por qué:** Un deploy con configuración Postfix fallará en conectar al servidor de correo de PUCP — Nodemailer necesita `host: smtp.gmail.com, port: 587` con OAuth2 institucional.  
**Archivo MD:** [[Vista de Contexto]]

---

### [2026-06-14] Diagramas de Interacción — C5: Reemplazo de Inicio de Sesión por Validación de Rol Evaluador

**Tipo:** Corrección crítica (retroalimentación del evaluador)  
**Sección del .docx:** 4.8 Diagramas de Interacción → primera sección  
**Qué cambió en MD:** Se eliminó la sección "Inicio de Sesión (UP Cuentas)" (con referencia a `seq-inicio-sesion.md`). Se reemplazó por "Validación de Solicitud de Rol Evaluador (UP Cuentas)" con referencia a `seq-validacion-rol-evaluador.md` (archivo ya existente). La descripción cubre: `PUT /roles/evaluador` → `GestorRoles.validarSolicitudEvaluador` → actualización de roles en Hazelcast (RC15) → `publish(ROL_ACTUALIZADO)` a Kafka → `AuditoriaService.registrarCambioPrivilegio` → `publish(AUDITORIA_ROL)` → DataWriter persiste en tabla append-only. Incluye la nota de que `NotificacionConsumer` es **interno** a la UP de Notificaciones. También se documenta el `SolicitudExpirationJob` (cron diario dentro de UP Cuentas) que anula solicitudes vencidas de 7 días hábiles automáticamente (RF09).  
**Por qué:** El evaluador observó que el diagrama de inicio de sesión no cubre el escenario clave ni la razón de ser de ConectaPUCP. La validación de rol evaluador muestra la propuesta de valor diferenciadora con RF09 + RC14 + RC15.  
**Archivo MD:** [[Diagramas de Interacción]]

---

### [2026-06-14] Diagramas de Interacción — seq-envio-correo: referencia .png → .md

**Tipo:** Corrección de referencia rota  
**Sección del .docx:** 4.8 Diagramas de Interacción → "Envío de Correo (UP Notificaciones)"  
**Qué cambió en MD:** La línea `![[seq-envio-correo.png]]` fue cambiada a `![[seq-envio-correo.md]]`. El archivo PNG no existía. Se creó el diagrama Mermaid en `assets/Diagramas/diagramas interaccion/UP Notificaciones/seq-envio-correo.md` con el flujo completo: UP fuente → Kafka → NotificacionController → NotificacionOrquestador → GrillaDatos (preferencias) → MotorPlantillas → MailerClient → smtp.gmail.com (Google Workspace). Incluye nota de reintento RC10.  
**Archivo MD:** [[Diagramas de Interacción]] · `assets/Diagramas/diagramas interaccion/UP Notificaciones/seq-envio-correo.md` (NUEVO)

---

### [2026-06-14] Diagramas de Interacción — NotificacionConsumer: aclaración de ubicación (UP Notificaciones)

**Tipo:** Corrección de ambigüedad arquitectural  
**Sección del .docx:** 4.8 Diagramas de Interacción → "Crear Publicación (UP Sociales)"  
**Qué cambió en MD:** En el paso "[notificaciones]" del flujo asíncrono de Crear Publicación, se aclaró que `NotificacionConsumer` es un componente **interno** del Servicio de Notificaciones UP, no una llamada HTTP cross-UP. Opera sobre el `NotificacionOrquestador` de su propia UP.  
**Por qué:** La redacción anterior era ambigua y podría interpretarse como una llamada HTTP directa entre UPs, lo que violaría la independencia de UPs en SBA.  
**Archivo MD:** [[Diagramas de Interacción]]

---

### [2026-06-14] Código — Publicaciones y Foros: ComentarioService + IEventPublisher

**Tipo:** Corrección de deploy blocker (gamificación de comentarios no funcional)  
**Sección del .docx:** 4.4.6 Vista de Código — Publicaciones y Foros  
**Qué cambió en MD:** El texto decía que `ComentarioService` tenía dependencia directa hacia `IGamificacionService`, pero el diagrama de clases no mostraba ninguna dependencia de gamificación. Se corrigió: `ComentarioService` usa `IEventPublisher` (mismo patrón que `PublicacionService`) para publicar el evento `COMENTARIO_CREADO` a Kafka. El `GamificacionConsumer` lo consume con `TipoAccion.COMENTAR_FORO`. Se actualizó tanto el MD de sustento como el diagrama Mermaid (`codigo-publicaciones-foros.md`) para agregar `-eventPublisher: IEventPublisher` a `ComentarioService` y la relación `ComentarioService ..> IEventPublisher : publica a Kafka`.  
**Por qué:** Sin `IEventPublisher`, `agregarComentario()` nunca dispara gamificación ni notificaciones — RF21 no funciona para comentarios en deploy.  
**Archivos MD:** [[Código - Publicaciones y Foros]] · `assets/Diagramas/codigo/UP Social/codigo-publicaciones-foros.md`

---

### [2026-06-14] Patrones de Persistencia — Audit Log (C6)

**Tipo:** Corrección crítica (retroalimentación del evaluador)  
**Sección del .docx:** 4.6 Patrones de Persistencia  
**Qué cambió en MD:** Se añadió la nueva sección `## Audit Log` que documenta el patrón para RC14: tabla append-only `auditoria_privilegios` (solo INSERT), `AuditoriaService`, `AuditoriaDataMapper`, y los campos de cada entrada de log (`idRegistro`, `idUsuarioAfectado`, `idAdmin`, `accion`, `nuevoPrivilegio`, `timestamp`). El evento Kafka `AUDITORIA_ROL` es consumido por el `DataWriter`.  
**Archivo MD:** [[Patrones de Persistencia]]

---

### [2026-06-14] Patrones de Interacción con BD — SolicitudEvaluadorDataMapper y AuditoriaDataMapper (C6)

**Tipo:** Corrección crítica (retroalimentación del evaluador)  
**Sección del .docx:** 4.7 Patrones de Interacción con la Base de Datos → Data Mapper  
**Qué cambió en MD:** Se añadió el sub-apartado "Vínculo con RF09 y RC14" en la sección Data Mapper: documenta `SolicitudEvaluadorDataMapper` (tabla `solicitudes_evaluador`, campos de estado y timestamps para RF09) y `AuditoriaDataMapper` (tabla append-only `auditoria_privilegios`, solo INSERT para RC14).  
**Archivo MD:** [[Patrones de Interacción con BD]]

---

### [2026-06-14] Código — Gestor de Roles: SolicitudExpirationJob + AuditoriaService (C6 + RF09)

**Tipo:** Corrección de deploy blocker  
**Sección del .docx:** 4.4.X Vista de Código — Gestor de Roles  
**Qué cambió en MD:** Se amplió el sustento de diseño con:  
- Sección "Gestión Formal de Postulaciones (RF09)" actualizada: incluye los 4 estados de `SolicitudEvaluador` (PENDIENTE/APROBADA/RECHAZADA/ANULADA) y el mecanismo detallado del `SolicitudExpirationJob` (cron diario dentro de UP Cuentas): consulta solicitudes vencidas → ANULADA en Hazelcast → Kafka `SOL_ANULADA` → DataWriter → `AuditoriaService.registrar(log)` → `NotificacionConsumer` notifica al postulante.  
- Sección "Auditoría Inmutable (RC14)": vincula `AuditoriaService.registrar(log)` con `AuditoriaDataMapper` e `auditoria_privilegios` append-only.  
**Por qué:** Sin `SolicitudExpirationJob`, las solicitudes vencidas nunca se anulan — RF09 ("pasado este tiempo se anula la solicitud") no funcionaría en deploy.  
**Archivo MD:** [[Código - Gestor de Roles]]

---

### [2026-06-14] Componentes — Servicio de Cuentas: Gestor de Roles actualizado con SolicitudExpirationJob

**Tipo:** Complemento de documentación  
**Sección del .docx:** 4.3 Componentes → Servicio de Cuentas  
**Qué cambió en MD:** La descripción del componente "Gestor de Roles" se amplió para mencionar `ISolicitudEvaluadorRepository` y el `SolicitudExpirationJob` (cron diario). Se añadió RF26 a la lista de RFs del componente.  
**Archivo MD:** [[Componentes - Servicio de Cuentas]]

---

### [2026-06-14] Código — Validación de Material: mecanismo de streaming (M2)

**Tipo:** Corrección de incoherencia técnica  
**Sección del .docx:** 4.4.X Vista de Código — Validación de Material  
**Qué cambió en MD:** Se añadió la sección "Mecanismo de Validación sobre Stream" que documenta: (1) `SizeValidationHandler` hace check preliminar de `Content-Length` header para rechazo rápido; (2) `MimeTypeValidationHandler` lee solo los primeros N bytes (magic bytes) del stream antes de almacenar; (3) el stream se escribe al Object Storage con `maxBytes = 100 MB` y si se supera, se aborta y borra el objeto parcial. Esto resuelve la contradicción entre "validar tamaño" y "streaming".  
**Archivo MD:** [[Código - Validación de Material]]

---

### [2026-06-14] Componentes — Servicio de Persistencia: Motor de Búsqueda → Indexador de Búsqueda (M1)

**Tipo:** Corrección de ambigüedad de nomenclatura C4  
**Sección del .docx:** 4.3 Componentes → Servicio de Persistencia  
**Qué cambió en MD:** El componente "Motor de Búsqueda" fue renombrado a "Indexador de Búsqueda" para distinguirlo del contenedor externo "Motor de Búsqueda [ElasticSearch]" de la Vista de Contenedores. En C4, el componente interno (quien hace llamadas a ElasticSearch) y el contenedor externo (el servidor ElasticSearch) deben tener nombres distintos.  
**Archivo MD:** [[Componentes - Servicio de Persistencia]]

---

### [2026-06-14] Patrones de Diseño: numeración completa (m4)

**Tipo:** Corrección de formato  
**Sección del .docx:** 4.5 Patrones de Diseño  
**Qué cambió en MD:** Se completó la numeración de las secciones: 4.5.6 Strategy, 4.5.7 Facade UP Notificaciones, 4.5.8 Adapter MailSender, 4.5.9 Front Controller, 4.5.10 Observer Kafka, 4.5.11 Template View. Las primeras 5 (4.5.1–4.5.5) ya tenían número.  
**Archivo MD:** [[Patrones de Diseño]]

---

### [2026-06-14] Requerimientos Funcionales: consolidación RF17 + RF28 (m5)

**Tipo:** Corrección de duplicado  
**Sección del .docx:** 3.1 Requerimientos Funcionales  
**Qué cambió en MD:** RF17 se actualizó para incluir explícitamente a "estudiantes y evaluadores" como actores (antes solo decía "estudiantes"). RF28 se marcó como "Consolidado en RF17" — queda como referencia histórica sin implementación adicional.  
**Archivo MD:** [[Requerimientos Funcionales]]

---

### [2026-06-14] Vista de Contenedores: nota de responsabilidades del API Gateway (m1)

**Tipo:** Aclaración arquitectural  
**Sección del .docx:** 3.4 Vista de Contenedores  
**Qué cambió en MD:** Se amplió la descripción del API Gateway para especificar: reverse proxy de routing (nginx o equivalente), TLS termination, CORS policy. **No valida tokens ni sesiones** — esa responsabilidad es de cada UP consultando Hazelcast (RC13).  
**Archivo MD:** [[Vista de Contenedores]]

---

### [2026-06-14] Código — Módulo Autenticación: aclaración GridClientFacade Singleton (m3)

**Tipo:** Aclaración de comportamiento en entornos escalados  
**Sección del .docx:** 4.4.X Vista de Código — Módulo Autenticación  
**Qué cambió en MD:** Se añadió nota aclaratoria: el Singleton garantiza una sola instancia de conexión Hazelcast **por proceso Node.js**, no por cluster. Con escalado horizontal, cada réplica tiene su propio `GridClientFacade` — todos comparten el mismo cluster Hazelcast como fuente de verdad.  
**Archivo MD:** [[Código - Módulo Autenticación]]

---

### [2026-06-14] Plan de Pruebas — Sección completa

**Tipo:** Adición (nuevo contenido del Laboratorio 05)  
**Sección del .docx:** 1 Plan de Pruebas (secciones 1.1 a 4.14)  
**Qué cambió en MD:** El MD estaba completamente en blanco (placeholders). Se completó con:

- **§ 1.1 Uso del Sistema:** descripción del contexto de pruebas de ConectaPUCP.
- **§ 1.2 Elementos a Probar:** módulos de Identidad/Accesos, Contenido Académico, Interacción Social, Notificaciones.
- **§ 1.3 Alcance:** incluye pruebas funcionales, integración, seguridad, rendimiento, usabilidad. Excluye infraestructura física, DR y carga masiva en producción.
- **§ 1.4 Asunciones** y **§ 1.5 Restricciones**: entorno Staging, credenciales sandbox, congelamiento de requisitos, limitaciones del equipo.
- **§ 2 Comunicación del Plan:** tabla COM-01 a COM-06 con inclusión **diferenciada** de: equipo desarrollo (ejecutor), JP Ana Valverde (validador académico), **DGTI — Dirección de Gestión de Tecnologías de Información** (habilitador institucional para CAS y SMTP), estudiantes voluntarios (usabilidad), administrador del sistema (flujos de admin), comité de arquitectura/docentes (receptores de resultados). Se documenta que la solicitud a DGTI debe tramitarse mediante **memorando formal** de la Facultad de Ciencias e Ingeniería.
- **§ 3 Enfoque de Pruebas:** Caja Negra (Partición de Equivalencia + Valores Límite) y Basado en Riesgos con tabla de priorización por nivel crítico/alto/medio/bajo.
- **§ 4 Tipos de Pruebas:** TP-01 Funcionales, TP-02 Integración, TP-03 Rendimiento (sin cambios de contenido, solo formato).
- **§ 5 Riesgos:** RSK-01/02/03 (sin cambios).
- **§ 6 Cronograma:** extendido hasta **15/07/2026** (fecha de examen/sustentación final del curso INF50). Se añadió hito previo: memorando a DGTI antes del 21/06/2026.
- **§ 7 Casos de Prueba:** dos pantallas seleccionadas con tablas completas de clases de equivalencia y especificaciones de caso válido e inválido:
  - **Pantalla 1:** Subida de Material Académico — 16 clases (CE01–CE16), casos CP-SM-01 (válido) y CP-SM-02 (inválido).
  - **Pantalla 2:** Postulación a Evaluador — 12 clases (CE01–CE12), casos CP-PE-01 (válido) y CP-PE-02 (inválido). Se aclara que **RF32 no aplica en esta pantalla** (es acción del admin en su panel, no del estudiante en el formulario).

**Archivo MD:** [[Plan de Pruebas]]

---

## Historial — Cambios ya aplicados en .docx

*(Mover aquí los bloques de arriba cuando los apliques en el documento oficial, anotando la fecha de aplicación.)*

| Fecha aplicación | Bloque | Notas |
|-----------------|--------|-------|
| — | — | Sin entradas aún |
