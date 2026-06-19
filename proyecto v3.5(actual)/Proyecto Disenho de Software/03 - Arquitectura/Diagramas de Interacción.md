# Diagramas de Interacción

---

## Validación de Solicitud de Rol Evaluador (UP Cuentas)

![[seq-validacion-rol-evaluador.md]]

**Descripción del escenario:**

Este escenario cubre el corazón diferenciador de ConectaPUCP: el flujo de validación de postulantes al rol de evaluador con plazos estrictos (RF09), propagación de permisos en tiempo real (RC15) y registro inmutable de auditoría (RC14).

1. **Acción del Administrador:** El Administrador envía `PUT /roles/evaluador` al Controlador de Cuentas con el ID del usuario y la decisión (aprobación o rechazo).
2. **Orquestación del Gestor de Roles:** El Controlador delega en `GestorRoles.validarSolicitudEvaluador(idUsuario)`. El Gestor verifica el estado de la solicitud y determina si la resolución es válida.
3. **Actualización de Roles en el Space (RC15):** El Gestor llama a `actualizarRoles()` en la Grilla de Datos (Hazelcast). El nuevo rol queda disponible de forma inmediata para todas las UPs que consulten el Space, cumpliendo RC15 (propagación en tiempo real sin latencia de BD).
4. **Publicación de Evento a Kafka:** El Gestor publica el evento `ROL_ACTUALIZADO` a la Grilla de Mensajería (Kafka). El `DataWriter` consume el evento y persiste el cambio de rol en PostgreSQL de forma asíncrona (Write-Behind).
5. **Auditoría Inmutable (RC14):** El Gestor notifica a `AuditoriaService.registrarCambioPrivilegio(log)`. El servicio de auditoría guarda la entrada en la Grilla de Datos y publica `AUDITORIA_ROL` a Kafka. El `DataWriter` lo persiste en la tabla append-only `auditoria_privilegios` — solo INSERT, nunca UPDATE/DELETE.
6. **Flujo Asíncrono de Notificación:** `NotificacionConsumer` (dentro del Servicio de Notificaciones UP) consume el evento de Kafka y envía correo al postulante con la decisión (RF26). El `NotificacionConsumer` es interno a la UP de Notificaciones — no es una llamada HTTP cross-UP.
7. **Expiración Automática (RF09 — SolicitudExpirationJob):**
   - El `SolicitudExpirationJob` (cron diario dentro de la UP de Cuentas) detecta solicitudes con más de 7 días hábiles sin resolución.
   - Cambia estado a `ANULADA` en Hazelcast → publica `SOL_ANULADA` a Kafka → `DataWriter` persiste → `NotificacionConsumer` notifica al postulante.
8. **Estructura de Control de Flujo (alt):**
   - **\[aprobación\]:** Rol actualizado a EVALUADOR en Hazelcast + PostgreSQL. Auditoría registrada. Postulante notificado por correo.
   - **\[rechazo\]:** Solicitud marcada como RECHAZADA. Auditoría registrada. Postulante notificado con motivo.
   - **\[evidencia inválida / vencida\]:** Estado → ANULADA. Auditoría registrada. Postulante notificado automáticamente.

---

## Subida de un Archivo Académico (UP Archivos)

![[seq-subida-archivo.md]]

**Descripción del escenario:**

1. **Inicio de la Petición:** El Estudiante/Evaluador selecciona un archivo desde la Aplicación Web, la cual envía una petición `POST /archivos` al Controlador Archivos.
2. **Orquestación (Facade):** El Controlador delega el trabajo al componente Gestión Archivos, el cual actúa como Fachada. La fachada recibe la data usando un **Stream** en lugar de cargar todo el archivo en la memoria RAM del servidor.
3. **Fase de Validación (Chain of Responsibility):** La Fachada invoca al componente Validación Material para comprobar de forma granular el tamaño, la extensión y el tipo MIME del archivo. El validador retorna un `ValidationResponseDTO`.
4. **Estructura de Control de Flujo (alt):**
   - **\[archivo válido\]:**
     - *Almacenamiento Físico:* La Fachada guarda primero el flujo binario (stream) directamente en el Object Storage. Retorna `objectKey` + `checksum`.
     - *Persistencia de Metadatos:* La Fachada ordena al Repositorio Archivos guardar los metadatos de dominio (autor, curso, ciclo y el `objectKey`).
     - *Integración con SBA y persistencia asíncrona:* El repositorio realiza dos operaciones independientes: (1) `put(metadata, objectKey)` en la Grilla de Datos (Hazelcast), para que el archivo quede disponible en el Space de forma inmediata; (2) publica el evento `ARCHIVO_SUBIDO` en la Grilla de Mensajería (Kafka). El `DataWriter` consume ese evento de forma asíncrona y persiste los metadatos definitivos en PostgreSQL. La Grilla de Datos **no** dispara este evento; es el Repositorio quien publica directamente a Kafka.
     - *Respuesta Limpia (DTO):* La Fachada construye un `ArchivoDTO` que no transporta el BLOB de regreso, sino únicamente datos estructurales y la URL/clave técnica.
     - El Controlador responde con **HTTP 202 (Accepted)** — el archivo fue subido exitosamente, pero queda en estado "pendiente de aprobación".
   - **\[archivo inválido\]:** La Fachada devuelve el DTO con los errores detectados. El Controlador responde con **HTTP 400 (Bad Request)**.

