# Vista de Código — Módulo Autenticación (Servicio de Cuentas)

![[codigo-modulo-autenticacion.png]]
*Diagrama de clases completo: AuthService, IAuthProvider, ExternalAuthAdapter, ExternalAuthClient, ISesionRepository, SesionRepositoryGrid, GridClientFacade (Singleton), SesionUsuario, CredencialExterna, IdentidadExterna, AuthResponse, TipoCredencial (Enum).*

![[codigo-autenticacion-adapter.png]]
*Diagrama simplificado del patrón Adapter: AuthService → IAuthProvider ← ExternalAuthAdapter → ExternalAuthClient.*

---

## Sustento de decisiones de diseño

### Patrón Adapter e Inversión de Dependencias (DIP)
El componente utiliza una interfaz de autenticación externa (`IAuthProvider`) para desacoplar la lógica interna del sistema del proveedor institucional. El adaptador `ExternalAuthAdapter` traduce la respuesta específica de CAS hacia un modelo interno común, permitiendo que en el futuro se pueda reemplazar CAS por OAuth2, SAML u otro proveedor sin modificar el servicio principal de autenticación.

### Principio de Responsabilidad Única (SRP) y Alta Cohesión
El proceso de autenticación se divide en responsabilidades claras:
- **`ExternalAuthClient`:** Se encarga de comunicarse con CAS.
- **`ExternalAuthAdapter`:** Normaliza la respuesta recibida de CAS al modelo interno.
- **`AuthService`:** Coordina el inicio de sesión.
- **`SesionRepositoryGrid`:** Guarda o invalida la sesión del usuario en Hazelcast mediante `GridClientFacade`.

### Separación entre Autenticación y Autorización
CAS solo valida que el usuario pertenece a la comunidad PUCP, pero no decide qué puede hacer dentro del sistema. Luego de validar la identidad institucional, el sistema consulta el usuario interno y sus roles para determinar si ingresa como estudiante, evaluador o administrador. Esto permite cumplir con la gestión diferenciada de roles y permisos (RF14).

### Integración con la Arquitectura Basada en Espacios
Las sesiones, tokens y roles activos se almacenan en la Grilla de Datos mediante el cliente de grilla (`GridClientFacade` como Singleton). Esto permite que el servicio de autenticación sea *stateless* a nivel de servidor, mientras el estado de sesión queda compartido en el Space. Así, cualquier instancia de la UP de Cuentas puede validar una sesión sin depender de memoria local.

> **Nota sobre el patrón Singleton en entornos escalados:** El Singleton garantiza **una sola instancia de conexión Hazelcast por proceso Node.js**, no por cluster. Cuando el Servicio de Cuentas escala horizontalmente, cada réplica (proceso) tiene su propio `GridClientFacade`; todos comparten el mismo cluster Hazelcast como fuente de verdad. Este comportamiento es el esperado y correcto para los clientes Hazelcast distribuidos.

### Seguridad y Control del Ciclo de Sesión
La sesión local se crea solo después de que CAS confirma la identidad institucional y el sistema verifica el usuario interno. Si la sesión expira o no es válida, el sistema rechaza el acceso y muestra el mensaje: *"Sesión inválida. Por favor, vuelva a iniciar sesión."* (RF13).

---

*Ver también: [[Componentes - Servicio de Cuentas]] · [[Código - Gestor de Roles]] · [[Diagramas de Interacción]]*
