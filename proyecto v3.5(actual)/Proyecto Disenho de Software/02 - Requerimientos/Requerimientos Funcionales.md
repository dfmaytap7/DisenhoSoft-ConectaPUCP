# Requerimientos Funcionales

| ID | Descripción | Tipo | Prioridad |
|----|-------------|------|-----------|
| RF01 | El sistema deberá incluir un motor de búsqueda interno que permita localizar publicaciones en foros y repositorios mediante palabras clave, curso y ciclo, mostrando resultados en menos de 2 segundos. | Funcional | Alta |
| RF02 | El sistema de software deberá permitir al estudiante marcar los materiales de estudio como favoritos para crear accesos directos a ellos desde su perfil. | Funcional | Baja |
| RF03 | El sistema de software deberá enviar notificaciones exclusivamente mediante correo electrónico institucional a los usuarios para informarles sobre cualquier nueva actividad en sus publicaciones o consultas. | Funcional | Alta |
| RF04 | El sistema deberá permitir a los alumnos crear eventos en "Grupos de Estudio", especificando curso, tema y horario, quedando accesibles a inscripción voluntaria de alumnos y evaluadores interesados. | Funcional | Media |
| RF05 | El sistema deberá mostrar en la sección "Grupos de Estudio" los eventos organizados, permitiendo filtrarlos por fecha, curso, ciclo o palabras clave. | Funcional | Media |
| RF06 | El sistema de software deberá ofrecer foros de discusión organizados por ciclo académico y curso, permitiendo la creación, modificación y eliminación de publicaciones y comentarios. | Funcional | Media |
| RF07 | El sistema de software deberá implementar votaciones en forma de likes (positivas y negativas) en los foros para destacar contenido relevante. | Funcional | Media |
| RF08 | El sistema deberá notificar automáticamente exclusivamente mediante correo electrónico a los evaluadores sobre documentos pendientes de validación en el panel de control, en un tiempo máximo de 2 minutos después de la carga. | Funcional | Alta |
| RF09 | El sistema deberá permitir al administrador validar las evidencias presentadas por los postulantes al rol de evaluador en un plazo máximo de 7 días hábiles, antes de otorgarles el rol correspondiente. Pasado este tiempo se anula la solicitud. | Funcional | Alta |
| RF10 | El sistema deberá asignar puntos adicionales de gamificación a los evaluadores por cada documento validado, registrando la acción en sus estadísticas personales de inmediato. | Funcional | Baja |
| RF11 | El sistema deberá otorgar puntos adicionales de gamificación a los alumnos que organicen grupos de estudio activos, con al menos 3 miembros y una sesión realizada dentro del ciclo. Esto mediante puntos acumulados para subir de rango a cada alumno. | Funcional | Media |
| RF12 | El sistema de software deberá permitir el inicio de sesión únicamente mediante cuentas de correo institucional PUCP verificadas por SSO CAS. | Funcional | Alta |
| RF13 | El sistema de software deberá mostrar el mensaje "Sesión inválida. Por favor, vuelva a iniciar sesión." cuando falle la autenticación o expire la sesión. | Funcional | Alta |
| RF14 | El sistema deberá gestionar roles de usuario diferenciados (estudiante, evaluador y administrador), limitando los accesos de acuerdo con sus permisos asignados. | Funcional | Alta |
| RF15 | El sistema permitirá al usuario buscar material por filtros de búsqueda configurables: por antigüedad, por curso, por formato, por popularidad (medida por cantidad de favoritos), por tema, por actividad, estado de verificación y autor. | Funcional | Alta |
| RF16 | El sistema de software deberá mostrar un indicador de carga si una operación tarda más de 1 segundo, y un mensaje de "Tiempo de espera excedido" si tarda más de 5 segundos. | Funcional | Media |
| RF17 | El sistema de software deberá permitir a los estudiantes y evaluadores cargar archivos (apuntes, exámenes, guías) `.pdf`, `.txt`, `.png`, `.jpg`, `.docx`, `.pptx`, `.xlsx`, `.doc`, `.xls`, `.ppt` de hasta 100 MB y asociarlos obligatoriamente a un curso y ciclo académico antes de completar la carga. | Funcional | Alta |
| RF18 | El sistema de software deberá incorporar automáticamente los apuntes y guías validados en un repositorio centralizado de recursos organizados por curso y ciclo. | Funcional | Alta |
| RF19 | El sistema de software deberá permitir que el administrador configure qué extensiones de archivos están permitidas para subir. | Funcional | Baja |
| RF20 | El sistema de software deberá permitir a los usuarios descargar a su dispositivo los archivos subidos a la plataforma. | Funcional | Alta |
| RF21 | El sistema de software deberá otorgar puntos y logros a los alumnos por las acciones de subida de documentos, validación de contenido y participación en foros. | Funcional | Media |
| RF22 | El sistema deberá mostrar las siguientes estadísticas personales a cada usuario: cantidad de documentos subidos, cantidad de documentos validados, participación en foros y puntos acumulados, actualizadas en tiempo real. | Funcional | Media |
| RF23 | El sistema de software deberá integrar funciones de compartir publicaciones, materiales y foros para generar enlaces compartibles que puedan ser enviados a otras plataformas. El acceso mediante dichos enlaces siempre requerirá autenticación institucional PUCP (SSO CAS); si el destinatario no está autenticado, será redirigido al inicio de sesión antes de ver el contenido. | Funcional | Media |
| RF24 | El sistema de software deberá implementar una interfaz para los usuarios con rol de evaluador en el que se permita validar, rechazar y reportar un archivo. | Funcional | Alta |
| RF25 | El sistema permitirá la moderación automática y manual de las publicaciones y comentarios hechos por los usuarios. | Funcional | Media |
| RF26 | El sistema notificará automáticamente al postulante al rol de evaluador sobre el resultado de su validación o anulación de su solicitud por tiempo expirado. | Funcional | Media |
| RF27 | El sistema permitirá al Estudiante gestionar sus preferencias de recepción de alertas (activar/desactivar categorías). | Funcional | Baja |
| RF28 | Consolidado en RF17 — RF17 ya cubre a estudiantes y evaluadores con los mismos requisitos de carga. Este requerimiento queda como referencia histórica y no genera implementación adicional. | Funcional | Alta |
| RF29 | El sistema permitirá la recuperación y descarga de archivos binarios almacenados en el repositorio para usuarios autorizados. | Funcional | Media |
| RF30 | El sistema permitirá a los usuarios (Estudiante/Evaluador) editar su información de contacto y datos personales básicos. | Funcional | Media |
| RF31 | El sistema permitirá al Administrador activar o suspender cuentas de usuario de forma manual. | Funcional | Alta |
| RF32 | El sistema debe actualizar el rol del usuario a "Evaluador" una vez que el administrador valida satisfactoriamente las evidencias (vinculado al RF09). | Funcional | Alta |
| RF33 | El sistema debe asignar automáticamente puntos y niveles a los usuarios según su interacción en foros y grupos de estudio. | Funcional | Media |
| RF34 | El sistema permitirá visualizar una tabla de posiciones de reputación basada en los puntos obtenidos en la gamificación. | Funcional | Baja |
| RF35 | El sistema permitirá la apertura, cierre y archivado automático de hilos de discusión en foros basándose en las fechas del ciclo académico actual. | Funcional | Alta |
| RF36 | El sistema enviará alertas automáticas sobre eventos de calendario y fechas de exámenes hacia el cliente SMTP. | Funcional | Media |
| RF37 | El sistema debe organizar los documentos validados en el repositorio por curso, ciclo académico y formato de archivo. | Funcional | Alta |
| RF38 | El sistema debe permitir y almacenar la vinculación técnica entre archivos del repositorio y las publicaciones/foros donde se usen. | Funcional | Alta |

---

## Fuentes para medidas y métricas

1. Velocidad de subida desde red móvil en Perú → calculado 2 minutos como máximo para un archivo de 50 MB.
2. Entrevistas a estudiantes PUCP en campus.
3. Recomendaciones OWASP para seguridad en autenticación: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
4. PAIDEIA: tamaño máximo de subida 250 MB (se eligió 100 MB como restricción propia).
5. IBM — High Availability: https://www.ibm.com/think/topics/high-availability

---

*Ver también: [[Requerimientos de Calidad]] · [[Restricciones]]*
