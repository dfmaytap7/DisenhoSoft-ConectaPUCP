# Vista de Contenedores

Nivel 2 del modelo C4 — descompone ConectaPUCP en sus contenedores (aplicaciones y almacenes de datos).

![[c4-vista-contenedores.png]]
*Imagen 2: Vista de Contenedores de ConectaPUCP en el modelo C4.*

---

## Contenedores

| Contenedor | Descripción |
|------------|-------------|
| **Aplicación Web** | Parte frontend que los usuarios interactúan. [Container: JavaScript, Framework Frontend] |
| **API Gateway** | Entrada única HTTPS y ruteo hacia las UPs. Actúa como reverse proxy de routing (nginx o equivalente): aplica TLS termination, CORS policy y reglas de enrutamiento por prefijo de ruta. **No valida tokens ni sesiones** — esa responsabilidad recae en cada UP consultando la Grilla de Datos (Hazelcast) directamente (RC13). |
| **Servicio de Notificaciones (UP)** | API que orquesta y expone el panel de alertas hacia el usuario y gestiona el envío de correos. [Node.js] |
| **Servicio de Archivos (UP)** | API encargada de la carga, validación, metadatos y distribución de los documentos. [Node.js] |
| **Servicio Social (UP)** | API que gestiona la creación de foros, publicación de comentarios y cálculo de gamificación. [Node.js] |
| **Servicio de Cuentas (UP)** | API que gestiona el inicio de sesión, sesiones activas, asignación y verificación de roles. [Node.js] |
| **Grilla de Datos** | Memoria compartida central (Hazelcast) que mantiene el estado sincronizado entre todos los servicios (UPs). |
| **Grilla de Mensajería** | Bus de eventos (Apache Kafka) que extrae e inyecta operaciones de forma asíncrona. |
| **Servicio de Persistencia** | Agrupa la lectura, escritura y transformación de datos persistentes. Consume eventos, actualiza BD/índices y recarga el Space. |
| **Base de Datos** | Almacena la información de los usuarios, publicaciones, historial de transacciones, reglas de gamificación y metadatos de archivos. [PostgreSQL] |
| **Almacenamiento de Objetos** | Repositorio de almacenamiento de objetos (Object Storage). Almacena de forma persistente los materiales de estudio físicos (archivos pesados) y delega la entrega directamente al cliente mediante URLs firmadas. |
| **Motor de Búsqueda** | Índice para búsquedas full-text por curso, ciclo, palabras clave y filtros. [ElasticSearch] |

---

## Sustento

### Microservicios desacoplados

- **Desacoplamiento Funcional:** El sistema se divide en servicios especializados (Cuentas, Archivos, Social, Notificaciones). Esto permite que un fallo en el "Servicio Social" no impida que un alumno descargue un archivo crítico desde el "Servicio de Archivos".
- **Bus de Eventos (Kafka):** El uso de una grilla de mensajería permite el procesamiento asíncrono. Por ejemplo, al subir un archivo, el sistema responde de inmediato al usuario mientras que el envío de notificaciones y el cálculo de puntos de gamificación ocurren en segundo plano, optimizando el tiempo de respuesta (RC03).

---

*Ver también: [[Vista de Contexto]] · [[Componentes - Servicio de Notificaciones]] · [[Componentes - Servicio de Archivos]] · [[Componentes - Servicio de Cuentas]] · [[Componentes - Servicio Social]] · [[Componentes - Servicio de Persistencia]]*
