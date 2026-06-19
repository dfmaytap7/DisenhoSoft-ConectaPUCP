# Patrones de Diseño

Resumen de todos los patrones de diseño aplicados en ConectaPUCP.

---

## 4.5.1 Patrón Chain of Responsibility — "Validación de Material"

![[codigo-validacion-material.png]]

**Sustento:** Elegimos Chain of Responsibility porque la validación de un archivo académico requiere múltiples comprobaciones secuenciales (tamaño máximo, extensión permitida, firma MIME). Si resolvemos esto con sentencias `if-else` anidadas dentro de una sola clase, violaríamos el SRP y tendríamos una clase monolítica y rígida.

El patrón fue la elección ideal porque **desacopla las reglas de negocio**. Al convertir cada validación en un "eslabón" independiente, logramos que la cadena pueda detenerse inmediatamente si el archivo falla en algún punto. Además, preparamos al sistema para el futuro: si mañana la universidad exige integrar un escaneo de antivirus, simplemente agregamos un nuevo eslabón a la cadena sin tocar el código de las validaciones anteriores (OCP).

*Ver: [[Código - Validación de Material]]*

---

## 4.5.2 Patrón Proxy — "Repositorio de Archivos"

![[codigo-repositorio-archivos-proxy.png]]

**Sustento:** Elegimos el patrón Proxy porque la lectura y escritura de archivos pesados en la Grilla de Datos (Hazelcast) es una operación computacionalmente costosa y altamente confidencial. Necesitábamos establecer un control de seguridad estricto para evitar que usuarios sin permisos descarguen exámenes de otros.

Escogimos este patrón en lugar de poner la seguridad dentro de la clase de Hazelcast porque queríamos mantener la separación de intereses. El Proxy es perfecto porque "se disfraza" de repositorio implementando su misma interfaz. El sistema cree que está hablando con la base de datos, pero en realidad está hablando con nuestro intermediario de seguridad, el cual verifica los permisos (`checkAccess`) y, solo si el usuario está autorizado, delega la carga pesada al repositorio real.

*Ver: [[Código - Repositorio de Archivos]]*

---

## 4.5.3 Patrón Adapter — "Autenticación de Cuentas"

![[codigo-autenticacion-adapter.png]]

**Sustento:** Se aplica el patrón Adapter para aislar al componente de autenticación del formato específico usado por CAS. El sistema trabaja contra una interfaz genérica de autenticación, mientras que el adaptador se encarga de traducir la comunicación con el proveedor institucional.

Esta decisión permite cambiar el mecanismo externo de autenticación sin alterar la lógica principal del inicio de sesión. Si en el futuro CAS se reemplaza por OAuth2, SAML o Microsoft Entra, bastaría con crear otro adaptador que cumpla el mismo contrato. Además, el diseño evita que detalles técnicos del proveedor externo contaminen el modelo interno del sistema.

*Ver: [[Código - Módulo Autenticación]]*

---

## 4.5.4 Patrón Facade — "Gestor de Cuentas"

![[codigo-gestion-cuentas-facade.png]]

**Sustento:** Se aplica el patrón Facade mediante `GestionCuentasService`, ya que esta clase concentra las operaciones principales de cuentas y ofrece una entrada simple para el controlador. Así, el controlador no necesita conocer los pasos internos para iniciar sesión, actualizar perfil, suspender cuentas o asignar roles.

Esta decisión reduce el acoplamiento entre la capa de entrada y la lógica interna del sistema. Si en el futuro cambia la forma de consultar usuarios, registrar auditoría o coordinar roles, el controlador puede mantenerse estable porque sigue comunicándose con la misma fachada.

*Ver: [[Componentes - Servicio de Cuentas]]*

---

## 4.5.5 Patrón Observer — "Publicaciones y Foros"

**Sustento:** Se aplica el patrón Observer para desacoplar la lógica del foro de sus efectos secundarios: moderación, gamificación y notificaciones. `PublicacionService` actúa como *Subject*: tras persistir la publicación en la Grilla de Datos, publica el evento `PUBLICACION_CREADA` en la **Grilla de Mensajería (Kafka)** a través de `IEventPublisher`. Los tres observadores —`ModeradoConsumer`, `GamificacionConsumer` y `NotificacionConsumer`— son consumidores Kafka que reaccionan de forma asíncrona, cada uno dentro de su propio servicio. El *Subject* no sabe qué consumidores están suscritos ni cuántos son, cumpliendo el contrato central del patrón.

