# Vista de Código — Gamificación (Servicio Social)

![[codigo-gamificacion.md]]
*Diagrama de clases completo (patrón Strategy, C4 aplicado): GamificacionController, CalculadoraPuntosService, ICalculadoraService (Strategy), estrategias concretas (CalculadoraGrupoEstudioService, CalculadoraValidacionDocService, CalculadoraReaccionService, CalculadoraSubidaDocService, CalculadoraParticipacionForoService), IEventoRepository, IMotorReglasService, MotorReglasService, IReglaRepository, IRangoEventPublisher, TipoAccion (Enum), Rango (Enum), NivelRango, ReglaPuntaje, EventoGamificacion.*

---

## Sustento de decisiones de diseño

### Principio de Responsabilidad Única (SRP) y Alta Cohesión
Se evitó centralizar toda la lógica en el controlador o en un servicio gigante. El diseño distribuye el dominio en bloques de construcción altamente cohesivos:
- **`MotorReglasService`:** Su única responsabilidad es consultar y proveer las políticas de puntaje vigentes (`ReglaPuntaje`).
- **`CalculadoraPuntosService`:** Actúa como el cerebro de la operación, dedicándose exclusivamente a calcular la sumatoria, registrar el evento de auditoría y evaluar si los puntos acumulados alcanzan un nuevo umbral (`NivelRango`).

### Principio Abierto/Cerrado (OCP) y Diseño Orientado a Datos
El sistema está diseñado para ser extensible sin requerir modificaciones en el código fuente. Al utilizar las enumeraciones `TipoAccion` y `Rango`, y vincularlas a entidades persistentes (`ReglaPuntaje`, `NivelRango`), si el día de mañana se decide cambiar la cantidad de puntos que otorga `SUBIR_DOCUMENTO` o se crea un nuevo rango, esto se gestiona a nivel de base de datos o configuración. El motor de cálculo (`CalculadoraPuntosService`) seguirá funcionando sin alterar su lógica.

### Inversión de Dependencias (DIP) y Bajo Acoplamiento
La orquestación del sistema fluye a través de abstracciones. `CalculadoraPuntosService` no depende de repositorios concretos ni de clases específicas de otros módulos, sino que inyecta interfaces (`IMotorReglasService`, `IEventoRepository`, `IRangoEventPublisher`). Esto permite que las implementaciones subyacentes cambien (por ejemplo, migrar las reglas de PostgreSQL a Hazelcast) sin afectar la lógica core de asignación de puntos.

### Patrón Strategy
`CalculadoraPuntosService` actúa como contexto y selecciona entre un conjunto de implementaciones concretas de `ICalculadoraService` (estrategias por `TipoAccion`):
- `CalculadoraGrupoEstudioService`
- `CalculadoraValidacionDocService`
- `CalculadoraReaccionService`
- `CalculadoraSubidaDocService`
- `CalculadoraParticipacionForoService`

Esto favorece el OCP: agregar una nueva mecánica implica añadir una nueva estrategia sin rediseñar el orquestador.

### Aislamiento de Contextos Delimitados (Microservicios)
El Servicio Social y el Servicio de Cuentas son UPs independientes que no se llaman entre sí directamente — este es un principio fundamental de la Space-Based Architecture. Cuando `CalculadoraPuntosService` detecta que un usuario subió de nivel, no invoca al Servicio de Cuentas vía HTTP. En su lugar, publica el evento `RANGO_ACTUALIZADO { userId, nuevoRango, timestamp }` a la **Grilla de Mensajería (Kafka)** a través de `IRangoEventPublisher`. El Servicio de Cuentas tiene su propio consumer que escucha ese tópico y actualiza el rango en Hazelcast y PostgreSQL. Este diseño elimina el acoplamiento temporal: si el Servicio de Cuentas está caído, el evento queda encolado en Kafka y se procesa cuando vuelva, sin que la operación de gamificación falle ni quede en estado inconsistente.

### Rangos de gamificación
```
CACHIMBO → REGULAR → EXPERTO → AVANZADO → SENIOR → ELITE
```

---

*Ver también: [[Componentes - Servicio Social]] · [[Código - Publicaciones y Foros]] · [[Patrones de Diseño]]*
