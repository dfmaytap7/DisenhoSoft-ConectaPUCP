# Plan de Pruebas

---

## 1. Contexto de las Pruebas

### 1.1 Uso del Sistema

ConectaPUCP es una plataforma web distribuida orientada a tres perfiles de usuario: estudiantes, evaluadores y administradores de la comunidad universitaria. El sistema habilita el intercambio descentralizado de recursos académicos, la interacción en foros, la autogestión de grupos de estudio y la gobernanza de materiales mediante flujos de validación. El ciclo de pruebas se ejecutará tomando como eje los flujos de negocio transversales, garantizando que el comportamiento de los componentes responda con precisión a las reglas de negocio de cada perfil bajo condiciones de concurrencia.

### 1.2 Elementos a Probar

**Módulo de Identidad y Accesos (Servicio de Cuentas):**
- Autenticación centralizada mediante el protocolo institucional SSO CAS.
- Gestión, persistencia y aislamiento de roles (Estudiante, Evaluador, Administrador).
- Control de sesiones y ciclo de vida de las cuentas por parte del administrador.

**Módulo de Contenido Académico (Servicio de Archivos):**
- Carga de materiales de estudio al repositorio centralizado y validación de formato/tamaño.
- Flujo de gobernanza: asignación, validación, aprobación o rechazo de documentos por el Evaluador.
- Motor de búsqueda indexada y filtrado avanzado de recursos educativos.

**Módulo de Interacción Social (Servicio Social y Gamificación):**
- Hilos de discusión en foros, publicación de comentarios y lógica distributiva de votos (likes).
- Creación, asignación de miembros y autogestión de Grupos de Estudio.
- Motor de gamificación: reglas de asignación de puntajes, medallas y actualización del perfil.

**Módulo de Eventos (Servicio de Notificaciones):**
- Despacho asíncrono de alertas y confirmaciones transaccionales por correo electrónico (SMTP).

### 1.3 Alcance de las Pruebas

Se incluyen los requerimientos de prioridad **Alta** y **Media**:
- **Pruebas Funcionales:** Flujos de negocio principales (autenticación, carga de archivos, foros, postulación a evaluador).
- **Pruebas de Integración:** Comunicación asíncrona entre UPs vía Space (Hazelcast) y bus de eventos (Kafka); integración con CAS y SMTP.
- **Pruebas de Seguridad:** Control de acceso por roles, gestión de sesiones, validación MIME de archivos.
- **Pruebas de Rendimiento:** Tiempos de respuesta ≤ 2 s bajo ≥ 100 usuarios concurrentes (RC03).
- **Pruebas de Usabilidad:** Navegación en flujos críticos con usuarios reales.

Se excluyen:
- Pruebas de infraestructura física (hardware, red del datacenter).
- Failover/Disaster Recovery a nivel de datacenter.
- Pruebas de carga masiva en producción real.

### 1.4 Asunciones

- El equipo dispone de credenciales de prueba estables para CAS, SMTP y almacenamiento (sandbox DGTI).
- Existe un entorno Staging/Testing aislado con Kafka y Redis/Hazelcast configurados.
- El set de Mock Data simula densidad, volumen y tipos de archivos reales del entorno estudiantil.
- Los requisitos están congelados durante la ventana de ejecución de pruebas.

### 1.5 Restricciones

- **Temporal:** La ejecución está acotada por el calendario académico del semestre 2026-1.
- **Infraestructura:** Sin entorno espejo de producción a gran escala; rendimiento se simula con herramientas de inyección de carga.
- **Terceros:** La disponibilidad de CAS y SMTP (servicios PUCP) puede retrasar las pruebas de integración.
- **Recursos:** El diseño, ejecución y documentación recae únicamente en el equipo de desarrollo (rol cruzado Dev/QA).

---

## 2. Comunicación del Plan

### 2.1 Dependencia institucional con la PUCP

ConectaPUCP depende de dos sistemas administrados por la PUCP para poder operar:

| Sistema | Dependencia | Unidad PUCP responsable |
|---------|-------------|------------------------|
| **SSO CAS** | Autenticación de todos los usuarios (RF12, RC07). Sin credenciales de sandbox, ningún flujo de login puede probarse ni desplegarse. | **DGTI** — Dirección de Gestión de Tecnologías de Información |
| **SMTP institucional** (Google Workspace) | Envío de notificaciones a correos `@pucp.edu.pe` (RF03, RF08, RF26, RF36). Requiere configuración de relay SMTP o credenciales OAuth2. | **DGTI** — Dirección de Gestión de Tecnologías de Información |