Implementar el Observer a través de Kafka —en lugar de llamadas síncronas en proceso— fue la decisión correcta porque el sistema no puede tolerar que el tiempo de registro de una publicación escale con el número de efectos secundarios (RC03: ≤ 2 s bajo 100 usuarios concurrentes). Con un modelo síncrono, cada observador añadiría latencia al request HTTP y un fallo aislado podría dejar la publicación en estado inconsistente. Al delegar la notificación al bus de eventos, el *Subject* cierra el request inmediatamente tras el `ack` de Kafka; cada consumer falla de forma independiente sin afectar al flujo principal ni a los demás; y la infraestructura del bus garantiza que cada evento se procese exactamente una vez, eliminando el riesgo de duplicados.

*Ver: [[Código - Publicaciones y Foros]]*

---

## 4.5.6 Patrón Strategy — "Gamificación"

![[codigo-gamificacion-strategy.png]]

**Sustento:** Se aplica el patrón Strategy en el núcleo de gamificación mediante `CalculadoraPuntosService` como contexto y un conjunto de implementaciones de `ICalculadoraService`. Cada estrategia encapsula cómo se calculan puntos y multiplicadores para su tipo de evento.

Esta decisión reduce el acoplamiento entre la variabilidad del negocio (las "reglas de puntaje") y el orquestador: el servicio central no crece con `if/switch` por cada nueva acción ni duplica lógica de consulta al motor de reglas en múltiples sitios; en su lugar delega en la estrategia seleccionada. Agregar una nueva mecánica implica añadir una nueva estrategia sin rediseñar el controlador ni el servicio orquestador.

*Ver: [[Código - Gamificación]]*

---

## 4.5.7 Patrón Facade — UP Notificaciones

![[codigo-notificacion-orquestador-facade.png]]

**Sustento:** La clase `NotificacionOrquestador` implementa la interfaz `INotificacionService` y actúa como un intermediario unificado que encapsula una secuencia compleja de interacciones. Para procesar una notificación, se requiere coordinar tres subsistemas distintos:
1. El acceso al estado distribuido (`IUnitOfWork` / Hazelcast).
2. El procesamiento de formato (`ITemplateEngine`).
3. La infraestructura de transmisión física (`IMailSender`).

El orquestador expone una interfaz sumamente limpia hacia el exterior, ocultando esta complejidad subyacente.

*Ver: [[Código - Gestor de Notificaciones]]*

---

## 4.5.8 Patrón Adapter — MailSender

![[patron-adapter-mailsender.png]]

**Sustento:** La aplicación requiere realizar envíos de correos electrónicos corporativos, operación que depende de utilitarios nativos o APIs de terceros. El patrón introduce la interfaz propia `IMailSender` para definir el contrato ideal requerido por nuestro dominio. La clase concreta `MailSender` implementa este contrato y, en su interior, traduce y adapta las llamadas del sistema hacia los comandos específicos y rígidos que exige la librería externa.

*Ver: [[Código - Mailer Client]]*

---

## 4.5.9 Patrón Front Controller — UP Notificaciones

![[patron-front-controller.png]]

**Sustento:** El `NotificacionController` actúa como la puerta de acceso exclusiva para todas las peticiones síncronas HTTP dirigidas a la UP. Expone los métodos de entrada (`enviarNotificacionIndividual`, `enviarNotificacionMasiva`) y recibe los datos empaquetados en DTOs (`NotificacionDTO`). Este componente no ejecuta lógica de negocio; en su lugar, valida el esquema de entrada y delega inmediatamente la responsabilidad al componente de servicio interno a través de la interfaz `INotificacionService`.

---

## 4.5.10 Patrón Observer — Kafka (UP Notificaciones)

![[patron-observer-kafka.png]]

**Sustento:** La UP de Notificaciones debe reaccionar de forma reactiva ante los cambios de estado del ecosistema global de ConectaPUCP (como la subida de un archivo o una interacción social). El `NotificacionConsumer` se registra dinámicamente como un escucha (`Listener`) dentro de la infraestructura del bus de eventos (Kafka). Cuando un tópico genera una publicación (`notify`), el consumidor intercepta el mensaje a través del método `update(EventoDTO)` y activa el flujo de procesamiento en el orquestador.

---

## 4.5.11 Patrón Template View — Motor de Plantillas

![[codigo-motor-plantillas.png]]

**Sustento:** Este patrón gestiona la composición del cuerpo visual de los mensajes. En lugar de construir las interfaces HTML concatenando cadenas de texto en el código fuente, el diseño separa los componentes en dos elementos:
1. Archivos HTML estáticos con marcadores de posición (placeholders como `{{usuario}}`).
2. El motor encargado de fusionar dichos archivos con el modelo de datos real en tiempo de ejecución.

El `TemplateEngine` se apoya en un `TemplateLoader` para aislar también la estrategia de lectura del archivo físico.

*Ver: [[Código - Motor de Plantillas]]*

---

*Ver también: [[Patrones de Persistencia]] · [[Patrones de Interacción con BD]]*
