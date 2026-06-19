# Vista de Código — Validación de Material (Servicio de Archivos)

![[codigo-validacion-material.png]]
*Diagrama de clases: IMaterialValidator, MaterialValidator, BaseValidationHandler (abstract), SizeValidationHandler, ExtensionValidationHandler, MimeTypeValidationHandler, ValidationRules, FileMetadata (DTO), ValidationResponseDTO.*

---

## Sustento de decisiones de diseño

### Implementación del Patrón Chain of Responsibility (Comportamiento)
Se refactorizó la lógica de validación, eliminando el bloque monolítico de comprobaciones anidadas. En su lugar, el flujo se dividió en manejadores granulares (`SizeValidationHandler`, `ExtensionValidationHandler`, `MimeTypeValidationHandler`) que heredan de `BaseValidationHandler`. Esto permite que el archivo sea procesado de forma secuencial; si un eslabón falla, la cadena se detiene inmediatamente y retorna el error. Esto hace que el código sea altamente cohesivo, autodocumentado y sumamente fácil de probar de forma unitaria (KISS).

### Mecanismo de Validación sobre Stream (compatibilidad con archivos hasta 100 MB)

El diseño usa streaming para evitar cargar el archivo completo en RAM, pero esto implica que el tamaño total no es conocido hasta que el stream termina. La cadena resuelve esto en dos fases:

1. **`SizeValidationHandler` — check preliminar por `Content-Length`:** Lee el header HTTP `Content-Length` antes de abrir el stream. Si supera 100 MB, rechaza inmediatamente (HTTP 400) sin leer ningún byte del cuerpo. Este header puede ser omitido o falsificado, por lo que es un rechazo rápido, no el único control de tamaño.

2. **`MimeTypeValidationHandler` — magic bytes del stream:** Lee únicamente los primeros N bytes del stream para identificar la firma del tipo de archivo (MIME). Esta operación ocurre antes de enviar el stream al Object Storage, garantizando que se rechacen archivos con extensión falsificada.

3. **Límite de bytes en Object Storage:** El stream se escribe directamente al Object Storage con un límite de bytes configurado (`maxBytes = 100 MB`). Si el stream supera el límite antes de terminar, la operación se aborta y el objeto parcial se elimina del almacenamiento. Este es el control definitivo de tamaño (cubre el caso de `Content-Length` falsificado).

### Abstracción, Inversión de Dependencias (DIP) y Principio Abierto/Cerrado (OCP)
El diseño expone la interfaz `IMaterialValidator` como contrato principal. La clase `MaterialValidator` original fue transformada: ya no contiene la lógica algorítmica, sino que actúa como el cliente que arma la cadena y guarda la referencia al `primerEslabon`. Gracias a esto, si en el futuro cambian las estrategias de validación (por ejemplo, agregar escaneo de virus externo), se puede crear e inyectar un nuevo manejador en la cadena sin modificar el código de los validadores existentes ni del orquestador, cumpliendo estrictamente con el OCP.

### Principio de Responsabilidad Única (SRP) y Separación de Configuración
Se ha evitado codificar las reglas de negocio en duro (hardcode) dentro de la lógica. La clase `ValidationRules` asume la responsabilidad exclusiva de almacenar los parámetros y restricciones estáticas (como `MAX_SIZE` y `ALLOWED_EXTENSIONS`). Esto centraliza la configuración, permitiendo que cada eslabón concreto se dedique única y exclusivamente a ejecutar su regla específica de comprobación.

### Aislamiento de Datos e Interfaz (Patrón DTO)
El flujo de entrada y salida está fuertemente tipado y aislado mediante objetos de transferencia de datos:
- **`FileMetadata`:** Abstrae los detalles físicos del archivo (buffer/stream), pasando a los manejadores únicamente la información estructurada necesaria (nombre, peso, tipo MIME).
- **`ValidationResponseDTO`:** Estandariza la respuesta del componente indicando si es válido, y en caso de fallo, proporcionando un código de error y un mensaje seguro y procesable por el cliente.

---

*Ver también: [[Componentes - Servicio de Archivos]] · [[Patrones de Diseño]]*
