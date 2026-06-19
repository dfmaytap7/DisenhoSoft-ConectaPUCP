# Componentes — Servicio de Notificaciones (UP)

![[c4-componentes-notificaciones.png]]
*Vista de Componentes del Servicio de Notificaciones UP.*

---

## Componentes

| Componente | Descripción | Roles | RF | RC |
|------------|-------------|-------|----|----|
| **Controlador de Notificaciones** | Punto de entrada para peticiones síncronas de la App Web. | Administrador, Sistema | RF14, RF26, RF27 | RC03, RC07 |
| **Gestor de Notificaciones** | Actúa como el orquestador principal. Evalúa las reglas de negocio, consulta las preferencias del usuario y coordina la generación del mensaje. | Evaluador, Sistema | RF03, RF08, RF19, RF21, RF36 | RC02, RC04, RC10 |
| **Cliente Grilla de Datos** | Adaptador para Hazelcast que maneja preferencias y registros. | Sistema | RF28 | RC09, RC19 |
| **Motor de Plantillas** | Generador de contenido dinámico (HTML) para los mensajes. | Administrador | RF03, RF08, RF26, RF36 | RC06 |
| **Mailer Client** | Despacha los correos hacia el servidor Postfix. | Estudiante (receptor) | RF08, RF19, RF36 | RC10 |

---

## Sustento

**Inversión de Dependencias (DIP):** El `NotificationManager` depende de interfaces (`IMailSender`, `ITemplateEngine`), lo que permite cambiar el proveedor de correos (de SMTP local a una API en la nube como AWS SES) sin alterar la lógica de negocio.

---

*Ver también: [[Vista de Contenedores]] · [[Código - Gestor de Notificaciones]] · [[Código - Motor de Plantillas]] · [[Código - Mailer Client]]*
