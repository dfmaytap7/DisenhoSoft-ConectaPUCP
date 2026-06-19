# Vista de Código — Data Reader (Servicio de Persistencia)

![[codigo-data-reader.md]]

---

## Sustento de decisiones de diseño

### Mecanismo de activación: interfaz MapLoader de Hazelcast
El `DataReader` implementa la interfaz `MapLoader<K, V>` de Hazelcast. Cuando una UP ejecuta `map.get(key)` y el valor no existe en el IMap (cache miss), Hazelcast llama automáticamente a `DataReader.load(key)`. El DataReader consulta PostgreSQL mediante el `IDataMapper` correspondiente, reconstruye la entidad y la devuelve. Hazelcast recibe ese valor, lo almacena en el IMap y lo entrega a la UP — todo de forma transparente: la UP nunca sabe si hubo miss. Este mecanismo elimina la necesidad de un `CacheMissListener` explícito o lógica de retry en las UPs.

El método `preload(domain)` usa `GridReloadPort` para precarga proactiva (warm-up al arrancar el servicio). En ese camino sí se llama a `map.put()` directamente porque no es una respuesta a un miss sino una carga anticipada.

### Principio de Responsabilidad Única (SRP)
El `DataReader` tiene una responsabilidad clara: recuperar información persistente cuando la Grilla de Datos no contiene los datos solicitados. No ejecuta reglas de negocio propias ni modifica el estado funcional del sistema; únicamente resuelve lecturas desde la fuente persistente y recarga el Space.

### Separación entre Lectura Operativa y Lectura Persistente
Las UPs consultan normalmente la Grilla de Datos para mantener baja latencia. Cuando ocurre un **cache miss**, el `DataReader` actúa como intermediario entre Hazelcast y la base de datos. Así se evita que cada UP tenga que conocer cómo consultar PostgreSQL o reconstruir datos desde Object Storage.

### Bajo Acoplamiento y Evolución de Infraestructura
El Servicio de Cuentas, Archivos, Social o Notificaciones no necesita saber si los datos vienen de PostgreSQL, de un índice o de un almacenamiento externo. Esa decisión queda encapsulada en el `DataReader`. Si en el futuro cambia la fuente de datos o se agrega otra estrategia de lectura, las UPs no tendrían que modificarse.

### Optimización del Rendimiento
El `DataReader` permite mantener la Grilla de Datos como fuente principal de consulta. Solo se acude a la persistencia cuando es necesario, lo cual ayuda a reducir accesos directos a la BD y mantiene tiempos de respuesta más estables (RC03, RC12).

---

*Ver también: [[Componentes - Servicio de Persistencia]] · [[Código - Data Writer]] · [[Código - Data Mapper]]*
