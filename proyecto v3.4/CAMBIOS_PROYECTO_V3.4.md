# Cambios aplicados - Proyecto v3.4

## Motivo de la corrección

La versión v3.3 contenía diagramas útiles, pero todavía existían inconsistencias respecto a la observación del laboratorio 4:

1. El diagrama de interacción de inicio de sesión no debía ser el escenario principal del informe, porque no representa el corazón de ConectaPUCP.
2. La vista de código simplificada de Data Writer no coincidía completamente con el diseño detallado basado en `KafkaEventAdapter`, `WriteHandlerRegistry`, `IWriteHandler` y handlers tipo Strategy.
3. La vista de Mappers no incluía todavía las clases necesarias para cubrir RF09 y RC14 de forma explícita.
4. El Gestor de Roles no mostraba con suficiente claridad la solicitud de evaluador, sus evidencias y la estrategia de aprobación.
5. Auditoría de Cuentas no explicitaba el comportamiento append-only ni el hash de integridad requerido para un log inalterable.

## Archivos modificados

### Servicio de Persistencia

- `codigo/Servicio Persistencia/Data Writer.puml`
- `codigo/Servicio Persistencia/Data Writer.drawio.xml`
- `codigo/Servicio Persistencia/Mappers.puml`
- `codigo/Servicio Persistencia/Mappers.drawio.xml`
- `diagramas interaccion/Servicio Persistencia/write behind - Data Writer.puml`
- `diagramas interaccion/Servicio Persistencia/write behind - Data Writer.drawio.xml`

Cambios realizados:

- Se reemplazó la vista simplificada del Data Writer por una vista coherente con el diseño detallado del componente.
- Se incorporaron `KafkaEventAdapter`, `IMessageBrokerClient`, `IEventDeserializer`, `WriteHandlerRegistry`, `IWriteHandler`, `ITransactionManager`, `IWriteAuditLogger` y `IFailurePublisher`.
- Se mantuvo el patrón Strategy para los handlers de escritura.
- Se extendió `RolActualizadoWriteHandler` para que use `IUsuarioMapper`, `ISolicitudEvaluadorMapper` e `IPrivilegioAuditMapper`.
- Se añadió soporte explícito para RF09, RF32 y RC14 sin crear un diseño paralelo inconsistente.

### Mappers / Repositorios

Cambios realizados:

- Se mantuvo el estilo de Data Mapper basado en `Snapshot`, `Record`, `BasePersistenceMapper` y `PostgreSqlGateway`.
- Se agregaron `SolicitudEvaluadorMapper` y `PrivilegioAuditMapper`.
- Se agregaron snapshots y records para `SolicitudEvaluador`, `EvidenciaPostulacion` y `PrivilegioAudit`.
- `PrivilegioAuditMapper` se definió como append-only: solo expone `append()` y no expone `update()` ni `delete()`.
- Se incorporó Dependent Mapping para evidencias de postulación, ya que dependen de la solicitud de evaluador.

### UP Cuentas

- `codigo/UP Cuentas/Gestor roles.puml`
- `codigo/UP Cuentas/Gestor roles.drawio.xml`
- `codigo/UP Cuentas/Auditoria.puml`
- `codigo/UP Cuentas/Auditoria.drawio.xml`
- `diagramas interaccion/UP Cuentas/validacion rol evaluador - UP Cuentas.puml`
- `diagramas interaccion/UP Cuentas/validacion rol evaluador - UP Cuentas.drawio.xml`

Cambios realizados:

- Se reforzó el flujo de validación de postulante a evaluador como escenario principal del componente de cuentas.
- Se añadió `SolicitudEvaluadorRepository`, `UsuarioRolRepository`, `SolicitudEvaluador`, `EvidenciaPostulacion` y `RoleChangedEvent`.
- Auditoría ahora muestra `PrivilegeChangeLog`, `AuditHashService` y `GridAuditRepository` con comportamiento append-only.
- El diagrama de interacción de validación de evaluador ahora muestra la revisión de evidencias, aprobación/rechazo, actualización del rol, auditoría y publicación del evento hacia Data Writer.

## Decisión sobre el diagrama de inicio de sesión

El diagrama `diagramas interaccion/UP Cuentas/inicio sesion - UP Cuentas.puml` se conserva como flujo secundario de seguridad, pero no debe ser presentado como diagrama principal del sustento técnico. Para el informe se recomienda priorizar:

1. Subida, validación y publicación de material académico.
2. Validación de postulante a evaluador y auditoría de privilegios.
3. Búsqueda/descarga de material académico, si se requiere un tercer flujo.

## Impacto en el informe

Las correcciones permiten justificar mejor:

- RF09: validación de evidencias de postulante a evaluador dentro del plazo.
- RF32: actualización del rol del usuario a Evaluador.
- RC14: log inalterable de modificación de privilegios.
- RC15: propagación del cambio de rol a la Grilla de Datos.
- Patrones de persistencia: Identity Field, Foreign Key Mapping, Dependent Mapping y Audit Log append-only.
- Patrones de interacción con BD: Data Mapper, Gateway, Transaction Manager y write-behind.

## Archivos agregados

- `lab4.docx`: avance del Laboratorio 4 con corrección del informe anterior, plan de pruebas, riesgos, cronograma y mockup de pantalla para alumno.
- `CAMBIOS_PROYECTO_V3.4.md`: detalle de cambios realizados, razón técnica e impacto en el informe.
