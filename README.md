# Legal Case Management — Expedientes, ABAC y Trazabilidad

Plataforma full‑stack para **gestión de expedientes legales**, diseñada con **Clean Architecture**, **control de acceso basado en atributos (ABAC)** y **t trazabilidad/auditoría criptográficamente verificable**.

- ✅ Gestión de expedientes, actuaciones y documentos
- ✅ Autenticación (JWT) y autorización ABAC (OPA o Casbin)
- ✅ Auditoría completa (allow/deny) con **encadenamiento hash**
- ✅ Backend desacoplado y testeable (Clean Architecture)
- ✅ Frontend moderno (React + TypeScript)

---

## Tabla de contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Ejecución en local](#ejecución-en-local)
- [Variables de entorno](#variables-de-entorno)
- [ABAC](#abac)
- [Trazabilidad](#trazabilidad)
- [API](#api)
- [Calidad](#calidad)
- [Seguridad](#seguridad)
- [Roadmap](#roadmap)
- [Licencia](#licencia)

---

## Características

### Gestión legal
- **Expedientes**: alta, edición, estados (abierto/cerrado/archivado), clasificación (público/reservado/confidencial)
- **Actuaciones**: registro cronológico de acciones/procesos dentro del expediente
- **Documentos**: adjuntos y metadatos (tipo, fecha, relación a actuación)

### Seguridad (ABAC + JWT)
- Autenticación con **JWT**
- Autorización ABAC por:
  - asignación a expediente
  - oficina/área
  - nivel de confidencialidad
  - estado del expediente
  - contexto (hora, canal, IP, etc. si aplica)

### Auditoría y trazabilidad verificable
- Registro de eventos por operación (CRUD y acceso)
- Registro de **decisión ABAC** (allow/deny) + motivo
- **Encadenamiento hash** (SHA-256) para detectar alteraciones

---

## Arquitectura

Este proyecto adopta **Clean Architecture**:

- **Domain**: entidades y reglas del negocio (sin dependencias externas)
- **Application**: casos de uso, DTOs y puertos (interfaces)
- **Infrastructure**: implementaciones (PostgreSQL, ABAC engine, hashing, storage)
- **Presentation**: API HTTP (Express) + validación + middlewares

Flujo de dependencias (siempre hacia adentro):

```
Presentation -> Infrastructure -> Application -> Domain
```

> La infraestructura **nunca** se usa directamente desde los casos de uso: se inyecta por interfaces (ports), facilitando testeo y reemplazo de implementaciones.

---

## Estructura del repositorio

> Ajusta nombres si tu implementación difiere.

```
.
├─ backend/
│  ├─ src/
│  │  ├─ domain/
│  │  │  ├─ entities/
│  │  │  ├─ value-objects/
│  │  │  └─ errors/
│  │  ├─ application/
│  │  │  ├─ use-cases/
│  │  │  ├─ dtos/
│  │  │  └─ ports/                 # interfaces (repos, policy, hashing, etc.)
│  │  ├─ infrastructure/
│  │  │  ├─ db/                    # postgres client, migrations
│  │  │  ├─ repositories/          # implements ports
│  │  │  ├─ policy/                # OPA/Casbin adapters
│  │  │  └─ crypto/                # hashing implementation
│  │  ├─ presentation/
│  │  │  └─ http/
│  │  │     ├─ routes/
│  │  │     ├─ controllers/
│  │  │     ├─ middlewares/
│  │  │     └─ validators/
│  │  └─ main/
│  │     ├─ di/                    # wiring / dependency injection
│  │     └─ app.ts|app.js          # bootstrap
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ app/                      # routing, providers
│  │  ├─ features/                 # expedientes, auth, auditoria
│  │  ├─ shared/                   # ui, hooks, utils, api client
│  │  └─ main.tsx
│  ├─ .env.example
│  └─ package.json
└─ docs/
   ├─ api.md                       # (opcional) especificación endpoints
   ├─ arquitectura.md              # (opcional) decisiones técnicas
   └─ seguridad.md                 # (opcional) políticas, amenazas, hardening
```

---

## Requisitos

- Node.js **LTS** (recomendado)
- PostgreSQL **14+**
- npm / pnpm / yarn

Opcional:
- OPA (Open Policy Agent) si usarás políticas externas
- Docker / Docker Compose para levantar BD y servicios

---

## Ejecución en local

### 1) Base de datos

Crea una base de datos en PostgreSQL:

```sql
CREATE DATABASE expedientes;
```

Si usas Docker (opcional), define un `docker-compose.yml` con Postgres y credenciales (no incluido aquí).

### 2) Backend

```bash
cd backend
cp .env.example .env
npm install

# Migraciones / schema (si aplica)
# npm run migrate

npm run dev
```

### 3) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Luego abre el frontend y autentícate con un usuario válido (si tienes seed, ejecútalo).

---

## Variables de entorno

### backend/.env.example

```env
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/expedientes

JWT_SECRET=change_me

# ABAC: motor de políticas
ABAC_ENGINE=opa   # opa | casbin
OPA_URL=http://localhost:8181  # si ABAC_ENGINE=opa

# Auditoría / trazabilidad
AUDIT_HASH_ALGO=sha256
```

### frontend/.env.example

```env
VITE_API_URL=http://localhost:4000
```

---

## ABAC

ABAC decide permisos evaluando **atributos** del sujeto, recurso y entorno.

### Atributos sugeridos

**Sujeto (usuario)**
- `id`, `role` (abogado, asistente, admin)
- `oficinaId`
- `clearanceLevel`
- asignaciones a expediente (relación)

**Recurso (expediente/documento/actuación)**
- `classification` (público/reservado/confidencial)
- `estado` (abierto/cerrado/archivado)
- `ownerOficinaId`
- `assignedUserIds`

**Entorno**
- hora, canal, IP (si aplica)

### Recomendación de diseño (Clean Architecture)

- La decisión ABAC se invoca en **Application (caso de uso)** mediante un **port**:
  - `PolicyEngine.evaluate(subject, resource, action, context)`
- La implementación vive en **Infrastructure** (OPA/Casbin) y se inyecta desde `main/di`.

> Importante: registrar en auditoría **allow/deny** + el motivo de la decisión.

---

## Trazabilidad

Cada acción relevante genera un evento de auditoría.

### Encadenamiento hash (SHA-256)

Para cada evento:

- `prevHash`: hash del evento anterior
- `payloadCanonical`: serialización canónica del evento (orden estable de campos)
- `hash = sha256(prevHash + payloadCanonical)`

Esto ayuda a detectar:
- modificaciones retroactivas
- inserciones/eliminaciones en el historial

### Campos sugeridos de auditoría

- `eventId`
- `timestamp`
- `actorUserId`
- `action`
- `resourceType`
- `resourceId`
- `abacDecision` (allow/deny)
- `abacReason`
- `prevHash`
- `hash`

---

## API

> Documenta endpoints concretos en `docs/api.md` o genera OpenAPI/Swagger si lo deseas.

Convención sugerida (REST):

- `POST /auth/login`
- `GET /cases`
- `POST /cases`
- `GET /cases/:id`
- `PATCH /cases/:id`
- `POST /cases/:id/actuations`
- `POST /cases/:id/documents`
- `GET /cases/:id/audit-trail`

Errores:
- `401` no autenticado
- `403` denegado por ABAC (registrar `deny` en auditoría)
- `404` recurso inexistente
- `422` validación

---

## Calidad

Recomendaciones mínimas:

- Lint + format (ESLint/Prettier)
- Validación de requests (Zod/Joi/Yup)
- Tests de casos de uso (Application) con puertos mockeados
- Tests de integración de repositorios (Infrastructure) con Postgres
- Logs estructurados (pino/winston) y trazas por request

---

## Seguridad

- Nunca commitear `.env` (usar `.env.example`)
- Rotar `JWT_SECRET` en producción
- Sanitizar inputs y validar DTOs
- Controlar tamaño de archivos adjuntos + tipo MIME
- Registrar accesos/descargas sensibles en auditoría
- Aplicar principio de mínimo privilegio en ABAC

---

## Roadmap

- [ ] OpenAPI/Swagger (contrato formal)
- [ ] Docker Compose (API + DB + OPA)
- [ ] Seed oficial (usuarios/expedientes demo)
- [ ] Pruebas unitarias e integración
- [ ] Observabilidad (request-id, métricas, trazas)
- [ ] Firma digital / sellado de tiempo (opcional, para robustecer evidencias)

---

## Licencia

Pendiente. (Recomendado: MIT o Apache-2.0 según el objetivo del repositorio.)
