# Vista de Código — Publicaciones y Foros (Servicio Social)

![[codigo-publicaciones-foros.md]]
*Diagrama de clases: ForoController, IPublicacionService, IComentarioService, PublicacionService, ComentarioService, IEventPublisher, Publicacion, PublicacionDTO.*

---

## Sustento de decisiones de diseño

### Principio de Responsabilidad Única (SRP) y Separación de Intereses (SoC)
El diseño presenta una clara separación en capas lógicas:
- **`ForoController`:** Se encarga exclusivamente de recibir y orquestar las peticiones HTTP.
- **`PublicacionService` / `ComentarioService`:** Contienen la lógica de negocio pura (como moderar una publicación o redactar un borrador).
- **`PublicacionMapper` / `ComentarioMapper`:** Asumen la única tarea de transformar datos.
- **`PublicacionRepository` / `ComentarioRepository`:** Aíslan la persistencia y el acceso a datos.

### Inversión de Dependencias (DIP) y Bajo Acoplamiento
El flujo de control se dirige hacia las abstracciones. El `ForoController` no está acoplado a clases concretas, sino a las interfaces `IPublicacionService` e `IComentarioService`. Del mismo modo, los servicios dependen de abstracciones como `IPublicacionRepository`. Esto permite que la infraestructura de base de datos pueda evolucionar sin obligar a reescribir la lógica de negocio ni los controladores.

### Protección del Dominio mediante el Patrón DTO
Se implementan `PublicacionDTO` y `ComentarioDTO` para aislar las entidades de dominio centrales (`Publicacion`, `Comentario`). Esto evita exponer la estructura interna del modelo de datos hacia el exterior (la Aplicación Web) y previene vulnerabilidades de seguridad. La responsabilidad de esta traducción estructurada se delega de forma altamente cohesiva a `PublicacionMapper` y `ComentarioMapper`.

### Cohesión del Modelo de Dominio y Restricciones
Las entidades centrales modelan fielmente las relaciones del mundo real (una publicación contiene cero a muchos comentarios y reacciones). Además, el uso de Enumeradores (`EstadoModeracion`, `TipoPublicacion`, `TipoReaccion`) centraliza los estados válidos del sistema. Esto evita el uso de cadenas de texto genéricas, previniendo errores y garantizando la integridad conceptual.

### Desacoplamiento entre Componentes Lógicos
`PublicacionService` no conoce directamente el Servicio de Gamificación ni el de Notificaciones. En su lugar, depende de la interfaz `IEventPublisher`, que abstrae la publicación de eventos a la **Grilla de Mensajería (Kafka)**. Al crear una publicación, `PublicacionService` invoca `publicarEvento(tipo, pub)`, que publica `PUBLICACION_CREADA`; los consumidores (`GamificacionConsumer`, `NotificacionConsumer`) reaccionan de forma asíncrona sin que el foro conozca qué consumidores existen ni cuántos son. Esto elimina el acoplamiento síncrono que existía cuando el Observer en-proceso llamaba directamente a los servicios de gamificación y notificaciones dentro del mismo request HTTP.

Al igual que `PublicacionService`, `ComentarioService` depende de `IEventPublisher` para desacoplar los efectos secundarios de los comentarios. Al agregar un comentario, publica el evento `COMENTARIO_CREADO` a Kafka; el `GamificacionConsumer` lo consume y registra el evento con `TipoAccion.COMENTAR_FORO`. Esto garantiza que la gamificación de comentarios sea asíncrona (RC03) y que el Servicio Social no conozca directamente al Servicio de Gamificación, preservando la independencia de UPs.

---

*Ver también: [[Componentes - Servicio Social]] · [[Código - Gamificación]] · [[Patrones de Diseño]]*
