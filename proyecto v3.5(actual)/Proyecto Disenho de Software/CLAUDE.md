# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ConectaPUCP** is a web platform designed for PUCP (Pontificia Universidad Católica del Perú) students to share and access academic materials (exams, notes, guides), participate in discussion forums, and join study groups. The project is from the course *Diseño de Software* (INF50), Grupo 24.

Currently, the repository contains only the architecture design document (`Laboratorio 03 - grupo 24.docx`). There is no implemented code yet.

## System Context

Three user roles: **Estudiante** (student), **Evaluador** (validator with elevated permissions), **Administrador**.

Two external systems:
- **Sistema CAS (PUCP SSO)** — institutional identity provider for authentication
- **Sistema Correo Electrónico PUCP** — institutional Gmail-based email for notifications

## Architecture

The design follows **Space-Based Architecture (SBA)** with microservices. The C4 model was used to document it.

### Containers

| Container | Role |
|---|---|
| Aplicación Web | Frontend SPA |
| API Gateway | Single HTTPS entry point, routes to Processing Units (UPs) |
| Servicio de Notificaciones | Alert panel + email dispatch |
| Servicio de Archivos | File upload, validation, metadata, distribution |
| Servicio Social | Forums, study groups, gamification |
| Servicio de Cuentas | Login via CAS, sessions, role management |
| Grilla de Datos (Hazelcast) | Shared in-memory state across all UPs |
| Grilla de Mensajería (Kafka) | Async event bus between UPs |
| Servicio de Persistencia | Reads/writes between Hazelcast and PostgreSQL |
| Base de Datos (PostgreSQL) | Persistent storage for users, posts, metadata |
| Almacenamiento de Objetos | Binary file storage; delivers files via signed URLs |

### Key Architectural Decisions

- UPs are **stateless** — all shared state (sessions, tokens, roles, rankings) lives in Hazelcast (the "Space").
- UPs **never write directly to PostgreSQL**; they write to Hazelcast, and the `DataWriter` consumes Kafka events to persist asynchronously (Write-Behind pattern).
- On cache miss, `DataReader` fetches from PostgreSQL and repopulates the Space.
- Authentication: CAS validates institutional identity → system creates local session + token in Hazelcast.

## Design Patterns Applied

| Pattern | Location |
|---|---|
| Chain of Responsibility | `Validación de Material` — sequential file validation (size → extension → MIME) |
| Proxy | `Repositorio de Archivos` — `FileAccessProxy` enforces `checkAccess()` before delegating to `HazelcastFileRepository` |
| Adapter | `Autenticación de Cuentas` — wraps CAS protocol; `MailSender` — wraps Nodemailer |
| Facade | `GestionCuentasService` (Servicio Cuentas); `NotificaciónOrquestador` (Servicio Notificaciones) |
| Observer | `PublicacionService`/`ComentarioService` notify `GamificacionObserver`, `NotificacionObserver`, `ModeracionObserver` |
| Strategy | `CalculadoraPuntosService` selects gamification calculator per `TipoAccion` |
| Template View | `HandlebarsTemplateEngine` + `TemplateLoader` + `TemplateCache` for email HTML |
| Front Controller | `NotificacionController` — single HTTP entry point, delegates to `INotificacionService` |
| Data Mapper | `UsuarioDataMapper`, `ArchivoDataMapper`, `PublicacionDataMapper` isolate SQL from domain entities |
| Repository | `IFileRepository`, `IPublicacionRepository`, etc. abstract persistence |
| DTO + Mapper/Assembler | Input/output isolation at all service boundaries |
| Identity Field (GUID) | `Archivo.id` for Hazelcast key uniqueness |
| Dependent Mapping | `SocialReference` lifecycle managed entirely by `Archivo` |

## Component Structure (per service)

Each Processing Unit (UP) follows the same layered structure:
```
Controller (HTTP entry, validates schema, delegates)
  └─> Service / Facade (orchestrates business logic via interfaces)
        ├─> Domain Entities + Enums
        ├─> Repository Interface (IXxxRepository)
        │     └─> Hazelcast implementation
        └─> GridClient (Hazelcast adapter)
```

The **Servicio de Persistencia** sits behind all UPs:
- `DataReader` — resolves cache misses, reloads Space from PostgreSQL
- `DataWriter` — consumes Kafka events, writes to PostgreSQL / Object Storage
- `DataMapper/Repositories` — SQL/JDBC, domain ↔ record transformation

## Asset & Diagram Conventions

- **`assets/images/`** — PNG exports usados en los documentos Obsidian con `![[filename.png]]`.
- **`assets/Diagramas/`** — Fuente de todos los diagramas. Estructura por tipo:
  - `contexto/`, `contenedores/`, `codigo/UP */`, `diagramas interaccion/UP */`
  - Cada diagrama puede tener: `.drawio.xml` (editable en draw.io), `.puml` (PlantUML legacy), `.md` (Mermaid, formato activo para nuevos diagramas).
- **Formato activo para nuevos diagramas: Mermaid** — archivos `.md` con bloque ` ```mermaid ``` `, renderizables en VS Code y Obsidian sin plugins adicionales.
- **Cuando se actualiza un diagrama**: (1) actualizar `.drawio.xml` en `assets/Diagramas/`, (2) crear/actualizar el `.md` Mermaid en la misma subcarpeta, (3) registrar el cambio en `CHANGELOG.md`.
- **`CHANGELOG.md`** es el único registro de cambios — no existe un archivo de actualizaciones separado.
- **`Correcciones.md`** — lista de tareas de auditoría de arquitectura con checkboxes; al resolver un ítem moverlo al historial al final del mismo archivo.

## Technology Constraints

- **Auth**: OAuth2 or SAML 2.0 for institutional identity; CAS is the current provider
- **TLS 1.3** for all communications; Hazelcast inter-node traffic also over TLS/SSL
- **File uploads**: up to 100 MB; allowed formats: `.pdf .txt .png .jpg .docx .pptx .xlsx .doc .xls .ppt`; MIME-type validation required (reject extension spoofing)
- **Browser support**: last 2 versions of Chrome, Firefox, Edge, Safari (as of 2025-09-05)
- **Accessibility**: WCAG 2.1 Level AA minimum
- **Response time**: ≤ 2 seconds under 100 concurrent users; loading indicator after 1 s, timeout message after 5 s
- **Availability**: ≥ 95% during academic semester
- **Email notifications**: max 2 minutes from event to dispatch; retry on failure via Kafka
- **Role change propagation**: must reach Hazelcast in real time so other UPs see updated permissions immediately