**Canal de comunicación hacia la PUCP:**  
La solicitud formal de acceso a los servicios CAS y SMTP de pruebas deberá tramitarse mediante **memorando de la Facultad de Ciencias e Ingeniería** dirigido a DGTI, firmado por el coordinador del curso INF50 — Diseño de Software. El equipo de proyecto redactará el borrador del memorando; el Jefe de Práctica (Ana Valverde) coordinará la firma con el coordinador y la entrega a DGTI.

### 2.2 Tabla de interesados y comunicación

| ID | Interesado | Rol en las pruebas | Forma de comunicación | Periodicidad | Inclusión |
|----|-----------|-------------------|----------------------|--------------|-----------|
| COM-01 | **Equipo de desarrollo** (Camargo, Rosales, Mayta, Vilca) | Dev/QA — diseña, ejecuta y documenta pruebas | Reporte de bugs en GitHub Issues + pipeline CI/CD | Semanal e inmediato al detectar defecto | Diferenciada — ejecutor |
| COM-02 | **JP / Evaluador del curso** (Ana Valverde) | Valida casos de prueba y aprueba artefactos | Reunión virtual + documento compartido (Google Drive) | Al finalizar cada sprint de pruebas | Diferenciada — validador académico |
| COM-03 | **Representante DGTI** (contacto designado) | Provee credenciales sandbox de CAS y SMTP; aprueba la integración institucional | Memorando formal + correo institucional a la unidad DGTI | Al inicio (solicitud) y al cierre (entrega de resultados) | Diferenciada — habilitador institucional |
| COM-04 | **Estudiantes PUCP** (3–5 voluntarios externos al equipo) | Usuarios de prueba para usabilidad — flujos de subida de material y postulación a evaluador | Sesión guiada de pruebas de usabilidad (presencial o virtual) | Una sesión al finalizar la etapa de ejecución funcional | Diferenciada — usuario de prueba |
| COM-05 | **Administrador del sistema** (rol asignado a un miembro del equipo) | Ejecuta flujos de administración: activar cuentas, aprobar postulaciones a evaluador, moderar contenido | Documento de casos de prueba + sesión de ejecución interna | Durante el bloque de ejecución (27/06 – 02/07) | Diferenciada — ejecutor de flujos de admin |
| COM-06 | **Comité de Arquitectura / Docentes** | Reciben informe consolidado de métricas: SLAs de tiempo de respuesta y disponibilidad | Informe PDF entregado en plataforma del curso | Al finalizar las pruebas y en la sustentación final | Grupal — receptor de resultados |

> **Respecto a la inclusión diferenciada:** cada grupo participa en etapas y canales distintos. Los estudiantes voluntarios solo participan en usabilidad (no en integración ni rendimiento). El representante DGTI solo es contactado para habilitación de credenciales y cierre formal. El administrador del sistema ejecuta sus flujos específicos de manera separada a los flujos de estudiante/evaluador. Esta separación evita contaminación de datos de prueba entre roles.

---

## 3. Enfoque de Pruebas

Se seleccionan dos enfoques complementarios:

### 3.1 Caja Negra — Partición de Equivalencia y Análisis de Valores Límite

Se prueban los componentes exclusivamente desde sus interfaces externas (formularios, APIs REST), sin conocimiento de la implementación interna. Este enfoque es el central para los casos de prueba de las dos pantallas seleccionadas, ya que permite:
- Verificar que los requerimientos funcionales (RF) se cumplen exactamente según lo especificado, sin sesgo hacia cómo están implementados.
- Aplicar **Partición de Equivalencia**: agrupar entradas en clases válidas e inválidas donde todos los valores de una clase producen el mismo comportamiento, reduciendo el número de casos necesarios.
- Aplicar **Análisis de Valores Límite**: en campos con restricciones de tamaño (nombres ≤ 255 chars, descripciones ≤ 300 chars, archivos ≤ 100 MB) probar los valores en los bordes exactos (justo en el límite y un byte/carácter por encima).

### 3.2 Basado en Riesgos

Los casos de prueba se priorizan según el impacto de fallo en producción y la probabilidad de defecto. Este enfoque permite focalizar esfuerzo limitado (equipo académico, sin QA dedicado) en los componentes más críticos:

