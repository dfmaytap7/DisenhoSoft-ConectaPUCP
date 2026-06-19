# Vista de Código — Data Writer (Servicio de Persistencia)

![[codigo-data-writer.md]]
*Diagrama de clases: PersistenceEventSubscriber, DataWriter, MapperRegistry, IDataMapper, SearchIndexer.*

---

## Sustento de decisiones de diseño

### Principio de Responsabilidad Única (SRP) y Separación de Intereses (SoC)
El `DataWriter` se encarga exclusivamente de procesar los eventos de escritura generados por las UPs y sincronizar los cambios con los mecanismos de persistencia permanente. Su responsabilidad no es validar reglas de negocio ni decidir permisos, sino tomar eventos ya generados por el sistema y convertirlos en operaciones persistentes sobre PostgreSQL, ElasticSearch u Object Storage cuando corresponda.

### Desacoplamiento entre UPs y Base de Datos
El diseño evita que las UPs escriban directamente en la base de datos. En lugar de eso, los servicios de Cuentas, Archivos, Social y Notificaciones publican cambios en la Grilla de Datos o en la Grilla de Mensajería, y el `DataWriter` se encarga de persistirlos. Esto reduce el acoplamiento entre la lógica de negocio y la infraestructura de datos.

### Persistencia Asíncrona y Tolerancia a Fallos
Al usar un flujo basado en eventos, las operaciones de persistencia pueden ejecutarse de manera asíncrona. Esto permite que el sistema responda más rápido al usuario y que los fallos temporales de la base de datos puedan manejarse mediante reintentos, sin bloquear directamente a las UPs (RC10).

### Coherencia con Space-Based Architecture
El `DataWriter` representa el mecanismo de escritura permanente dentro de la arquitectura orientada a espacios. Las UPs trabajan principalmente con el Space/Hazelcast, mientras que el `DataWriter` sincroniza los datos definitivos hacia el almacenamiento persistente.

### Estructura interna
- **`PersistenceEventSubscriber`:** Recibe el evento desde Kafka y lo entrega al `DataWriter`.
- **`DataWriter`:** Usa `MapperRegistry` para elegir el mapper correcto según el dominio del evento.
- **`MapperRegistry`:** Resuelve qué `IDataMapper` aplicar.
- **`SearchIndexer`:** Actualiza índices de ElasticSearch cuando corresponde.

---

*Ver también: [[Componentes - Servicio de Persistencia]] · [[Código - Data Reader]] · [[Código - Data Mapper]]*
