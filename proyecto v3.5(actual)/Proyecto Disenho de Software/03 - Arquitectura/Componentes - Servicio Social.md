# Componentes — Servicio Social (UP)

![[c4-componentes-social.png]]
*Vista de Componentes del Servicio Social UP.*

---

## Componentes

| Componente | Descripción | Roles | RF | RC |
|------------|-------------|-------|----|----|
| **Controlador Social** | Punto de entrada para interactuar con foros, grupos y rankings. Recibe peticiones, valida tokens JWT y delega al Gestor. | Estudiante, Evaluador | RF06, RF14, RF15, RF20, RF33, RF34 | RC03, RC07 |
| **Gestión Social** | Orquestador principal. Valida reglas de negocio complejas, coordina inscripciones a eventos y dispara el motor de recompensas. | Estudiante, Administrador | RF04, RF05, RF12, RF15, RF23 | RC02, RC04, RC05 |
| **Publicaciones y Foros** | Gestiona la lógica de creación de hilos, comentarios y vinculación de archivos mediante IDs de referencia. | Estudiante, Evaluador | RF03, RF06, RF07, RF35, RF38 | RC01, RC16, RC20 |
| **Gamificación** | Motor de reglas que calcula puntos y niveles en tiempo real basándose en las interacciones sociales enviadas por el Gestor. | Sistema | RF33, RF34 | RC16, RC17 |
| **Cliente Grilla de Datos** | Adaptador técnico para comunicarse con el Space (Hazelcast) para persistir estados y rankings. | Sistema | RF01, RF10, RF33, RF35 | RC08, RC16, RC19 |

---

## Sustento

- **Comunicación entre Contratos:** El componente de Publicaciones y Foros no calcula puntos directamente, delega esta acción a `IGamificacionService`. Esto mantiene alta cohesión y evita que la lógica de foros se cruce con reglas de negocio de premios.
- **Diseño Orientado a Datos para Gamificación:** Las reglas de puntaje no están en código duro, sino que se consultan mediante un `MotorReglasService`, permitiendo que el administrador cambie cuántos puntos vale un like sin desplegar código nuevo.

---

*Ver también: [[Vista de Contenedores]] · [[Código - Publicaciones y Foros]] · [[Código - Gamificación]]*
