# Proyecto v3 - Índice

Este paquete reemplaza los archivos `.txt` por `.puml`, genera `.drawio.xml` con formato por tipo de diagrama y clasifica los diagramas de interacción por UP.

## Convenciones usadas

- Diagrama de contexto/contenedores/componentes: bloques C4 con colores diferenciados.
- Diagramas de clases/código: formato UML tipo clase, interfaz, enum y DTO.
- Diagramas de interacción: participantes con lifeline y mensajes ordenados.
- Arquitectura base: contenedores V4.1 con Data Reader y Data Writer.

## Estructura principal

- `contexto/`
- `contenedores/`
- `codigo/Servicio Persistencia/`
- `codigo/UP Cuentas/`
- `codigo/UP Archivos/`
- `codigo/UP Social/`
- `codigo/UP Notificaciones/`
- `diagramas interaccion/UP Cuentas/`
- `diagramas interaccion/UP Archivos/`
- `diagramas interaccion/UP Social/`
- `diagramas interaccion/UP Notificaciones/`
- `diagramas interaccion/Servicio Persistencia/`

## Actualización v3.4

La versión v3.4 incorpora las correcciones solicitadas para el Laboratorio 4:

- Se refuerza el escenario de validación de postulante a evaluador como diagrama de interacción principal de UP Cuentas.
- Se actualizan las vistas de código de Data Writer y Mappers para cubrir RF09 y RC14 sin romper el diseño existente.
- Se agregan mappers, snapshots y records para solicitud de evaluador, evidencias y auditoría de privilegios.
- Se agrega el documento `lab4.docx` con el avance del laboratorio.
- El diagrama de inicio de sesión queda como flujo secundario y no como sustento principal.
