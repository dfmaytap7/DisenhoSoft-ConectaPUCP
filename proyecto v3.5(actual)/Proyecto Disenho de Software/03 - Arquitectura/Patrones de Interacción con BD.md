# Patrones de Interacción con la Base de Datos

---

## Data Mapper

![[codigo-data-mapper.png]]

El diagrama muestra cómo el Servicio de Persistencia aplica el patrón **Data Mapper** mediante clases como `UsuarioDataMapper`, `ArchivoDataMapper` y `PublicacionDataMapper`. Estas clases:
- Concentran la lógica de acceso SQL/JDBC.
- Transforman los datos entre los registros persistentes y los objetos/snapshots del sistema.

Con esto, las UPs no acceden directamente a PostgreSQL y las entidades de dominio no conocen la estructura física de las tablas.

### Vínculo con RF09 y RC14

Dos Data Mappers adicionales dan soporte directo a los requerimientos RF09 y RC14:

- **`SolicitudEvaluadorDataMapper`** (RF09): transforma registros de la tabla `solicitudes_evaluador` ↔ objetos `SolicitudEvaluador`. Persiste los campos: `idSolicitud`, `idPostulante`, `evidencias[]`, `estado` (PENDIENTE / APROBADA / RECHAZADA / ANULADA), `fechaCreacion`, `fechaResolucion`, `idAdminResolutor`. El `GestorRoles` actualiza el estado y el `DataWriter` lo persiste vía evento Kafka `SOL_EVALUADOR_ACTUALIZADA`.

- **`AuditoriaDataMapper`** (RC14): inserta entradas en la tabla append-only `auditoria_privilegios`. Persiste: `idRegistro`, `idUsuarioAfectado`, `idAdmin`, `accion`, `nuevoPrivilegio`, `timestamp`. Nunca ejecuta UPDATE ni DELETE — solo INSERT, garantizando la inmutabilidad requerida por RC14.

---

## Data Transfer Object (DTO)

![[codigo-data-mapper-archivo-dto.png]]

La implementación del patrón **Data Transfer Object (DTO)** se justifica por la necesidad de desacoplar el modelo de dominio de la interfaz de comunicación externa.

La clase `ArchivoDTO` encapsula y transfiere únicamente la información estrictamente necesaria para el cliente:
- `urlDescarga`
- Datos básicos del curso
- Nombre y ciclo

Ocultando atributos internos, estructurales o sensibles propios de la entidad `Archivo` (como el `checksum`, `objectKey` o las dependencias de `SocialReference`).

### Rol del Assembler
La clase `ArchivoDTOAssembler` actúa como traductor: lee el dominio y construye el objeto de transferencia. Este patrón:
- Optimiza el rendimiento de la red al reducir el tamaño de los payloads.
- Previene vulnerabilidades asociadas a la exposición involuntaria de la lógica de negocio.
- Garantiza que el modelo interno de la aplicación pueda evolucionar libremente sin romper el contrato de datos esperado por los usuarios de la API.

---

*Ver también: [[Patrones de Persistencia]] · [[Código - Data Mapper]] · [[Código - Data Writer]]*
