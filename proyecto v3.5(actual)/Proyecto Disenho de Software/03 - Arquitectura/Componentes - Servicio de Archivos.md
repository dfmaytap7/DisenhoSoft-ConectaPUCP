# Componentes — Servicio de Archivos (UP)

![[c4-componentes-archivos.png]]
*Vista de Componentes del Servicio de Archivos UP.*

---

## Componentes

| Componente | Descripción | Roles | RF | RC |
|------------|-------------|-------|----|----|
| **Controlador de Archivos** | Punto de entrada HTTP. Recibe el archivo y valida la identidad/rol del usuario. | Estudiante, Evaluador, Administrador | RF14, RF28, RF29 | RC03, RC07 |
| **Gestión de Archivos** | Coordina la validación técnica y el flujo hacia la grilla. Actúa como Facade. Recibe datos usando un Stream en lugar de cargar el archivo completo en RAM. | Sistema | RF04, RF09, RF22, RF28 | RC02, RC04 |
| **Validación de Material** | Ejecuta filtros de tamaño, extensión y políticas de contenido. | Sistema | RF09, RF25 | RC11 |
| **Repositorio de Archivos** | Implementa la lógica de organización por curso/ciclo y vínculos sociales. | Sistema | RF37, RF38 | RC12, RC18, RC20 |
| **Cliente Grilla de Datos** | Adaptador técnico para la persistencia de binarios y metadatos en el Space (Hazelcast). | Sistema | RF01, RF37, RF38 | RC09, RC13, RC19 |
| **ArchivoDTO Assembler** | Convierte entidades internas en DTOs para exponer al cliente. | Sistema | RF29 | RC03 |

---

## Sustento

- El acceso a los archivos se realiza a través de `IFileRepository`, aislando si el archivo vive en la Grilla de Datos o en un almacenamiento local, facilitando la portabilidad.
- Se separa la **Validación de Material** en un componente independiente para ejecutar filtros de seguridad (firma/MIME) y tamaño antes de procesar el archivo, cumpliendo con la restricción RC11.

---

*Ver también: [[Vista de Contenedores]] · [[Código - Validación de Material]] · [[Código - Repositorio de Archivos]]*
