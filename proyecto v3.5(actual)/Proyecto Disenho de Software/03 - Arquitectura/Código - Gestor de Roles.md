# Vista de Código — Gestor de Roles (Servicio de Cuentas)

![[codigo-gestor-roles.png]]
*Diagrama de clases principal: RolManagerService con proxy, repositorios y auditoría.*

![[codigo-gestor-roles-completo.png]]
*Diagrama de clases completo del Gestor de Roles con todas las relaciones.*

---

## Sustento de decisiones de diseño

### Abstracción e Inversión de Dependencias (DIP)
El componente expone sus operaciones mediante una interfaz que permite desacoplar a los controladores de la implementación concreta. Además, el servicio principal trabaja con repositorios y servicios abstractos, evitando depender directamente de la base de datos o de la grilla, lo que facilita cambios futuros en la infraestructura sin afectar la lógica de negocio.

### Control de Acceso mediante Proxy
Se utiliza un proxy para validar permisos antes de ejecutar operaciones sensibles como asignar o revocar roles. Esto permite centralizar las validaciones de seguridad y evitar que usuarios no autorizados modifiquen privilegios.

### Gestión Formal de Postulaciones (RF09)
Se incorpora el concepto de **solicitud de rol** para representar el proceso de postulación a evaluador. En lugar de asignar roles directamente, el sistema crea solicitudes que transitan por los estados: `PENDIENTE → APROBADA | RECHAZADA | ANULADA`. El `ISolicitudEvaluadorRepository` abstrae el acceso a estas solicitudes; el `DataWriter` las persiste vía evento Kafka `SOL_EVALUADOR_ACTUALIZADA`.

**Mecanismo de expiración automática (RF09 — "pasado este tiempo se anula la solicitud"):**
El componente `SolicitudExpirationJob` es un proceso programado (cron job) que se ejecuta diariamente dentro del Servicio de Cuentas UP. Su lógica:
1. Consulta `ISolicitudEvaluadorRepository.findPendientesMayoresA(7_dias_habiles)`.
2. Para cada solicitud vencida: cambia estado a `ANULADA`, escribe en la Grilla de Datos (Hazelcast) y publica evento `SOL_EVALUADOR_ACTUALIZADA` a Kafka.
3. El `DataWriter` persiste el nuevo estado en PostgreSQL.
4. `AuditoriaService.registrar(log)` registra la anulación automática en `auditoria_privilegios`.
5. El evento Kafka `SOL_ANULADA` es consumido por `NotificacionConsumer` (Servicio de Notificaciones), que notifica al postulante según RF26.

### Separación de Responsabilidades (SRP)
- El **servicio de roles** (`GestorRoles`) se encarga de la lógica de negocio (validaciones, cambios de rol y gestión de solicitudes).
- Los **repositorios** (`ISolicitudEvaluadorRepository`, `IRolRepository`) manejan el almacenamiento vía Hazelcast.
- El **componente de auditoría** (`AuditoriaService`) registra las acciones sensibles con inmutabilidad (RC14).

Esto evita concentrar múltiples responsabilidades en una sola clase.

### Integración con la Arquitectura Basada en Espacios
Los cambios de roles, permisos y solicitudes se almacenan en la grilla de datos mediante repositorios especializados, lo que permite que otras unidades de procesamiento accedan a esta información en tiempo real sin depender directamente de la base de datos (RC15).

### Auditoría Inmutable (RC14)
Cada cambio de privilegio — aprobación, rechazo o anulación de solicitud, suspensión de cuenta — genera una entrada en `AuditoriaService.registrar(log)`. El `AuditoriaDataMapper` inserta la entrada en la tabla append-only `auditoria_privilegios` (solo INSERT, nunca UPDATE/DELETE). Esto garantiza el log inalterable exigido por RC14.

---

*Ver también: [[Componentes - Servicio de Cuentas]] · [[Código - Módulo Autenticación]] · [[Patrones de Diseño]]*
