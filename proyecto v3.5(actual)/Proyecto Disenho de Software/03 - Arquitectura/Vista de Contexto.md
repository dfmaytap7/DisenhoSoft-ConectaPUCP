# Vista de Contexto

Nivel 1 del modelo C4 — muestra ConectaPUCP como sistema central, los actores que interactúan con él y los sistemas externos.

![[c4-vista-contexto.png]]
*Imagen 1: Vista de Contexto de ConectaPUCP en el modelo C4.*

---

## Actores

| Actor | Descripción |
|-------|-------------|
| **Estudiante** | Alumno de la PUCP que revisa material en repositorios, comenta en foros o participa en grupos de estudio. |
| **Evaluador** | Miembro de la comunidad PUCP capaz de evaluar material subido por otros. |
| **Administrador** | Administrador de configuraciones, moderación y parámetros de la plataforma web. |

## Sistemas Externos

| Sistema Externo | Descripción |
|-----------------|-------------|
| **Sistema CAS** | Sistema que permite la validación de cuentas PUCP (SSO — autorización e inicio de sesión). |
| **Sistema de Correo Electrónico** | Servicio de correo institucional PUCP (Google Workspace). La comunicación se realiza mediante SMTP relay hacia `smtp.gmail.com` con credenciales institucionales OAuth2 o credenciales de aplicación. El cliente SMTP del sistema (`SmtpMailSender` / Nodemailer) se configura apuntando a este host, no a un servidor Postfix propio. |

---

## Sustento

Se busca resolver la fragmentación de la información académica en la PUCP:

- **Centralización de Recursos:** Se diseñó como un núcleo que conecta a alumnos y egresados para evitar la dependencia de "repositorios informales" entre amigos, democratizando el acceso a la información.
- **Interoperabilidad Institucional:** La integración con el Sistema CAS y el Servicio de Correo PUCP no es opcional; es una decisión de diseño para garantizar que solo usuarios con identidad verificada accedan al sistema, cumpliendo con la restricción técnica de autenticación institucional.

---

*Ver también: [[Vista de Contenedores]] · [[Introducción]]*
