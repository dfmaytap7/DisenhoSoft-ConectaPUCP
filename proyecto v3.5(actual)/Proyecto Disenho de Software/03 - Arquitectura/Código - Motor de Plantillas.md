# Vista de Código — Motor de Plantillas (Servicio de Notificaciones)

![[codigo-motor-plantillas.png]]
*Diagrama de clases: ITemplateEngine, HandlebarsTemplateEngine, TemplateCache, TemplateLoader.*

---

## Sustento de decisiones de diseño

### Abstracción y Diseño Orientado a Interfaces (DIP y OCP)
El componente expone hacia el exterior la interfaz `ITemplateEngine`. Cualquier clase cliente (como el `NotificationManager`) dependerá de esta abstracción y no de la implementación concreta. Esto cumple con el Principio de Inversión de Dependencias (DIP) y el Principio Abierto/Cerrado (OCP), ya que permite reemplazar fácilmente la tecnología subyacente sin necesidad de modificar el código de los clientes que lo utilizan.

### Principio de Responsabilidad Única (SRP) y Alta Cohesión
Se ha evitado construir una clase monolítica centralizando todo el trabajo. En su lugar, el diseño divide el sistema en tres bloques de construcción altamente cohesivos:

- **`TemplateLoader`:** Su única responsabilidad es gestionar el acceso a los archivos o fuentes externas (I/O), obteniendo el código fuente en texto plano (`string`) a través de una ruta base (`basePath`).
- **`TemplateCache`:** Su única responsabilidad es mantener en memoria el estado y gestionar el acceso rápido a las plantillas previamente procesadas. (`Map<string, Function>`)
- **`HandlebarsTemplateEngine`:** Se encarga de la lógica core de compilación y renderizado, orquestando y delegando tareas a las otras dos clases.

### Eficiencia Computacional y Principio DRY
Se ha introducido la clase `TemplateCache` para almacenar las funciones de las plantillas ya compiladas. Esto asegura que el costoso proceso de compilación (`-compile()`) ocurra una sola vez por cada plantilla. En escenarios de notificaciones masivas, se reutiliza la función guardada en caché, evitando repetir procesos innecesarios y garantizando el rendimiento y la escalabilidad del sistema.

### Bajo Acoplamiento y Modularidad
Al delegar la obtención de los archivos al `TemplateLoader`, el motor de plantillas (`HandlebarsTemplateEngine`) queda desacoplado de la infraestructura de almacenamiento. Si en el futuro las plantillas dejan de estar en una carpeta local y pasan a estar alojadas en un repositorio en la nube, únicamente será necesario modificar o crear una nueva versión del `TemplateLoader`, manteniendo intacta la lógica de compilación y renderizado del motor principal.

---

*Ver también: [[Código - Gestor de Notificaciones]] · [[Patrones de Diseño]]*