---

## Crear Publicación (UP Sociales)

![[seq-crear-publicacion.md]]

**Descripción del escenario:**

1. **Inicio del Flujo:** El estudiante o evaluador accede a la Aplicación Web para crear una publicación en el foro.
   - **\[opt — usuario cancela antes de enviar\]:** La Aplicación Web descarta el formulario localmente sin realizar ninguna llamada al servidor.
2. **Envío de la Solicitud:** La Aplicación Web envía `POST /social/publicaciones` al `ForoController`.
3. **Estructura de Control de Flujo (alt):**
   - **\[datos válidos\]:**
     - *Mapeo de entidad:* `ForoController` delega en `PublicacionService` con `crearPublicacion(PublicacionDTO)`. El servicio invoca `PublicacionMapper.toEntity(dto)` para convertir el DTO en la entidad de dominio `Publicacion`.
     - *Persistencia:* El servicio llama a `PublicacionRepository.save(entidad)`, que escribe en la Grilla de Datos (Hazelcast) y retorna el `id persistido`.
     - *Publicación del evento:* `PublicacionService` invoca `publish(PUBLICACION_CREADA)` en la Grilla de Mensajería (Kafka) y recibe `ack`. A partir de este punto el request HTTP puede cerrarse.
     - *Respuesta inmediata:* El servicio retorna el `PublicacionDTO` al controlador, que responde con **HTTP 201** sin esperar a los consumidores.
   - **\[datos inválidos\]:** `ForoController` detecta errores de validación y retorna **HTTP 400**. `PublicacionService` no es invocado y no se publica ningún evento a Kafka.
4. **Flujo Asíncrono — Consumidores Kafka (loop):** Independientemente del request HTTP, tres consumidores reaccionan a `PUBLICACION_CREADA` — garantizando RC03 (≤ 2 s) y eliminando el riesgo de duplicados:
   - *\[moderación\]:* `ModeradoConsumer` invoca `evaluar(EstadoModeracion)` para determinar si la publicación requiere revisión.
   - *\[gamificación\]:* `GamificacionConsumer` llama a `CalculadoraPuntosService.registrarEvento(TipoAccion, usuario, meta)`. El servicio ejecuta `seleccionarStrategy(TipoAccion)` para obtener `CalculadoraParticipacionService «Strategy»`, que invoca `calcularPuntos(evento)`. La estrategia consulta `MotorReglasService.evaluarReglas(ReglaPuntaje)`, recibe `ReglaPuntaje / riesgo` y retorna los `puntos`. El servicio cierra con `guardar(Evento) / OK` hacia el consumer.
   - *\[notificaciones\]:* `NotificacionConsumer` (componente interno del Servicio de Notificaciones UP) recibe el evento de Kafka e invoca al `NotificacionOrquestador` para enviar las alertas. No es una llamada HTTP cross-UP — el consumer vive dentro de la UP de Notificaciones y opera sobre su propio orquestador interno.

---

## Envío de Correo (UP Notificaciones)

![[seq-envio-correo.md]]

**Descripción del escenario:**

1. **Origen del Evento:** Ocurre un evento relevante en ConectaPUCP — por ejemplo: archivo pendiente de validación, solicitud de evaluador aprobada o rechazada, respuesta en una publicación, o alerta de calendario. La UP que detecta el evento lo publica en la Grilla de Mensajería (Kafka).
2. **Recepción y Orquestación (Facade):** El `NotificacionController` recibe la petición y delega en el `NotificacionOrquestador`, que actúa como Fachada y coordina el flujo completo.
3. **Verificación de Preferencias:** El orquestador consulta las preferencias del usuario en la Grilla de Datos para determinar si tiene activada la categoría de alerta correspondiente.
4. **Estructura de Control de Flujo (alt):**
   - **\[notificación activa\]:**
     - *Generación de contenido (Template View):* El orquestador solicita al Motor de Plantillas generar el HTML del correo usando la plantilla correspondiente y los datos del evento: nombre del usuario, tipo de alerta, fecha, curso, archivo o publicación relacionada.
     - *Envío:* El orquestador pasa el mensaje al Mailer Client (`MailSender` — Adapter sobre Nodemailer), que lo despacha al servidor SMTP institucional PUCP.
     - *Trazabilidad:* El sistema registra en la Grilla de Datos el identificador del mensaje, destinatario, tipo de evento, fecha, estado y resultado del envío.
   - **\[notificación desactivada\]:** El orquestador descarta el evento sin generar ni enviar correo.
5. **Reintento Asíncrono (RC10):** Si el envío falla, el evento queda marcado en Kafka para reintento automático.

---

*Ver también: [[Código - Módulo Autenticación]] · [[Código - Validación de Material]] · [[Código - Publicaciones y Foros]] · [[Código - Gestor de Notificaciones]]*