| Nivel de riesgo | Componentes | Requerimientos |
|----------------|-------------|---------------|
| **Crítico** | Autenticación SSO CAS, validación MIME de archivos, propagación de roles | RF12, RC07, RC11, RC14, RC15 |
| **Alto** | Carga de archivos al repositorio, postulación a evaluador, notificaciones en ≤ 2 min | RF09, RF17, RF18, RF26, RF08 |
| **Medio** | Foros y votos, gamificación, grupos de estudio | RF06, RF07, RF11, RF21, RF33 |
| **Bajo** | Favoritos, tabla de posiciones, compartir enlaces | RF02, RF23, RF34 |

Las pruebas funcionales y de integración se ejecutan en orden descendente de riesgo para garantizar que los defectos críticos se detecten primero.

---

## 4. Tipos de Pruebas

| ID | Tipo de Prueba | Sustento |
|----|---------------|----------|
| TP-01 | **Pruebas Funcionales** | Verifican de extremo a extremo que las reglas de negocio se ejecuten correctamente según el catálogo de requerimientos. Son indispensables para los flujos críticos: autenticación SSO CAS (RF12/RC07), carga y validación de archivos (RF17/RC11), postulación a evaluador (RF09/RF32) e interacciones sociales (RF06/RF07). |
| TP-02 | **Pruebas de Integración** | ConectaPUCP opera con UPs stateless que se comunican exclusivamente a través del Space (Hazelcast) y Kafka. Estas pruebas validan la comunicación asíncrona entre UPs, la correcta gestión de cache miss por el DataReader (MapLoader), y la integración con servicios perimetrales (CAS y SMTP). Sin estas pruebas, fallas de integración podrían no detectarse hasta producción. |
| TP-03 | **Pruebas de Rendimiento** | Certifican los SLAs de escalabilidad: tiempos de respuesta ≤ 2 s bajo ≥ 100 usuarios concurrentes (RC03) y disponibilidad ≥ 95% en semestre activo (RC02). Incluyen escenarios de ráfaga (semanas de exámenes) con carga de archivos de hasta 100 MB (RF17) en paralelo con actividad de foros. |

---

## 5. Riesgos en el Desarrollo de las Pruebas

| ID | Riesgo | Sustento |
|----|--------|----------|
| RSK-01 | **Indisponibilidad de servicios externos perimetrales** (SSO CAS, SMTP PUCP, Object Storage) | Múltiples flujos críticos dependen de infraestructuras fuera del control del equipo. Una caída del CAS bloquearía todas las pruebas de autenticación; una caída del SMTP impediría certificar RF03/RF08/RF26. La demora en la respuesta de DGTI al memorando de solicitud es el riesgo de materialización más probable. |
| RSK-02 | **Retraso en la configuración del entorno de pruebas** (Kafka, Hazelcast/Redis) | El núcleo transaccional SBA depende de que el middleware esté completamente operativo. Problemas de configuración de red o serialización en el Space impedirían ejecutar pruebas de integración y rendimiento. |
| RSK-03 | **Cobertura insuficiente en concurrencia extrema** | El tráfico de ConectaPUCP es volátil (picos en semanas de exámenes). Los escenarios de estrés simultáneo (100+ uploads de 100 MB + ráfaga de likes) pueden revelar cuellos de botella en el Write-Behind que no se detecten con pruebas seriales, vulnerando RC03. |

---

## 6. Cronograma

> Fecha de entrega final: **15 de julio de 2026** (fecha de examen/sustentación final del curso INF50).

