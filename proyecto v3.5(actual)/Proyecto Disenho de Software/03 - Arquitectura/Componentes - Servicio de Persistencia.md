# Componentes — Servicio de Persistencia

![[c4-componentes-persistencia.png]]
*Vista de Componentes del Servicio de Persistencia.*

---

## Componentes

| Componente                     | Descripción                                                                                                                                                                                                               | Roles   | RF                                             | RC                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------- | ---------------------------- |
| **Data Reader**                | Atiende casos de cache miss o precarga de datos. Recupera información persistente desde PostgreSQL u Object Storage y la vuelve a colocar en la Grilla de Datos para que las UPs no accedan directamente a la BD.         | Sistema | RF01, RF14, RF15, RF20, RF29, RF30, RF37, RF38 | RC03, RC12, RC13, RC18, RC20 |
| **Data Writer**                | Consume eventos de escritura provenientes de la Grilla de Mensajería y sincroniza los cambios permanentes en PostgreSQL. También puede actualizar índices de búsqueda y guardar referencias a archivos en Object Storage. | Sistema | RF18, RF21, RF31, RF32, RF37, RF38             | RC09, RC10, RC14, RC15       |
| **Data Mapper / Repositorios** | Aplica el patrón Data Mapper para transformar registros persistentes en objetos/snapshots del sistema y viceversa. Centraliza SQL/JDBC y evita que las UPs conozcan directamente la estructura de las tablas.             | Sistema | RF09, RF14, RF18, RF30, RF31, RF32, RF37, RF38 | RC14, RC15, RC20             |
| **Indexador de Búsqueda**      | Actualiza índices de búsqueda full-text (ElasticSearch) por curso, ciclo, palabras clave y filtros. Componente interno del Servicio de Persistencia; se distingue del contenedor externo "Motor de Búsqueda [ElasticSearch]" de la Vista de Contenedores. [JSON/HTTP]                                                                                                           | Sistema | RF01, RF15                                     | RC03                         |

---

## Sustento

- **Separación entre Lectura y Escritura:** Las UPs consultan normalmente la Grilla de Datos para mantener baja latencia. Cuando ocurre un cache miss, el `DataReader` actúa como intermediario entre Hazelcast y la base de datos.
- **Bajo Acoplamiento:** El Servicio de Cuentas, Archivos, Social o Notificaciones no necesita saber si los datos vienen de PostgreSQL, de un índice o de un almacenamiento externo.
- **Persistencia asíncrona (Write-Behind via Kafka):** Las UPs realizan dos operaciones independientes: escriben en la Grilla de Datos (Hazelcast) para disponibilidad inmediata en el Space, y publican un evento a la Grilla de Mensajería (Kafka). El `DataWriter` consume ese evento y persiste los datos definitivamente en PostgreSQL. La Grilla de Datos no dispara el evento; es la UP quien publica directamente a Kafka.

---

*Ver también: [[Vista de Contenedores]] · [[Código - Data Reader]] · [[Código - Data Writer]] · [[Código - Data Mapper]]*
