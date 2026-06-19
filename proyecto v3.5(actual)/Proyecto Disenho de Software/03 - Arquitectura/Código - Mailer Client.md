# Vista de Código — Mailer Client (Servicio de Notificaciones)

![[codigo-mailer-client.png]]
*Diagrama de clases: IMailSender, SmtpMailSender, EmailMessage (DTO), MailConfig, Nodemailer (library).*

---

## Sustento de decisiones de diseño

### Abstracción e Inversión de Dependencias (DIP)
El diseño expone la interfaz `IMailSender` como el contrato de comunicación para cualquier cliente que necesite enviar correos. Al depender de esta abstracción y no de la clase concreta `SmtpMailSender`, se cumple el Principio de Inversión de Dependencias. Esto garantiza que el sistema principal desconozca los detalles técnicos del envío de correos.

### Encapsulamiento de Librerías Externas (Patrón Adapter) y OCP
La clase `SmtpMailSender` actúa como un envoltorio (wrapper/adapter) para la dependencia externa `<<library>> Nodemailer`. Al aislar la librería de terceros detrás de la interfaz `IMailSender`, el sistema se protege contra cambios externos. Si en el futuro Nodemailer queda obsoleta o se decide usar una API de nube, solo se creará una nueva clase que implemente `IMailSender`, cumpliendo con el Principio Abierto/Cerrado (extensible sin modificar el código cliente).

### Principio de Responsabilidad Única (SRP) y Alta Cohesión
La lógica se ha dividido en clases pequeñas y especializadas:
- **`SmtpMailSender`:** Se encarga exclusivamente de la lógica operativa (crear el transportador, verificar la conexión y ejecutar el envío).
- **`MailConfig`:** Encapsula únicamente las credenciales y parámetros de conexión (host, puerto, seguridad). Separar la configuración permite que estos datos se inyecten dinámicamente (por ejemplo, desde variables de entorno) sin alterar la lógica de envío.

### Aislamiento de Datos mediante DTOs
Se utiliza el objeto `EmailMessage` con el estereotipo `<<DTO>>`. Esta decisión asegura que la información del correo (destinatario, asunto, contenido HTML) viaje empaquetada de forma segura y estructurada, sin contener lógica de negocio, reduciendo el acoplamiento entre los componentes que generan el mensaje y los que lo envían.

---

*Ver también: [[Código - Gestor de Notificaciones]] · [[Patrones de Diseño]]*
