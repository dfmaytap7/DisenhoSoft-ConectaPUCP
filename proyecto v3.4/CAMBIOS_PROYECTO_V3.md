# Cambios aplicados - Proyecto v3

## Correcciones globales

1. Se eliminó el uso de archivos `.txt` para diagramas. Todo diagrama editable quedó como `.puml`.
2. Se generó un `.drawio.xml` por cada `.puml` con formato visual según tipo de bloque:
   - C4/componentes: bloques redondeados, contenedores, componentes, bases de datos y colas diferenciadas.
   - Clases: formato UML tipo clase/interfaz/DTO/enum.
   - Interacción: participantes, lifelines y mensajes.
3. Se tomó como fuente principal `Diagrama contenedores V4.1 - Principal`, porque separa Data Reader y Data Writer.
4. Se mantuvo `Diagrama contenedores V4 - Referencia previa` solo como histórico.
5. Se llenaron las carpetas que estaban vacías o con poco contenido, incluyendo `contexto` y la clasificación por UP en `diagramas interaccion`.

## Coherencia arquitectónica

- Las UPs no acceden directamente a PostgreSQL.
- Las UPs consultan/escriben estado estructurado en Hazelcast.
- El Data Writer persiste escrituras asincrónicas en PostgreSQL/Elasticsearch y actualiza referencias a Object Storage.
- El Data Reader atiende cache miss o precargas y recarga la Grilla de Datos.
- Object Storage guarda binarios pesados; Hazelcast/BD guardan metadata, `objectKey`, `checksum` y estados.

## Persistencia e interacción con BD

- Se agregó `Patrones_de_Persistencia_e_Interaccion_con_BD_CORREGIDO.md`.
- Se aclaró que DTO significa **Data Transfer Object** y que no es lo mismo que Data Mapper.
- Se separó `ArchivoDataMapper` (interacción con BD/snapshots) de `ArchivoDTOAssembler` (entidad ↔ DTO para presentación).
- Se ajustó el uso de LOB Serializado para no afirmar que archivos pesados de 100 MB deben ir completos en Hazelcast/BD.

## Patrones de diseño aplicados

- UP Cuentas: Adapter, Facade, Page Controller, Strategy/RBAC, Observer/Audit Logger.
- UP Archivos: Facade, Chain of Responsibility, Proxy, Adapter, DTO/Assembler.
- UP Social: Observer, Strategy, DTO, DIP.
- UP Notificaciones: Facade, Observer, Template Method, Adapter.
- Servicio Persistencia: Data Mapper, write-behind, read-through/cache miss.

## Diagramas de interacción generados

- UP Cuentas: inicio de sesión; validación de rol evaluador.
- UP Archivos: subida de archivo; descarga de archivo.
- UP Social: creación de publicación/notificación; reacción/gamificación.
- UP Notificaciones: envío de correo.
- Servicio Persistencia: write-behind Data Writer; read-through Data Reader.

## Archivos de referencia preservados

- Se preservó el PDF original de persistencia como `Patrones_de_Persistencia_e_Interaccion_con_BD_ORIGINAL.pdf` y se añadió una versión corregida en Markdown.


## Corrección posterior - Sintaxis PlantUML en diagramas de interacción

- Se corrigieron los participantes multilínea de los diagramas de interacción.
- El error se debía a etiquetas partidas en dos líneas, por ejemplo `participant "Usuario` seguido de `Autorizado" as u`.
- Se reemplazaron esos saltos físicos por `\n` dentro de la cadena, formato válido para PlantUML: `participant "Usuario\nAutorizado" as u`.
- Se verificó que no queden comillas desbalanceadas en archivos `.puml`.

Archivos corregidos:
- diagramas interaccion/UP Cuentas/inicio sesion - UP Cuentas.puml
- diagramas interaccion/UP Cuentas/validacion rol evaluador - UP Cuentas.puml
- diagramas interaccion/UP Archivos/subida de archivo - UP Archivos.puml
- diagramas interaccion/UP Archivos/descarga de archivo - UP Archivos.puml
- diagramas interaccion/UP Social/publicacion y notificacion - UP Social.puml
- diagramas interaccion/UP Social/reaccion y gamificacion - UP Social.puml
- diagramas interaccion/UP Notificaciones/envio correo - UP Notificaciones.puml
- diagramas interaccion/Servicio Persistencia/write behind - Data Writer.puml
- diagramas interaccion/Servicio Persistencia/read through - Data Reader.puml


## Corrección de formato de diagramas de interacción

- Se regeneraron los `.drawio.xml` ubicados en `diagramas interaccion/` usando formato UML similar a la referencia `UP Archivos - Laboratorio 3.drawio.xml`.
- Los actores principales ahora usan `shape=umlActor`.
- Los participantes usan bloques rectangulares naranja con borde fuerte.
- Las líneas de vida usan línea punteada roja.
- Los mensajes síncronos usan flecha negra sólida y las respuestas usan flecha discontinua.
- Se añadieron barras de activación y notas amarillas cuando el `.puml` contiene `note`.

## Corrección adicional - XML draw.io de diagramas de interacción
- Se corrigió la celda raíz de los XML de interacción: `mxCell id="0"` ya no tiene `parent="1"`.
- Esto era la causa de que diagrams.net/draw.io no cargara los diagramas aunque el XML estuviera bien formado.
- Se mantuvo el formato visual de interacción similar a la referencia de UP Archivos.


## Ajustes proyecto v3.3

- Se renombró el entregable a `proyecto v3.3`.
- Se corrigieron todos los diagramas de interacción para alinearlos con la notación UML de diagramas de secuencia usada en la PPT del curso.
- Los participantes que representan usuarios ahora se modelan como `actor` en los `.puml` y con símbolo UML de actor en los `.drawio.xml`.
- Los eventos asíncronos ahora usan `->>` en PlantUML y flecha abierta en draw.io; las respuestas quedan como flechas punteadas.
- Se agregaron fragmentos UML `alt`, `opt` y `par` en flujos con condiciones, iteraciones lógicas o ejecución paralela.
- Se agregaron activaciones (`activate` / `deactivate`) en los `.puml` y barras de activación en los XML.
- Se cerraron los flujos principales con una respuesta visible hacia la aplicación web o el actor.
- Se regeneraron los XML de interacción con celda raíz válida de draw.io y estilo de secuencia similar a la referencia de UP Archivos.