| Fecha | Actividad | Responsable / Rol |
|-------|-----------|-------------------|
| **Hasta 21/06/2026** | Redacción y entrega del memorando a DGTI solicitando credenciales sandbox de CAS y SMTP. | JP Ana Valverde + Equipo de desarrollo |
| **22/06 – 24/06/2026** | Despliegue y verificación del entorno Staging (Kafka + Redis/Hazelcast). Diseño y documentación de casos de prueba a partir de los requerimientos. | SysAdmin / Equipo QA |
| **25/06 – 26/06/2026** | Revisión, ajuste y aprobación de los casos de prueba para asegurar cobertura de flujos. | JP Ana Valverde (validador académico) |
| **27/06 – 02/07/2026** | **Bloque de ejecución:** pruebas funcionales (flujos RF críticos), pruebas de integración (CAS + SMTP + Kafka), pruebas de seguridad (roles y validación MIME). Ejecución diferenciada por rol: flujos de estudiante, evaluador y administrador. Sesión de usabilidad con 3–5 estudiantes voluntarios. | Equipo QA + Equipo Desarrollo + Estudiantes voluntarios |
| **03/07 – 06/07/2026** | Resolución de defectos, tratamiento de excepciones no controladas y estabilización de las UPs stateless. | Equipo de Desarrollo |
| **07/07 – 08/07/2026** | Reejecución de casos fallidos. Revisión técnica de SLAs de rendimiento (< 2 s). Verificación de que correcciones no introdujeron nuevos defectos. | Equipo QA + Comité de Arquitectura |
| **09/07/2026** | Recopilación de logs, métricas de rendimiento, actas de conformidad y redacción del Informe Final de Pruebas. | Equipo QA + Equipo Desarrollo |
| **10/07 – 14/07/2026** | Preparación de la sustentación final: consolidación de artefactos, presentación de resultados. | Todos los miembros del equipo |
| **15/07/2026** | **Entrega y sustentación final** ante docentes y stakeholders del curso INF50. | Todos los interesados |

---

## 7. Casos de Prueba

Las dos pantallas seleccionadas para los casos de prueba son:
- **Pantalla 1:** Subida de Material Académico (RF17, RF18, RF28, RC11)
- **Pantalla 2:** Postulación a Evaluador (RF09, RF26)

> **Nota sobre el prototipo:** Las clases de equivalencia válidas e inválidas definen el comportamiento interactivo esperado del prototipo. En particular: el botón de envío debe estar **deshabilitado** mientras existan campos obligatorios vacíos o inválidos (feedback inmediato per RC06/RF16); los campos deben mostrar errores inline al perder el foco; los contadores de caracteres deben cambiar a color rojo al superar el 90 % del límite y bloquear al alcanzarlo.

---

### 7.1 Pantalla 1 — Subida de Material Académico

**Requerimientos cubiertos:** RF17, RF18, RF28, RC11  
**Actor:** Estudiante autenticado

#### Tabla de Clases de Equivalencia

| ID | Campo | Tipo | Condición / Rango | Resultado esperado en la UI |
|----|-------|------|-------------------|-----------------------------|
| CE01 | Archivo adjunto | **Válida** | Extensión ∈ {pdf, txt, png, jpg, docx, pptx, xlsx, doc, xls, ppt} AND tamaño ≤ 100 MB AND MIME coincide con extensión | Dropzone muestra vista previa del archivo; sin errores |
| CE02 | Archivo adjunto | **Inválida** | Extensión ∉ lista permitida (ej. `.exe`, `.zip`, `.mp4`) | Error inline: "Extensión no permitida. Formatos aceptados: PDF, TXT, PNG…" |
| CE03 | Archivo adjunto | **Inválida** | Tamaño > 100 MB | Error inline: "El archivo supera el límite de 100 MB" |
| CE04 | Archivo adjunto | **Inválida** | MIME spoofing: extensión `.pdf` con magic bytes de `.exe` | Error inline: "El tipo de archivo no coincide con su extensión" (validado en servidor) |
| CE05 | Archivo adjunto | **Inválida** | Sin archivo seleccionado | Botón "Subir material" deshabilitado; al intentar enviar: "Debe adjuntar un archivo" |
| CE06 | Nombre del archivo | **Válida** | 1 – 255 caracteres | Campo aceptado; contador visible |
| CE07 | Nombre del archivo | **Inválida** | Vacío (0 caracteres) | Error inline: "El nombre es obligatorio" |
| CE08 | Nombre del archivo | **Inválida** | > 255 caracteres | Contador en rojo; bloqueo al llegar a 255 |
| CE09 | Curso | **Válida** | Valor seleccionado del menú desplegable | Campo válido; sin errores |
| CE10 | Curso | **Inválida** | Sin selección | Error inline: "Seleccione un curso" |
| CE11 | Ciclo académico | **Válida** | Valor seleccionado (ej. 2025-1) | Campo válido |
| CE12 | Ciclo académico | **Inválida** | Sin selección | Error inline: "Seleccione un ciclo académico" |
| CE13 | Tipo de material | **Válida** | Valor ∈ {Examen, Apunte, Guía} | Campo válido |
| CE14 | Tipo de material | **Inválida** | Sin selección | Error inline: "Seleccione el tipo de material" |
| CE15 | Descripción | **Válida** | 0 – 300 caracteres (campo opcional) | Contador visible; aceptado |
| CE16 | Descripción | **Inválida** | > 300 caracteres | Contador en rojo al pasar 270; bloqueo a 300 |

