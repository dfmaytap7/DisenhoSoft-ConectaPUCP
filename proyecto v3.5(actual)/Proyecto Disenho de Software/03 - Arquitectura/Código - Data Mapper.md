# Vista de Código — Data Mapper / Repositorios (Servicio de Persistencia)

![[codigo-data-mapper.png]]
*Diagrama de clases: IDataMapper\<T\>, UsuarioDataMapper, ArchivoDataMapper, PublicacionDataMapper, ConnectionProvider.*

![[codigo-data-mapper-archivo-dto.png]]
*Diagrama de clases: Archivo (dominio), SocialReference, ArchivoDataMapper, ArchivoRecordSnapshot, ArchivoDTOAssembler, ArchivoDTO.*

---

## Sustento de decisiones de diseño

### Aplicación del Patrón Data Mapper
Los `DataMapper` concentran la transformación entre los objetos del sistema y los registros persistentes. Su función es aislar la estructura del modelo de dominio respecto a la estructura física de las tablas. Por eso, las entidades como `Usuario`, `Archivo`, `Rol` o `Publicacion` no necesitan conocer SQL, columnas ni detalles de PostgreSQL.

### Principio de Responsabilidad Única (SRP)
Los mappers no validan reglas de negocio ni gestionan flujos de usuario. Su única responsabilidad es transformar datos entre representaciones:
- Entidad de dominio
- Snapshot persistible (`ArchivoRecordSnapshot`)
- Registro de base de datos
- DTO cuando corresponda

Esto evita mezclar lógica de negocio con lógica de persistencia.

### Inversión de Dependencias (DIP) y Bajo Acoplamiento
Los componentes de lectura y escritura pueden depender de abstracciones como `IUsuarioRepository`, `IArchivoRepository` o `IPublicacionRepository`, en lugar de depender directamente de una implementación concreta. Esto permite cambiar la tecnología de persistencia o ajustar el esquema de tablas sin afectar a las UPs ni a las reglas de negocio.

### Mantenibilidad ante Cambios en la BD
Si cambia una tabla, una columna o la forma de almacenar un archivo, el cambio se concentra en los mappers y repositorios. El impacto no se propaga hacia los controladores, servicios de negocio o componentes de otras UPs.

### Protección del Dominio
El uso de mappers evita que las entidades del dominio se contaminen con detalles técnicos. Por ejemplo, una clase `Archivo` puede representar el concepto de material académico, mientras que el mapper decide cómo se guarda su `objectKey`, `checksum`, curso, ciclo o metadata en la base de datos.

### Patrón DTO + Assembler
La clase `ArchivoDTOAssembler` lee el dominio y construye el `ArchivoDTO` optimizando el payload de red: solo transfiere `id`, `nombre`, `curso`, `ciclo`, `urlDescarga` — nunca el BLOB ni datos internos sensibles.

---

*Ver también: [[Componentes - Servicio de Persistencia]] · [[Patrones de Interacción con BD]]*
