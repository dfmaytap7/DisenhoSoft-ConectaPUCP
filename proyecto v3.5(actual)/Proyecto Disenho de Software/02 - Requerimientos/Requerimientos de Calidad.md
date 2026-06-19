# Requerimientos de Calidad

| ID | Descripción | Tipo | Prioridad |
|----|-------------|------|-----------|
| RC01 | El sistema de software deberá contar con un diseño responsivo que garantice su correcta visualización y funcionamiento desde navegadores de escritorio, tablets y dispositivos móviles. | Calidad | Alta |
| RC02 | El sistema deberá mantener una disponibilidad mínima del 95% durante el semestre académico, mediante mecanismos de alta disponibilidad y recuperación automática ante fallos. | Calidad | Alta |
| RC03 | El sistema debe asegurar que los tiempos de respuesta de los servicios no superen los 2 segundos de carga, incluso si hay más de 100 usuarios conectados simultáneamente. | Calidad | Baja |
| RC04 | El sistema de software deberá ser escalable horizontalmente para soportar el crecimiento progresivo de usuarios concurrentes, documentos almacenados y grupos de discusión activos. | Calidad | Baja |
| RC05 | El sistema de software deberá contar con la configuración de visibilidad de la información personal, respetando los estándares de privacidad establecidos por la universidad. | Calidad | Media |
| RC06 | El sistema de software debe ser fácil de usar y comprender para los usuarios que se sienten o no familiarizados con la tecnología, incluyendo a aquellos que no se sienten cómodos con plataformas complejas o difíciles de manejar. | Calidad | Media |
| RC07 | El sistema debe garantizar que solo los estudiantes, profesores y evaluadores de la universidad puedan registrarse y acceder a la plataforma. Debe integrarse con un sistema de autenticación seguro para evitar el acceso de personas externas. | Calidad | Alta |
| RC08 | El sistema deberá tener la capacidad de interactuar con otras plataformas institucionales o sistemas de la PUCP en el futuro para la sincronización de datos. | Calidad | Baja |
| RC09 | El servicio deberá registrar en la Grilla de Datos (Hazelcast) el ciclo de vida de cada mensaje (desde la creación hasta el despacho) para asegurar la trazabilidad del proceso. | Calidad | Media |
| RC10 | El servicio deberá ser capaz de reintentar envíos fallidos de forma asíncrona utilizando el almacenamiento temporal en el "Space". | Calidad | Alta |
| RC11 | El sistema debe rechazar archivos que no coincidan con su extensión (validación de firma/MIME) o que superen los 100 MB. | Calidad | Media |
| RC12 | Los archivos deben almacenarse en la Grilla de Datos asegurando una alta tasa de transferencia y evitando el uso de discos locales lentos. | Calidad | Alta |
| RC13 | Los tokens y roles deben estar disponibles en el "Space" (Hazelcast) para que otros servicios validen permisos sin latencia. | Calidad | Alta |
| RC14 | El sistema debe registrar un log inalterable de quién y cuándo modificó un privilegio de usuario (especialmente para el RF09). | Calidad | Alta |
| RC15 | Los cambios de privilegios deben propagarse a la Grilla de Datos en tiempo real para evitar discrepancias de acceso en los servicios de Archivos y Notificaciones. | Calidad | Alta |
| RC16 | La arquitectura debe garantizar en el "Space" que cada interacción de votación (like/dislike) sea única por usuario/publicación para evitar manipulaciones en la gamificación. | Calidad | Alta |
| RC17 | El almacenamiento de hilos activos y rankings en Hazelcast debe optimizar la serialización de objetos para minimizar la latencia y el consumo de RAM en los nodos. | Calidad | Media |
| RC18 | El sistema debe permitir la reanudación de subidas o descargas de archivos si la sesión con la Grilla de Datos se interrumpe momentáneamente. | Calidad | Alta |
| RC19 | Toda comunicación entre las Unidades de Procesamiento (UP) y la Grilla de Datos debe estar protegida mediante TLS/SSL. | Calidad | Alta |
| RC20 | El sistema debe validar que los archivos vinculados a foros existan en el repositorio, evitando enlaces rotos para el usuario. | Calidad | Alta |

---

*Ver también: [[Requerimientos Funcionales]] · [[Restricciones]]*
