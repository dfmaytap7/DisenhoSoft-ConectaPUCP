# Vista de Código — Repositorio de Archivos (Servicio de Archivos)

![[codigo-repositorio-archivos.png]]
*Diagrama de clases completo: IFileRepository, HazelcastFileRepository, FileAccessProxy (Proxy), Archivo, SocialReference, FileSearchFilters, ArchivoMapper, ArchivoDTO.*

![[codigo-repositorio-archivos-proxy.png]]
*Diagrama simplificado del patrón Proxy: IFileRepository, HazelcastFileRepository, FileAccessProxy.*

---

## Sustento de decisiones de diseño

### Patrón Repository e Inversión de Dependencias (DIP)
El diseño aísla por completo la lógica de acceso a datos utilizando la interfaz `IFileRepository`. El sistema central interactúa únicamente con esta abstracción, desconociendo si está comunicándose con el proxy de seguridad o con el repositorio final. La clase `HazelcastFileRepository` implementa esta interfaz encapsulando la complejidad técnica del cliente de la grilla de datos (`GridClient`). Esto permite cambiar la tecnología de persistencia sin alterar una sola línea del modelo de dominio, cumpliendo con el OCP.

### Implementación del Patrón Proxy (Estructural) para Control de Acceso
El acceso a los archivos físicos (LOBs) almacenados en la Grilla de Datos es una operación crítica que requiere seguridad. Para ello, se introdujo la clase `FileAccessProxy` que actúa como un intermediario (Protection Proxy). Este proxy intercepta las peticiones al repositorio y ejecuta el método privado `checkAccess()` para validar permisos antes de delegar la operación de lectura o escritura al repositorio real. Esto permite aislar la lógica de seguridad sin contaminar la clase de persistencia.

### Aislamiento del Dominio y Seguridad (Patrón DTO y Mapper)
Para proteger la entidad principal `Archivo` y no exponer información sensible o estructura interna al exterior, se implementó el patrón Data Transfer Object con `ArchivoDTO`. La responsabilidad de transformar estos datos recae exclusivamente en la clase `ArchivoMapper`. Esta clase, además, asume la responsabilidad crucial de generar la URL de descarga segura (`generateDownloadUrl`), asegurando que el cliente solo reciba los datos exactos que necesita para la vista (incluyendo el nombre del curso resuelto) y el enlace directo al Object Storage.

### Encapsulamiento de Parámetros (Objeto de Parámetro)
En lugar de tener métodos de búsqueda con largas listas de argumentos, se ha creado la clase `FileSearchFilters`. Esto mantiene las firmas de los métodos en la interfaz limpias y permite que, si en el futuro se agregan nuevos filtros de búsqueda, no sea necesario modificar la interfaz `IFileRepository` ni sus implementaciones.

### Cohesión del Modelo de Dominio (Relaciones Estructurales)
La relación de agregación entre `Archivo` y `SocialReference` modela fielmente la realidad del negocio: un archivo centraliza sus propias referencias sociales (dónde y cuándo fue compartido en los foros mediante el `postId`), manteniendo una alta cohesión conceptual. La responsabilidad de gestionar esta relación se refleja claramente en el contrato del repositorio mediante el método `addSocialLink`.

---

*Ver también: [[Componentes - Servicio de Archivos]] · [[Patrones de Diseño]] · [[Patrones de Persistencia]]*