#### Especificación de Caso de Prueba Válido — CP-SM-01

| Atributo | Detalle |
|----------|---------|
| **ID** | CP-SM-01 |
| **Precondición** | Usuario autenticado como Estudiante con sesión activa en SSO CAS |
| **Clases cubiertas** | CE01, CE06, CE09, CE11, CE13, CE15 |
| **Datos de entrada** | Archivo: `examen_calculo.pdf` (2 MB, PDF válido) · Nombre: "Examen parcial Cálculo 1 – 2024-1" (38 chars) · Curso: Cálculo 1 · Ciclo: 2025-1 · Tipo: Examen · Descripción: "Incluye temas de derivadas e integrales definidas." (50 chars) |
| **Pasos** | 1. Arrastrar archivo al dropzone. 2. Completar todos los campos. 3. Clic en "Subir material." |
| **Resultado esperado** | HTTP 202 Accepted. Mensaje: *"Tu material fue enviado y está pendiente de validación. Recibirás una notificación por correo institucional (RF18, RF03)."* Botón deshabilitado durante la carga (spinner). Estado del archivo: PENDIENTE. Evento `ARCHIVO_SUBIDO` publicado a Kafka. |
| **Resultado en prototipo** | El botón permanece habilitado y con color primario; al hacer clic muestra spinner y luego banner de éxito verde. |

#### Especificación de Caso de Prueba No Válido — CP-SM-02

| Atributo | Detalle |
|----------|---------|
| **ID** | CP-SM-02 |
| **Precondición** | Usuario autenticado como Estudiante |
| **Clases cubiertas** | CE02, CE04, CE07, CE10, CE12, CE14 |
| **Datos de entrada** | Archivo: `virus.exe` renombrado como `apunte.pdf` (1 MB, MIME spoofing) · Nombre: vacío · Curso: sin selección · Ciclo: sin selección · Tipo: sin selección |
| **Pasos** | 1. Adjuntar archivo con extensión falsa. 2. Dejar todos los campos obligatorios vacíos. 3. Intentar clic en "Subir material." |
| **Resultado esperado** | Botón "Subir material" deshabilitado mientras campos estén vacíos. Si se fuerza el envío: HTTP 400. Errores inline mostrados: *"El nombre es obligatorio" · "Seleccione un curso" · "Seleccione un ciclo académico" · "Seleccione el tipo de material."* El error del archivo (MIME spoofing) se valida en servidor y devuelve: *"El tipo de archivo no coincide con su extensión."* Ningún archivo persiste en Object Storage. |
| **Resultado en prototipo** | Botón deshabilitado (color gris, cursor bloqueado). Los campos vacíos muestran borde rojo y texto de error debajo. Al corregir cada campo, el botón se habilita progresivamente. |

---

### 7.2 Pantalla 2 — Postulación a Evaluador

**Requerimientos cubiertos:** RF09, RF26  
**Actor:** Estudiante autenticado

> **Nota:** RF32 (*"actualizar el rol a Evaluador una vez que el administrador valida"*) es una acción del administrador en su panel de control, no del estudiante en este formulario. RF32 no aplica como referencia de esta pantalla.

#### Tabla de Clases de Equivalencia

| ID | Campo | Tipo | Condición / Rango | Resultado esperado en la UI |
|----|-------|------|-------------------|-----------------------------|
| CE01 | Cursos dominados | **Válida** | ≥ 1 curso ingresado (chips) | Campo aceptado; chip visible con opción de eliminar |
| CE02 | Cursos dominados | **Inválida** | Sin ningún curso (lista vacía) | Error inline: "Ingrese al menos un curso dominado" |
| CE03 | Experiencia académica | **Válida** | 1 – 500 caracteres | Contador visible; campo aceptado |
| CE04 | Experiencia académica | **Inválida** | Vacío (0 caracteres) | Error inline: "La experiencia académica es obligatoria" |
| CE05 | Experiencia académica | **Inválida** | > 500 caracteres | Contador en rojo al pasar 450; bloqueo a 500 |
| CE06 | Motivo de postulación | **Válida** | 1 – 400 caracteres | Contador visible; campo aceptado |
| CE07 | Motivo de postulación | **Inválida** | Vacío (0 caracteres) | Error inline: "El motivo de postulación es obligatorio" |
| CE08 | Motivo de postulación | **Inválida** | > 400 caracteres | Contador en rojo al pasar 360; bloqueo a 400 |
| CE09 | Documentos de respaldo | **Válida** | Extensión ∈ {pdf, jpg, png} AND tamaño ≤ 10 MB | Dropzone muestra nombre del archivo; sin errores |
| CE10 | Documentos de respaldo | **Inválida** | Sin documento adjunto | Error inline: "Debe adjuntar al menos un documento de respaldo" |
| CE11 | Documentos de respaldo | **Inválida** | Extensión ∉ {pdf, jpg, png} (ej. `.zip`, `.docx`) | Error inline: "Solo se permiten archivos PDF, JPG o PNG" |
| CE12 | Documentos de respaldo | **Inválida** | Tamaño > 10 MB | Error inline: "El documento supera el límite de 10 MB" |

