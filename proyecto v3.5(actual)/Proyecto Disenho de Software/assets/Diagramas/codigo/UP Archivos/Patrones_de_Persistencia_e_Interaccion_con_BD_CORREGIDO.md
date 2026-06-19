# Patrones de Persistencia e Interacción con BD - Versión corregida

## DTO aclarado

**DTO (Data Transfer Object)** es un objeto serializable usado para trasladar datos entre capas o sistemas. En este proyecto, `ArchivoDTO` no representa la tabla ni la entidad completa `Archivo`; representa solo los datos que la Aplicación Web necesita recibir o enviar, por ejemplo `idArchivo`, `nombre`, `curso`, `ciclo`, `estadoValidacion` y `urlDescarga`.

Esto evita exponer detalles internos como `objectKey`, `checksum`, reglas de persistencia o buffers binarios. El DTO se transforma mediante un **Assembler** (`ArchivoDTOAssembler`), no mediante el Data Mapper de BD.

## Data Mapper

`ArchivoDataMapper` pertenece al Servicio de Persistencia. Su responsabilidad es transformar entre la entidad/snapshot persistible y los registros de PostgreSQL o estructuras persistentes. Por tanto, contiene la lógica de interacción con el repositorio de datos y evita que la entidad conozca SQL o tablas.

## Objeto Grande (LOB) Serializado

Para la arquitectura V4.1 se evita almacenar el binario completo de hasta 100 MB dentro de Hazelcast o PostgreSQL. La decisión coherente es almacenar el binario en Object Storage y mantener en Hazelcast/BD solo metadata, `objectKey`, `checksum` y estados. Si se necesita usar LOB serializado en el informe, se aplica a estructuras pequeñas como `metadataJson` o `socialRefs`, no al archivo pesado completo.

## Dependent Mapping

`SocialReference` depende de `Archivo`: no tiene repositorio propio ni ciclo de vida independiente. Se guarda como parte del agregado de metadata de `Archivo`.

## Identity Field

`Archivo.id: GUID` se mantiene como Identity Field para ubicar de forma unívoca el objeto en memoria, en Hazelcast y en los registros persistentes.
