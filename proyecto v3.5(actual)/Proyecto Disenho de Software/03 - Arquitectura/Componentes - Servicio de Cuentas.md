# Componentes — Servicio de Cuentas (UP)

![[c4-componentes-cuentas.png]]
*Vista de Componentes del Servicio de Cuentas UP.*

---

## Componentes

| Componente | Descripción | Roles | RF | RC |
|------------|-------------|-------|----|----|
| **Controlador de Cuentas** | Interfaz de entrada y validación de tokens. | Estudiante, Evaluador, Administrador | RF13, RF14, RF30 | RC03, RC07 |
| **Gestión de Cuentas** | Lógica de CRUD de usuarios y estados de cuenta. Actúa como Facade. | Sistema | RF11, RF16, RF31 | RC02, RC04 |
| **Gestor de Roles** | Manejo de jerarquías, permisos y cambios de rol (RF09). Gestiona solicitudes de postulación a evaluador (`ISolicitudEvaluadorRepository`). Incluye el `SolicitudExpirationJob` (cron diario) que anula automáticamente solicitudes con más de 7 días hábiles sin resolución, publica `SOL_ANULADA` a Kafka y dispara notificación al postulante (RF26). | Administrador, Sistema | RF09, RF14, RF26, RF32 | RC14, RC15 |
| **Autenticación de Cuentas** | Adaptador para la integración con el sistema de identidad de la PUCP (CAS). | Sistema | RF13 | RC07, RC08 |
| **Auditoría de Cuentas** | Registra acciones sensibles sobre cuentas, roles y privilegios del sistema. | Administrador, Sistema | RF09, RF14, RF31, RF32 | RC14, RC15, RC07 |
| **Cliente Grilla de Datos** | Persistencia de sesiones y perfiles en Hazelcast mediante `GridClientFacade`. | Sistema | RF10, RF11, RF14, RF30, RF31, RF32, RF19 | RC09, RC13, RC14, RC15 |

---

## Sustento

- **Gestión de Estado en el Espacio:** El componente de Autenticación valida la identidad institucional mediante CAS, pero la sesión local, tokens y roles activos se almacenan en la Grilla de Datos. Esto permite que el servicio de cuentas sea *stateless* a nivel de servidor y escalable horizontalmente.
- **Seguridad y Auditoría:** Se incorpora Auditoría de Cuentas para registrar acciones sensibles como suspensión de usuarios, asignación de roles y aprobación de postulaciones (quién, sobre qué usuario, cuándo).
- **Gestión de Roles y Postulaciones:** El Gestor de Roles administra permisos, cambios de rol y solicitudes de postulación a evaluador. Cuando un estudiante postula, se genera una solicitud pendiente; solo un administrador puede aprobarla o rechazarla. Si se aprueba, el rol se actualiza y se propaga a la Grilla de Datos.

---

*Ver también: [[Vista de Contenedores]] · [[Código - Gestor de Roles]] · [[Código - Módulo Autenticación]]*
