# Patrones de Persistencia

---

## Identity Field

![[patron-identity-field.png]]

Para mantener la relación unívoca entre los objetos en memoria y los registros en la base de datos/Hazelcast, se implementó el patrón **Identity Field**. La clase `Archivo` incluye el atributo `id: GUID` marcado con el estereotipo `<<Identity Field>>`.

Esto simplifica enormemente las operaciones CRUD en la clase `HazelcastFileRepository`, ya que el identificador es:
- **Inmutable** — no cambia tras la creación.
- **Representativo** — identifica unívocamente el recurso.
- **Sin colisiones** — un GUID garantiza unicidad global sin depender de secuencias de la BD.

---

## Dependent Mapping

![[patron-dependent-mapping.png]]

Se identificó una relación de composición estricta entre un documento y los foros donde se comparte. Para esto, se aplicó el patrón **Dependent Mapping**.

La clase dependiente `SocialReference` no tiene su propio ciclo de vida ni un repositorio independiente. Su persistencia es gestionada enteramente por la clase "dueña" (`Archivo`):
- `SocialReference` no puede existir sin su `Archivo`.
- Al persistir o eliminar un `Archivo`, se persistirán/eliminarán también sus `SocialReference`.

---

## Audit Log

Para cumplir con RC14 (*"el sistema debe registrar un log inalterable de quién y cuándo modificó un privilegio de usuario"*) se aplica el patrón **Audit Log**.

La tabla `auditoria_privilegios` es de **solo-inserción** (append-only): ningún proceso puede actualizar ni borrar registros existentes, garantizando la inmutabilidad requerida. Cada entrada contiene:

| Campo | Descripción |
|-------|-------------|
| `id` | GUID único del registro de auditoría |
| `idUsuarioAfectado` | Usuario cuyo privilegio fue modificado |
| `idAdmin` | Administrador que ejecutó el cambio |
| `accion` | Tipo de cambio (APROBACION_ROL / RECHAZO_ROL / ANULACION_ROL / SUSPENSION_CUENTA) |
| `nuevoPrivilegio` | Rol asignado o acción realizada |
| `timestamp` | Fecha y hora exactas del evento |

**Clases involucradas:**
- `AuditoriaService` — recibe la notificación del `GestorRoles` y construye la entrada de log.
- `AuditoriaDataMapper` — persiste la entrada en PostgreSQL vía el `DataWriter` (evento Kafka `AUDITORIA_ROL`).
- `ISolicitudEvaluadorRepository` — abstrae el acceso a solicitudes pendientes/aprobadas/rechazadas/anuladas (RF09).

La entrada se escribe primero en la Grilla de Datos (Hazelcast) y luego se publica como evento `AUDITORIA_ROL` a Kafka. El `DataWriter` consume el evento y persiste la entrada en PostgreSQL. Dado que la tabla es append-only, no hay riesgo de sobrescritura durante la ventana asíncrona.

---

*Ver también: [[Patrones de Interacción con BD]] · [[Código - Repositorio de Archivos]] · [[Código - Gestor de Roles]]*
