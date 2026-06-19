# Vista de Código — Gestor de Notificaciones (Servicio de Notificaciones)

![[codigo-gestor-notificaciones.png]]
*Diagrama de clases: NotificationManager, NotificationRuleEngine, RecipientPreference, Notification, IDataGrid, IMailSender, ITemplateEngine, INotificationManager.*

---

## Sustento de decisiones de diseño

### Abstracción e Inversión de Dependencias (DIP)
Para garantizar que el módulo sea flexible y evolutivo, el orquestador principal (`NotificationManager`) no depende de implementaciones concretas, sino que dirige sus dependencias hacia abstracciones. Interactúa exclusivamente con las interfaces `IDataGrid`, `IMailSender` e `ITemplateEngine`. Esto asegura que los bloques de construcción de alto nivel no se vean afectados por cambios técnicos en las herramientas de bajo nivel.

### Principio de Responsabilidad Única (SRP) y Alta Cohesión
Se ha evitado crear un componente monolítico dividiendo las tareas:
- `NotificationManager`: responsable únicamente de orquestar el flujo de ejecución.
- `NotificationRuleEngine`: responsable de decidir las reglas de negocio (si un correo aplica o no).
- `RecipientPreference` y `Notification`: aíslan las responsabilidades de datos puros.

### Principio Abierto/Cerrado (OCP) y Bajo Acoplamiento
El diseño permite que el sistema sea fácilmente extensible sin necesidad de modificar el código existente. Si en el futuro se requiere cambiar el motor de renderizado de plantillas o el proveedor de correos, el bajo acoplamiento logrado mediante las interfaces permite introducir nuevas clases que implementen `ITemplateEngine` o `IMailSender` sin tocar una sola línea de código en el `NotificationManager`.

### Modularidad y Simplicidad
La clase `NotificationManager` implementa su propia interfaz (`INotificationManager`), garantizando que cualquier otro componente externo (como un Controlador web) interactúe con el subsistema de notificaciones a través de un contrato claro, encapsulando la complejidad interna y facilitando su posible reemplazo como bloque de construcción.

---

*Ver también: [[Componentes - Servicio de Notificaciones]] · [[Código - Motor de Plantillas]] · [[Código - Mailer Client]] · [[Patrones de Diseño]]*
