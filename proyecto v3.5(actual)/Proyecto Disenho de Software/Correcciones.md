# Correcciones — Auditoría de Arquitectura ConectaPUCP

> **Instrucciones de uso:**
> - Cada ítem tiene un checkbox. Solo tú marcas y eliminas — Claude no toca este archivo salvo para agregar nuevos problemas o actualizar el estado de uno existente.
> - Las secciones resueltas se marcan con `**Estado:** ✓ Resuelto` pero permanecen en el archivo hasta que tú decidas eliminarlas.
> - Los problemas están ordenados por severidad: crítico → medio → menor.

---

## Lista de tareas

### Críticos
- [x] **C1** — Write-Behind confunde Hazelcast-native con Kafka-based ✓
- [x] **C2** — DataReader no tiene mecanismo de activación definido (código ✓; diagrama login anulado → ver C5) → [[Correcciones#C2 — DataReader sin mecanismo de activación]]
- [x] **C3** — Dos caminos para notificaciones (Observer + Kafka) sin resolución ✓ → [[Correcciones#C3 — Dos caminos de notificación sin resolución]]
- [x] **C4** — `ICuentasAPI` crea acoplamiento directo entre UPs ✓ → [[Correcciones#C4 — `ICuentasAPI` viola la independencia de UPs]]
- [x] **C5** — Diagrama Inicio de Sesión reemplazado por Validación de Rol Evaluador (RF09 + RC14) ✓ → [[Correcciones#C5 — Reemplazar diagrama de Inicio de Sesión]]
- [x] **C6** — RC14 y RF09 documentados en Patrones de Persistencia, Patrones de Interacción con BD y Código - Gestor de Roles ✓ → [[Correcciones#C6 — RC14 y RF09 en Patrones y Vistas de Código]]

### Medios
- [x] **M1** — "Motor de Búsqueda" renombrado a "Indexador de Búsqueda" en Componentes - Servicio de Persistencia ✓ → [[Correcciones#M1 — "Motor de Búsqueda" nombra dos cosas distintas]]
- [x] **M2** — Mecanismo de streaming documentado (Content-Length pre-check + magic bytes + maxBytes en Object Storage) ✓ → [[Correcciones#M2 — Stream + validación de tamaño incoherente]]
- [ ] **M3** — Flujo de rechazo de archivos (post-202) no documentado → [[Correcciones#M3 — Flujo de rechazo de archivos no documentado]]

### Menores
- [x] **m1** — API Gateway: nota de routing añadida a Vista de Contenedores ✓ → [[Correcciones#m1 — API Gateway sin diagrama]]
- [x] **m2** — Postfix reemplazado por Google Workspace SMTP en Vista de Contexto ✓ → [[Correcciones#m2 — Postfix impreciso]]
- [x] **m3** — `GridClientFacade (Singleton)`: nota de aclaración añadida en Código - Módulo Autenticación ✓ → [[Correcciones#m3 — GridClientFacade Singleton en Node.js]]
- [x] **m4** — Numeración de patrones completada (4.5.6 a 4.5.11) ✓ → [[Correcciones#m4 — Numeración de patrones incompleta]]
- [x] **m5** — RF17 actualizado para incluir evaluadores; RF28 consolidado como referencia histórica ✓ → [[Correcciones#m5 — RF17 y RF28 duplicados]]

---

## Detalle de problemas

---

### C1 — Write-Behind mal explicado

**Archivos afectados:** [[Diagramas de Interacción]] · [[Componentes - Servicio de Persistencia]] · [[Código - Data Writer]]
**Severidad:** Crítico
**Estado:** ✓ Resuelto el 2026-06-05

#### El problema

El diseño mezcla dos mecanismos distintos como si fueran uno solo:

- **Write-Behind nativo de Hazelcast** funciona así: se configura un `MapStore` por cada `IMap`. Cuando una UP hace `map.put(key, value)`, Hazelcast bufferiza la escritura y llama al `MapStore.store()` después de un delay configurable. **Hazelcast es quien dispara la escritura. Kafka no interviene.**
- **Write-Behind via Kafka (manual)** funciona así: la UP publica un evento a Kafka. El `DataWriter` escucha ese tópico y persiste en PostgreSQL. **Kafka es el bus. Hazelcast no dispara nada.**

#### Dónde estaba la frase incorrecta

En [[Diagramas de Interacción]] (flujo de subida de archivo):

> *"El repositorio inserta los metadatos en la Grilla de Datos (Hazelcast). La Grilla aplica el patrón Write-Behind, delegando la inserción final en la BD física a un DataWriter mediante un evento asíncrono."*

Esta frase describía que Hazelcast publica a Kafka, lo cual **no existe nativo en Hazelcast**. Hazelcast no publica a Kafka de forma automática.

#### Lo que realmente ocurre según el código

En [[Código - Data Writer]], el `PersistenceEventSubscriber` consume de Kafka. Por lo tanto, las UPs publican a Kafka directamente, no a través de Hazelcast.

#### Corrección aplicada

El flujo real es: la UP hace dos operaciones independientes:
1. `map.put()` en Hazelcast (escribe en el Space para disponibilidad inmediata).
2. Publica un evento a Kafka (para que el DataWriter persista de forma asíncrona en PostgreSQL).

Ambas operaciones las hace la UP. Se eliminó la frase "La Grilla aplica Write-Behind via Kafka." y se actualizó el diagrama de secuencia añadiendo `Grilla Mensajería` como participante explícito.

---

### C2 — DataReader sin mecanismo de activación

**Archivos afectados:** [[Componentes - Servicio de Persistencia]] · [[Código - Data Reader]] · [[Diagramas de Interacción]]
**Severidad:** Crítico
**Estado:** ✓ Resuelto parcialmente el 2026-06-05
**Nota:** La corrección del diagrama de secuencia de Inicio de Sesión (`seq-inicio-sesion.md` y cambios en `inicio sesion - UP Cuentas.drawio.xml`) queda **anulada** — el diagrama será eliminado del informe según retroalimentación del evaluador (ver [[Correcciones#C5 — Reemplazar diagrama de Inicio de Sesión]]). La corrección del código (`Código - Data Reader.md` y `Data Reader.drawio.xml`) permanece válida.

#### El problema

El sistema afirma que cuando hay un cache miss en Hazelcast, el `DataReader` recupera datos de PostgreSQL y recarga el Space. Pero **ningún documento especifica quién detecta ese miss ni cómo se llama al DataReader.**

El flujo de inicio de sesión lo describe así:

> *"Si la información no está disponible en la grilla, el sistema solicita al Servicio de Persistencia que recupere los datos mediante el DataReader."*

¿Quién hace esa solicitud? ¿Cómo?

#### Opciones técnicas

- **Opción A — Hazelcast MapLoader (recomendada):** El DataReader implementa la interfaz `MapLoader` de Hazelcast. Cuando una UP hace `map.get(key)` y no hay resultado, Hazelcast automáticamente llama a `MapLoader.load(key)`. Este mecanismo es transparente para la UP; ella nunca sabe si hubo miss.
- **Opción B — Manual con retry:** La UP detecta el null, publica un evento Kafka ("cache_miss:usuario:123"), el DataReader lo consume, va a PostgreSQL, recarga el Space, y la UP reintenta. Requiere lógica de retry en la UP.

#### Corrección

Especificar explícitamente que el DataReader implementa `MapLoader` de Hazelcast (Opción A). Actualizar [[Código - Data Reader]] con el diagrama correspondiente y una descripción del contrato `MapLoader`.

---

### C3 — Dos caminos de notificación sin resolución

**Archivos afectados:** [[Diagramas de Interacción]] · [[Patrones de Diseño]] · [[Código - Gestor de Notificaciones]] · [[Componentes - Servicio de Notificaciones]]
**Severidad:** Crítico
**Estado:** ✓ Resuelto el 2026-06-05

#### El problema

El sistema tiene dos mecanismos de notificación activos simultáneamente sin que ningún documento indique cuál prevalece:

1. **Observer en memoria** (`NotificacionObserver.onPublicacionCreada()`) — se dispara desde `PublicacionService` o `ForoController`, síncrono, en el mismo proceso del Servicio Social.
2. **Kafka consumer** (`NotificacionConsumer`) — el Servicio de Notificaciones escucha tópicos de Kafka, completamente asíncrono.

Si el `NotificacionObserver` llama directamente al Servicio de Notificaciones vía HTTP, se **bypass** Kafka. Si el Observer solo publica a Kafka, entonces es simplemente un publisher, no un Observer real. En implementación esto generaría notificaciones duplicadas o condiciones de carrera.

Además, notificar síncronamente desde el Observer antes de retornar HTTP 201 viola RC03 (≤ 2 segundos de respuesta).

#### Corrección

Definir un único camino:

1. `PublicacionService` guarda la publicación y retorna DTO al controlador.
2. `PublicacionService` (o el Observer) **publica un evento a Kafka** — ese es su único rol.
3. El controlador retorna **HTTP 201 inmediatamente**.
4. El `NotificacionConsumer` en el Servicio de Notificaciones consume el evento de Kafka y procesa la notificación.
5. El `GamificacionObserver` también solo publica a Kafka; el Servicio Social tiene su propio consumer para gamificación.

El Observer en-proceso desaparece o queda reducido a ser un publisher de eventos Kafka. El diagrama de "Crear Publicación" debe reflejar esta secuencia.

---

### C4 — `ICuentasAPI` viola la independencia de UPs

**Archivos afectados:** [[Código - Gamificación]] · [[Componentes - Servicio Social]]
**Severidad:** Crítico

#### El problema

En `CalculadoraPuntosService` (Servicio Social), cuando un usuario sube de rango, se llama `ICuentasAPI.actualizarRango()`. Esto implica que el **Servicio Social hace una llamada HTTP directa al Servicio de Cuentas**.

En Space-Based Architecture, las UPs no se llaman entre sí directamente. Se comunican a través del Space (Hazelcast) o del bus (Kafka). Si el Servicio de Cuentas está caído en el momento en que el usuario sube de rango, la operación de gamificación falla o queda inconsistente. Introduce acoplamiento temporal entre dos UPs que deberían ser independientes.

#### Corrección

Cuando el usuario sube de nivel, el Servicio Social publica un evento Kafka:

```
RANGO_ACTUALIZADO { userId, nuevoRango, timestamp }
```

El Servicio de Cuentas tiene un consumer que escucha ese tópico y actualiza el rol/rango en Hazelcast y PostgreSQL. La interfaz `ICuentasAPI` desaparece y es reemplazada por un `RangoEventPublisher` o similar. Actualizar [[Código - Gamificación]] con este cambio.

---

### M1 — "Motor de Búsqueda" nombra dos cosas distintas

**Archivos afectados:** [[Vista de Contenedores]] · [[Componentes - Servicio de Persistencia]]
**Severidad:** Medio

#### El problema

En el modelo C4, el mismo nombre "Motor de Búsqueda" describe dos elementos distintos:

- **Vista de Contenedores:** "Motor de Búsqueda [ElasticSearch]" — este es el servidor ElasticSearch, un contenedor externo de infraestructura.
- **Componentes - Servicio de Persistencia:** "Motor de Búsqueda" — este es el componente de software (indexador) que hace llamadas HTTP a ElasticSearch para actualizar índices.

En C4, el componente interno y el contenedor externo deben tener nombres distintos. Además, en [[Código - Data Writer]], el componente ya aparece nombrado correctamente como `SearchIndexer`.

#### Corrección

- En [[Componentes - Servicio de Persistencia]]: renombrar a **"Indexador de Búsqueda"** (o `SearchIndexer` para consistencia con el código).
- En [[Vista de Contenedores]]: mantener **"Motor de Búsqueda [ElasticSearch]"** como el servidor externo.

---

### M2 — Stream + validación de tamaño incoherente

**Archivos afectados:** [[Diagramas de Interacción]] · [[Código - Validación de Material]]
**Severidad:** Medio

#### El problema

El diseño establece dos cosas simultáneamente que se contradicen técnicamente:

1. *"La Fachada recibe la data usando un Stream en lugar de cargar el archivo completo en RAM"*
2. `SizeValidationHandler` valida que el archivo no supere 100 MB.

Para saber el tamaño total de un stream, debes leerlo completo, lo que anula la ventaja del streaming. La única alternativa sin leer el stream completo es confiar en el header HTTP `Content-Length`, pero este header puede ser falsificado por el cliente (spoofing).

El mismo problema aplica a `MimeTypeValidationHandler`: para validar el tipo MIME por magic bytes, debes leer al menos los primeros bytes del archivo.

#### Corrección

Documentar el mecanismo real:

1. `SizeValidationHandler` verifica el header `Content-Length` como check preliminar (rechazo rápido si supera 100 MB).
2. El stream se escribe directamente a Object Storage con un límite de bytes (`maxBytes = 100 MB`).
3. Si el stream supera el límite antes de terminar, se aborta la operación y se borra el objeto parcial del Object Storage.
4. `MimeTypeValidationHandler` lee solo los primeros N bytes (magic bytes) del stream antes de pasarlo al almacenamiento.

Actualizar la descripción de [[Código - Validación de Material]] y el flujo de subida en [[Diagramas de Interacción]].

---

### M3 — Flujo de rechazo de archivos no documentado

**Archivos afectados:** [[Diagramas de Interacción]] · [[Componentes - Servicio de Archivos]]
**Severidad:** Medio

#### El problema

El upload retorna HTTP 202 con el archivo ya guardado en Object Storage y metadatos en Hazelcast, en estado "pendiente de aprobación". Un evaluador puede **rechazar** el archivo (RF24). Pero en ningún documento se especifica qué ocurre entonces:

- ¿Quién borra el binario de Object Storage?
- ¿Quién actualiza el estado en Hazelcast y PostgreSQL?
- ¿Quién dispara la notificación al estudiante indicando el rechazo?
- ¿El DataWriter maneja el borrado como un tipo especial de evento?

RF26 menciona notificación al postulante de evaluador pero no cubre el rechazo de archivos. Es un flujo de negocio completo con implicaciones en Object Storage (almacenamiento de objetos que puede quedar huérfano) que no aparece en los diagramas de interacción.

#### Corrección

Agregar un diagrama de interacción en [[Diagramas de Interacción]] para el escenario de rechazo de archivo por evaluador, cubriendo:
1. Evaluador envía decisión de rechazo con motivo.
2. Servicio de Archivos actualiza estado en Hazelcast → evento Kafka `ARCHIVO_RECHAZADO`.
3. DataWriter actualiza PostgreSQL (estado = RECHAZADO) y borra binario de Object Storage.
4. Servicio de Notificaciones notifica al estudiante con el motivo.

---

### m1 — API Gateway sin diagrama

**Archivos afectados:** [[Vista de Contenedores]]
**Severidad:** Menor

#### El problema

El API Gateway aparece en la Vista de Contenedores como entrada única HTTPS, pero no tiene una sección de componentes ni se especifican sus responsabilidades:

- ¿Valida tokens JWT/sesiones (auth gateway) o solo hace routing?
- ¿Cómo decide a qué UP enrutar?
- ¿Tiene rate limiting, CORS policy?

RC13 implica que cada UP valida tokens desde Hazelcast directamente, lo que sugiere que el Gateway solo hace routing. Pero esto debe decirse explícitamente.

#### Corrección

Agregar un párrafo de sustento en [[Vista de Contenedores]] indicando que el API Gateway es un reverse proxy de routing (nginx o similar) sin lógica de autenticación propia. La validación de tokens/sesiones ocurre en cada UP consultando Hazelcast (RC13). El Gateway solo aplica TLS termination y reglas de CORS.

---

### m2 — Postfix impreciso

**Archivos afectados:** [[Vista de Contexto]]
**Severidad:** Menor

#### El problema

La Vista de Contexto describe el sistema externo de correo como "Gestionado vía Postfix." PUCP usa Google Workspace (Gmail institucional). Postfix es un servidor SMTP que se auto-hostea. No es el sistema de correo de PUCP.

#### Corrección

Actualizar la descripción del sistema externo a: *"Servicio de correo institucional PUCP (Google Workspace). La comunicación se realiza mediante SMTP relay hacia smtp.gmail.com con credenciales institucionales OAuth2 o credenciales de app."* Ajustar también [[Código - Mailer Client]] si hace referencia explícita a Postfix.

---

### m3 — GridClientFacade Singleton en Node.js

**Archivos afectados:** [[Código - Módulo Autenticación]]
**Severidad:** Menor

#### El problema

El diseño documenta `GridClientFacade` como `(Singleton)`. En Node.js, cada proceso tiene su propio heap: no existe un singleton compartido entre instancias del UP. Con múltiples instancias del Servicio de Cuentas escaladas horizontalmente, cada instancia tiene su propio cliente Hazelcast. Llamarlo "Singleton" sin aclaración puede llevar a pensar que es una instancia global compartida por todo el cluster.

#### Corrección

Agregar una nota en [[Código - Módulo Autenticación]] aclarando que el Singleton garantiza **una sola instancia de conexión Hazelcast por proceso Node.js**, no por cluster. Cada instancia UP tiene su propia conexión al Hazelcast cluster, lo cual es el comportamiento correcto de los clientes Hazelcast.

---

### m4 — Numeración de patrones incompleta

**Archivos afectados:** [[Patrones de Diseño]]
**Severidad:** Menor

#### El problema

La sección numera los primeros cinco patrones (4.5.1 a 4.5.5) y luego abandona la numeración para Strategy, Facade UP Notificaciones, Adapter MailSender, Front Controller, Observer Kafka y Template View.

#### Corrección

Completar la numeración: 4.5.6 Strategy, 4.5.7 Facade UP Notificaciones, 4.5.8 Adapter MailSender, 4.5.9 Front Controller, 4.5.10 Observer Kafka, 4.5.11 Template View.

---

### m5 — RF17 y RF28 duplicados

**Archivos afectados:** [[Requerimientos Funcionales]]
**Severidad:** Menor

#### El problema

RF17 describe la carga de archivos para estudiantes. RF28 describe la carga de archivos para alumnos y evaluadores. RF28 es casi idéntico a RF17 pero extiende el actor. Esto genera redundancia y puede causar inconsistencias si uno se actualiza y el otro no.

#### Corrección

Consolidar: RF17 se reformula para incluir a estudiantes y evaluadores. RF28 se elimina o se convierte en un refinamiento explícito de RF17 (ej. RF28 → *"Extensión de RF17: aplica también a evaluadores"*).

---

### C5 — Reemplazar diagrama de Inicio de Sesión

**Archivos afectados:** [[Diagramas de Interacción#Inicio de Sesión (UP Cuentas)]] · [[Código - Gestor de Roles]] · [[Código - Módulo Autenticación]]
**Severidad:** Crítico
**Fuente:** Retroalimentación del evaluador del curso

#### El problema

El diagrama de interacción 4.8.1 (Inicio de Sesión) fue observado por el evaluador con el siguiente argumento:

> *"No se sustenta la inclusión de diagrama 4.8.1 Inicio de sesión ya que no cubre un escenario clave al no representar el corazón ni la razón de ser de la solución (plataforma web ConectaPUCP) ni como lo distingue de otra soluciones."*

Adicionalmente: *"Y estos diagramas deben guardar correspondencia con los diagramas de clases de diseño."*

Un inicio de sesión vía SSO es genérico — cualquier plataforma PUCP lo tiene. No muestra la propuesta de valor diferenciadora de ConectaPUCP.

#### Corrección

Eliminar la sección `## Inicio de Sesión (UP Cuentas)` de [[Diagramas de Interacción]] y reemplazarla por un diagrama de un escenario clave.

**Reemplazo recomendado: Validación de Solicitud de Rol Evaluador (RF09 + RC14)**

Este escenario cubre directamente los dos puntos de retroalimentación del evaluador:
- Es el corazón de la propuesta de valor: el sistema de validación de evaluadores con plazos estrictos es lo que distingue ConectaPUCP de plataformas genéricas de archivos.
- Responde además al segundo punto de feedback (RC14 y RF09, ver [[Correcciones#C6 — RC14 y RF09 en Patrones y Vistas de Código]]).
- El drawio ya existe: `assets/Diagramas/diagramas interaccion/UP Cuentas/validacion rol evaluador - UP Cuentas.drawio.xml`.

El flujo abarca:
1. Postulante envía solicitud con evidencias → Servicio de Cuentas la almacena como `SolicitudPendiente`.
2. Sistema verifica plazo de 7 días hábiles; si vence → estado `ANULADA`, notificación al postulante.
3. Administrador revisa → aprueba o rechaza → `GestorRoles` actualiza rol en Hazelcast (propagación en tiempo real, RC15) y persiste via DataWriter (Kafka).
4. `AuditoriaService` registra la entrada de log inmutable en `auditoria_privilegios` (RC14).
5. `NotificacionObserver` publica evento a Kafka → Servicio Notificaciones envía correo al postulante (RF26).

**Correspondencia con Vistas de Código requerida:**
- `Código - Gestor de Roles` — debe mostrar `GestorRoles`, `ISolicitudEvaluadorRepository`, `AuditoriaService`.
- `Código - Módulo Autenticación` — sesión actualizada en Hazelcast una vez aprobado el rol.

**Alternativa (si el equipo prefiere un escenario funcional de archivos):**
- Descarga de Material Académico (RF20, RF29) — muestra: búsqueda → Proxy verifica acceso → DataReader cache-through → `SignedUrlService` genera URL firmada → usuario descarga. Drawio ya existe: `descarga de archivo - UP Archivos.drawio.xml`. Corresponde a `Código - Repositorio de Archivos`.

---

### C6 — RC14 y RF09 en Patrones y Vistas de Código

**Archivos afectados:** [[Patrones de Interacción con BD]] · [[Patrones de Persistencia]] · [[Código - Data Mapper]] · [[Código - Gestor de Roles]]
**Severidad:** Crítico
**Fuente:** Retroalimentación del evaluador del curso

#### El problema

El evaluador preguntó:

> *"¿Qué patrones reflejan la funcionalidad de los requerimientos RC14 y RF09 de la solución? Debe actualizar las Vistas de Código correspondientes para la inclusión de estos patrones."*

**RF09** — *"El sistema deberá permitir al administrador validar las evidencias presentadas por los postulantes al rol de evaluador en un plazo máximo de 7 días hábiles, antes de otorgarles el rol correspondiente. Pasado este tiempo se anula la solicitud."*

**RC14** — *"El sistema debe registrar un log inalterable de quién y cuándo modificó un privilegio de usuario (especialmente para el RF09)."*

**Gap actual:**
- [[Patrones de Interacción con BD]] documenta Data Mapper y DTO pero **no vincula explícitamente** ningún patrón con RF09 ni RC14.
- [[Patrones de Persistencia]] documenta Identity Field y Dependent Mapping pero **no menciona Audit Log** para RC14.
- `assets/Diagramas/codigo/UP Cuentas/Auditoria.drawio.xml` existe como diagrama pero **no está incorporado** en ninguna Vista de Código del informe.
- [[Código - Gestor de Roles]] no muestra el mecanismo de auditoría ni la persistencia de solicitudes de evaluador.

#### Patrones que responden a RF09 y RC14

**Para RF09 — Workflow de validación de evaluadores:**
- **Repository** (`ISolicitudEvaluadorRepository`) — abstrae el acceso a solicitudes pendientes/aprobadas/rechazadas/anuladas. El `DataReader` (vía MapLoader) resuelve cache miss; el `DataWriter` persiste los cambios de estado.
- **Data Mapper** (`SolicitudEvaluadorDataMapper`, `UsuarioDataMapper`) — transforma las solicitudes a/desde registros PostgreSQL sin exponer SQL al dominio. Ya documentado en [[Patrones de Interacción con BD]] pero sin mención explícita de RF09.
- **State** (implícito en el dominio) — `SolicitudEvaluador` transita por estados: `PENDIENTE → APROBADA | RECHAZADA | ANULADA`. Puede mencionarse como parte del diseño del dominio en [[Código - Gestor de Roles]].

**Para RC14 — Log inalterable de cambios de privilegio:**
- **Audit Log** — tabla `auditoria_privilegios` de solo-inserción (append-only). `AuditoriaService` crea una entrada cada vez que `GestorRoles` modifica un privilegio. `AuditoriaDataMapper` persiste la entrada. Nunca se borran ni actualizan registros. El drawio ya existe: `assets/Diagramas/codigo/UP Cuentas/Auditoria.drawio.xml`.

#### Corrección

1. En [[Patrones de Interacción con BD#Data Mapper]]: añadir párrafo que vincule explícitamente `SolicitudEvaluadorDataMapper` y `UsuarioDataMapper` con RF09, especificando qué datos persisten (evidencias, estado, timestamps, actor).
2. En [[Patrones de Persistencia]]: añadir nueva sección `## Audit Log` que documente el patrón para RC14: tabla append-only `auditoria_privilegios`, `AuditoriaDataMapper`, entrada de log inmutable con `(userId, adminId, accion, timestamp, nuevoPrivilegioId)`.
3. En [[Código - Gestor de Roles]]: actualizar diagrama para incluir `AuditoriaService`, `AuditoriaDataMapper` y la relación con `ISolicitudEvaluadorRepository`. Crear Mermaid de `Auditoria.drawio.xml`.
4. Si se adopta el escenario de C5 (Validación de Rol Evaluador): el diagrama de interacción debe mostrar explícitamente la llamada a `AuditoriaService.registrar(log)` como paso visible en el flujo.

---

## Historial de correcciones

### 2026-06-05 — C1: Write-Behind mal explicado

**Archivos MD modificados:**
- [[Diagramas de Interacción#Subida de un Archivo Académico (UP Archivos)]] — Cabecera: `![[seq-subida-archivo.png]]` → `![[seq-subida-archivo.md]]`. Paso 4, bloque `[archivo válido]`, párrafo *"Integración con SBA y persistencia asíncrona"*: eliminada la frase "La Grilla aplica el patrón Write-Behind delegando a DataWriter via evento asíncrono"; reemplazada por las dos operaciones independientes del Repositorio (put en Hazelcast + publish a Kafka).
- [[Componentes - Servicio de Persistencia#Sustento]] — Bullet `**Persistencia asíncrona (Write-Behind via Kafka):**`: reemplazado "Las UPs publican cambios en la Grilla de Datos o Mensajería" por la descripción de las dos operaciones independientes; añadida la aclaración "La Grilla de Datos no dispara el evento; es la UP quien publica directamente a Kafka."
- [[Código - Data Writer]] — Cabecera: `![[codigo-data-writer.png]]` → `![[codigo-data-writer.md]]`. Sin cambios en `## Sustento de decisiones de diseño`.

**Diagramas Mermaid creados:**
- `assets/Diagramas/diagramas interaccion/UP Archivos/seq-subida-archivo.md` — Participante `Grilla Mensajería` añadido. Flecha `Grilla Datos → DataWriter: evento write-behind` eliminada. Flecha `Repositorio Archivos → Grilla Mensajería: publish(ARCHIVO_SUBIDO)` añadida. Flujo asíncrono `Grilla Mensajería ->> DataWriter` fuera del bloque `alt`.
- `assets/Diagramas/codigo/Servicio Persistencia/codigo-data-writer.md` — Conversión de `codigo-data-writer.png` a Mermaid sin cambio de contenido.

**Diagramas drawio actualizados:**
- `assets/Diagramas/diagramas interaccion/UP Archivos/subida de archivo - UP Archivos.drawio.xml` — Participante `Grilla Mensajería` añadido (id=51). Celda id=39 (`evento write-behind`) eliminada. Flecha `publish(ARCHIVO_SUBIDO)` (id=53) de Repositorio Archivos a Grilla Mensajería añadida. Nota asíncrona en rosa (id=55) y flecha `onMessage(ARCHIVO_SUBIDO)` (id=56) añadidas.

---

### 2026-06-05 — C2: DataReader sin mecanismo de activación

**Archivos MD modificados:**
- [[Código - Data Reader#Sustento de decisiones de diseño]] — Cabecera: `![[codigo-data-reader.png]]` → `![[codigo-data-reader.md]]`. Nueva subsección `### Mecanismo de activación: interfaz MapLoader de Hazelcast` añadida al inicio del sustento (antes de `### Principio de Responsabilidad Única`): DataReader implementa `MapLoader<K,V>`; `load(key)` invocado automáticamente por Hazelcast en cache miss; proceso transparente para la UP; `GridReloadPort` exclusivo para `preload()` proactivo.
- [[Diagramas de Interacción#Inicio de Sesión (UP Cuentas)]] — Cabecera: `![[seq-inicio-sesion.png]]` → `![[seq-inicio-sesion.md]]`. Tercer párrafo de la descripción: eliminada la frase "el sistema solicita al Servicio de Persistencia que recupere los datos mediante el DataReader"; reemplazada por la descripción explícita del mecanismo MapLoader.

**Diagramas Mermaid creados:**
- `assets/Diagramas/codigo/Servicio Persistencia/codigo-data-reader.md` — `CacheMissListener` eliminado; `MapLoader <<interface>>` añadido con relación `implements`; `MapperRegistry` añadido; `GridReloadPort` etiquetado "preload proactivo".
- `assets/Diagramas/diagramas interaccion/UP Cuentas/seq-inicio-sesion.md` — Bloque `opt [cache miss]`: flecha `GD ->> DR: load(correo)` con nota sobre MapLoader automático e invisibilidad para la UP.

**Diagramas drawio actualizados:**
- `assets/Diagramas/codigo/Servicio Persistencia/Data Reader.drawio.xml` — `CacheMissListener` eliminado; `MapLoader <<Hazelcast MapLoader>>` añadido (fillColor verde); `MapperRegistry` añadido; arista `e_impl` (dashed hollow triangle) `DataReader → MapLoader`. Nota amarilla: "Hazelcast llama load(key) automáticamente cuando IMap.get(key) devuelve null."
- `assets/Diagramas/diagramas interaccion/UP Cuentas/inicio sesion - UP Cuentas.drawio.xml` — Celda id=36: label `recargarCuenta(correo)` → `load(correo)`. Celda id=52: nota actualizada con MapLoader y transparencia para la UP.

---

### 2026-06-05 — C3: Dos caminos de notificación

**Archivos MD modificados:**
- [[Diagramas de Interacción#Crear Publicación (UP Sociales)]] — Cabecera: `![[seq-crear-publicacion.png]]` → `![[seq-crear-publicacion.md]]`. Descripción completa reescrita: eliminados `ModeradorObserver`, `GamificacionObserver`, `NotificacionObserver` síncronos antes de HTTP 201; reemplazados por flujo Kafka-async con `GamificacionConsumer` y `NotificacionConsumer`.
- [[Patrones de Diseño#4.5.5 Patrón Observer — "Publicaciones y Foros"]] — Sección 4.5.5 completa reescrita: eliminado Observer en-proceso con `IForoObserver`; reemplazado por Observer vía Kafka donde `PublicacionService` publica `PUBLICACION_CREADA` y los consumers son los observadores.
- [[Código - Publicaciones y Foros]] — Cabecera: `![[codigo-publicaciones-foros.png]]` → `![[codigo-publicaciones-foros.md]]`. Descripción del diagrama actualizada (eliminados `IForoObserver`, `NotificacionForoObserver`, `GamificacionObserver`; añadido `IEventPublisher`). Sección `### Desacoplamiento entre Componentes Lógicos`: párrafo sobre `IEventPublisher` y `publicarEvento()` añadido al inicio.

**Diagramas Mermaid creados:**
- `assets/Diagramas/diagramas interaccion/UP Social/seq-crear-publicacion.md` — nuevo archivo. Flujo: guardar en Grilla Datos → `publish(PUBLICACION_CREADA)` a Kafka → HTTP 201 inmediato → `onMessage(PUBLICACION_CREADA)` asíncrono a GamificacionConsumer y NotificacionConsumer.
- `assets/Diagramas/codigo/UP Social/codigo-publicaciones-foros.md` — nuevo archivo. Clases: ForoController, IPublicacionService, IComentarioService, PublicacionService, ComentarioService, IEventPublisher, Publicacion, PublicacionDTO. Relación `PublicacionService ..> IEventPublisher : publica a Kafka`.

**Diagramas drawio actualizados:**
- `assets/Diagramas/diagramas interaccion/UP Social/publicacion y notificacion - UP Social.drawio.xml` — reescrito completo (página pageWidth=1700). `Gamificación` → `GamificacionConsumer` (id=15-16); `UP Notificaciones` → `NotificacionConsumer` (id=17-18); `Grilla Mensajería` añadida (id=13-14); bloque `opt` eliminado; `publish(PUBLICACION_CREADA)` a Kafka (id=35); HTTP 201 retornado antes de separador async (id=38, id=42); `onMessage(PUBLICACION_CREADA)` asíncrono a GamificacionConsumer (id=43) y NotificacionConsumer (id=45).
- `assets/Diagramas/codigo/UP Social/Publicaciones y foros.drawio.xml` — reescrito (pageWidth=1900). Eliminados: `IForoObserver` (id=obs), `NotificacionForoObserver` (id=noti), `GamificacionObserver` (id=gam), edges r5/r5_label/r6/r7. Modificados: `pubsvc` — `<<Subject>>` eliminado; `pubsvc_attrs` → `-eventPublisher: IEventPublisher`; `pubsvc_methods` → `+publicarEvento(tipo, pub): void`; `pubif_methods` → `+suscribir(obs): void` eliminado. Añadidos: `epubif` (IEventPublisher, fillColor=#D5E8D4), `epubif_methods`, edge `r_ep` con label "publica a Kafka".

---

*Generado el 2026-06-05 · Basado en auditoría completa de arquitectura ConectaPUCP*