#### Especificación de Caso de Prueba Válido — CP-PE-01

| Atributo | Detalle |
|----------|---------|
| **ID** | CP-PE-01 |
| **Precondición** | Usuario autenticado como Estudiante. Perfil con nombre completo, código PUCP y correo institucional ya registrados (campos autocompletados desde el perfil). |
| **Clases cubiertas** | CE01, CE03, CE06, CE09 |
| **Datos de entrada** | Cursos: ["Cálculo 1", "Programación OO", "Álgebra Lineal"] · Experiencia: "He sido monitor de Cálculo 1 durante dos ciclos consecutivos y jefe de práctica en el ciclo 2024-2." (100 chars) · Motivo: "Deseo contribuir a la comunidad académica validando material de calidad para mis compañeros." (93 chars) · Documento: `certificado_monitor.pdf` (2 MB, PDF válido) |
| **Pasos** | 1. Verificar datos autocompletados (nombre, código, correo). 2. Ingresar cursos dominados (presionar Enter por cada uno). 3. Completar textarea de experiencia y motivo. 4. Adjuntar documento. 5. Clic "Enviar postulación." |
| **Resultado esperado** | HTTP 201 Created. Solicitud creada en estado PENDIENTE. El administrador recibe notificación por correo (RF08). Mensaje al estudiante: *"Tu postulación fue enviada. El administrador revisará tu solicitud en un plazo máximo de 7 días hábiles (RF09). Recibirás una notificación al correo institucional con el resultado (RF26)."* Si el plazo vence sin revisión: solicitud cambia a ANULADA y estudiante recibe notificación automática. |
| **Resultado en prototipo** | Botón "Enviar postulación" habilitado con color primario. Al enviar: spinner + banner verde de confirmación. El banner incluye el texto informativo sobre el plazo de 7 días. |

#### Especificación de Caso de Prueba No Válido — CP-PE-02

| Atributo | Detalle |
|----------|---------|
| **ID** | CP-PE-02 |
| **Precondición** | Usuario autenticado como Estudiante. |
| **Clases cubiertas** | CE02, CE04, CE08, CE11 |
| **Datos de entrada** | Cursos: ninguno (lista vacía) · Experiencia: vacía · Motivo: texto de 420 caracteres (> 400) · Documento: `constancia.docx` (3 MB, extensión no permitida) |
| **Pasos** | 1. No ingresar ningún curso. 2. Dejar experiencia vacía. 3. Ingresar texto que excede 400 caracteres en el motivo. 4. Adjuntar archivo `.docx`. 5. Intentar clic "Enviar postulación." |
| **Resultado esperado** | Botón "Enviar postulación" deshabilitado mientras existan campos inválidos. Al forzar envío: HTTP 400. Errores inline: *"Ingrese al menos un curso dominado" · "La experiencia académica es obligatoria" · "Máximo 400 caracteres (420/400 escritos)" · "Solo se permiten archivos PDF, JPG o PNG."* No se crea ninguna solicitud en el sistema. |
| **Resultado en prototipo** | Botón gris deshabilitado. El campo de motivo bloquea el ingreso al llegar a 400 caracteres (el usuario no puede escribir más). El dropzone muestra borde rojo y el nombre del archivo en rojo con ícono de error al adjuntar `.docx`. |

---

*Ver también: [[Índice]] · [[Requerimientos Funcionales]] · [[Requerimientos de Calidad]] · [[Correcciones]]*
