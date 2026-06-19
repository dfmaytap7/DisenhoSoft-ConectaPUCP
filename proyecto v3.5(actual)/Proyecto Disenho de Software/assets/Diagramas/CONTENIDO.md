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
